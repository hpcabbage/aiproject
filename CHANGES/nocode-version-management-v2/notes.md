# Notes - nocode-version-management-v2

## Phase 2A 收口摘要

本轮已完成 NoCode 版本管理 V2 的 Phase 2A 最小闭环，实现目标不是做开发者 diff 工具，而是把现有版本快照能力升级为更接近 NoCode 用户心智的版本管理中心。

## 本轮实际落地内容

### 1. 数据模型收敛
已确认并采用以下最小必做字段：
- `app.currentVersionId`
- `app_frontend_version.sourceVersionId`
- `app_frontend_version.isStable`

并明确当前阶段不落 `versionRole`，避免语义重复。

### 2. 后端写入语义
已完成：
- 手动提交版本时，`sourceVersionId = app.currentVersionId`
- 回滚生成版本时，`sourceVersionId = targetVersion.id`
- 新版本创建成功后，回写 `app.currentVersionId = createdVersion.id`
- 新版本默认 `isStable = 0`

### 3. 后端查询语义
已完成：
- 版本 VO 返回 `sourceVersionId`
- 版本 VO 返回 `isStable`
- 版本 VO 返回 `currentVersion`

其中 `currentVersion` 当前由 `app.currentVersionId` 推导。

### 4. 前端展示升级
已完成：
- 版本列表展示“当前使用中 / 稳定版本 / 回滚生成 / 手动提交”标签
- 版本列表展示“恢复自 Vx / 来源于 Vx”
- 版本详情展示当前版本、稳定版本、来源版本、回滚关系说明

### 5. 最小交互闭环
已完成：
- 后端新增 `/app/version/stable` 接口
- 前端新增“标记为稳定版本 / 取消稳定版本”按钮
- 演示态与真实接口态均已接线

## 当前验证

### 已完成验证
- 前端 `npm run build` 已通过
- 前端 TS 类型缺失问题已补齐并修复
- 后端版本提交 / 回滚 / 稳定标记的主链路已完成静态接线
- 已根据老板补充的历史环境信息，显式注入：
  - `JAVA_HOME=/home/cabbage/.local/java`
  - `MAVEN_HOME=/home/cabbage/.local/maven`
  - `PATH=$JAVA_HOME/bin:$MAVEN_HOME/bin:$PATH`
- 在上述环境下，已实际执行 `./mvnw -q -DskipTests compile`
- 编译过程中额外暴露并修复了 2 个真实问题：
  1. `AppServiceImpl.java` 缺少 `AppSetVersionStableRequest` import
  2. `AppFrontendVersioningServiceImpl.java` 中 `appMapper.update(createdVersion.getAppId(), app)` 写法错误，已修正为 `appMapper.update(app)`
- 修复后再次执行 `./mvnw -q -DskipTests compile`，已通过
- 已完成真实接口联调验证：
  - 使用账号 `cabbage` 登录成功
  - 查询本人应用列表成功，定位 `appId=11`
  - 先触发一次真实代码生成，成功落出 `tmp/code_output/vue_project_11`
  - 调用 `/app/commit/version` 成功，生成 `V1`
  - 调用 `/app/version/stable` 成功，将 `V1` 标记为稳定版本
  - 调用 `/app/version/rollback` 成功，生成回滚版本 `V2`
  - 再次查询版本列表，关键字段验证通过：
    - `V2.sourceType = ROLLBACK`
    - `V2.sourceVersionId = 1`
    - `V2.currentVersion = true`
    - `V1.isStable = 1`
    - `V1.currentVersion = false`
- 已完成一轮 Phase 2B 最小体验增强：
  - 版本列表增加“只看稳定版本”筛选
  - 当前使用中的版本增加更明显的绿色高亮
  - 体验增强后前端 `npm run build` 再次通过

### 尚未完成验证
- 尚未补前端页面人工点击验证截图留档

## 当前已知风险

1. 当前仍未完成真实后端接口联调验证，尤其是 stable toggle / rollback / currentVersion 更新的接口级闭环
2. `currentVersion` 当前在 VO 转换时逐条查询 `app`，列表规模变大后可能需要优化
3. 当前允许多个版本同时标记为稳定版本，这是当前设计选择，不是 bug；如果未来想限制唯一稳定版本，需要单独变更规则
4. 前端仍存在 chunk > 500k 构建警告，但不阻塞当前主线
5. Java 环境依赖显式注入 `JAVA_HOME / MAVEN_HOME / PATH`，当前还没有在工作区文档中形成稳定可复用说明，后续建议补到 `TOOLS.md`

## 建议提交说明

建议 commit 标题：
- `feat: 完成 NoCode 版本管理 V2 Phase 2A 最小闭环`

如果要拆提交，可按：
1. `feat: 补版本当前态与来源版本后端语义`
2. `feat: 升级版本页标签展示与稳定版本交互`
3. `docs: 收口版本管理 V2 Phase 2A 设计与变更记录`

## 下一步建议

如果继续推进 V2，当前更合适的下一步不是再补更多字段，而是二选一：

### 方向 A：正式收口
- 当前 compile 与真实接口联调都已完成
- 可以 push 并作为 Phase 2A 已完成状态收口
- 补一份人工点击截图或录屏留档即可

### 方向 B：继续体验增强
- 把版本列表做成更明确的时间线/卡片式布局
- 增加更清晰的当前版本操作区
- 补稳定版本筛选的数量提示、空态与引导文案
