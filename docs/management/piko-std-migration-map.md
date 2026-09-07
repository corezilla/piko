# Piko STD Migration Map

状态：CP-01 canonical authority map
基线：Piko reviewed candidate `f2bb0937f31a27c36ecc1adefc31b1b78b6dc722`；STD `9841083c4d8d0ed1556bdc413d77b4567ac696b4`

## 1. 文档映射

| 迁移候选 | 模板 | 来源 authority | residual scope |
|---|---|---|---|
| `docs/management/piko-std-migration-plan-v0.1.md` | `management.project-plan` | 已接受 profile/domains/authority/cohort 共识 | 只管理迁移，不取得设计或运行 authority |
| `docs/design/piko-agent-runtime-design-v0.3.md` | `design.system` | service design v0.2、当前机器契约、冻结 review 输入 | 原 service design 在 promotion 前保留全部 residual authority |
| `docs/design/piko-collaboration-bridge-design-v0.3.md` | `design.system-mechanism` | Matrix collaboration design v0.3 | 原机制文档在 promotion 前保留全部 residual authority |
| `docs/design/piko-collaboration-bridge-internal-design-v0.3.md` | `design.definition` | 上述机制中的 Piko-owned 内部结构 | 不包含外部 Owner 或端到端机制 authority |
| `docs/contracts/piko-agent-runtime-contract-v0.3.md` | `contracts.specification` | OpenAPI、JSON Schema、error catalog、fixtures | 机器文件继续是字段 authority |
| `docs/management/piko-requirements-traceability-v0.3.md` | `requirements.traceability` | 现有 Requirement/Matrix/Test IDs | Slinky/LLMTier-owned 需求仍留在各 Owner |
| `docs/assurance/piko-agent-runtime-vv-plan-v0.3.md` | `assurance.vv-plan` | QA v0.2/v0.3 | 运行证据尚未产生 |
| `docs/assurance/piko-agent-runtime-test-specification-v0.3.md` | `assurance.test-specification` | QA cases、V03-E2E IDs | 原 QA ledger 不被整体 Supersede |
| `docs/review/piko-std-migration-review-packet.md` | `review.packet` | 本次 inventory/validation evidence | 只请求迁移候选 review |

## 2. 章节映射

- `design.system`：既有目的/范围对应模板 1/3；authority/约束对应 2；组件/数据/状态/接口对应 4-8；
  recovery/security/observability/deployment 对应 9-12；risks/open gates/verification 对应 13-14 与附录。
- `design.system-mechanism`：既有 context、state、normal path、failure/recovery、concurrency、security、
  observability、validation 章节覆盖端到端机制模板；内部模块细节拆到 `design.definition`。
- contract、V&V、test 文档保留现有 ID 和表格，用 tailoring 维持机器 authority 与证据边界。

## 3. CP-01 authority disposition

- `agent-runtime-service-design-v0.2.md` 的 system-design prose scope 已完整迁入
  `piko-agent-runtime-design-v0.3.md`，旧文档标记 Superseded 并保留历史。
- `agent-runtime-matrix-collaboration-design-v0.3.md` 的 mechanism/internal prose scope 已完整迁入
  两份 CollaborationBridge canonical 文档，旧文档标记 Superseded 并保留历史。
- OpenAPI、JSON Schema、error catalog 和 fixtures 不迁出字段 authority；它们保持 current。
- QA v0.2/v0.3 与跨项目 review artifact 保留未关闭 item、输入与历史证据，不整体 Supersede。
- CP-01 不修改 `rag/std-ingestion-manifest.jsonl`，也不激活 runtime。后续 PUB-01 候选以 CP-01
  immutable commit `119aa51af60da32c2db8d27c53bbf2975ab12938` 生成独立
  `rag/project-ingestion-manifest.jsonl`，只纳入 10 份 Approved canonical Markdown；机器 authority、
  QA/review/evidence、旧 prose 与 runtime artifact 全部排除。外部 RAG backend 不存在，indexing 为
  `N/A_NO_PROJECT_BACKEND`，Runtime Activation 仍为 `false / NOT_RUN`。
