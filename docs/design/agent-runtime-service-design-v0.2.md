# Piko 智能体运行时服务设计提案

> **Superseded (prose scope)：** 本文的 system-design prose 已由
> `docs/design/piko-agent-runtime-design-v0.3.md` 取代。字段级机器契约仍由既有
> OpenAPI、JSON Schema、error catalog 与 fixtures 承担；本文保留用于历史审计。

版本：v0.2
状态：Superseded（prose scope）
日期：2026-09-06
取代：v0.1 英文草案

## 1. 文档目的与证据边界

本文定义 Piko 为 Slinky v0.3 提供智能体运行时服务时的外部边界和内部架构。
本文严格区分三类内容：

- 等待跨项目评审的契约行为；
- 由 Piko 自行决定的内部实现设计；
- 已实现、已测试的证据，目前此类证据为零。

本文不是已冻结的 Slinky 契约。所有候选语义均标记为 `候选`，并记录在
QA 文档中。Piko 当前没有生产运行时、Pi SDK 集成、持久化存储、可执行服务
或已通过的契约测试。

## 2. 已评审输入

| 输入文档 | 版本 | SHA-256 |
|---|---:|---|
| Piko 智能体运行时需求 | v0.2 | `ef732d31bcb619c16dd045c5154ca543dfbc4169da36e47d53e2c3c4b886e440` |
| Tier LLM 服务契约 | v0.20 | `d70832277dd793099f4a99425e8fff920dde3e68077af2f15a8e0d0b0b581db5` |
| 智能资源管理 | v0.30 | `a039d52672a8e34b0259e0798385c1b5bdfb7ccc8a310fe984dc937316b10d2c` |
| Knowledge、Memory 与 Skill | v0.19 | `c5d7f11deb8bd167541160db69899da32c6673b1b64914106105b1a103091efd` |
| PR / 环境管理 | v0.22 | `ec7d9c5fbdfa82d8dbca2e951e0deed889b351ee11aadc2a729dc7a120bb34b3` |
| 外部 Tool 与集成管理 | v0.26 | `c936fca081782c833938ac79256b7135d7e4176a21a65a986f2580acf4aeeca6` |
| Artifact 与 Event 可靠性 | v0.12 | `815579756ff5afe924b837b9acd060eff5f672bdb28b493e6f9939d56a214845` |
| T7 回归、System 与 E2E | v0.13 | `df3f8d178112aa2c58356e10a4779b3c23828ffd4e0811b64d32d6ede276259c` |

## 3. 不可破坏的边界

1. IR-backed 推理只有一条链路：`Slinky Runtime -> Piko -> Tier Data Plane`。
2. Piko 只把 LLM Tier 当作 OpenAI-compatible 云模型接口；不调用
   Provider endpoint、Tier Observation API 或 Tier Management API，也不持有
   Provider credential。
3. Piko 不拥有 Slinky 的 Plan、IR 组合、Role assignment、Knowledge、Workspace
   Lease、Artifact effective version、Review acceptance、Gate 或 Work success。
4. 每个 active participant 必须占用一个已分配 Agent Runtime Slot 和一个完整 IR。
5. Piko 不得自行增加 participant、替换 IR 或 Slot、提高 Tier service level、扩大
   Tool scope，也不得跟随 `latest`。
6. 系统只有一个 Agent Runtime API 和一条 Pi SDK programmatic execution path，
   不引入 Pi CLI、mlexp compatibility API、fallback endpoint、direct Tier path
   或并行 runtime implementation。
7. Slinky-owned 对象只以 exact immutable reference 和完成验证所必需的最小
   materialized descriptor 进入 Piko。
8. Pi AgentSession、transcript、checkpoint、Extension 和内部 Tool 对象只能作为
   Piko evidence，不能成为 Slinky project truth。

## 4. 总体架构

