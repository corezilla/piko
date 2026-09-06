# Piko Agent Runtime v0.3 契约说明

状态：STD 迁移候选，等待项目 Review  
日期：2026-09-07  
模板：STD `contracts.specification@0.1.0`  
authority：Piko

## 1. Contract scope 与 authority

本文汇总 Piko v0.3 对外和 consumed contract 的边界，不复制字段定义。字段级 authority：

1. `agent-runtime-openapi-v0.2.yaml` 与 `agent-runtime-v0.2.schema.json`：基础 Runtime API；
2. `agent-runtime-matrix-openapi-v0.3.yaml` 与 `agent-runtime-matrix-v0.3.schema.json`：
   Matrix/Element 增量；
3. `error-blocker-catalog-v0.2.json` 与 v0.3 catalog：typed error/blocker；
4. `fixtures/v0.3/*.json`：正负 machine sample；
5. LLMTier Piko-facing machine bundle：Piko consumed contract，当前只通过 Matrix review
   materialize，Piko 不跨项目读取 LLMTier 文件。

设计文档解释为什么和如何实现；若与机器文件字段冲突，先将冲突作为 blocker 处理，不静默
选择一方，也不由实现兼容两套语义。

## 2. Operation / Message / Event Catalog

| ID | Kind | Producer | Consumer | Sync/Async | Idempotency |
|---|---|---|---|---|---|
| AR-OP-READINESS | Query | Slinky/Operator | Piko | Sync | ETag/If-None-Match |
| AR-OP-RUN-CREATE | Command | Slinky Runtime | Piko | Async accepted | Idempotency-Key + request digest + Attempt unique |
| AR-OP-RUN-CANCEL | Command | Slinky Runtime | Piko | Async reconcile | Idempotency-Key + If-Match |
| AR-OP-RUN-RECONCILE | Command | Slinky Runtime/Operator | Piko | Async | 同 Run/obligation identity |
| AR-OP-RUN-QUERY | Query | Slinky | Piko | Sync | scope + ETag |
| AR-OP-RESULT-QUERY | Query | Slinky | Piko | Sync | current/historical immutable ref |
| AR-EVT-RUN | Event/SSE | Piko | Slinky | Async read | per-Run sequence/Last-Event-ID |
| MX-OP-PROFILE | Admin/Query/Probe | Operator | Piko | Sync | Idempotency-Key + ETag |
| MX-OP-BINDING | Command/Query | Slinky Runtime | Piko | Sync outcome | Idempotency-Key + ETag |
| MX-OP-SESSION-LIST | Query | Slinky View | Piko | Sync | signed cursor + snapshot |
| MX-OP-ELEMENT | Query | Slinky View | Piko | Sync | exact Session + ETag |
| MX-OP-CLOSE | Command | Slinky Runtime | Piko | Async convergence | Idempotency-Key + ETag |
| MX-EVT-AS-TXN | Matrix transaction | Homeserver | Piko | Async push | AS txn + event id dedup |
| MX-EVT-OUTBOUND | Matrix event | Piko | Homeserver | Async | stable Matrix txn id |
| LT-OP-RESPONSES | Model command | Piko | LLMTier | Sync/Recovery | Idempotency-Key + canonical digest |
| LT-OP-RECOVERY | Query | Piko | LLMTier | Sync | canonical Client/Source scope |

## 3. Request、Response、Event 与数据对象

### 3.1 Agent Runtime

核心对象包括 AgentRuntimeProfile、AgentSlot/Snapshot、AgentTaskRequest、AgentRun、
ParticipantRun、AgentTaskResult、AgentRunEvent、ErrorEnvelope 和 recovery response。完整
required/enum/conditional rule 见 v0.2 Schema。

v0.3 `AgentTaskRequest` 通过唯一 extension 增加 `collaboration_contract`；strict
`AgentTaskResultV03` 可选增加 `collaboration_resolution_summary`，不是新 endpoint 或第二 Result。

### 3.2 Matrix/Element

