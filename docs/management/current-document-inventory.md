# Piko 当前文档盘点与 STD 映射

状态：迁移盘点草案  
日期：2026-09-07  
authority：Piko

## 1. 盘点范围

本盘点覆盖 `/Users/ben/work/piko/docs` 中迁移前已经存在的设计、契约、QA 和 Review
材料。STD 迁移只建立候选结构，不删除或覆盖原文档，不改变原有接口 ID、Test Case、
Matrix 决策和 authority。

## 2. 当前文档清单

| 路径 | 类型/authority | 状态与版本 | 上位/下位关系 | 重复或冲突 | 建议模板 |
|---|---|---|---|---|---|
| `design/agent-runtime-service-design-v0.2.md` | Piko 服务设计 | 中文 review draft v0.2 | 上位设计；Matrix v0.3 在其上增量 | v0.1 为历史版本；候选 D1-D5 尚未全部冻结 | `design.system` / system |
| `design/agent-runtime-matrix-collaboration-design-v0.3.md` | Piko 子系统设计 | 中文 review draft v0.3 | 下位于服务设计；约束 Matrix 契约 | 与基础设计部分重复 authority/security/recovery | `design.system-mechanism` + `design.definition` |
| `design/agent-runtime-service-design-v0.1.md` | Piko 历史设计 | superseded 英文草案 | 被 v0.2 取代 | 不迁移事实；保留审计 | 历史归档，不实例化 |
| `contracts/agent-runtime-openapi-v0.2.yaml` | Piko API 字段权威候选 | v0.2 draft | 服务设计的机器接口 | v0.1 为历史版本 | `contracts.specification` 的机器附件 |
| `contracts/schemas/agent-runtime-v0.2.schema.json` | Piko Schema 字段权威候选 | v0.2 draft | OpenAPI 本地引用 | v0.1 为历史版本 | `contracts.specification` 的机器附件 |
| `contracts/error-blocker-catalog-v0.2.json` | Piko error catalog | v0.2 draft | 基础 Agent Runtime | v0.3 增量不替代基础项 | `contracts.specification` 的机器附件 |
| `contracts/agent-runtime-matrix-openapi-v0.3.yaml` | Piko Matrix 增量 API | v0.3 review candidate | 扩展唯一 Agent Runtime API | 不得成为第二 runtime surface | `contracts.specification` 的机器附件 |
| `contracts/schemas/agent-runtime-matrix-v0.3.schema.json` | Piko Matrix 增量 Schema | v0.3 review candidate | 扩展 v0.2 Schema | 与 OpenAPI 同步；SessionSummary/CloseResult enum 尚未对齐 Slinky v0.6，必须单独 Contract Amendment | `contracts.specification` 的机器附件 |
| `contracts/error-blocker-catalog-v0.3.json` | Piko Matrix error 增量 | v0.3 review candidate | 以 v0.2 catalog 为 base | 不得复制出第二 error authority | `contracts.specification` 的机器附件 |
| `contracts/fixtures/v0.3/collaboration-decision-fixtures.json` | Contract evidence | v0.3 candidate | 验证多 room/resolution/authority | 不转写为 Markdown | fixture 保留 |
| `contracts/*v0.1*` | 历史机器契约 | superseded | 被 v0.2/v0.3 取代 | 不作为当前事实 | 历史归档，不实例化 |
| `qa/agent-runtime-contract-qa-v0.2.md` | Piko QA ledger | v0.2 draft | 基础服务 QA | v0.1 历史；v0.3 增量 | `assurance.vv-plan` + `assurance.test-specification` |
| `qa/agent-runtime-contract-qa-v0.3.md` | Piko Matrix QA ledger | v0.3 review candidate | 增量 QA、V03-E2E-093..099 | 与 Review Packet 有 traceability 重复 | 同上，保留原 ID |
| `qa/agent-runtime-contract-qa-v0.1.md` | 历史 QA | superseded | 被 v0.2 取代 | 不作为当前计划 | 历史归档，不实例化 |
| `review/matrix-element-v0.3-review-packet.md` | Piko 跨项目 Review | 等待 Slinky Review | 当前 Matrix/Element review packet | STD migration packet 不替代它 | `review.packet`，原件保留 |
| `review/llmtier-v0.3-review-20260906.md` | Piko 对 LLMTier Review | accepted semantics / activation false | Piko consumed-contract evidence | 不是 Piko runtime 实现证明 | `review.packet`，原件保留 |

## 3. 迁移结果

