# Piko 当前文档盘点与 STD 映射

状态：迁移完成；STD draft.21 结构升级评审中
日期：2026-09-09
authority：Piko

## 1. Current documents

| 路径 | STD Template | Authority |
|---|---|---|
| `docs/00_management/piko-std-migration-plan-v0.1.md` | `management.project-plan` | 迁移过程与完成边界 |
| `docs/00_management/piko-std-tailoring-v0.1.md` | `management.tailoring` | Piko STD tailoring |
| `docs/10_requirements/piko-requirements-traceability-v0.3.md` | `requirements.traceability` | Requirement/Matrix/Test ID 追踪 |
| `docs/20_system_design/piko-agent-runtime-design-v0.3.md` | `design.system` | `0.3.1 / review`；上一批准版本继续作为生效基线 |
| `docs/20_system_design/mechanisms/piko-collaboration-bridge-design-v0.3.md` | `design.system-mechanism` | `0.3.1 / review`；上一批准版本继续作为生效基线 |
| `docs/30_subsystem_design/piko-collaboration-bridge-internal-design-v0.3.md` | `design.definition` | Piko-owned 内部设计 |
| `docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md` | `contracts.specification` | 契约边界与机器 authority 索引 |
| `docs/70_verification/plans/piko-agent-runtime-vv-plan-v0.3.md` | `assurance.vv-plan` | 后续设计/实现验证策略 |
| `docs/70_verification/specifications/piko-agent-runtime-test-specification-v0.3.md` | `assurance.test-specification` | 后续可执行测试规格 |
| `docs/91_reviews/piko-std-migration-review-packet.md` | `review.packet` | MR-01 immutable review authority |
| `docs/91_reviews/piko-std-draft21-upgrade-packet.md` | `review.packet` | 本次 draft.21 升级候选与评审边界 |

机器字段 authority 位于 `interfaces/{openapi,schemas,error-codes,vectors}/`，可执行契约 Gate 位于
`tests/contract/`。设计、契约和验证中的 open item 属于后续重新设计与编码，不属于迁移 blocker。

## 2. Deleted superseded artifacts

迁移完成后已删除以下工作树副本；历史仍可从 Git commit 查询，不继续作为 current 文件存在：

- v0.1/v0.2 Agent Runtime 与 v0.3 Matrix 旧设计 prose；
- v0.1 OpenAPI、Schema、error catalog 和 QA；
- v0.2/v0.3 旧 QA ledger；
- 旧 Matrix/Element 与 LLMTier review 文档；
- draft.1 `rag/std-ingestion-manifest.jsonl`。

迁移 packet、decision、evidence 和 allowlist 继续保留在 `docs/91_reviews/`，因为它们是迁移审计，
不是待重设计的产品文档。

## 3. Migration closure

- STD source：`0.1.0-draft.21` / `274ef0a67eda080baa0063ae27ede7ee129aa32a` / 73 artifacts。
- current prose：每个 scope 只有一条 authority 链；两份 `0.3.1` 候选在批准前不取代上一版本。
- project RAG：`rag/project-ingestion-manifest.jsonl` 保留升级前 canonical snapshot；候选批准与 promotion 前不重建。
- external vector backend：`N/A_NO_PROJECT_BACKEND`。
- Runtime Activation：`false / NOT_RUN`；后续设计、编码和运行验证使用独立 Gate。