```text
HTTP / SSE API
  -> Authentication 与 Client / Source scope
  -> Schema 与 digest validation
  -> Admission Coordinator
       -> Runtime / Profile readiness
       -> Durable idempotency 与 Attempt uniqueness
       -> Slot registry 与 atomic claim
       -> Execution Package verifier
       -> Tier binding verifier
       -> Tool policy verifier
  -> Durable Run Coordinator
       -> Run state store
       -> Append-only Event store
       -> Append-only Result store
       -> Recovery obligation ledger
  -> Execution Supervisor
       -> Participant supervisor
       -> Pi SDK AgentSession adapter
       -> Tier Data Plane adapter
       -> Workspace 与 Tool broker
       -> Structured Result gateway
  -> 只读 Operations 与 Audit projection
```

API 层不包含 workflow fallback。Coordinator 是 AgentRun 状态、Slot claim、Piko
Event 和 Result version 的唯一写入者。Participant supervisor 只能报告 observation，
不能直接发布 terminal Run state。

## 5. 持久化模型与不变式

第一版实现使用具备事务能力的持久化存储，至少包含以下逻辑记录：

| 记录 | 必须保持的不变式 |
|---|---|
| `ClientRegistration` | credential 只能解析到一个已授权 Client 和 Source scope |
| `IdempotencyRecord` | `(client_id, idempotency_key)` 只能映射一个 digest 和 Run |
| `AttemptIndex` | `(client_id, work_execution_id, attempt_id)` 至多对应一个 Run |
| `AgentRun` | version 单调递增；除 `UnknownOutcome` 外，terminal state 不再迁移 |
| `AgentSlot` | 使用稳定配置 identity；至多存在一个 active ParticipantRun claim |
| `ParticipantRun` | participant、IR、Slot、Tier 和 Knowledge binding 创建后不可变 |
| `AgentEvent` | 每个 Run 内 sequence 严格递增，只追加不修改 |
| `AgentTaskResult` | `(agent_run_id, result_version)` 不可变 |
| `RecoveryObligation` | retry 不得擦除未解决的 process、Tool、Workspace 或 Tier outcome |
| `AuditRecord` | mutation、credential resolution 和 policy decision 只追加不修改 |

`POST /runs` 只有在同一耐久事务中写入 idempotency record、Attempt index、Run
identity、初始 Event 和全部 Slot claim 后才返回 `202`。事务提交前不得启动外部执行。

## 6. 就绪状态与请求接收（候选 D1）

全局状态与请求级 admission 分开判断：

| 全局状态 | 新 Run 行为 |
|---|---|
| `NotReady` | `accepting_runs=false`，拒绝所有新 Run |
| `Ready` | 仅当请求所需的全部 dependency/capability 均 current 且 Ready 时接收 |
| `Degraded` | 仅当 `accepting_runs=true`、请求所需 scope 全部 current 且 Ready、且不存在全局 recovery blocker 时接收 |

提案增加 machine-readable `degraded_scopes[]` 和 `admission_blockers[]`。人类可读
文本不得参与 admission 决策。

Admission 固定按以下顺序重验：

1. credential、Client/Source scope、API 和 Schema version；
2. idempotency key 与 canonical request digest；
3. runtime profile 和 exact requested capability；
4. participant、完整 IR、exact Slot identity/version 和 independence；
5. Tier credential binding 存在性和 assigned logical service level；
6. Workspace Lease、Host Binding、manifest、root 和 Tool scope；
7. budget 和 deadline；
8. durable Run creation 与 atomic multi-Slot claim。

步骤 8 前失败不能留下 Run、session、Slot claim 或外部 side effect。步骤 8 的事务
失败必须整体回滚。

## 7. Run、取消与核对

公开状态迁移为：

```text
Accepted -> Queued -> Preparing -> Running -> Finalizing -> terminal
Preparing | Running | Finalizing -> UnknownOutcome
Queued | Preparing | Running -> Cancelled | TimedOut
UnknownOutcome -> Succeeded | Failed | Cancelled | TimedOut
```

最后一行只允许由有 Evidence 支持的 reconcile 完成。