核心对象：MatrixTransportProfile、IRCommunicationBinding、CollaborationContract、
CollaborationSessionSummary/List、ElementConversationDescriptor、CollaborationSessionClose、
CollaborationResolutionSummary。Secret、delivery checkpoint 和 transcript 不进入 DTO。

### 3.3 LLMTier

Piko generation 只消费 non-stream Responses、exact-case Models 和 Responses recovery。
Embeddings 由 Knowledge/Memory consumer 验证；Chat/SSE 属 V0.4。`Idempotency-Key` 与
`X-Tier-Client-Request-ID` 不可互换；`source_instance_id` 不进入 durable recovery scope。

## 4. 状态、错误和 blocker catalog

### 4.1 状态 authority

- AgentRun：Accepted/Queued/Preparing/Running/Finalizing 和 terminal；只有
  UnknownOutcome 可由 Evidence 支持的 reconcile 收敛。
- CollaborationSession：Provisioning/Active/WaitingForReply/Closing/Closed/Unavailable。
- IR binding 外部：Active/Suspended；内部恢复态不扩展外部 enum。
- LLMTier Invocation 状态由 LLMTier authority；Piko只映射 observation 与 obligation。

上述 CollaborationSession 行是当前 Piko 机器候选的审计事实，不是最终 wire 对齐结论。Slinky
v0.6 要求 SessionSummary 为 `Active|WaitingForReply|Closing|Closed|RecoveryRequired`，close
outcome 为 `Closing|Closed|AlreadyClosed|RecoveryRequired`；Element descriptor 状态属于独立
view/source DTO。当前 Schema 的 `Provisioning/Unavailable/Unchanged` 与该要求存在 Contract
alignment gate，本次 STD 迁移不直接修改机器 enum。内部→wire 映射、Closing drain 与重复 close
语义以 CollaborationBridge §7.3/§8.4 为设计目标，机器 Contract Amendment 完成前不得生成
runtime types 或激活能力。

### 4.2 Error surface

API error、execution error、planning blocker 分开。典型 Matrix errors：

- `ResourceVersionMismatch`、`ResourceAlreadyExists`、`IdempotencyConflict`；
- `UnsupportedIdentityProvisioningMode`、`UnsupportedRoomTopology`；
- `EncryptedRoomNotSupported`、`FederatedRoomNotSupported`、`ElementEmbeddingNotSupported`；
- `InvalidCollaborationSessionCursor/Filter`；
- `ElementConversationSourceUnavailable`；
- `CollaborationResolutionInvalid/AuthorityViolation`；
- `CollaborationDeliveryBackpressure`、`CollaborationStateInconsistent`。

message 文本不参与客户端分支；code/status/retryable/required details 由 catalog 决定。

## 5. 幂等、并发、事务与一致性

1. Run create 在一个 durable transaction 写 idempotency、Attempt index、Run、Event、Slot
   claim 和 collaboration intent；commit 前无外部 side effect。
2. mutation 的 Idempotency-Key 解决重复请求；If-Match/ETag 解决资源版本并发，两者不可替代。
3. JSON digest 使用 RFC 8785 JCS + UTF-8 + SHA-256；header/body 重复 identity 必须相同。
4. Matrix AS transaction 在 txn/event/delivery/checkpoint 原子落盘后 ACK。
5. Matrix outbound retry 复用同一 txn id；LLMTier retry/recovery 复用同一 key/digest/obligation。
6. 单写者 lease + fencing 阻止 stale process ACK、send 或推进 version。
7. LLMTier 首次响应头丢失且尚无 Invocation ID 时，显式 adapter 复用同一 namespace/key/digest
   重放原 POST 以取得 canonical outcome 或 Invocation ID；`maxRetries=0` 只禁 SDK 隐式重试，
   不得生成新 key、Attempt 或 logical invocation。
8. close 的同一 namespace/key/digest 重放返回该请求首次记录的同一 CloseResult 语义且不重复
   close/archive；相同 key 不同 digest 返回冲突。只有已 Closed Session 上另一项通过鉴权和版本
   检查的新请求才可记录 `AlreadyClosed`；Session 最新状态通过既有查询读取。
