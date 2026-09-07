# Piko

Piko 是为 Slinky v0.3 设计的独立智能体运行时服务。本仓库目前处于契约与系统设计
评审阶段，尚未包含生产实现。

当前中文评审材料：

- `docs/std.lock.json`
- `docs/std-source-manifest.json`（锁定 STD draft.17 的 71 个来源 artifact）
- `rag/std-ingestion-manifest.jsonl`（保留的 draft.1 历史 artifact；不代表项目 RAG ingestion）
- `docs/management/current-document-inventory.md`
- `docs/management/piko-std-migration-plan-v0.1.md`
- `docs/management/piko-std-tailoring-v0.1.md`
- `docs/management/piko-std-migration-map.md`
- `docs/management/piko-requirements-traceability-v0.3.md`
- `docs/design/piko-agent-runtime-design-v0.3.md`
- `docs/design/piko-collaboration-bridge-design-v0.3.md`
- `docs/design/piko-collaboration-bridge-internal-design-v0.3.md`
- `docs/contracts/piko-agent-runtime-contract-v0.3.md`
- `docs/assurance/piko-agent-runtime-vv-plan-v0.3.md`
- `docs/assurance/piko-agent-runtime-test-specification-v0.3.md`
- `docs/review/piko-std-migration-review-packet.md`
- `docs/review/piko-std-migration-review-packet.review-decision.json`
- `docs/design/agent-runtime-matrix-collaboration-design-v0.3.md`
- `docs/contracts/agent-runtime-matrix-openapi-v0.3.yaml`
- `docs/contracts/schemas/agent-runtime-matrix-v0.3.schema.json`
- `docs/contracts/error-blocker-catalog-v0.3.json`
- `docs/contracts/fixtures/v0.3/collaboration-decision-fixtures.json`
- `docs/qa/agent-runtime-contract-qa-v0.3.md`
- `docs/review/matrix-element-v0.3-review-packet.md`
- `docs/review/llmtier-v0.3-review-20260906.md`
- `scripts/validate_v03_contract.py`
- `docs/design/agent-runtime-service-design-v0.2.md`
- `docs/contracts/agent-runtime-openapi-v0.2.yaml`
- `docs/contracts/schemas/agent-runtime-v0.2.schema.json`
- `docs/contracts/error-blocker-catalog-v0.2.json`
- `docs/qa/agent-runtime-contract-qa-v0.2.md`

上述 v0.3 文件是 Matrix/Element 增量提案，v0.2 文件是其 Agent Runtime 基础。
在跨项目评审关闭前，不得把它们视为已经冻结的 Slinky 契约或实现证据。v0.1 文件
是英文历史草案，仅供审计，不再作为当前评审版本。跨项目新消息只通过 Matrix 传递。

`piko-*` 候选文档按 STD `0.1.0-draft.17` 的 immutable commit/tag 建立，目前仍是
Migration Review `draft`。迁移通过前，原设计和机器契约继续作为可追溯输入；不执行 canonical
promotion、项目 RAG ingestion 或 Runtime Activation。用户已批准内部 repository identifier 为
`piko`；这项批准不构成后续 canonical promotion 授权。
