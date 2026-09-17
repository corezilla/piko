# Piko STD Migration Map

状态：STD document migration completed；PUB-02 rebuilt
历史迁移基线（仅审计来源、非 current authority）：Piko final document snapshot `84d12da6f786e57e200b64cf80567e32f68f8d45`；STD `eeaf9bf33012928e3e74a9ca30e87d717690d343`。当前 authority 由 current inventory、现行系统设计与机器契约定义；当前 STD 锁为 draft.21 / `274ef0a67eda080baa0063ae27ede7ee129aa32a`。

## 1. 文档映射

| 迁移候选 | 模板 | 来源 authority | residual scope |
|---|---|---|---|
| `docs/00_management/piko-std-migration-plan-v0.1.md` | `management.project-plan` | 已接受 profile/domains/authority/cohort 共识 | 只管理迁移，不取得设计或运行 authority |
| `docs/20_system_design/piko-agent-runtime-design-v0.3.md` | `design.system` | 当前简化需求、机器契约与已接受 review 决定；service design v0.2仅为历史迁移来源 | 无；旧 service design 已完整迁移并退役 |
| 已退役，无 current mechanism 文档 | N/A | 历史 Matrix collaboration design v0.3 | 仅Git审计来源；不构成产品消息/绑定/恢复fallback |
| `docs/30_subsystem_design/piko-agent-runtime-core-internal-design-v0.3.md` | `design.definition` | 当前简化Runtime与固定Pi事实 | 不包含外部Owner或业务流程authority |
| `docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md` | `contracts.specification` | OpenAPI、JSON Schema、error catalog、fixtures | 机器文件继续是字段 authority |
| `docs/10_requirements/piko-requirements-traceability-v0.3.md` | `requirements.traceability` | 现有 Requirement/Matrix/Test IDs | Slinky/LLMTier-owned 需求仍留在各 Owner |
| `docs/70_verification/plans/piko-agent-runtime-vv-plan-v0.3.md` | `assurance.vv-plan` | QA v0.2/v0.3 | 运行证据尚未产生 |
| `docs/70_verification/specifications/piko-agent-runtime-test-specification-v0.3.md` | `assurance.test-specification` | QA cases、V03-E2E IDs | 原 QA ledger 不被整体 Supersede |
| `docs/91_reviews/piko-std-migration-review-packet.md` | `review.packet` | 本次 inventory/validation evidence | 只请求迁移候选 review |

## 2. 章节映射

- `design.system`：当前简化设计以 9 节覆盖目的/边界、Pi复用、执行失败、模型调用、Matrix、Memory/Usage、运维、退出条款与跨方基线；不再宣称存在旧14章 current authority。
- `design.system-mechanism`：当前不单列 mechanism 文档；标准 Matrix 讨论与普通任务循环已纳入 current system/core design。历史 mechanism 只作 Git 审计来源，不承担 residual authority。
- contract、V&V、test 文档保留现有 ID 和表格，用 tailoring 维持机器 authority 与证据边界。

## 3. DIR-01 authority disposition

- `agent-runtime-service-design-v0.2.md` 的 system-design prose scope 已完整迁入
  `piko-agent-runtime-design-v0.3.md`；旧工作树副本已删除，历史只从 Git/evidence 查询。
- 历史 `agent-runtime-matrix-collaboration-design-v0.3.md` 及两份 CollaborationBridge 候选已退出
  current authority；只从Git历史审计，不是兼容分支。标准Matrix参与规则位于当前system/runtime core。
- OpenAPI、JSON Schema、error catalog 和 fixtures 不迁出字段 authority；它们保持 current。
- 旧 QA 与跨项目 review 工作树副本已删除；仍有价值的约束位于 canonical design、contract 和 V&V
  文档，作为后续重新设计/编码输入，不属于迁移 blocker。
- DIR-01 将 current prose、机器契约、验证资料、评审记录与历史材料一次搬到 STD 默认路径；不改变
  Document ID、业务语义、接口 ID 或 Runtime Activation。
- `rag/project-ingestion-manifest.jsonl` 已删除全部 PUB-01 Piko 记录，并由 PUB-02 基于最终文档
  snapshot 全量重建；历史记录只说明当时发布事实，不是当前 simplified.5 authority。
- 外部 RAG backend 不存在，indexing 为 `N/A_NO_PROJECT_BACKEND`；Runtime Activation 仍为
  `false / NOT_RUN`。
