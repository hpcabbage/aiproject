# Release Summary - nocode-version-management-v2

## 变更摘要

本轮完成了 NoCode 版本管理 V2 的 Phase 2A 最小闭环，把原先偏“版本快照列表”的能力，升级成更接近 NoCode 用户心智的版本管理中心。

本轮核心不是做代码 diff，而是补齐版本管理的产品语义：
- 当前使用中的版本
- 稳定版本
- 回滚生成的版本
- 版本来源关系
- 稳定版本的最小操作闭环

## 用户可感知效果

用户现在可以在版本页直接看到：
- 哪一版是当前正在使用的版本
- 哪一版被标记成稳定版本
- 哪一版是通过回滚生成的
- 当前版本是恢复自哪一版 / 来源于哪一版

用户现在还可以：
- 手动把某一版标记为稳定版本
- 取消稳定版本标记
- 在不理解代码 diff 的前提下完成版本识别与回溯

## 当前验证

### 前端验证
- `npm run build` 已通过
- 版本列表标签、来源关系、详情页说明、稳定版本按钮均已接通

### 后端验证
- 已显式注入 Java / Maven 环境：
  - `JAVA_HOME=/home/cabbage/.local/java`
  - `MAVEN_HOME=/home/cabbage/.local/maven`
  - `PATH=$JAVA_HOME/bin:$MAVEN_HOME/bin:$PATH`
- `./mvnw -q -DskipTests compile` 已通过
- 编译过程中额外抓到并修复了 2 个真实问题：
  - `AppServiceImpl.java` 缺少 `AppSetVersionStableRequest` import
  - `AppFrontendVersioningServiceImpl.java` 中 `appMapper.update(...)` 写法错误

## 已知风险

- 真实后端接口联调还没补
- `currentVersion` 当前在 VO 转换时逐条查询 `app`，后续版本量大时可能需要优化
- 当前允许多个版本同时标记为稳定版本，这是当前设计选择；如果未来要限制唯一稳定版本，需要新变更
- 前端仍有 chunk > 500k 警告，但不阻塞本轮提交

## 提交建议

### 推荐单提交标题
- `feat: 完成 NoCode 版本管理 V2 Phase 2A 最小闭环`

### 如果拆提交，推荐拆法

#### 提交 1
- 标题：`feat: 补版本当前态与来源版本后端语义`
- 范围：
  - `currentVersionId`
  - `sourceVersionId`
  - `isStable`
  - VO 返回与后端写入语义
  - stable toggle 后端接口

#### 提交 2
- 标题：`feat: 升级版本页标签展示与稳定版本交互`
- 范围：
  - 版本列表标签
  - 来源关系展示
  - 版本详情增强
  - 稳定版本按钮交互
  - 前端 API typings 同步

#### 提交 3
- 标题：`docs: 收口版本管理 V2 Phase 2A 设计与变更记录`
- 范围：
  - `proposal.md`
  - `tasks.md`
  - `design.md`
  - `spec-delta.md`
  - `notes.md`
  - 本文件 `release-summary.md`

## 当前更推荐的提交策略

如果你希望这轮改动作为一个完整产品闭环提交，当前更推荐：

**直接单提交。**

原因：
- 数据模型、后端语义、前端展示、最小交互、本轮文档收口是同一个产品动作
- 强行拆开会增加理解成本
- 当前这轮最适合作为一个完整 feature 提交

## 进展同步

一句话版本：

**NoCode 版本管理 V2 Phase 2A 已完成最小闭环，当前版本、稳定版本、回滚来源、稳定版本操作都已落地，前端构建与后端编译均已通过，剩余主要是接口联调验证。**
