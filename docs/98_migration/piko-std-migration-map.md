# Piko STD Migration Map

状态：STD document migration completed；PUB-02 rebuilt
基线：Piko final document snapshot `eefb12a3b45fd8ffb5a1b2d950d430f4508fec3f`；STD `eeaf9bf33012928e3e74a9ca30e87d717690d343`

## 1. 文档映射

| 迁移候选 | 模板 | 来源 authority | residual scope |
|---|---|---|---|
| `docs/00_management/piko-std-migration-plan-v0.1.md` | `management.project-plan` | 已接受 profile/domains/authority/cohort 共识 | 只管理迁移，不取得设计或运行 authority |
| `docs/20_system_design/piko-agent-runtime-design-v0.3.md` | `design.system` | service design v0.2、当前机器契约、冻结 review 输入 | 原 service design 在 promotion 前保留全部 residual authority |
| `docs/20_system_design/mechanisms/piko-collaboration-bridge-design-v0.3.md` | `design.system-mechanism` | Matrix collaboration design v0.3 | 原机制文档在 promotion 前保留全部 residual authority |
| `docs/30_subsystem_design/piko-collaboration-bridge-internal-design-v0.3.md` | `design.definition` | 上述机制中的 Piko-owned 内部结构 | 不包含外部 Owner 或端到端机制 authority |
| `docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md` | `contracts.specification` | OpenAPI、JSON Schema、error catalog、fixtures | 机器文件继续是字段 authority |
| `docs/10_requirements/piko-requirements-traceability-v0.3.md` | `requirements.traceability` | 现有 Requirement/Matrix/Test IDs | Slinky/LLMTier-owned 需求仍留在各 Owner |
| `docs/70_verification/plans/piko-agent-runtime-vv-plan-v0.3.md` | `assurance.vv-plan` | QA v0.2/v0.3 | 运行证据尚未产生 |
| `docs/70_verification/specifications/piko-agent-runtime-test-specification-v0.3.md` | `assurance.test-specification` | QA cases、V03-E2E IDs | 原 QA ledger 不被整体 Supersede |
| `docs/91_reviews/piko-std-migration-review-packet.md` | `review.packet` | 本次 inventory/validation evidence | 只请求迁移候选 review |

## 2. 章节映射

- `design.system`：既有目的/范围对应模板 1/3；authority/约束对应 2；组件/数据/状态/接口对应 4-8；
  recovery/security/observability/deployment 对应 9-12；risks/open gates/verification 对应 13-14 与附录。
- `design.system-mechanism`：既有 context、state、normal path、failure/recovery、concurrency、security、
  observability、validation 章节覆盖端到端机制模板；内部模块细节拆到 `design.definition`。
- contract、V&V、test 文档保留现有 ID 和表格，用 tailoring 维持机器 authority 与证据边界。

## 3. DIR-01 authority disposition

- `agent-runtime-service-design-v0.2.md` 的 system-design prose scope 已完整迁入
  `piko-agent-runtime-design-v0.3.md`；旧工作树副本已删除，历史只从 Git/evidence 查询。
- `agent-runtime-matrix-collaboration-design-v0.3.md` 的 mechanism/internal prose scope 已完整迁入
  两份 CollaborationBridge canonical 文档；旧工作树副本已删除。
- OpenAPI、JSON Schema、error catalog 和 fixtures 不迁出字段 authority；它们保持 current。
- 旧 QA 与跨项目 review 工作树副本已删除；仍有价值的约束位于 canonical design、contract 和 V&V
  文档，作为后续重新设计/编码输入，不属于迁移 blocker。
- DIR-01 将 current prose、机器契约、验证资料、评审记录与历史材料一次搬到 STD 默认路径；不改变
  Document ID、业务语义、接口 ID 或 Runtime Activation。
- `rag/project-ingestion-manifest.jsonl` 已删除全部 PUB-01 Piko 记录，并由 PUB-02 基于最终文档
  snapshot 全量重建；10 条记录均使用新路径、draft.19 和可复算 content hash。
- 外部 RAG backend 不存在，indexing 为 `N/A_NO_PROJECT_BACKEND`；Runtime Activation 仍为
  `false / NOT_RUN`。
