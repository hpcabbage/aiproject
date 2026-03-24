# Checkout.com 支付渠道接入调研（开发 / 支付中台视角）

> 目标：从支付中台接入的角度，整理 Checkout.com（用户口语里常写成 check.out / checkout）的接入方式、关键能力、落地事项、系统设计点、联调要点与风险点。
>
> 说明：本文基于 Checkout.com 官方开发文档目录、API 文档入口与开发主题页面整理，偏“技术方案梳理 + 中台接入 checklist”，不是逐字段 API 翻译稿。

---

## 1. Checkout.com 是什么

Checkout.com 是一家国际化支付服务商，提供：

- 在线收单（cards + APMs）
- 3DS / Authentication
- Tokenization / Vault
- Refund / Void / Capture
- Payouts
- Webhooks
- 风控、争议处理、报告能力
- Hosted / SDK / API-only 多种接入模式

对支付中台来说，它更像一个“可支持多支付方式、多接入形态、国际卡能力较完整”的 PSP / Acquirer 能力层。

---

## 2. 从支付中台视角，接入它到底要做什么

如果你是支付中台，要接 Checkout.com，核心不是“调一个下单接口”这么简单，而是要把它纳入你的统一支付抽象层。

至少要覆盖这些能力域：

1. **商户/渠道配置管理**
2. **统一下单与支付方式路由**
3. **支付状态推进**
4. **3DS / challenge / redirect 流程处理**
5. **capture / void / refund**
6. **webhook 异步通知**
7. **token / stored credentials / recurring**
8. **风控与错误码映射**
9. **对账、报表、争议处理**
10. **测试、灰度、监控、告警**

---

## 3. 官方文档显示的主要接入形态

Checkout.com 在官方“Accept payments”文档里给出了多条主路径：

- **Payments API**：直接用 API 收单
- **Payment Setup API**：更适合复杂支付方式 / payment method orchestration
- **Flow**：Checkout.com 的预构建支付 UI
- **Hosted Payments Page**：托管支付页
- **Payment Links**：支付链接
- **Stored card details**：绑卡 / 复用卡
- **3D Secure**：认证能力
- **Webhooks**：异步事件通知

对支付中台来说，通常最有价值的是下面 4 条：

### A. API-only（推荐用于支付中台）
适合：
- 你已经有自己的收银台 / cashier
- 想把渠道能力封装进统一支付抽象
- 想统一订单、风控、路由、幂等、对账

中台一般会优先选择这条。

### B. Flow / Hosted Page
适合：
- 快速接入
- 降低 PCI 压力
- 前端希望少做卡信息表单与 3DS 页面编排

如果你中台目标是“快速上线海外收单”，可以把 Hosted / Flow 作为短期方案。

### C. Stored credentials / recurring
适合：
- 订阅
- 自动续费
- 扣款协议
- 卡绑定与复用

### D. Webhooks + payment lifecycle management
这是中台落地时几乎必做的，不做就无法稳定推进支付状态机。

---

## 4. 中台接入前，要先搞清楚的业务边界

在做技术前，先把这些产品问题定下来：

### 4.1 你打算接什么能力
- 只接 cards？
- 还是 cards + local payment methods？
- 是否要支持 wallets（Apple Pay / Google Pay）？
- 是否要支持 recurring / MIT / CIT？
- 是否要支持 payout？
- 是否要支持 chargeback / dispute 管理？

### 4.2 你的支付中台抽象模型是否够用
你现有抽象至少要能表达：

- 渠道：checkout_com
- 支付产品：card / apm / wallet
- 交易类型：authorize / capture / sale / refund / void
- 支付动作：同步返回、重定向、challenge、异步通知
- 支付状态：created / pending / approved / declined / captured / refunded / voided / expired
- 渠道参考号：payment_id / action_id / request_id / processing reference
- 认证信息：3DS, ECI, liability shift, authentication status
- 令牌信息：token / instrument / customer / stored credential marker

如果你现在的中台只有“统一支付”一个粗粒度接口，没有交易生命周期模型，接 Checkout.com 时会很痛苦。

---

## 5. 官方能力拆解成中台功能模块

### 5.1 账号与认证
官方文档显示支持：
- **API keys**
- **OAuth 2.0 client credentials**

