# Spec Delta - nocode-version-management-v2

## Product Delta

当前正式规格中的版本管理能力，需要从：
- 版本快照 + 备注 + 回滚

升级为：
- 版本快照 + 备注 + 回滚 + 当前版本表达 + 稳定版本表达 + 来源版本表达

## Data Delta

建议补充：

### app
- `currentVersionId` bigint NULL COMMENT '当前使用中的前端版本 id'

### app_frontend_version
- `sourceVersionId` bigint NULL COMMENT '来源版本 id，用于表达继承/回滚来源'
- `isStable` tinyint NOT NULL DEFAULT 0 COMMENT '是否稳定版本'

## Data Scope Decision

### 必做字段
- `app.currentVersionId`
- `app_frontend_version.sourceVersionId`
- `app_frontend_version.isStable`

### 当前不做字段
- `versionRole`

原因：
- 当前版本可由 `currentVersionId` 推导
- 回滚结果可由 `sourceType=ROLLBACK` 表达
- 稳定版本可由 `isStable` 表达
- 现阶段增加 `versionRole` 会造成重复语义

## Frontend Delta

版本管理页需要新增：
- 当前使用中标签
- 稳定版本标签
- 回滚生成标签
- 来源版本说明

## API Delta

后端版本详情 / 列表返回值需要携带：
- 当前版本标识
- 稳定版本标识
- 来源版本信息

## Validation Delta

验证标准从“能提交 / 能回滚”升级为：
- 用户能一眼看懂当前版本
- 用户能识别稳定版本
- 用户能识别回滚生成版本
- 用户能看懂版本之间的来源关系
