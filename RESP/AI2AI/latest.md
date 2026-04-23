# AI2AI Latest

## 当前结论
`nocode-version-restore-experience` 这条 change 已完成阶段性收口，且主链路已真实验证通过。

当前版本回滚语义已从“回滚生成新版本”正式切换为：

**截断式回滚模型**

即：
1. 回滚到目标版本后，后续版本全部删除；
2. 当前版本直接变成目标版本；
3. 后续再次提交时，从目标版本号继续重新编号。

本阶段已完成需求对齐、后端实现、前端语义改造和真实联调验证，当前已进入提交与尾巴收口阶段。

## 当前项目
- 项目：`NoCode`
- 当前阶段：`add-app-version-history` 前后端最小闭环已形成
- 当前主题：前端修改版本记录第一阶段文件版本目录 + 数据库索引落地

## 当前 Change
- change-id: `nocode-version-restore-experience`
- 当前 task: `阶段收口已完成，准备提交并决定是否继续处理尾巴问题（如 sourceVersionId 语义 / Modal 化确认）`

## 当前里程碑
### M0：建立持续自治工作流
- 状态：已完成

### M1：NoCode 后端最小构建恢复
- 状态：已完成

### M2：NoCode AI 流式生成主链路核对
- 状态：已完成

### M3：site_template 前后端最小闭环
- 状态：已完成

### M4：site_template 页面级验收收口
- 状态：已完成

### M5：site_template 第一阶段交付总结
- 状态：已完成

### M6：site_template 行为边界与提交边界整理
- 状态：已完成

### M7：site_template 详情页与 UI 收口
- 状态：已完成

### M8：前端修改版本记录能力第一阶段
- 状态：进行中

## 本轮已完成
1. 已重启本地 `8123` 后端实例，确认当前在线的是本轮改造后的新代码，而不是之前残留的旧进程。
2. 已用老板提供的 `cabbage / 050312+Qq` 成功获取并复用登录 session，打通真实接口联调链路。
3. 已对 `appId=11` 完成真实截断式回滚验证：
   - 回滚前版本列表为 `V2 -> V1`
   - 对 `versionId=1` 执行回滚后，版本列表只剩 `V1`
   - `V2` 被实际删除，当前版本直接变为 `V1`
4. 已继续完成“回滚后重新提交编号”验证：
   - 回滚后再次提交新版本
   - 新版本编号重新变为 `V2`
   - 当前版本正确切换为新的 `V2`
5. 已确认截断式回滚主语义真实生效，并把 `tasks.md` 中 T7 标记完成。
6. 已继续处理 `sourceVersionId` 语义尾巴：
   - 将普通 `MANUAL_COMMIT` 提交时传入的 `sourceVersionId` 从 `app.getCurrentVersionId()` 改为 `null`
   - 后端重新编译通过
   - 真实提交验证通过，`appId=11` 新生成的 `V3` 记录里 `sourceVersionId = null`

## 当前决策
### 决策 1：版本回滚正式切换为截断式回滚
- 原因：老板明确要求“回滚到 V2 后，后续版本全部删除，当前版本就是 V2，并从该处重新编号”。
- 验证：proposal / notes / tasks 已完成重写。
- 回滚：除非老板再次改口，否则不再沿用“回滚生成新版本”。

### 决策 2：当前仍保持“文件版本目录 + 数据库索引”作为底层模型
- 原因：即使回滚语义变更，底层仍然以真实文件版本目录和数据库索引为主，不引入真实 Git 仓库。
- 验证：当前版本体系与现有表结构仍可承载该方向。
- 回滚：无，除非未来整体切换到真实仓库管理。

### 决策 3：代码 diff 仍不作为 NoCode 用户主能力
- 原因：老板目标仍然是给普通用户做版本管理，不是给开发者做代码视角回溯。
- 验证：当前 change 文档继续保持该边界。
- 回滚：除非后续明确增加开发者视图。

## 当前验证
- 需求对齐验证：
  - `proposal.md` 已切换为截断式回滚目标
  - `notes.md` 已记录最新产品规则与实现边界
  - `design.md` 已落地后端截断式回滚执行方案
- 后端实现验证：
  - `rollbackToVersion()` 已不再调用 `createVersionRecord(...)`
  - 版本服务层已补齐“查询后续版本 / 删除后续版本”最小能力
  - `NoCode` 编译通过：`bash ./mvnw -q -DskipTests compile`
  - 重启后本地 `8123` 已运行当前新代码
- 前端实现验证：
  - `AppVersionPage.vue` 已切换为截断式回滚主文案
  - 回滚前会弹出永久删除确认
  - 前端构建通过：`npm run build`
- 真实联调验证：
  - 登录 session 已成功获取并复用
  - `appId=11` 回滚到 `V1` 后，版本列表从 `V2 -> V1` 变为仅剩 `V1`
  - 回滚后再次提交，新版本编号重新从 `V2` 开始
  - 当前版本标记随回滚 / 提交结果正确切换

## 当前风险
1. 截断式回滚是破坏性操作，当前最小实现采用“先删文件、再删数据库”的顺序，若中途失败仍可能出现半删除状态。
2. 当前前端强确认使用的是原生 `window.confirm`，危险性已表达清楚，但交互层级还不够产品化，后续可再换成 Ant Design Modal。
3. 当前 migration SQL 仍未在真实数据库执行，后续联调前仍需确认环境表结构与当前模型是否一致。

## 变更文件
- NoCode/src/main/java/com/yuaicodemother/service/impl/AppFrontendVersioningServiceImpl.java
- CHANGES/nocode-version-restore-experience/release.md
- RESP/AI2AI/latest.md

## Next Action
继续只推进一个最小子步：开始做提交收口，按后端 / 前端边界整理当前改动，并给出建议 commit 方案。