中台需要做：
- 渠道账号配置表
- 环境隔离（sandbox / production）
- key 生命周期管理
- 敏感字段加密存储
- key 轮换能力
- 请求签名 / 鉴权头封装

建议配置模型：
- channel_code
- merchant_entity / processing_channel_id（如果有多实体 / 多处理通道）
- secret_key / public_key / oauth client
- environment
- webhook secret / webhook endpoint id
- enabled payment methods
- country / currency whitelist

---

### 5.2 下单 / 支付请求
Checkout.com 的官方能力说明里，Payments API 支持：
- 使用 token 发起支付
- 使用 network token
- 使用 payment instrument
- 使用完整卡信息发起支付

中台需要抽象：

#### 统一支付入参
- merchant_order_no
- payment_no
- amount
- currency
- subject / description
- customer
- billing / shipping
- capture strategy（立即扣款 or 先授权后扣款）
- return_url / success_url / failure_url
- notify_url（若中台自己消费 webhook，这个会转成内部事件而不是给业务方）
- payment method data
- device / risk context
- stored credential flags

#### 中台内部要支持的支付模式
- **Sale**：一步支付
- **Auth**：仅授权
- **Capture**：后续扣款
- **Void**：撤销授权
- **Refund**：退款

---

### 5.3 3DS / Authentication
官方文档明确有：
- 3D Secure
- Standalone sessions
- authentication optimization
- 3RI authentication

这意味着你的中台不能只支持“同步扣款结果”。
必须支持：

- frictionless
- challenge
- redirect / browser interaction
- challenge completion callback
- authentication result persistence

中台需要设计：

#### 支付状态机
建议至少有：
- INIT
- REQUIRES_ACTION
- PROCESSING
- AUTHORIZED
- CAPTURED
- DECLINED
- VOIDED
- REFUNDED
- EXPIRED
- FAILED

#### 前后端交互能力
- 下单返回 `next_action`
- next_action 可能是：
  - redirect_url
  - sdk_action
  - challenge payload
  - no_action
- 前端完成 challenge 后，后端再 query payment / 等 webhook 补状态

#### 需要记录的认证字段
- 3ds.enabled / attempted / applied
- eci
- cavv / xid（如返回）
- liability_shift
- auth_status
- challenge indicator
- exemption flag（如适用）

如果你是支付中台，这部分建议抽象成统一 `payment_action` 结构，不要把 Checkout.com 的前端动作模型直接裸露给上游业务。

---

### 5.4 Webhooks
官方文档目录明确给出：
- Receive webhooks
- Configure your webhook server
- Manage webhooks in Dashboard
- Manage webhooks using API
- Resend webhooks

并且事件类型非常多，至少覆盖：
- payment_approved
- payment_declined
- payment_pending
- payment_captured
- payment_capture_declined
- payment_refunded
- payment_voided
- payment_expired
- authentication_* 系列
- dispute_* 系列
- payout_* 系列

#### 中台必须做的事情
1. 暴露专用 webhook 接口
2. 验签 / 验来源
3. webhook 幂等处理
4. 保存原始报文
5. 事件映射成内部统一事件
6. 通过 payment_id / merchant reference 做交易归并
7. 支持延迟补单与重放

#### 推荐落地模型
- raw_webhook_log
- channel_event_dedup
- payment_event
- payment_status_transition_log

#### 中台统一事件建议
- PAYMENT_AUTHORIZED
- PAYMENT_CAPTURED
- PAYMENT_FAILED
- PAYMENT_PENDING
- PAYMENT_VOIDED
- PAYMENT_REFUNDED
- PAYMENT_EXPIRED
- PAYMENT_AUTH_REQUIRED
- DISPUTE_OPENED
- DISPUTE_WON
- DISPUTE_LOST

---

### 5.5 幂等性
官方单独有一节 **Idempotency**，并明确强调：

> safely retry API requests, without the risk of duplicate requests

这对支付中台非常重要。

你至少要做两层幂等：

#### 渠道外层（中台自身）
- merchant_order_no + operation_type
- payment_no + operation_type
- refund_no

