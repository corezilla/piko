# Piko

Piko 是为 Slinky v0.3 设计的独立智能体运行时服务。本仓库目前处于契约与系统设计
评审阶段，尚未包含生产实现。

当前中文评审材料：

- `docs/std.lock.json`
- `docs/std-source-manifest.json`（锁定 STD draft.19 的 71 个来源 artifact）
- `rag/std-ingestion-manifest.jsonl`（保留的 draft.1 历史 artifact；不代表项目 RAG ingestion）
- `rag/project-ingestion-manifest.jsonl`（PUB-02：基于最终文档快照重新录入的 10 份 Piko canonical 文档）
- `docs/98_migration/current-document-inventory.md`
- `docs/00_management/piko-std-migration-plan-v0.1.md`
- `docs/00_management/piko-std-tailoring-v0.1.md`
- `docs/98_migration/piko-std-migration-map.md`
- `docs/10_requirements/piko-requirements-traceability-v0.3.md`
- `docs/20_system_design/piko-agent-runtime-design-v0.3.md`
- `docs/20_system_design/mechanisms/piko-collaboration-bridge-design-v0.3.md`
- `docs/30_subsystem_design/piko-collaboration-bridge-internal-design-v0.3.md`
- `docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md`
- `docs/70_verification/plans/piko-agent-runtime-vv-plan-v0.3.md`
- `docs/70_verification/specifications/piko-agent-runtime-test-specification-v0.3.md`
- `docs/91_reviews/piko-std-migration-review-packet.md`
- `docs/91_reviews/piko-std-migration-review-packet.review-decision.json`
- `docs/99_reference/design/agent-runtime-matrix-collaboration-design-v0.3.md`
- `interfaces/openapi/agent-runtime-matrix-openapi-v0.3.yaml`
- `interfaces/schemas/agent-runtime-matrix-v0.3.schema.json`
- `interfaces/error-codes/error-blocker-catalog-v0.3.json`
- `interfaces/vectors/v0.3/collaboration-decision-fixtures.json`
- `docs/70_verification/reports/agent-runtime-contract-qa-v0.3.md`
- `docs/91_reviews/matrix-element-v0.3-review-packet.md`
- `docs/91_reviews/llmtier-v0.3-review-20260906.md`
- `tests/contract/validate_v03_contract.py`
- `docs/99_reference/design/agent-runtime-service-design-v0.2.md`
- `interfaces/openapi/agent-runtime-openapi-v0.2.yaml`
- `interfaces/schemas/agent-runtime-v0.2.schema.json`
- `interfaces/error-codes/error-blocker-catalog-v0.2.json`
- `docs/70_verification/reports/agent-runtime-contract-qa-v0.2.md`

上述 v0.3 文件是 Matrix/Element 增量提案，v0.2 文件是其 Agent Runtime 基础。
在跨项目评审关闭前，不得把它们视为已经冻结的 Slinky 契约或实现证据。v0.1 文件
是英文历史草案，仅供审计，不再作为当前评审版本。跨项目新消息只通过 Matrix 传递。

`piko-*` 文档的内容由 MR-01 immutable candidate commit
`f2bb0937f31a27c36ecc1adefc31b1b78b6dc722` 固定，并在 CP-01 commit
`119aa51af60da32c2db8d27c53bbf2975ab12938` 完成 canonical promotion。DIR-01 以 STD
`0.1.0-draft.19` 将已发布内容一次迁入默认目录树，不改变业务 authority。当前 canonical prose 是上列 `piko-*` design/contract/traceability/assurance
文档；旧 v0.2/v0.3 prose 仅保留历史或 residual scope。OpenAPI、JSON Schema、error catalog 与
fixtures 继续是字段级机器 authority；QA ledger 继续承担未关闭项。PUB-02 已删除 manifest 中全部旧
Piko 记录，并以最终文档 snapshot `eefb12a3b45fd8ffb5a1b2d950d430f4508fec3f` 的新路径和内容 hash
全量重新录入。项目不存在外部 RAG backend，因此 indexing 诚实记录为
`N/A_NO_PROJECT_BACKEND`。Runtime Activation 保持 `false / NOT_RUN`。内部 repository identifier 为 `piko`，
canonical GitHub repository 为 `corezilla/piko`。