9. LLMTier replay 本身不得新增 dispatch intent 或 Invocation。若故障前已有 Backend dispatch
   证据，总数保持 1；若故障发生在 durable record 后、首次 dispatch 前，原 Invocation 可从 0
   推进到最多 1；dispatch 前拒绝或取消保持 0。

## 6. Pagination、filter、ordering 与 retention

- Session list filters：status、ir_id、work_execution_id、agent_run_id，组合 AND。
- 顺序：`last_message_at DESC NULLS LAST, collaboration_session_id ASC`。
- cursor 绑定 Client/Project/filter digest/snapshot upper bound/sort key/expiry 并签名。
- 无效、过期、跨 scope/filter cursor typed fail，不回退第一页。
- AgentRun Event retention、Session cursor expiry、archive policy 时长尚为 Open Gate。
- LLMTier recovery 已接受 W=168h、M=24h、Piko D=24h。

## 7. 身份、权限、Secret 与多项目隔离

- authenticated credential -> canonical Client；Source header 只能缩小授权。
- `(client, project, ir)` 稳定派生 MXID；display name 不参与 identity/routing。
- query 先 authorization 再 existence check；隐藏/无权/不存在按不可枚举策略返回。
- AS token、provider credential、device/encryption key、checkpoint、ledger、用户 Element
  session 不进入 Slinky/Pi DTO、日志或 Evidence。
- transcript 不代替 Result/Resolution/Artifact；Resolution 不创建 Slinky-owned action。

## 8. 版本、兼容性与迁移

- 外部 API 保持唯一 `agent-runtime/v1`；v0.3 是 v0.2 的受控增量。
- create/update 使用强 ETag；schema/profile/contract exact version admission。
- 不支持的版本或 feature fail closed；不建立兼容 endpoint/fallback。
- STD 迁移只改变文档结构，不改变现有 operation、field、error、test 或 Matrix ID。
- 当前 STD source revision 为 null，文档只能保持 draft/review。

## 9. Positive/Negative fixture 与 validator

现有 `collaboration-decision-fixtures.json` 覆盖：多 room page、resolution minority、authority
overflow、AgentTaskResult resolution 和 descriptor unavailable。`validate_v03_contract.py`
校验 v0.3/base Schema、OpenAPI refs/filter/typed response、participant set 和 error catalog。

仍需增加：base Runtime 全量 fixture、MXID vector、room state、AS transaction crash、outbound
response loss、cursor tamper/expiry、LLMTier lost-response 和 Secret corpus。

## 10. Requirement → Contract → Test traceability

| Requirement | Contract | Test |
|---|---|---|
| AR-001 单一 runtime path | v0.2 OpenAPI + dependency boundary | V03-E2E-085、dependency scan |
| AR-002 atomic admission | AgentTaskRequest/Run/Slot | V03-E2E-086/087 + crash test |
| AR-003 strict Result/recovery | AgentTaskResult/Result history | V03-E2E-088..092 |
| MX-001..012 identity/profile/room/delivery | v0.3 Matrix OpenAPI/Schema/errors | V03-E2E-093..096 |
| MX-013 multi-room cursor | Session list + cursor rules | V03-E2E-097 |
| MX-014/015 structured resolution/authority | AgentTaskResultV03 + Resolution | V03-E2E-098 |
| MX-016 Element full discussion | element-view + typed 503 | V03-E2E-099 |
| MX-017 LLMTier exact model/Scope B | consumed machine contract | pinned adapter/lost-response tests |

## 11. Activation Gate 与未决项

Design/schema validation 不等于 runtime activation。未关闭项：SessionSummary/CloseResult enum
对齐 Slinky v0.6 的独立 Contract Amendment、persistence/HA、Pi collaboration
hook、Workspace/Tool descriptor、retention catalog、homeserver/AS version、CollaborationEvent
fixture、Element route、capacity/SLO，以及完整 Contract/Recovery/Security/E2E execution。

明确禁止通过添加 fallback、第二 config、第二 ledger 或直接 provider/Matrix client 来绕过 Gate。