#### 渠道内层（发给 Checkout.com）
- 为支付、capture、refund 等关键写操作生成唯一 idempotency key
- key 与请求体 hash 绑定
- 请求失败可安全重试

推荐：
- `pay:{channel}:{paymentNo}`
- `capture:{channel}:{paymentNo}:{captureNo}`
- `refund:{channel}:{refundNo}`

并保存：
- idempotency_key
- request_payload_hash
- channel_request_id
- channel_response_snapshot

---

### 5.6 支付生命周期管理
官方 `Manage payments` 目录显示，至少有这些能力：

- Authorize a payment
- Capture a payment
- Retry a payment
- Void a payment
- Refund a payment
- Reverse a payment
- Get payment details
- Get payment actions
- Get a list of payments
- Search and filter payments

所以你的中台接入不能只做“支付下单”。
至少还要封装：

- 查询支付单
- 查询动作流水
- 撤销
- 部分捕获 / 全额捕获（如果支持）
- 部分退款 / 多次退款（如果支持）
- 重试策略
- 交易查询补偿任务

建议你的中台渠道接口长这样：

- `createPayment()`
- `queryPayment()`
- `capturePayment()`
- `voidPayment()`
- `refundPayment()`
- `queryRefund()`
- `parseWebhook()`
- `queryPaymentActions()`

---

### 5.7 绑卡 / Tokenization / Vault
官方文档目录明确有：
- Store and manage credentials
- Store credentials
- Payment instruments
- Network tokens
- Tokenize credentials
- Tokenize card verification value
- Update stored credentials
- Forward stored credentials
- Migrate credentials

这意味着如果你的中台要支持 recurring / subscription / MIT，就要考虑：

#### 你是否要自己持久化 token 元数据
一般建议存：
- channel_customer_id
- instrument_id / token_id
- token_type
- masked_pan
- expiry month/year
- brand
- issuer country
- fingerprint（如果有）
- reusable flag
- network token flag

#### 你是否要支持 stored credential 合规标识
比如：
- CIT 首次绑卡
- MIT 后续扣款
- recurring / unscheduled
- 3RI 场景

这部分一定要纳入统一协议，不然以后切别的国际卡渠道会重复踩坑。

---

### 5.8 测试能力
官方文档有单独的：
- Test cards
- Payments testing
- Disputes testing
- AVS / ANI / recommendation code testing

这对中台接入很关键，因为你应该定义一套标准测试矩阵：

#### 基础用例
- 成功支付
- 支付失败
- 风险拒绝
- 3DS frictionless
- 3DS challenge
- authorize + capture
- authorize + void
- full refund
- partial refund
- webhook delayed arrival
- webhook 重复投递
- query 补单成功

#### 高级用例
- stored credential 首扣
- stored credential 复扣
- 幂等重试
- 网络超时后补查
- 渠道 pending -> success
- 多币种金额格式

---

## 6. 支付中台技术实现建议

## 6.1 渠道适配器设计
建议做成：

- `CheckoutComChannelClient`
- `CheckoutComPaymentService`
- `CheckoutComWebhookService`
- `CheckoutComMapper`
- `CheckoutComCodeTranslator`

### 核心职责

#### ChannelClient
- 发 HTTP 请求
- 设置鉴权头
- 设置 idempotency
- 统一超时 / 重试 / 日志

#### Mapper
- 内部模型 <-> Checkout.com 模型转换

#### CodeTranslator
- 渠道错误码 / 事件码 -> 内部错误语义

#### WebhookService
- 验签
- 反序列化
- 幂等
- 事件映射

---

## 6.2 推荐表设计

### channel_merchant_account
- id
- channel_code
- account_name
- env
- secret_config
- status

### payment_order
- payment_no
- merchant_order_no
- amount
- currency
- status
- channel_code
- channel_payment_id
- channel_reference
- auth_status
- captured_amount
- refunded_amount

### payment_operation
- operation_no
- payment_no
- operation_type
- amount
- status
- channel_request_id
- channel_operation_id

### payment_channel_snapshot
- payment_no
- raw_request
- raw_response
- last_query_response
- last_webhook_payload

### webhook_event_log
- event_id
- channel_code
- event_type
- channel_event_id
- channel_payment_id
- payload
- process_status

