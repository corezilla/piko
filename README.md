# Piko

Piko 是为 Slinky v0.3 设计的独立智能体运行时服务。本仓库目前处于契约与系统设计
评审阶段，尚未包含生产实现。

当前中文评审材料：

- `docs/std.lock.json`
- `docs/std-source-manifest.json`（锁定 STD draft.18 的 71 个来源 artifact）
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

`piko-*` 文档的内容由 MR-01 immutable candidate commit
`f2bb0937f31a27c36ecc1adefc31b1b78b6dc722` 固定，并以 STD `0.1.0-draft.18` 完成 CP-01
canonical promotion。当前 canonical prose 是上列 `piko-*` design/contract/traceability/assurance
文档；旧 v0.2/v0.3 prose 仅保留历史或 residual scope。OpenAPI、JSON Schema、error catalog 与
fixtures 继续是字段级机器 authority；QA ledger 继续承担未关闭项。项目 RAG publication 由 PUB-01
独立处理，Runtime Activation 保持 `false / NOT_RUN`。内部 repository identifier 为 `piko`，
canonical GitHub repository 为 `corezilla/piko`。