| 新候选文档 | 来源 | STD Template |
|---|---|---|
| `management/piko-std-migration-plan-v0.1.md` | 已接受的迁移共识、当前 candidate/evidence | `management.project-plan` |
| `design/piko-agent-runtime-design-v0.3.md` | service design v0.2 + 已冻结 LLMTier/Matrix delta | `design.system` |
| `design/piko-collaboration-bridge-design-v0.3.md` | Matrix collaboration design v0.3 | `design.system-mechanism` |
| `design/piko-collaboration-bridge-internal-design-v0.3.md` | mechanism 内的 Piko-owned 内部结构 | `design.definition` |
| `management/piko-requirements-traceability-v0.3.md` | Requirement/Matrix/Test IDs | `requirements.traceability` |
| `contracts/piko-agent-runtime-contract-v0.3.md` | v0.2/v0.3 OpenAPI、Schema、error、fixture | `contracts.specification` |
| `assurance/piko-agent-runtime-vv-plan-v0.3.md` | QA v0.2/v0.3 | `assurance.vv-plan` |
| `assurance/piko-agent-runtime-test-specification-v0.3.md` | QA cases、V03-E2E-085..099 | `assurance.test-specification` |
| `review/piko-std-migration-review-packet.md` | 本次迁移证据 | `review.packet` |

## 4. 保留、删除与归档建议

- 首轮迁移不删除任何原文档。
- 新候选文档通过项目 Review 前，原文档仍是当前可追溯输入。
- Review 通过后，可将 v0.1 文件标记为历史归档；是否移动路径另行评审。
- OpenAPI、JSON Schema、error catalog、fixture 和 validator 继续作为机器权威，不复制进
  Markdown。
- `docs/std-source-manifest.json` 是 draft.18 的 71-artifact source lock；旧
  `rag/std-ingestion-manifest.jsonl` 原样保留为 draft.1 历史 artifact，不执行 ingestion。
- PUB-01 候选 `rag/project-ingestion-manifest.jsonl` 只纳入 CP-01 commit
  `119aa51af60da32c2db8d27c53bbf2975ab12938` 的 10 份 Approved canonical Markdown。
  旧 prose、机器 authority、QA/review/evidence、STD source artifact 与 Draft/In Review 文档均排除。
  项目没有现存外部 RAG backend，因此外部向量 indexing 为 `N/A_NO_PROJECT_BACKEND`。
- 当前机器候选的 SessionSummary `Provisioning/Unavailable` 与 CloseResult `Unchanged` 未找到
  已冻结为 Slinky wire contract 的 Review ID；原迁移输入只记录
  `S-20260906-df6086da1916`、`S-20260906-1df5563ef488`，而原 QA 仍把 Session 状态确认列为
  review item。按 Slinky v0.6，目标 wire enum 是 Summary 的 `RecoveryRequired` 与 CloseResult
  的 `AlreadyClosed/RecoveryRequired`。本次迁移只登记冲突，不直接修改机器文件。

## 5. CP-01 canonical authority registry

| Scope | Current canonical authority after CP-01 | Prior artifact disposition |
|---|---|---|
| Agent Runtime system-design prose | `docs/design/piko-agent-runtime-design-v0.3.md` | `agent-runtime-service-design-v0.2.md` prose scope Superseded；保留历史 |
| CollaborationBridge mechanism prose | `docs/design/piko-collaboration-bridge-design-v0.3.md` | `agent-runtime-matrix-collaboration-design-v0.3.md` prose scope Superseded；保留历史 |
| CollaborationBridge internal definition | `docs/design/piko-collaboration-bridge-internal-design-v0.3.md` | 新拆分的 Piko-owned scope；无旧整份文档被替代 |
| API/Schema/error/fixture fields | 既有 OpenAPI、JSON Schema、catalog、fixtures | 保持字段级 machine authority，不被 Markdown 复制或 Supersede |
| Contract boundary prose | `docs/contracts/piko-agent-runtime-contract-v0.3.md` | 汇总/引用机器 authority；不取得 Slinky/LLMTier authority |
| Requirement/Test traceability | `docs/management/piko-requirements-traceability-v0.3.md` | 原 ID 保留；外部 Owner scope 不迁入 Piko |
| V&V strategy and test specification | `docs/assurance/piko-agent-runtime-vv-plan-v0.3.md` 与 `piko-agent-runtime-test-specification-v0.3.md` | QA ledgers继续承担未关闭 item 与历史证据，不整体 Supersede |
| Migration governance | Approved plan、tailoring 与 MR-01 packet/decision | evidence 与旧 review packet 保留为审计记录 |

同一 scope 只允许上表一个 current prose authority。Runtime/external evidence 仍以实际执行 artifact
为 authority；Document Status 不把 NOT_RUN/BLOCKED 变为 PASS。

## 6. PUB-01 publication registry

- publication commit input：`119aa51af60da32c2db8d27c53bbf2975ab12938`。
- publication artifact：`rag/project-ingestion-manifest.jsonl`。
- namespace/authority/ACL：`piko` / `piko` / `visibility=project`。
- inclusion：上表 current canonical prose 中 10 份 Approved、带 sidecar 的 Markdown。
- exclusion：Superseded/historical prose、机器契约、QA、review/evidence、STD lock/source manifest 与 runtime evidence。
- Runtime Activation：`false / NOT_RUN`。
