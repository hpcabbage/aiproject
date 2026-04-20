# AI2AI Latest

## 当前结论
当前 `add-app-version-history` 已进一步收敛为：**真实文件版本目录 + 数据库迭代信息索引模型**。老板明确希望每条版本记录都对应真实文件版本，但并不要求真实 Git commit，也不需要完整 Git 仓库管理。同时，版本提交必须由用户显式触发，不能在前端修改成功后自动入版本。

本轮老板进一步明确了一个更关键的产品边界：这是 **NoCode 项目**，终端用户不应该接触代码 diff，也不应该看到系统自作聪明地描述“这次改了什么”。因为系统并不知道页面业务上具体改了什么，强行展示 diff 或自动摘要都容易制造错误感知。

因此当前版本能力正式收敛为：
1. 只做“版本快照 + 版本备注 + 回滚”；
2. 版本提交继续由用户主动触发；
3. 系统内部仍保存真实前端文件版本目录与数据库索引；
4. 前台只展示版本号、标题/备注、时间、来源、状态、版本目录等基础信息；
5. 不再把代码级 diff 作为面向用户的核心能力；
6. 不做自动“本次改了什么”的变更摘要推断；
7. 当前版本页的核心目标应回到“可靠存档、可靠查看、可靠回滚”，而不是 diff 展示。

## 当前项目
- 项目：`NoCode`
- 当前阶段：`add-app-version-history` 前后端最小闭环已形成
- 当前主题：前端修改版本记录第一阶段文件版本目录 + 数据库索引落地

## 当前 Change
- change-id: `nocode-version-management-v2`
- 当前 task: `Phase 2A 收口完成，等待 Java 环境验证或进入下一阶段体验增强`

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
1. 已完成真实接口联调，不再停留在静态接线与 compile 通过层面。
2. 已使用账号 `cabbage` 登录后端，验证登录态与权限链路正常。
3. 已查询本人应用列表并定位 `appId=11`，随后直接调用生成接口，成功落出 `tmp/code_output/vue_project_11`。
4. 已完成版本管理主链路真实联调：
   - `/app/commit/version` 成功生成 `V1`
   - `/app/version/stable` 成功将 `V1` 标记为稳定版本
   - `/app/version/rollback` 成功生成回滚版本 `V2`
   - 再查列表后确认 `sourceType / sourceVersionId / isStable / currentVersion` 语义全部符合预期
5. 已继续做一轮 Phase 2B 最小体验增强：
   - 版本列表新增“只看稳定版本”筛选
   - 当前使用中的版本新增更明显的绿色高亮
6. 已将联调结果与体验增强结果回写到 `CHANGES/nocode-version-management-v2/notes.md`。

## 当前决策
### 决策 1：当前 change 只围绕前端修改版本，不做泛化应用状态历史
- 原因：老板已明确目标是“他们对前端进行修改的版本记录”，继续做应用级版本模型会偏题。
- 验证：change 文档已完成纠偏。
- 回滚：无，除非老板后续再次扩大范围。

### 决策 2：第一阶段按“文件版本目录 + 数据库索引”落地，不做真实 Git commit
- 原因：老板需要的是像 Git 一样有层级的前端版本文件系统，同时数据库保存迭代信息和版本路径，但不要求真实 Git 提交。
- 验证：`design.md` / `notes.md` / 当前代码骨架已完成这一方向的收敛。
- 回滚：若后续还要继续简化，可再压缩元信息字段，但当前正式方向仍以该模型为准。

### 决策 3：不再把代码 diff 作为 NoCode 版本页面向用户的主能力
- 原因：老板已明确，NoCode 用户没必要接触代码，也不该被误导去理解代码层变化；同时系统也无法可靠知道页面业务上具体改了什么。
- 验证：当前需求边界已重新确认。
- 回滚：除非后续明确增加“开发者视图”，否则不恢复代码 diff 作为主展示路径。

## 当前验证
- change 文档验证：
  - `proposal.md / tasks.md / design.md / spec-delta.md / notes.md / release-summary.md` 已齐全
  - 当前 change 已形成完整的 proposal -> implementation -> validation -> notes 收口链路
- 后端编译验证：
  - 已显式注入 `JAVA_HOME / MAVEN_HOME / PATH`
  - `./mvnw -q -DskipTests compile` 已通过
- 前端构建验证：
  - `NocodeFront/yu-ai-code-mother-frontend` 已执行 `npm run build` 通过
  - 在体验增强后再次 build，仍通过
  - 仍存在 chunk >500k 警告，但不是当前主线阻塞项
- 真实接口联调验证：
  - 登录成功
  - 应用列表查询成功
  - 真实代码生成成功
  - 提交版本成功
  - 标记稳定版本成功
  - 回滚版本成功
  - 列表返回字段验证通过：
    - `sourceType`
    - `sourceVersionId`
    - `isStable`
    - `currentVersion`

## 当前风险
1. 当前最大未完成项已不再是主链路联调，而是是否还要继续推进 Phase 2B 的体验增强范围。
2. `currentVersion` 当前在 VO 转换时逐条查 `app`，未来版本量上来后可能需要优化。
3. 当前“稳定版本”允许多条记录同时存在，这是现阶段设计选择；若未来要限制唯一稳定版本，需要新 change。
4. 前端构建仍有 chunk >500k 警告，但不是当前主线阻塞项。
5. Java / Maven 依赖显式环境变量注入，后续最好把这套路径写进 `TOOLS.md`，避免再次误判。

## 变更文件
- RESP/AI2AI/latest.md
- CHANGES/nocode-version-management-v2/tasks.md
- CHANGES/nocode-version-management-v2/notes.md
- CHANGES/nocode-version-management-v2/release-summary.md

## Next Action
继续只推进一个最小子步：筛选本轮是否需要把相关图片一并纳入提交，随后分别在 workspace / NoCode / NocodeFront 执行 push；若图片不属于本轮核心产物，则直接跳过图片只 push 代码与文档。