Cancel 是幂等请求，不代表全部 side effect 已经停止。Supervisor 先持久化 cancel
intent，停止新的 mutation，尝试在预算内停止 child process、Tool 和 Tier invocation，
然后核对全部 obligation。无法确认的 outcome 必须发布 `UnknownOutcome`，不得虚报
`Cancelled` 或 `Failed`。

Reconcile 只能继续同一个 Run，不能重置 budget、增加 participant、创建新 Attempt
或重放 mutation。它只查询已有 process、Tool、Workspace 和 Tier identity，并追加
Evidence。

## 8. 严格终态 Result（候选 D2）

每个对外可见的 terminal Run 都必须引用一个 strict、immutable Result。Result
envelope 由可信 Piko runtime 创建和验证，不能由 LLM 直接决定。

| 终态 | 最低条件义务 |
|---|---|
| `Succeeded` | 全部 requested output 和 required Evidence；没有 error 或 unresolved side effect |
| `Failed` | typed error、已确认未成功的 outcome、实际产生的 Evidence；没有 unknown side effect |
| `Cancelled` | typed reason、cancel/cleanup Evidence；没有 unknown side effect |
| `TimedOut` | typed deadline error、cleanup Evidence；没有 unknown side effect |
| `UnknownOutcome` | typed error 或 blocker、已有 Evidence、全部 unresolved obligation reference |

Malformed LLM output 只能在 Run budget 内修复。修复预算耗尽且所有 side effect
均可确认时，可信 runtime 生成 `Failed + ResultContractViolation`。只要存在任何未知
side effect，就必须生成带 contract violation 和 unresolved reference 的
`UnknownOutcome`。

Result 与 terminal Run transition 必须原子发布。存储故障时 Run 保持
`Finalizing/RecoveryRequired`，不得暴露缺少 Result 的 terminal Run。
`TerminalResultMissing` 只表示数据损坏或不变式破坏，并导致 readiness 降级。

## 9. UnknownOutcome 收敛（候选 D4）

Result 采用 append-only version：

1. 首次不确定时发布 immutable Result v1，状态为 `UnknownOutcome`。
2. Reconcile 取得充分 Evidence 后追加 Result v2，并原子更新 Run 的 status、version
   和 current `result_ref`。
3. `GET /runs/{id}/result` 返回 current Result。
4. `GET /runs/{id}/results/{version}` 返回指定 immutable historical Result。
5. Reconciliation response 和新 Event 同时引用 previous/current Result ref，v1
   永久保留在审计链中。

只有 `UnknownOutcome` 可以收敛为其他 terminal status。其他 terminal Result 不得
被替换。

## 10. 错误与阻塞项（候选 D3）

Catalog 分成三个互不混用的 surface：

- API error：HTTP command/query 没有成功完成，使用 Error Envelope；
- execution error：已接收的 Run 执行后终止，写入 `AgentTaskResult.error`，Result
  query 仍使用 HTTP `200`；
- planning blocker：Slinky 必须修改 Plan、IR 或 Attempt，写入
  `AgentTaskResult.blocker`。

版本冲突统一使用 `ResourceVersionMismatch`，并由结构化 `resource_type` 指明 Slot、
Run、manifest 或其他资源。`RunDeadlineExceeded` 属于 `TimedOut` Result。HTTP
`504` 只描述同步 API operation timeout，不能猜测已接收异步 Run 的 outcome。

Machine-readable 提案位于
`docs/contracts/error-blocker-catalog-v0.2.json`。

## 11. 摘要与引用（候选 D5）

- JSON digest 使用 RFC 8785 JCS，编码为 UTF-8 后计算 SHA-256。
- `request_digest`、`manifest_digest` 和 `result_digest` 只排除其自身字段；其余纳入
  范围的字段由相应 Schema 明确。
- Workspace entry digest 对原始文件字节计算。
- Header 与 body 中重复的 identity 必须完全一致，否则 fail closed。
- `Idempotency-Key` header 参与幂等查询但不进入 request body digest；body 中的
  `idempotency_key` 必须与 header 相同。