### payment_token
- token_id
- customer_id
- channel_code
- channel_token
- brand
- last4
- exp_month
- exp_year
- token_status

---

## 6.3 错误码和状态码映射
官方文档目录里有：
- API response codes
- error codes
- AVS / CVV / recommendation codes 等

中台不要把渠道原始码直接暴露给业务方。
建议做三层映射：

### 第一层：渠道原始错误
- code
- response_code
- decline_code
- reason

### 第二层：中台标准错误类
- USER_INPUT_INVALID
- CARD_DECLINED
- AUTHENTICATION_REQUIRED
- FRAUD_REJECTED
- ISSUER_UNAVAILABLE
- CHANNEL_TIMEOUT
- CHANNEL_SYSTEM_ERROR
- DUPLICATE_REQUEST
- REFUND_NOT_ALLOWED

### 第三层：业务展示语义
- 支付失败，请更换银行卡
- 需要完成 3DS 验证
- 渠道繁忙，请稍后再试

---

## 7. 接入 Checkout.com 的推荐落地路径

### Phase 1：最小可用接入
目标：先跑通国际卡基础收单

做这些：
- API key / 环境配置
- 创建支付
- 查询支付
- webhook 接收
- 支付状态流转
- 基础错误码映射
- sandbox 测试

### Phase 2：交易管理补齐
- authorize / capture / void / refund
- 补单任务
- webhook 重放
- 幂等体系完善
- 风控字段透传

### Phase 3：高级能力
- 3DS 完整支持
- stored credentials
- recurring / MIT / CIT
- 多 payment methods
- dashboards / reconciliation
- disputes / reports

### Phase 4：中台产品化
- 渠道路由
- 降级与切换
- 失败重试策略
- 渠道监控评分
- 配置中心化
- 渠道 SLA / 健康度分析

---

## 8. 真正接入前要向渠道方 / 商务 / 运营确认的问题

### 8.1 账户与能力开通
- 你们拿到的是 sandbox 还是 production account？
- 是否已开 cards？
- 是否已开 3DS？
- 是否已开 recurring / stored credentials？
- 是否已开 refund / partial capture？
- 是否已开 disputes / reports API？
- 是否已开 local payment methods？哪些国家可用？

### 8.2 清结算 / 财务
- 结算币种有哪些？
- 收单币种和结算币种是否一致？
- 汇率与手续费如何体现？
- 对账文件如何下载？
- payout report / settlement report 获取方式？

### 8.3 风控与合规
- 是否要求 PCI SAQ A / A-EP / D？
- 卡数据是否完全由 Checkout.com 托管？
- 3DS exemption 使用规则？
- 存量 token 迁移是否支持？

### 8.4 技术运维
- webhook 签名机制是什么？
- webhook 重试规则是什么？
- rate limit 策略是什么？
- 生产环境 IP 白名单要求？
- 有无固定出站 / 入站 IP 文档？

---

## 9. 支付中台接入 Checklist

## 9.1 账号配置
- [ ] 获取 sandbox 账户
- [ ] 获取 production 账户
- [ ] 创建 API keys / OAuth client
- [ ] 确认环境域名
- [ ] 确认 webhook 配置

## 9.2 支付主流程
- [ ] 创建支付
- [ ] 查询支付
- [ ] 处理 redirect / challenge
- [ ] 接 webhook
- [ ] 做幂等
- [ ] 做补单

## 9.3 交易管理
- [ ] capture
- [ ] void
- [ ] refund
- [ ] partial refund
- [ ] operation query

## 9.4 认证与令牌
- [ ] 3DS
- [ ] tokenization
- [ ] stored credentials
- [ ] recurring / MIT / CIT

## 9.5 风险与稳定性
- [ ] code mapping
- [ ] timeout / retry
- [ ] circuit breaker
- [ ] metrics / logging / tracing
- [ ] webhook replay

## 9.6 财务与运营
- [ ] reports
- [ ] reconciliation
- [ ] disputes
- [ ] settlement data ingest

---

## 10. 一个典型的中台接入架构建议

