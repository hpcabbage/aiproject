# Design

## Context
当前 NoCode 前端版本体系已经具备：
- 文件版本目录：`frontend_versions/app_xxx/vN`
- 数据库版本记录：`app_frontend_version`
- 当前版本指针：`app.currentVersionId`
- 回滚接口：`rollbackToVersion(Long versionId, String rollbackReason)`

但当前后端实现仍采用旧模型：
1. 恢复目标版本文件到当前输出目录；
2. 再基于恢复后的当前输出目录创建一条新的回滚版本记录；
3. 更新 `app.currentVersionId` 指向该新版本。

老板最新需求与此冲突，要求采用 **截断式回滚**：
- 回滚到 `V2` 后，`V3+` 全部删除；
- 当前版本直接变成 `V2`；
- 后续提交从 `V3` 重新开始。

## Constraints
1. 当前底层仍保持“文件版本目录 + 数据库索引”模型，不引入真实 Git 仓库；
2. 当前 `id` 是真实唯一主键，`versionNo` 是用户可见编号，可允许在删除旧版本线后重新使用；
3. 本轮是破坏性回滚模型，数据库记录和版本目录都要真实删除；
4. 当前编译链路稳定，优先做最小改动，不扩成大重构。

## Decision
本轮后端采用 **截断式回滚执行方案**。

### 回滚输入
- `versionId`：目标版本 id
- `rollbackReason`：可选，仅用于用户操作记录/提示，不再用于生成新版本记录

### 回滚后系统应满足
以 `V1 -> V2 -> V3 -> V4 -> V5` 为例，回滚到 `V2` 后：
- 保留：`V1`、`V2`
- 删除：`V3`、`V4`、`V5`
- 当前版本：`V2`
- 当前输出目录：恢复成 `V2` 内容
- 后续再次提交时：新版本号从 `V3` 开始

## Backend Execution Plan
### Step 1：校验目标版本
- 校验 `versionId` 合法；
- 校验目标版本存在；
- 校验应用存在且当前用户有权限。

### Step 2：查询待删除版本
基于目标版本 `targetVersionNo`，查询当前应用下所有：
- `versionNo > targetVersionNo`

这些版本即为需要删除的后续版本。

### Step 3：恢复目标版本文件到当前输出目录
- 定位目标版本目录 `targetVersion.versionPath`
- 定位当前输出目录 `code_output/<codeGenType>_<appId>`
- 用目标版本内容覆盖当前输出目录

### Step 4：删除后续版本文件目录
遍历 `versionNo > targetVersionNo` 的版本：
- 删除其 `versionPath` 对应目录
- 若 `metaPath` 在版本目录内，随目录一起删除即可

### Step 5：删除后续版本数据库记录
删除所有 `versionNo > targetVersionNo` 的版本记录。

### Step 6：更新当前版本指针
更新：
- `app.currentVersionId = targetVersion.id`
- `app.updateTime = now`

### Step 7：返回目标版本
接口返回目标版本 VO，前端据此刷新状态。

## Service Layer Changes
### `AppFrontendVersioningServiceImpl.rollbackToVersion(...)`
当前实现：
- `restoreVersionToCurrentOutput(...)`
- `createVersionRecord(..., "ROLLBACK", targetVersion.getId())`

需改为：
- `restoreVersionToCurrentOutput(...)`
- `deleteVersionsAfter(appId, targetVersionNo)`
- `app.currentVersionId = targetVersion.id`
- 返回 `targetVersion`

### `AppFrontendVersionService`
建议新增最小能力：
1. `List<AppFrontendVersion> listVersionsAfter(Long appId, Integer versionNo)`
2. `boolean removeVersionsAfter(Long appId, Integer versionNo)` 或直接按 id 批量删除

### `AppFrontendVersionServiceImpl`
新增对应查询/删除实现，保证：
- 查询顺序稳定
- 删除范围仅限当前应用

## Version Number Rule
### 提交版本时
`getNextVersionNo(appId)` 继续采用：
- 当前最大有效 `versionNo + 1`

因为截断式回滚删除掉 `V3+` 后：
- 当前最大有效版本号自然变为 `2`
- 下一次提交就会重新生成 `V3`

## Error Handling
### 风险 1：文件恢复成功，但后续文件删除失败
结果：当前输出已回到目标版本，但历史目录删到一半。

当前最小策略：
- 先恢复目标版本文件
- 再删目录
- 删目录失败时直接抛错并记录日志
- 接受该轮失败需要人工处理的现实，不额外引入复杂补偿事务

### 风险 2：文件删除成功，但数据库删除失败
结果：数据库仍看到旧版本，文件已不存在。

当前最小策略：
- 数据库删除必须放在文件删除之后，但一旦失败应明确报错
- 下一轮若要继续增强，可考虑事务 + 删除前校验，但本轮先不扩展过大

### 风险 3：当前版本正好就是目标版本
建议允许执行，但实际无后续版本可删除时，接口直接返回目标版本即可。

## Non-Goals
1. 本轮不保留被删版本的逻辑删除记录；
2. 本轮不做恢复后自动生成审计记录；
3. 本轮不做真实 Git reset/revert 语义映射；
4. 本轮不扩成分支模型。

## Minimal Next Step
当前最值得推进的唯一子步：

**按本设计改造 `rollbackToVersion` 及版本服务层，让后端先从“生成新回滚版本”切到“删除后续版本并直接指回目标版本”。**