- Client/Source body 字段进入 digest，并必须匹配认证后 canonical identity。
- Opaque Slinky reference 不通过隐藏 API 解引用。Piko 必须检查的字段要以 versioned
  descriptor materialize 到 Execution Package，并由 manifest digest 覆盖。

## 12. OpenAI-compatible 云模型接入

`LLM Tier` 是 Slinky 的资源、容量与调度概念；对 Piko 而言，它只是一个
由当前 participant 请求绑定的 OpenAI-compatible 云模型服务。Piko 不理解也不
复制 Tier 的 Provider、Account、Backend Pool、capacity group、entitlement 或调度
authority。

External contract 仍保留 Slinky 提供的 `tier_binding`，Piko 在内部将它规一化为：

```text
OpenAICloudModelBinding
├─ base_url
├─ credential_binding_ref
├─ model = exact service_level_id
├─ canonical client / source / source instance headers
├─ allowed OpenAI API surface
└─ timeout / retry / streaming policy
```

Piko 在受控 Secret boundary 中解析 `credential_binding_ref`。固定 Pi 基线为
`@earendil-works/pi-coding-agent@0.85.1`、`@earendil-works/pi-ai@0.85.1`
（Pi commit `9767ba275f3e9a5ee0f5c5342249b629ab1b2282`）。该版本内建
`openai-responses` 强制 `stream:true`，不能直接消费 LLMTier V0.3 的 non-stream
Responses 与 recovery extension。因此唯一接入实现是 Piko 注册的
`piko-llmtier-responses-v0.3` adapter：它负责 non-stream Responses、Invocation/
Response recovery、typed status 和 durable idempotency；禁止只替换 `base_url`，也
禁止失败后退回 Pi 内建 provider 或另一 endpoint。

计划中的 Pi-facing surface：

- V0.3 Agent generation surface 仅为 non-stream `POST /v1/responses`；
- 恢复扩展：`GET /v1/invocations/{invocation_id}` 与
  `GET /v1/responses/{response_id}`，只由同一 adapter 在同一持久 obligation 中调用；
- Embeddings 由 Knowledge/Memory consumer 独立验证，不作为 Piko Agent generation
  surface；Chat Completions 与全部 SSE/streaming 延至 V0.4；
- `GET /v1/models[/...]` 只接受 exact-case Service Level ID；
- V0.3 surface 在 exact OpenAPI/fixture、custom adapter、crash/lost-response 与真实
  route capture 通过前保持 activation=false；未声明 endpoint 必须 fail closed，不允许
  runtime fallback；
- 不调用 Tier Observation API 或 Management API，不访问 Provider、Account、
  Backend Pool 或 physical model endpoint。

Compatibility manifest 作为已 materialize 的 versioned contract 输入或 Piko deployment
已验证配置进入 readiness，Piko 不为获取它而新增 Tier control-plane 路径。

Piko 保存 OpenAI response 中约定的 response ID、usage、Invocation ID、Location、
typed status 和 recovery obligation。认证、幂等和恢复的 canonical scope 是
`client_id + source_id`；`source_instance_id` 只用于 observation/correlation。任何
transport retry、agent-level retry 或 restart recovery 都必须复用首次 dispatch 前
持久化的同一 Idempotency-Key 和 request digest。Response 丢失后的 outcome query
必须由契约明确提供并受 Client scope 保护；未提供可验证 query 时，Piko 不盲目重派，
而是保留 `UnknownOutcome`。云模型 queue pressure 只能形成受 Run deadline 限制的
短期 dependency wait，不能成为 Piko project queue。

Recovery 时间约束固定为 `W=168h`、`M=24h`、Piko 产品 retry deadline `D=24h`，
满足 `D <= W-M`。`replay_same_request` 只能在 D 内复用同一 key、digest 和 Invocation
obligation。terminal typed error 即使使用 HTTP 502/503，也以 envelope 的
`retryable=false` 为准，禁止 Pi 通用 5xx retry 重新 dispatch。