```text
业务系统
   |
   v
统一收银台 / 支付网关
   |
   v
支付中台核心域
  - payment order
  - payment operation
  - payment status machine
  - token vault metadata
  - webhook center
  - reconciliation center
   |
   +--> Checkout.com Adapter
   |      - auth
   |      - request mapping
   |      - idempotency
   |      - webhook parse
   |      - code translation
   |
   +--> 其他支付渠道 Adapter
```

关键原则：
- 不让业务方直接理解 Checkout.com 的原生字段
- 不让业务方直接依赖 webhook 原始结构
- 统一抽象交易状态、动作、错误、认证结果

---

## 11. 我建议你优先研究的官方文档模块

如果你后面要真正落接，我建议按这个顺序读官方文档：

1. **Accept payments**
2. **Accept a payment using the Payments API**
3. **Manage payments**
4. **3D Secure**
5. **Receive webhooks**
6. **Idempotency**
7. **Manage API keys**
8. **Store and manage credentials**
9. **Test cards / Payments testing**
10. **API response codes / error codes**

---

## 12. 对你的支付中台来说，最值得抽象的几个点

如果只说工程价值，我认为最值得趁这次接入顺手升级中台的是：

### 12.1 统一 next_action 模型
用于承接：
- redirect
- 3DS challenge
- wallet action
- hosted payment jump

### 12.2 统一 payment operation 模型
用于承接：
- pay
- capture
- void
- refund
- query

### 12.3 统一 webhook event 模型
用于承接所有 PSP 的异步状态推进。

### 12.4 统一 stored credential 模型
这是后面接 Stripe / Adyen / Checkout.com / Worldpay 这类渠道时非常值钱的抽象层。

---

## 13. 实操建议：如果现在就要开始做

我建议你按这个最小开发计划推进：

### 第 1 周
- 建 Checkout.com 渠道配置模型
- 写 adapter skeleton
- 打通 sandbox auth
- 打通 create payment / query payment

### 第 2 周
- 接 webhook
- 建交易状态机
- 做幂等
- 跑基础测试用例

### 第 3 周
- 接 capture / refund / void
- 做错误码映射
- 做告警监控
- 做支付查询补偿任务

### 第 4 周
- 接 3DS / stored credentials
- 加 recurring 支持
- 补报表 / 对账 / dispute 能力

---

## 14. 结论

从支付中台角度看，Checkout.com 不是一个“只接一个支付下单接口”的渠道，而是一个需要整体纳入中台能力矩阵的国际收单渠道。

**接入它真正需要完成的核心事项是：**

- 渠道账号与鉴权接入
- 支付主链路打通
- 3DS / redirect / challenge 处理
- webhook 异步状态推进
- capture / void / refund 生命周期管理
- 幂等 / 补单 / 错误码映射
- stored credential / recurring 能力抽象
- 测试、对账、争议、运维闭环

如果你只是为了“尽快可用”，可以先走 API-only + webhook + query 的最小闭环；
如果你是为了把它纳入长期支付中台体系，就应该顺手把：

- next_action
- payment lifecycle
- token vault metadata
- webhook center
- code mapping

这些基础设施一起补齐。

---

## 15. 参考来源（本次整理依据）

- Checkout.com Docs 首页：<https://www.checkout.com/docs>
- Accept payments：<https://www.checkout.com/docs/payments/accept-payments>
- API Reference：<https://api-reference.checkout.com/>
- Receive webhooks：<https://www.checkout.com/docs/developer-resources/event-notifications/receive-webhooks>
- Idempotency：<https://www.checkout.com/docs/developer-resources/api/idempotency>
- Manage API keys：<https://www.checkout.com/docs/developer-resources/api/manage-api-keys>
- Test cards：<https://www.checkout.com/docs/developer-resources/testing/test-cards>
- Manage payments：<https://www.checkout.com/docs/payments/manage-payments>
- Store and manage credentials：<https://www.checkout.com/docs/payments/store-and-manage-credentials>
- 3D Secure：<https://www.checkout.com/docs/payments/authenticate-payments/3d-secure>

---

如果你要，我下一步可以继续帮你补两份更落地的东西：

1. **《Checkout.com 渠道接入 PRD / 技术方案模板》**
2. **《支付中台 Checkout.com Adapter 字段映射表》**

如果你点头，我就直接继续往下写。