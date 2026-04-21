# Notes

## Frontend Minimal Change List

### 1. AppChatPage.vue

需要从单一 `isGenerating` 升级为 generation 状态模型：

- 新增 `currentGenerationState`（或等价 refs）
  - `generationId`
  - `status`
  - `phase`
  - `aiMessageIndex`
- 将当前 `eventSource` 从 `generateCode()` 局部变量提升为组件级可控引用
- 在发送消息时创建新的 generation 上下文，并把 generationId 绑定到当前 AI 占位消息
- 在 SSE 消息处理时校验 `generationId`，旧 generation 的事件直接忽略
- `done / error / stopped` 分支拆开处理：
  - `success` -> 刷新预览
  - `stopped` -> 不刷新预览
  - `failed` -> 展示失败提示
- 输入区按钮交互调整：
  - 生成中时显示“终止生成”
  - 停止后恢复可发送状态
- 页面增加轻量流程可视化：
  - 理解需求
  - 生成页面
  - 刷新预览
  - 完成

### 2. 类型与消息结构

建议补一个前端 generation 类型文件或在页面内先最小定义：

```ts
interface GenerationState {
  generationId: string
  status: 'idle' | 'generating' | 'stopped' | 'failed' | 'success'
  phase: 'understanding' | 'generating' | 'refreshing_preview' | 'completed'
  aiMessageIndex: number
}
```

建议 AI 消息对象后续可补：
- `generationId?: string`
- `stopped?: boolean`
- `failed?: boolean`

用于消息级展示与状态隔离。

## Backend Minimal Change List

### 1. 新增 generation runtime registry

建议新增一个轻量运行时组件，例如：

- `GenerationRuntimeRegistry`
- 内部 `ConcurrentHashMap<String, GenerationRuntimeState>`

职责：
- 注册当前 generation
- 查询 generation 是否属于当前 app/user
- 更新 status / phase
- 标记 stopRequested
- 执行 cancelAction（若存在）
- 在 completed / failed / stopped 后清理 registry

### 2. AppController.java

当前 `/app/chat/gen/code` 需要补 generation 语义：

- 请求开始时生成 `generationId`
- 首次事件发送 `GENERATION_STARTED`
- 中间按 phase 发送 `PHASE_CHANGED`
- 内容 chunk 用 `CONTENT_CHUNK`
- 结束时区分：
  - `GENERATION_COMPLETED`
  - `GENERATION_STOPPED`
  - `GENERATION_FAILED`

同时建议新增：

- `POST /app/chat/gen/code/stop`

请求体最小建议：

```json
{
  "appId": 123,
  "generationId": "gen_xxx"
}
```

### 3. AppServiceImpl.java

- `chatToGenCode(...)` 需要扩成携带 generation 上下文的版本
- 在进入 AI 生成前完成 generation 注册
- 在 stop 场景下避免继续走成功完成逻辑
- 需要明确 chat history 在 stop 时是否照常记录（建议保留用户消息，AI 回复按已终止收口）

### 4. AiCodeGeneratorFacade.java

这是 stop 真取消的关键接入层：

- `processTokenStream(...)`：优先尝试拿到 token stream 的 cancel 能力并挂到 registry.cancelAction
- `processManualStreamingChat(...)`：尝试保存 streaming handle/cancel hook
- 若底层 cancel 暂不可得，也要支持上层通过 `stopRequested` 忽略后续完成逻辑

### 5. GlobalExceptionHandler.java

- SSE 错误响应建议逐步统一到 generation 事件模型
- 第一版可保留 `business-error`，但消息体里建议带上 generationId / status=failed / phase

## Suggested Files To Touch (First Implementation)

### Frontend
- `NocodeFront/yu-ai-code-mother-frontend/src/pages/app/AppChatPage.vue`
- （可选）新增 `src/types/generation.ts`

### Backend
- `NoCode/src/main/java/com/yuaicodemother/controller/AppController.java`
- `NoCode/src/main/java/com/yuaicodemother/service/impl/AppServiceImpl.java`
- `NoCode/src/main/java/com/yuaicodemother/ai/core/AiCodeGeneratorFacade.java`
- `NoCode/src/main/java/com/yuaicodemother/ai/core/handler/StreamHandlerExecutor.java`（若事件包装在此层接）
- `NoCode/src/main/java/com/yuaicodemother/exception/GlobalExceptionHandler.java`
- （新增）`GenerationRuntimeRegistry`
- （新增）generation 相关 DTO / enum / state 类

