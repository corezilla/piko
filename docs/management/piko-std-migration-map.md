# Piko STD draft.17 Migration Map

状态：Migration Review working artifact（不属于 canonical promotion）
基线：Piko `2386ea7fa6e5161ed6074b1e261fad74d148c067`；STD `94c0262de35b5b989bba9f8d23f212af709c9dbf`

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

## 3. Publication 边界

本 cohort 不删除、不改名、不整体 Supersede 原文档；不改机器契约，不修改
`rag/std-ingestion-manifest.jsonl`，不建立项目 RAG inclusion，不激活 runtime。只有后置批准明确每份 scope
全部迁出后，才可逐份切换 canonical 索引并标记旧文档 Superseded；否则旧文档保留 residual-scope authority。
