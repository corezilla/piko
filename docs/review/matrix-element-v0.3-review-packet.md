# Piko v0.3 Matrix/Element 设计 Review Packet

状态：等待 Slinky Review  
日期：2026-09-06  
需求来源：Matrix `S-20260906-3480e9be1da6`、`S-20260906-88487dbbc176`、`S-20260906-1df5563ef488`
Slinky 基线声明：Contract v0.5 commit `9e9f97c2ef`；Agent Collaboration View 冻结 commit `c5ee1aee0f`

## 1. 变更文件

| 项目内相对路径 | 绝对路径 | 用途 |
|---|---|---|
| `docs/design/agent-runtime-matrix-collaboration-design-v0.3.md` | `/Users/ben/work/piko/docs/design/agent-runtime-matrix-collaboration-design-v0.3.md` | 系统边界、状态机、持久化、恢复、安全与测试设计 |
| `docs/design/agent-runtime-service-design-v0.2.md` | `/Users/ben/work/piko/docs/design/agent-runtime-service-design-v0.2.md` | Piko/LLMTier Scope B、固定 Pi adapter 与 recovery 边界 |
| `docs/contracts/agent-runtime-matrix-openapi-v0.3.yaml` | `/Users/ben/work/piko/docs/contracts/agent-runtime-matrix-openapi-v0.3.yaml` | Profile、Binding、Session、Element 与 close API |
| `docs/contracts/schemas/agent-runtime-matrix-v0.3.schema.json` | `/Users/ben/work/piko/docs/contracts/schemas/agent-runtime-matrix-v0.3.schema.json` | v0.3 增量请求/响应 Schema |
| `docs/contracts/error-blocker-catalog-v0.3.json` | `/Users/ben/work/piko/docs/contracts/error-blocker-catalog-v0.3.json` | Matrix typed errors 与 fail-closed 规则 |
| `docs/contracts/fixtures/v0.3/collaboration-decision-fixtures.json` | `/Users/ben/work/piko/docs/contracts/fixtures/v0.3/collaboration-decision-fixtures.json` | 多 room、resolution、少数立场、越权与 descriptor unavailable 正负样例 |
| `docs/qa/agent-runtime-contract-qa-v0.3.md` | `/Users/ben/work/piko/docs/qa/agent-runtime-contract-qa-v0.3.md` | 已冻结决定、待确认 fixture 和 activation gate |
| `docs/review/llmtier-v0.3-review-20260906.md` | `/Users/ben/work/piko/docs/review/llmtier-v0.3-review-20260906.md` | LLMTier machine contract、Scope B 与 pinned SDK capture 结论 |
| `scripts/validate_v03_contract.py` | `/Users/ben/work/piko/scripts/validate_v03_contract.py` | 可重复的 Schema/OpenAPI/语义/error catalog 文档校验 |
| `README.md` | `/Users/ben/work/piko/README.md` | 当前中文评审材料索引 |

## 2. 冻结决定 Traceability

| # | Slinky 决定 | 设计章节 | Schema / OpenAPI | Test Case |
|---:|---|---|---|---|
| 1 | CollaborationBridge 唯一路径与 AS transaction ingress | 设计 §4、§10、§16 | OpenAPI `x-agent-task-request-extension`；Schema `CollaborationContract` | Contract ingress fixture；Recovery transaction replay；V03-E2E-096 |
| 2 | ApplicationServiceVirtualUser、稳定 MXID、唯一约束与 Binding lifecycle | 设计 §2、§6 | `identity_provisioning_mode` const；`IRCommunicationBindingRequest/Result` | Unit MXID vector/碰撞/同名；Contract Binding；V03-E2E-093/094 |
| 3 | singleton MatrixTransportProfile Admin/Read/Probe，Secret 引用 | 设计 §5、§12 | `/operator/matrix-transport-profile`、`:probe`；Profile Request/Result | Contract create/update/read/probe；Security Secret 扫描；V03-E2E-093 |
| 4 | If-None-Match、If-Match、ETag、幂等与 typed error | 设计 §13 | OpenAPI header parameters；error catalog v0.3 | Unit digest/ETag；Contract 409/412 与 replay；V03-E2E-093 |
| 5 | 一 Session 一 private non-encrypted non-federated room，成员与关闭保留 | 设计 §7、§8、§12 | `CollaborationContract`、Session Summary、Close Request/Result | Contract room/close；Recovery close/archive；Security policy negative；V03-E2E-095 |
| 6 | Element ExternalLink 且无 thread/Secret/checkpoint | 设计 §9、§12、§16 | `ElementConversationDescriptor` | Unit descriptor Secret scan；Contract element-view；V03-E2E-095 |
| 7 | 去重、ledger、durable inbox/outbox、checkpoint、lease/fencing、restart | 设计 §10、§11 | 状态为 Piko 私有实现，不进入公开 Schema | Unit 三层去重；Recovery crash/failover；V03-E2E-096 |
| 8 | Rename reconciliation 不改变 identity/room/membership/history | 设计 §6、§11 | Binding display profile/version 与稳定 `matrix_user_id` | Unit rename monotonic；Recovery partial failure；V03-E2E-094 |
| 9 | Unit/Contract/Recovery/Security/E2E 与 Pi SDK pin | 设计 §14、§15；QA MX-QA-001 | 全部新增 Schema/OpenAPI/error | V03-E2E-093..096；Pi adapter capture activation gate |
| 10 | 多 room cursor pagination 与四类 filter；summary 只含 Piko-owned refs/status | 设计 §9.1 | OpenAPI Session list；Schema `CollaborationSessionList/Summary` | MX-U-013、MX-C-013、MX-R-013、V03-E2E-097 |
| 11 | strict AgentTaskResult optional CollaborationResolutionSummary | 设计 §9.2 | OpenAPI `x-agent-task-result-schema`；Schema `AgentTaskResultV03/CollaborationResolutionSummary` | MX-U-014、MX-C-014、V03-E2E-098 |
| 12 | Resolution 只陈述 Team outcome，不执行 Slinky-owned decision/action | 设计 §3、§9.2 | strict Schema + error `CollaborationResolutionAuthorityViolation` | authority-overflow negative、MX-S-014、V03-E2E-098 |
| 13 | exact Session 打开既有 Element ExternalLink；无 transcript/login/iframe/token fallback | 设计 §9.3、§16 | element-view；`ElementConversationDescriptor`；typed 503 | MX-C-015、MX-S-014、V03-E2E-099 |
| 14 | exact-case Tier model 与 Scope B：Piko generation 为 non-stream Responses + Models + recovery | 基础设计 §12；LLMTier review §4-6 | LLMTier machine bundle review；Piko 不新增另一路径 | pinned SDK capture；V0.3 Chat/SSE fail-closed fixture 由 LLMTier 持有 |
| 15 | V03-E2E-097..099 evidence | 设计 §14；QA 测试映射 | fixture + validator + error catalog | V03-E2E-097、098、099 |