## 13. Workspace、Tool 与 Knowledge 边界

Piko 接收当前 Active Workspace Lease，并在 Running 前验证 exact Host Binding、root
mapping、base revision、manifest、expiration 和 write scope。Piko 不激活、转移或
释放 Slinky-owned Lease，只返回 observation，供 Slinky Runtime/PR authority 释放
或恢复 Lease。

每次 Tool call 都必须经过 Tool broker，并携带 immutable Run、ParticipantRun、Attempt、
Lease、capability binding、operation、root、deadline 和 approval reference。Path
traversal、symlink escape、未声明 command、network egress 和 Secret inheritance
必须 fail closed。有限 Tool seat 继续使用 PR Reservation/Lease，Piko 不增加 hold
协议。

Piko 只消费 Slinky 已选择并 materialize 的 exact Skill Plan、Experience reference
和 Context Bundle，不选择其他 Skill、不扫描其他 registry、不跟随 latest，也不替换
Unavailable capability。若 exact content 提高 capability、Tool、permission、participant
或 Tier demand，Piko 返回 `PlanRefinementRequired` 或
`CapabilityEscalationRequired`。

## 14. 团队执行与独立性

Single execution 是只有一个 participant 的 Team。每个 requested participant 恰好
创建一个 Pi AgentSession；实际并发 session 数不得超过原子 claim 的 Slot 数。

每个 participant 只接收自己的 exact IR、Role contract、Tool scope、Workspace scope、
Tier binding 和 Knowledge binding。Independent Reviewer 不得继承 Author 的 private
session memory。共享信息只能通过声明的 materialized Artifact、structured handoff
或 audited collaboration reference 传递。Review transcript 不能替代 Finding、Coverage、
ChangeSet 或 Validation Evidence。

## 15. SSE 事件与保留策略（候选 D5）

本节的 SSE 是 Piko 自身 `AgentRunEvent` 读取面，不是 LLMTier 模型 generation SSE；
后者按 §12 在 V0.3 明确 fail closed 并延至 V0.4。

Sequence 在单个 Run 内严格递增，并在 process restart 后保持。Retention window 内，
`Last-Event-ID` 从下一条恢复。如果请求早于 retention floor，Piko 在建立 stream 前
返回 `410 EventHistoryExpired`，并提供 current Run ref、retention floor 和 recovery
action。Client 随后读取 current Run/Result，并在需要时 reconcile。

Piko Event history 是 execution Evidence，与 Slinky domain authority Event Store 分离。
Piko 不直接写入 Slinky Outbox/Inbox，也不声明 Project global sequence。

## 16. 安全与 Client 隔离

- authenticated credential 是 Client identity authority；
- header 只能缩小、不能扩大已授权 Source scope；
- Run、Result、Event 和 Evidence query 必须先应用 Client scope，再决定是否暴露；
- Slot aggregate capacity 可以共享，但未授权 Client 看不到 claim owner；
- Agent Tool 不能写 runtime、credential 或 policy root；
- Secret 必须从 process environment 移除，并从 request、workspace、transcript、Result、
  Event、log 和 fixture 中脱敏；
- Mutation permission 是 WorkExecution authorization、participant permission、Tool
  binding 和 workspace root 的交集；
- Cancel、timeout 和 crash 不能删除 orphan 或 unresolved-side-effect record。

Pi SDK 只是 execution library，不是 sandbox。

## 17. API 与 Schema 提案

当前中文 review 文件：

- `docs/contracts/agent-runtime-openapi-v0.2.yaml`
- `docs/contracts/schemas/agent-runtime-v0.2.schema.json`
- `docs/contracts/error-blocker-catalog-v0.2.json`

这些文件是描述性提案，不是实现证据。冻结前双方仍需确认：

- exact reference descriptor Schema；
- error/blocker mapping；
- historical Result query；
- Event retention behavior；
- pagination 和 ETag 细节；
- Pi SDK 与 OpenAI-compatible 云模型 surface；
- liveness 是否要求 authentication。