## Validation Checklist

### 主路径
- 发送消息后，前端进入 generation 状态并显示 phase
- 收到内容 chunk 时只更新当前 generation 对应消息
- 成功完成后刷新预览，并将状态置为 success/completed

### Stop 路径
- 生成中点击“终止生成”后，按钮与输入状态正确恢复
- 当前 AI 消息停止追加内容，并标记为已终止
- 不触发预览刷新
- 旧 generation 后续事件不会污染新一轮生成

### 异常路径
- 业务错误时状态置为 failed
- 前端能展示失败，而不是误判为 stopped / success
- registry 能正确清理，避免残留 generation 占用

## T6 Review Findings

### 问题 1：stop 成功后，前端可能把本轮消息静默关闭但未稳定标记为“已终止”
- 严重度：中
- 是否阻塞：非阻塞
- 说明：`stopGeneration()` 成功分支里直接关闭 EventSource 和恢复 `isGenerating`，但若 `GENERATION_STOPPED` 事件未及时送达，当前消息可能缺少稳定的 stopped 文案收口。
- 最小修复建议：在 stop 成功分支里同步把当前 AI 消息标记为 stopped，并补默认提示文案。

### 问题 2：后端 business-error 事件未带 generationId，前端错误分支无法严格按 generation 隔离
- 严重度：中
- 是否阻塞：非阻塞
- 说明：当前 `GlobalExceptionHandler.handleSseError()` 仍只返回 `error/code/message`，未附带 generationId/status/phase。若后续存在并发/旧流场景，错误事件隔离能力不足。
- 最小修复建议：在 generation 链路里逐步统一错误消息体，补 `generationId/status=FAILED/phase`。

### 问题 3：当前 phase 可视化只存在状态模型，没有实际 UI 展示
- 严重度：低
- 是否阻塞：非阻塞
- 说明：主路径 stop/success 已接通，但用户还看不到“理解需求 / 生成页面 / 刷新预览 / 完成”的显式流程提示。
- 最小修复建议：后续加轻量状态条或文本提示，不必阻塞本轮收口。

### 问题 4：底层 LLM 真取消能力仍未打通
- 严重度：中
- 是否阻塞：非阻塞
- 说明：当前 stop 已做到前端停、后端截流、不刷新预览，但不能保证底层 provider 请求一定立即停止。
- 最小修复建议：后续继续评估 langchain4j 当前版本升级或本地桥接方案。

## Build Progress Update

### 已落地的最小实现

#### Backend
- 新增 `AppStopGenerationRequest`
- 新增 `GenerationStatusEnum` / `GenerationPhaseEnum`
- 新增 `GenerationRuntimeState`
- 新增 `GenerationRuntimeRegistry`
- `AppController.chatToGenCode` 已生成 `generationId`，并输出：
  - `generation-started`
  - `CONTENT_CHUNK`
  - `generation-completed`
  - `generation-stopped`
- 新增 `POST /app/chat/gen/code/stop`
- `AppService` / `AppServiceImpl` 已接入 stop 主链路
- `StreamHandlerExecutor` 已按 `generationId` 做最小 stop 截流

#### Frontend
- `AppChatPage.vue` 已新增 `GenerationState`
- 生成中按钮已切换为“终止生成”
- 已支持识别：
  - `GENERATION_STARTED`
  - `CONTENT_CHUNK`
  - `GENERATION_COMPLETED`
  - `GENERATION_STOPPED`
- stop 后不再刷新预览
- 已增加 generationId 隔离，旧流不会继续污染当前轮

### 验证结果

#### Backend compile
已通过：

```bash
export JAVA_HOME=/home/cabbage/.local/java MAVEN_HOME=/home/cabbage/.local/maven PATH=/home/cabbage/.local/java/bin:/home/cabbage/.local/maven/bin:$PATH && ./mvnw -q -DskipTests compile
```

#### Frontend build
已通过：

```bash
npm run build
```

已知非阻塞项：
- 前端仍有既有 chunk > 500k warning

## Preliminary Owner Checklist

当前阶段老板暂不需要改数据库。
只有在后续决定持久化 generation 历史时，才需要老板执行 schema 变更。届时再单独提供 SQL 清单。
