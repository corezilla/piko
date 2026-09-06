# Piko 智能体运行时 Matrix/Element 契约 QA

版本：v0.3  
状态：等待 Slinky 评审  
日期：2026-09-06  
基础记录：`agent-runtime-contract-qa-v0.2.md`

本文记录 Matrix/Element v0.3 增量契约的已确认项与未决项。所有文档均是 Piko
草案，不代表已有实现或测试证据。

## 已确认项

| ID | 决定 | 状态 |
|---|---|---|
| MX-001 | 唯一身份模式是 ApplicationServiceVirtualUser；ManagedUser 延后且不作 fallback | 已确认 |
| MX-002 | `(project_id, ir_id)` 与 `matrix_user_id` 均唯一；display name 不参与 routing | 已确认 |
| MX-003 | v0.3 只允许 private、non-federated、non-encrypted exclusive room | 已确认 |
| MX-004 | 一个 CollaborationSession 独占一个 room；不使用 shared room/thread | 已确认 |
| MX-005 | Element 仅 ExternalLink；用户使用自己的 Matrix session；不嵌入 iframe | 已确认 |
| MX-006 | AS registration/token 由 Operator 预配置，API 只接 credential binding reference | 已确认 |
| MX-007 | 创建用 If-None-Match 星号，更新用 If-Match/ETag，mutation 均要求 Idempotency-Key | 已确认 |
| MX-008 | AS push transaction 入站；delivery checkpoint 永远是 Piko 私有状态 | 已确认 |
| MX-009 | CollaborationContract 随 POST /runs 原子创建 Session intent，不另设 create endpoint | 已确认 |
| MX-010 | Closing 停止新发送与 wakeup，收敛 obligation 后归档；participant 变化创建新 Attempt | 已确认 |
| MX-011 | MXID 使用 RFC 8785 输入、SHA-256 完整摘要和无 padding 小写 Base32 的 `piko-ir-mxid/v1` 算法 | Piko 草案待 Slinky 确认 |
| MX-012 | room 固定 private-chat、private visibility、`m.federate=false` 且不存在 encryption state | Piko 草案待 Slinky 确认 |

## 未决但不阻塞草案

| ID | 问题 | 当前安全假设 | 影响与下一步 | 状态 |
|---|---|---|---|---|
| MX-QA-001 | Pi SDK package/version 与 collaboration hook | 不声明已支持；Matrix contract 与 Pi adapter 分层 | 阻塞 Pi adapter 实测与 activation；Piko 调研并 pin | 待处理 |
| MX-QA-002 | Operator retention policy catalog Schema 与时长 | 只接受 exact、已允许 policy ref | 阻塞 retention E2E；请 Slinky 提供选择字段，Piko提供 catalog | 待处理 |
| MX-QA-003 | Homeserver/AS 最低支持版本与 Probe 项 | 未通过 Probe 的 profile 为 NotReady | 阻塞部署 readiness fixture | 待处理 |
| MX-QA-004 | CollaborationEvent wire Schema | 只保存和投递已通过 strict validation 的事件 | 阻塞 Pi/Matrix contract test fixture | 待处理 |
| MX-QA-005 | route、reply obligation 与 deadline 的精确字段 | 不从文本或 display name 推断 | 阻塞自动 obligation tracking | 待处理 |
| MX-QA-006 | Room invite/membership reconciliation timeout | 未收敛时 Session 不进入 Active/Closed | 阻塞 recovery SLO，不阻塞状态机 | 待处理 |
| MX-QA-007 | Element route 规范编码与支持版本 | 只从 approved base URL + exact room ID 构造 | 阻塞浏览器兼容 Evidence | 待处理 |
| MX-QA-008 | AS transaction、outbox 与 wakeup 容量 | fail closed/backpressure，不丢弃 durable obligation | 阻塞 performance claim | 待处理 |
| MX-QA-009 | Session title 的 authoritative source | title 仅显示，不参与 routing；禁止由 room alias 推断 | 请 Slinky 明确 title descriptor 来源 | 待处理 |
| MX-QA-010 | Archive execution 与 retention failure 的最终状态 | 保持 Closing/Unavailable 并公开 blocker | 需冻结 retry deadline 与人工恢复入口 | 待处理 |

## 必须 fail closed 的条件

- identity mode 不是 `ApplicationServiceVirtualUser`；
- room 已加密、允许 federation、不是 exclusive room 或请求 Matrix thread；
- Element 请求 iframe、自动登录或传递用户/AS credential；
- transport profile、Binding、retention policy 或 ETag 不是 exact current version；
- route/membership/Session 无法由 `ir_ref + matrix_user_id + collaboration_session_id`
  唯一验证；
- writer lease、event/transaction ledger、outbound txn outcome 或 delivery obligation
  无法证明。

## Review 请求

请 Slinky 检查：

1. 增量 OpenAPI 的 Operator profile 路径与 Probe method 是否符合主契约；
2. Schema 是否完整复现已冻结字段，尤其 ETag 与 secret exclusion；
3. Session 状态是否允许内部 `Provisioning/Closing`，而 Element descriptor 只公开冻结枚举；
4. `CollaborationContract` 中 route/reply/deadline 的具体 machine-readable shape；
5. MX-QA-002、003、004、005、009、010 的责任与关闭条件。
6. `piko-ir-mxid/v1` 派生公式与 room provisioning 参数是否可进入冻结 fixture。