## 18. 验证策略

测试按以下顺序建立：

1. Schema 正反 fixture 与 digest vector；
2. State machine 和 transaction property test；
3. Authentication、Client isolation、ETag、pagination 和 idempotency Module test；
4. Fake Tier、fake Pi session 和 fake Tool/Workspace Contract test；
5. 在 Accepted、Queued、Preparing、Running、Finalizing 和 UnknownOutcome 注入
   process kill/restart；
6. Path traversal、symlink、command、egress、Secret 和 untrusted Extension test；
7. Real-service/fake-backend controlled-mount 和 Browser test；
8. 少量真实 Tier confirmation 与实测 SLO/capacity test；
9. Slinky black-box case 1-28 和 V03-E2E-085 至 092。

在当前 Evidence 没有绑定 source commit、Schema version、Environment topology/execution
profile、fingerprint 和 run ID 前，不声明 SLO 或 security 已达标。

## 19. 依赖缺口分类

### 19.1 已有设计文档可以回答

- 唯一 Piko-to-Tier inference path 和 exact logical service level；
- Slinky 提供 canonical Tier Source identity，Piko 只将其映射为云模型请求 header；
- composite IR 与 exact backing Seat；
- Knowledge selection/materialization authority；
- Workspace Lease、controlled mount 和 lane-local write 原则；
- Tool scope、credential 和 partial-side-effect 原则；
- immutable Artifact/CodeChangeSet 和 authority Event 原则；
- Piko 必须覆盖的 E2E 和 recovery 范围。

### 19.2 仍需 Slinky descriptor 或 fixture

- IR、RoleAssignment、Knowledge profile、Skill Plan、Context Bundle、Workspace Lease
  和 Host Binding 的最低 materialized descriptor；
- ArtifactCandidate、CodeChangeSet、Finding、Coverage 和 ValidationEvidence；
- independence、shared-write serialization 和 approval reference；
- black-box 正反 fixture 与 digest vector；
- authenticated Client/Source registration fixture；
- target controlled-mount 与 Browser execution profile；
- OpenAI-compatible 云模型 credential binding、API compatibility 和脱敏 response fixture。

### 19.3 仍需跨项目或用户决定

- D1-D5 candidate semantics；
- Pi SDK 最终 package/version 和 required endpoint surface；
- retention period、cursor expiry 和 Result history lifetime；
- SLO workload/environment 与 Deployment Capacity；
- 契约闭合后的具体 persistence/deployment/HA topology。

## 20. 交付阶段

1. 跨项目 review 与 contract closure；
2. TypeScript/Pi SDK build baseline 与 generated Schema types；
3. Durable control plane 与 Slot/Run/Event/Result invariant；
4. Workspace、Tool、Tier 和 Pi execution boundary；
5. Single/Team structured Result 与 recovery；
6. Contract、recovery、security 和 performance Evidence；
7. Release artifact、runbook、known limitation 和 exact digest。

## 21. Slinky 评审清单

- 确认或修改 D1-D5；
- 核对本文是否保持全部 Slinky authority boundary；
- 指出 Piko 必须验证但缺少 materialized descriptor 的 reference；
- 确认没有 endpoint 形成第二 inference、workspace 或 recovery path；
- 确认 Result conditional obligation 与 UnknownOutcome audit chain；
- 确认 `/results/{result_version}` 和 `410 EventHistoryExpired` 是否进入下一版契约；
- 分配第 19 节缺失 fixture 的提供责任。

## 22. 非目标

- 声称已经存在 production implementation 或 release；
- 获取 Slinky Project、Plan、IR、PR、Artifact、Knowledge 或 Acceptance authority；
- 兼容或迁移 mlexp；
- 直接访问 Provider 或 Tier Management；
- 建立公开 Internet multi-tenant Agent cloud；
- 允许 Agent 自选 fallback、增加 participant 或提高 Tier；
- 建立第二 config、selector、runtime、Tool、Knowledge 或 recovery mechanism。
