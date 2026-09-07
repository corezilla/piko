<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko CollaborationBridge 内部定义

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-collaboration-bridge-internal-design-v0.3` |
| Document Version | `0.3.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Architecture Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | `2026-09-07` |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-08` |
| STD Version | `0.1.0-draft.18` |
| Template ID | `design.definition` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/design/piko-collaboration-bridge-internal-design-v0.3.md` |
| Supersedes | none |

> 本文件只定义 Piko-owned 内部结构；端到端机制 authority 位于 `piko-collaboration-bridge-design-v0.3`。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目的、范围与父级约束

定义 CollaborationBridge 在 Piko 进程内的模块边界、持久状态和 fail-closed 行为。父级约束来自
Agent Runtime system design、CollaborationBridge mechanism design 与字段级机器契约。

## 2. 职责与非职责

负责 identity/session binding、durable inbox/outbox、transaction dedupe、reply obligation、lease/fencing、
recovery 与 Element locator 投影。不拥有 Slinky Project/IR/Decision、Matrix homeserver 实现或跨项目 acceptance。

## 3. 输入、输出与依赖

- 输入：已校验的 runtime command、AS transaction、operator transport profile 和持久化恢复记录。
- 输出：Piko Event/Result、typed error/blocker、outbox intent 和只读 audit projection。
- 依赖：唯一 Agent Runtime API、存储事务、Matrix client/AS adapter、clock 和 credential provider。

## 4. 内部分解

| 模块 | 职责 | 禁止项 |
|---|---|---|
| BindingRegistry | IR/session/room/identity 唯一绑定 | 不推断缺失 authority |
| InboxLedger | 入站验签、dedupe、cursor 投影 | 不回退为无 scope 查询 |
| ObligationEngine | required reply 与结构化 resolution | 不把 ACK 当业务批准 |
| OutboxDispatcher | 持久 txn、重试、结果归并 | 不绕过 idempotency key |
| LeaseCoordinator | fencing token 与 takeover | 不接受过期 writer |
| RecoveryReconciler | UnknownOutcome 收敛 | 不以猜测替代远端事实 |

## 5. 状态与不变量

核心状态为 Binding、InboxEvent、ReplyObligation、OutboxIntent、Lease 和 RecoveryAttempt。唯一键、状态枚举、
条件字段与错误码以 OpenAPI/JSON Schema/error catalog 为准；Markdown 不复制字段定义。

## 6. 主路径

入站 transaction 经鉴权和 dedupe 后写 InboxLedger；ObligationEngine 原子建立义务；受 fencing token 保护的
dispatcher 发送 outbox；确认结果写入 ledger 并生成投影。任何跨边界副作用必须先有耐久 intent。

## 7. 故障与恢复

进程崩溃后重放未完成 intent；远端结果不确定时进入 UnknownOutcome 并执行 reconcile；credential/authority
不完整时 fail closed；lease 过期 writer 的写入被拒绝。恢复不得创建第二 runtime/config/fallback 路径。

## 8. 并发与一致性

同一 binding、transaction 和 obligation 使用数据库唯一约束与 compare-and-set；跨进程写入由 fencing token
排序。读投影允许最终一致，但义务、发送 intent 和 close 决定必须事务一致。

## 9. 安全与隐私

Secret 只以 credential reference 进入 adapter，日志和 Evidence 禁止包含 token。所有入站事件校验 sender、room、
profile 和 scope；Element locator 是无 Secret 描述符。

## 10. 可观测性与审计

记录 correlation ID、transaction ID、binding/session ID、attempt、fencing token、typed outcome、source commit 与
时间。正文和 Secret 不进入默认指标标签。

## 11. 验证

机器契约由 `scripts/validate_v03_contract.py` 验证；并发、崩溃、homeserver E2E 与真实 credential boundary 仍需
按 V&V/Test Specification 取得运行证据。

## 12. 开放项

SessionSummary/CloseResult 与上游冻结语义的对齐是 contract/runtime activation gate，不阻塞本次文档迁移候选。
内部 repository identifier 为 `piko`；canonical GitHub repository 为 `corezilla/piko`。
本文已通过 CP-01 文档批准；Runtime Activation 仍需独立授权。
