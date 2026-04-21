# Release Summary - nocode-generation-control

## 变更摘要

本轮围绕 NoCode 聊天生成链路，补齐了第一版“生成任务控制”最小闭环：

- 为每轮生成引入 `generationId`
- 引入 generation runtime 状态（status / phase / stopRequested）
- 新增后端 stop 接口：`POST /app/chat/gen/code/stop`
- 将 SSE 输出从纯文本流扩展为 generation 事件流
- 前端聊天页支持“终止生成”按钮
- stop 后不再刷新预览，并对旧流做 generationId 隔离

## 用户可感知效果

用户现在在应用聊天页会感知到：

- 生成进行中时，发送按钮会切换为“终止生成”
- 点击“终止生成”后，本轮生成会停止收流
- 停止后页面不会继续刷新到半成品预览
- 新一轮生成不会再被上一轮残留流污染

## 当前验证

### 后端编译
已通过：

```bash
export JAVA_HOME=/home/cabbage/.local/java MAVEN_HOME=/home/cabbage/.local/maven PATH=/home/cabbage/.local/java/bin:/home/cabbage/.local/maven/bin:$PATH && ./mvnw -q -DskipTests compile
```

### 前端构建
已通过：

```bash
npm run build
```

### 审查结论
已完成 T6 Reviewer 复查，当前没有阻塞继续收口的硬问题。

## 已知风险

- stop 目前是“产品层可控停止”，不能完全承诺底层 LLM/provider 请求一定即时物理取消
- `business-error` 事件尚未完全纳入 generationId 协议，复杂并发场景下错误隔离仍可继续增强
- phase 已有状态模型，但前端尚未做更明确的流程可视化 UI
- stop 成功后的消息文案收口还可继续补强
- 前端仓库中仍存在与本次需求无关的未提交改动（如 `BasicLayout.vue` 的 route debug banner、`router/index.ts` 的版本管理路由），提交本需求前需要继续按提交范围拆分，避免把无关改动一并提交

## 提交建议

建议本阶段 commit 标题可用：

```text
feat：补齐生成任务终止与状态控制最小闭环
```

如果想拆两次提交，也可按：

1. `feat：后端接入 generation runtime 与 stop 接口`
2. `feat：前端接入终止生成与 generation 状态收口`

## 进展同步

- `CHANGES/nocode-generation-control/tasks.md`：T1-T6 已完成
- 当前已进入阶段性发布收口
- 下一阶段更适合继续做：
  1. phase 可视化 UI
  2. stop 成功后的消息收口增强
  3. generation 错误事件协议统一
  4. 评估底层流式 cancel 的进一步桥接
