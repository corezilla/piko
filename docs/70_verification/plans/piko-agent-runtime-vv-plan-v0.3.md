<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Agent Runtime v0.3 验证与确认计划

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-agent-runtime-vv-plan-v0.3` |
| Document Version | `0.4.0-draft.9` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Verification Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | none |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-16` |
| Template ID | `assurance.vv-plan` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/plans/piko-agent-runtime-vv-plan-v0.3.md` |
| Supersedes | none |

> 本计划不构成 production test report 或 Runtime Activation authority。
<!-- STD_DOCUMENT_COVER_END -->

Finalization.6保留四个跨字段Schema门禁，并要求OpenAPI三个配置PUT在exact strong If-Match更新目标不存在时
机器声明404 NotFound；负例必须证明不创建资源。OpenAPI仍须逐操作
暴露auth、410、ETag与配置PUT条件矩阵；合成Matrix raw event必须证明唯一namespaced codec、reply映射、
unknown/native分类与附件边界。真实homeserver/Element显示与AS回流仍是C类联调证据，不改变A类字段。
附件静态验证还必须复算domain-separated digest golden vector，证明不同multipart表示同摘要、metadata/content
变化冲突；并覆盖撤权/redaction/过期优先于304，以及blocker推迟实际删除与30天半开tombstone边界。

## 1. 目标、范围与 V&V authority

目标是证明 Piko 实现满足已冻结 Runtime、LLMTier 和 Matrix/Element contract，并在 crash、
重复投递、并发、权限失败和依赖不可用时 fail closed。Piko拥有实现验证 authority；Slinky
拥有业务 Acceptance，LLMTier/Matrix 各自拥有其服务行为。任何 mock 或文档检查不得升级为
他方 production evidence。

## 2. 被验证基线与环境

| Baseline | 固定项 | 当前状态 |
|---|---|---|
| Piko design | 两份 STD v0.3 candidate design | 本轮候选 |
| Piko contract | v0.2 base + v0.3 Matrix OpenAPI/Schema/errors | candidate |
| Pi | commit `9767ba2`；pi-coding-agent/pi-ai 0.85.1 | pinned，collaboration hook 未实测 |
| OpenAI SDK | 6.40.0 | mock capture 已有 |
| LLMTier | Piko-facing Scope B/recovery bundle | semantics accepted，activation false |
| Matrix/Element | version/config 未冻结 | Open Gate |
| STD | 项目采用 `0.1.0-draft.21`，revision `274ef0a67eda080baa0063ae27ede7ee129aa32a` | immutable source locked；本次结构升级为 review candidate，runtime activation=false |

每个执行 evidence 必须记录 source commit、Schema version、环境 topology、dependency version、
configuration fingerprint、case/run ID 和时间。

## 3. Verification 方法

| Requirement | Analysis | Inspection | Demonstration | Test | Owner | Evidence |
|---|---:|---:|---:|---:|---|---|
| 单一 runtime/inference path | 是 | 是 | 否 | 是 | Piko | dependency/config scan |
| atomic Run/Slot/Session intent | 是 | 是 | 是 | 是 | Piko | DB transaction + crash trace |
| strict Result/UnknownOutcome | 是 | 是 | 是 | 是 | Piko | Schema + recovery history |
| LLMTier exact model/idempotency | 是 | 是 | 是 | 是 | Piko/LLMTier | SDK capture + server ledger evidence |
| Matrix stable identity/exclusive room | 是 | 是 | 是 | 是 | Piko/Matrix Operator | binding/room state evidence |
| durable inbox/outbox/dedup | 是 | 是 | 是 | 是 | Piko | transaction/txn replay trace |
| structured resolution authority | 是 | 是 | 是 | 是 | Piko/Slinky | positive/negative Result fixture |
| Client/Project/Secret isolation | 是 | 是 | 否 | 是 | Piko Security | negative corpus + redaction scan |
| Piko execution capacity/claim | 是 | 是 | 否 | 是 | Piko/Slinky | snapshot/claim/partial-admission fixture + ledger evidence |
| 可信材料读取覆盖 | 是 | 是 | 否 | 是 | Piko/Slinky | broker evidence artifact + consumer material-map check |

## 4. Validation 场景与用户目标

1. Slinky 能以 exact WorkExecution/Attempt/IR 启动并观察 Run，不需要理解 Piko 内部状态。
2. 多 participant 可在独立 room 协作；无法达成一致时用户可打开完整 Element discussion。
3. 少数立场和 Evidence 不丢失，Piko 不越权创建用户 Action 或修改 Plan。
4. 模型调用响应丢失、Piko/Matrix 重启或网络重复后不产生第二 invocation/message/room。
5. Secret、其他 Client/Project 数据和 provider/AS内部信息不可泄露。

## 5. 测试层级和责任边界

- Unit：canonicalization、digest、state transition、cursor、MXID、policy predicate。
- Contract：OpenAPI/Schema/error、header、conditional rule、fixture 和 adapter shape。
- Module：Coordinator/Store/Adapter/Broker 的真实 module boundary。
- Subsystem：Agent Runtime、CollaborationBridge、LLMTier adapter。
- Recovery：每个 durable boundary 前后 crash、response loss、writer failover。
- Security：authz、enumeration、SSRF、path/symlink、egress、Secret、authority overflow。
- Performance：execution claim/admission、ledger/outbox、Matrix delivery 和 recovery backlog。
- E2E：Slinky V03-E2E-085..099，controlled dependencies。
- Acceptance：由 Slinky依据 Project/IR/Work目标决定，不由 Piko单方签署。

## 6. 环境、fixture、oracle 与数据治理

环境分为 pure unit、transactional DB、fake external、controlled Matrix/Element、controlled
LLMTier 和 full cross-project E2E。fixture 只能使用 synthetic credential/reference；不得提交
真实 token、prompt/output、用户 session 或内部 endpoint secret。

oracle 优先级：machine Schema/error catalog > frozen invariant > external service ledger/evidence >
observable outcome。LLM 自报文本、transcript 和最后一条消息不是 oracle。

## 7. 覆盖、采样、统计和判定规则

- 所有 required enum/conditional/error 至少一正一负。
- 每个外部 side-effect boundary 至少覆盖 commit 前 crash、commit 后 response loss、重复恢复。
- 每个 query 覆盖 authorized、unauthorized、hidden/not-found 和 stale version。
- 性能结论必须给 workload、sample count、percentile、warmup、topology 和置信边界；当前无结论。
- Case 状态只能是 Pass/Fail/Blocked/Invalid；未执行不是 Pass。

## 8. 故障注入、恢复和非正常路径

故障点覆盖 Run transaction、execution claim、capacity snapshot race、Pi process start/stop、LLMTier dispatch/response、Tool
mutation、Workspace write、AS transaction commit/ACK、Matrix send、membership、rename、close、
archive、checkpoint 和 lease handoff。恢复必须查询原 identity 并保留 obligation；不得生成新 key、
txn、Run、Session 或 room 作为通用重试。

DF-13 必须覆盖共享pool跨class不重复计数、snapshot后竞争、N个participant部分202、202响应丢失、
claim Unknown、服务重启、execution release后drain仍未知、过期及跨Client。snapshot只证明非预留可行性；
每个participant只有202及Held claim齐备才构成完整backing。

DF-14 必须覆盖安全派生路径、同对象版本range并集、重复读取、空文件真实read、metadata-only、读取中变化、
unmediated读取、不可审计profile、Unknown执行、证据发布故障及bytes窗口。Agent自述、stdout、权限声明、
execution_log_ref或输出存在均不能替代可信broker事实；consumer所需材料集合仍由Slinky判定。

Close 故障注入必须区分“禁止新业务 admission/send/wakeup”和“继续 drain 已确认 obligation”：
在 Closing 前后、每条 inbox/outbox 完成前后、archive/retention commit 前后崩溃，恢复后都使用
原 Session/room/txn/archive reference，并验证部分失败投影 RecoveryRequired 而非 Closed。
同一 close namespace/key/digest 在首次记录 `Closing`、Session 后续变为 Closed 后仍返回所记录的
`Closing` 结果且不重复 archive；另一个通过鉴权和版本检查的新请求才验证 `AlreadyClosed`，相同
key 不同 digest 验证 `IdempotencyConflict`。

LLMTier lost-response 必须覆盖两个分支：已有 Invocation ID 时 GET；首个响应头也丢失、无 ID 时，
显式 adapter 在 D=24h 内以同一 namespace/key/digest 重放原 POST，取得 canonical response 或
Invocation ID 后再 GET。若故障前已证明 Backend dispatch，则总数保持 1；若故障发生在 durable
record 后、首次 dispatch 前，则原 Invocation 可从 0 推进到最多 1，且 replay 不得新增 dispatch
intent/Invocation；dispatch 前拒绝或取消保持 0。所有分支都禁止 UnknownOutcome 自动重派。

## 9. 偏差、waiver、问题与重测

任何 waiver 必须记录 requirement、风险、owner、期限、补偿控制和批准人。因依赖版本未冻结、
环境不可用或 evidence 缺失导致的 case 标为 Blocked；修复后使用同一 case ID 追加 execution，
不覆盖失败证据。

## 10. Evidence package、traceability 与签署

Evidence package 包含基线 manifest、test execution manifest、stdout/log（脱敏）、database/
server ledger extract、artifact SHA-256、environment fingerprint、case traceability 和签署状态。

当前可用证据仅包括文档/Schema validator、fixtures、Pi/OpenAI mock capture；production route、
homeserver、crash E2E、security isolation 和 performance 均为 Open Gate。

## 11. Finalization A/B/C 关闭规则

- A（跨系统设计）以当前唯一finalization OpenAPI/Schema/error/field table/fixtures完整且三方review为关闭；
  不能把字段、错误、去重scope、retention、release或旧接口删除转移到联调决定。
- B（Piko内部下游设计）包括DB/HA/DDL、worker/Pi hook、sandbox和metrics；评审确认不改变A即可独立推进。
- C（联调验证）包括真实LLMTier deadline/recovery、Matrix/Element、Pi、Tool/Workspace、crash/failover、
  Secret与性能证据。失败保持runtime_activation=false，不启用v0.2/heavy或旧Session owner回退。