## 3. 明确删除的目标路径

v0.3 目标设计中不存在以下运行路径：

- `ManagedUser`；
- 虚拟用户普通 Matrix Client `/sync`、业务 poll 或 heartbeat；
- shared project room、Matrix thread 或 participant mutation；
- E2EE 或遇到加密 room 时的自动降级；
- iframe、自动登录或 Piko 代持用户 Element session；
- 外部 Collaboration bridge、Codex task、文件 outbox 或任何 fallback。

这些名词只会出现在“禁止”“非目标”或负向测试描述中，不代表保留实现。

## 4. 校验与结果

已执行：

1. Python `json.loads`：Schema 与 error catalog 通过；
2. `jsonschema.Draft202012Validator.check_schema`：metaschema 通过；
3. `yaml.safe_load`：OpenAPI YAML 通过；
4. 自定义 `$ref` walker：OpenAPI 内部与本地文件 fragment 全部可解析；
5. 代表性 positive samples：Profile Request/Result、Binding Request、
   CollaborationContract、AgentTaskRequest extension、Element descriptor 全部通过；
6. `scripts/validate_v03_contract.py`：Schema 正负样例、participant set 语义、OpenAPI
   filters/typed 503、authority boundary 与 error catalog 通过；
7. `git diff --check`：通过。

尚未执行 production route、homeserver、Application Service、Pi SDK 或 crash E2E；
仓库当前没有这些实现，本文不声称实现通过。

## 5. 未解决问题和占位项

- Pi SDK package/version 已固定为 `@earendil-works/pi-coding-agent` 与
  `@earendil-works/pi-ai` `0.85.1`（Pi commit `9767ba2`）；LLMTier provider baseline
  capture 见 `docs/review/llmtier-v0.3-review-20260906.md`。AgentSession collaboration
  hook 仍无 capture；它不阻塞 Matrix Contract review，但阻塞 Pi adapter activation。
- Operator retention policy catalog Schema、实际时长与 archive/reconciliation deadline。
- Matrix homeserver/Application Service 最低版本和 Probe 通过条件。
- CollaborationEvent、route、reply obligation、deadline 的最终 machine-readable fixture。
- Element route 编码、支持版本、Session title authority。
- transport capacity、backpressure 和 SLO profile。
- 多 room cursor 的签名 key rotation、snapshot storage/expiry 和 recovery SLO 需在实现期冻结；
  当前 wire contract 与 fail-closed 错误已确定。

当前没有与 Slinky 已冻结决定的已知冲突，也没有已知无法实现项。上述项目不得由实现
自行猜测；相关 scope 在 fixture 与测试完成前保持未激活或 fail closed。

## 6. Contract Test 与实现顺序

1. Slinky review 并冻结 Schema、typed errors 与正负 fixture；
2. 生成类型、canonicalization、ETag/idempotency contract harness；
3. persistence migration 与 identity/session/ledger invariants；
4. MatrixTransportProfile Admin/Read/Probe；
5. AS virtual-user provisioning、Binding 与 rename reconciliation；
6. AS transaction ingress、durable inbox/outbox、三层去重、lease/fencing；
7. `POST /runs` 原子 Session intent、exclusive room 与 membership；
8. 多 room Session list、稳定 cursor/filter、Element ExternalLink、close/archive/retention；
9. structured resolution persistence/validation 与 AgentTaskResult v0.3 projection；
10. crash/restart、security、backpressure、V03-E2E-093..099；
11. 在已固定 Pi SDK 上实现唯一 Pi adapter，并保存可复现 collaboration capture。

## 7. 建议冻结版本

- OpenAPI：`0.3.0`；
- Schema ID：`https://piko.local/schemas/agent-runtime-matrix-v0.3.schema.json`；
- `schema_version`：`agent-runtime-matrix/v0.3`；
- Error catalog：`agent-runtime-errors/v0.3`。

该包是 `agent-runtime v0.2` 的增量，最终合并到唯一 `agent-runtime/v1` 服务面。
