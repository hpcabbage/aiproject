# Design

## Context

当前前端 `AppChatPage.vue` 使用 `EventSource` 直接连接 `/app/chat/gen/code`，以局部变量维护 SSE 连接，并以 `isGenerating` 控制 UI。后端 `AppController.chatToGenCode` 直接把 `Flux<String>` 写入 SSE，结束时发 `done`。整个链路缺少 generation 级状态对象。

## Constraints

- 需要兼容现有聊天式生成主链路，避免大重构。
- 第一版应优先实现最小可用能力，而不是完整任务系统。
- 用户已确定采用多角色工作流推进，需要文档先收口后再进入实现。
- 数据库变更最好控制在最小范围，必要时由老板手动执行 schema 变更。

## Options Considered

### 方案 A：仅前端 stop + 本地状态
优点：快。
缺点：后端无真实任务状态，无法支撑后续 retry / 执行详情 / stop 语义闭环。

### 方案 B：引入最小 generation 状态体系 + 阶段事件（推荐）
优点：能同时支撑 stop、阶段展示、错误归因、后续扩展。
缺点：需要补接口语义，可能涉及最小数据持久化。

### 方案 C：一步到位做完整任务中心
优点：能力完整。
缺点：范围过大，不适合当前节奏。

## Decision

采用方案 B：

1. 先定义 generation 级概念：`generationId`、`status`、`phase`
2. 第一版优先做到：
   - 前端 stop 按钮
   - SSE 业务事件化
   - 阶段可视化
   - 状态收口
3. 后端 stop 语义按“两层实现”推进：
   - V1：前端 stop + 服务端感知终止状态，避免旧流污染
   - V2：桥接 LangChain4j / 底层 streaming cancel
4. 数据层优先评估两种落点：
   - 仅内存级 generation registry（适合最小实现）
   - 应用生成记录表 / 扩展字段（适合可追踪实现）

## Consequences

- 前端需要从单一 `isGenerating` 升级为 generation 状态模型。
- SSE 协议需要支持业务事件，不再只有文本 chunk + done。
- 后端需要明确 phase 切换点与 stop 后的落库/预览策略。
- 若需要持久化 generation 状态，老板可能需要配合执行 schema 变更。

## Current Code Findings

### Frontend

- `AppChatPage.vue` 当前只有单一 `isGenerating` 布尔状态，没有 generationId / status / phase。
- `generateCode()` 内部把 `eventSource` 定义为局部变量，外部无法直接 stop 当前连接。
- `done` 和 `onerror` 分支都会在结束后刷新预览，缺少“已终止不刷新”的状态分流。
- 现有消息列表以 `aiMessageIndex` 追踪当前回复，尚未防止旧流回写污染新一轮生成。

### Backend

- `AppController.chatToGenCode` 直接把 `Flux<String>` 写入 SSE，协议仅包含 `data` 和 `done` / `business-error`。
- `AppServiceImpl.chatToGenCode` 当前没有 generation 级对象，只做 app 权限校验、历史写入和流转发。
- `AiCodeGeneratorFacade` 中：
  - `processTokenStream()` 已能在 `TokenStream` 层面挂回调，理论上适合桥接 cancel / phase 事件。
  - `processManualStreamingChat()` 使用 `StreamingChatModel.chat(...)`，当前实现未保存流式 handle。
- `StreamHandlerExecutor` 只按代码生成类型包装输出，不承载 generation 状态。

### Preliminary Conclusion

- 第一版可以先 **不改数据库**，通过“前端持有 current generation + 后端内存级 generation registry”完成最小闭环。
- 若要支持跨请求查询、历史回看、可靠 retry，再考虑持久化 generation 表或扩展现有记录。
- 第一版真正的技术关键点不是表结构，而是：
  1. 让 SSE 协议携带 generationId / phase / status
  2. 让前端 stop 后不再刷新预览、不再接收旧流
  3. 在 `TokenStream` / `StreamingChatModel` 层找到 cancel 接入点

## Minimal Generation Model

### Frontend transient state

```ts
interface GenerationState {
  generationId: string
  status: 'idle' | 'generating' | 'stopped' | 'failed' | 'success'
  phase: 'understanding' | 'generating' | 'refreshing_preview' | 'completed'
  aiMessageIndex: number
}
```

说明：
- `generationId` 用于隔离旧流与新流。
- `status` 用于决定按钮、提示文案与结束分支。
- `phase` 只表达用户可见阶段，第一版不要求真实多 Agent 拆分。
- `aiMessageIndex` 用于继续复用当前消息列表结构，避免一次改太大。

### Backend in-memory registry

```java
class GenerationRuntimeState {
    String generationId;
    Long appId;
    Long userId;
    GenerationStatus status;
    GenerationPhase phase;
    boolean stopRequested;
    Runnable cancelAction; // optional, available when underlying stream supports cancel
}
```

说明：
- 第一版可先放在内存 registry（ConcurrentHashMap）中。
- `cancelAction` 作为可选桥接点，为 LangChain4j cancel 预留。
- 当 stop 发生但底层未真取消时，至少可通过 `stopRequested/status` 阻止后续 UI 与预览更新。

## SSE Event Contract Draft

统一建议采用业务事件包装，而不再只依赖默认 `message` + `done`：

```json
{
  "generationId": "gen_xxx",
  "type": "PHASE_CHANGED",
  "phase": "generating",
  "status": "generating",
  "payload": {}
}
```

### 建议事件类型

- `GENERATION_STARTED`
- `PHASE_CHANGED`
- `CONTENT_CHUNK`
- `GENERATION_STOPPED`
- `GENERATION_FAILED`
- `GENERATION_COMPLETED`

### 第一版 phase 映射建议

- 请求进入并通过权限/参数校验后，发送 `GENERATION_STARTED`
- 开始创建模型流前，phase = `understanding`
- 首个有效内容 chunk 或进入代码生成主流时，phase = `generating`
- 流结束、准备刷新预览时，phase = `refreshing_preview`
- 预览刷新完成后，phase = `completed`

### 向后兼容建议

第一版可保持 `business-error` 与 `done`，但新增事件消息体内统一带 `generationId/status/phase`，前端逐步切换解析逻辑，避免一次性切断旧处理方式。

## Stop Entry Draft

### 最小接口建议

- `POST /app/chat/gen/code/stop`
- body: `{ appId, generationId }`

### 第一版语义

- 校验当前 generation 是否属于当前用户与 app
- 将 registry 中该 generation 标记为 `stopRequested = true`, `status = stopped`
- 若底层可拿到 cancel handle，则执行 cancel
- SSE 尽量下发 `GENERATION_STOPPED`
- 前端收到 stopped 后：
  - 关闭当前 EventSource
  - 停止 loading
  - 不刷新预览
  - 允许继续发送下一轮

## Rollback

若 stop 真取消桥接风险过高，可先回退到：
- 保留 generationId / status / phase
- stop 只做前端收口与服务端逻辑忽略后续写入
- 暂不承诺底层模型请求立即中止
