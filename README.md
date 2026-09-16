# Piko

Piko 是为 Slinky v0.3 设计的独立智能体运行时服务。本仓库目前处于契约与系统设计
评审阶段，尚未包含生产实现。

## Engineering Standard

本项目采用 STD `0.1.0-draft.21`，由 `docs/std.lock.json` 锁定。STD 升级只在用户明确要求时
执行；单份文档只跟踪其 `Template ID`、独立 `Template Version` 和模板 SHA-256。

`docs/20_system_design/piko-agent-runtime-design-v0.3.md` 按 `design.system` 4.0.0 形成
V0.3 finalization review candidate，状态仍为 In Review。该候选已经把 Slinky 单 Agent 轻量任务
要求、Piko communication provider 和 LLMTier Scope B 消费规则合并为唯一设计路径；
`interfaces/openapi/agent-runtime-openapi-v0.3.yaml` 与配套 Schema/error/fixture 是唯一字段级候选。
旧 v0.2 heavy payload、Piko-owned Session directory/element-view/:close、`collaboration_contract`、
reconcile 与 Run SSE 在 `0.3.0-finalization.2` 一次性退役，不建立并行接口或 fallback。
这是定向设计候选，不改变本项目 draft.21 的正式 STD lock、其他文档的模板来源、
已发布文档快照或 Runtime Activation。候选来源证据见
`docs/91_reviews/piko-system-design-std26-source-manifest.json`，语义缺口与验证范围见
`docs/91_reviews/piko-system-design-std26-review-packet.md`；项目级采用、文档批准及
RAG 更新须分别评审。

当前中文评审材料：

- `docs/std.lock.json`
- `docs/std-source-manifest.json`（锁定 STD draft.21 的来源 artifact）
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
- `docs/60_interfaces/contracts/piko-v0.3-field-usage.md`
- `docs/60_interfaces/contracts/piko-llmtier-consumption-v0.3.md`
- `docs/70_verification/plans/piko-agent-runtime-vv-plan-v0.3.md`
- `docs/70_verification/specifications/piko-agent-runtime-test-specification-v0.3.md`
- `docs/91_reviews/piko-std-migration-review-packet.md`
- `docs/91_reviews/piko-std-migration-review-packet.review-decision.json`
- `docs/91_reviews/piko-std-draft21-upgrade-packet.md`（本次结构升级评审候选）
- `interfaces/openapi/agent-runtime-openapi-v0.3.yaml`
- `interfaces/schemas/agent-runtime-v0.3.schema.json`
- `interfaces/error-codes/error-blocker-catalog-v0.3.json`
- `interfaces/vectors/v0.3/lightweight-runtime-finalization-fixtures.json`
- `tests/contract/validate_v03_contract.py`
- `interfaces/openapi/agent-runtime-openapi-v0.2.yaml`（historical/superseded）
- `interfaces/schemas/agent-runtime-v0.2.schema.json`（historical/superseded）
- `interfaces/error-codes/error-blocker-catalog-v0.2.json`（historical/superseded）

上述 v0.3 文件共同组成 finalization candidate；v0.2 文件只作 provenance，不再是基础机器契约。
跨系统字段与行为归入 A 类并在联调前冻结；DB/HA/DDL/worker/Pi/sandbox 是 B 类内部下游设计；
真实依赖、crash、安全、性能证据是 C 类联调/激活门禁。B/C 不得修改 A 类 wire。
被 canonical 文档取代的旧工作树副本已经删除；必要历史通过 Git 与迁移 evidence 查询。

`piko-*` 文档的内容由 MR-01 immutable candidate commit
`f2bb0937f31a27c36ecc1adefc31b1b78b6dc722` 固定，并在 CP-01 commit
`119aa51af60da32c2db8d27c53bbf2975ab12938` 完成 canonical promotion。DIR-01 以 STD
`0.1.0-draft.19` 将已发布内容一次迁入默认目录树，不改变业务 authority；本次项目采用升级至
STD `0.1.0-draft.21` 时，文档实例只按各自独立 Template Version 判断是否需要调整。上一
canonical snapshot 仍由既有 publication evidence 与 RAG manifest 指向；本次 `0.3.1` 系统/机制设计
在批准和 promotion 前保持 review candidate。旧 v0.2/v0.3 prose 仅保留历史或 residual scope。OpenAPI、JSON Schema、error catalog 与
fixtures 继续是字段级机器 authority；QA ledger 继续承担未关闭项。PUB-02 已删除 manifest 中全部旧
Piko 记录，并以清理后的最终文档 snapshot `84d12da6f786e57e200b64cf80567e32f68f8d45` 的新路径和内容 hash
全量重新录入。项目不存在外部 RAG backend，因此 indexing 诚实记录为
`N/A_NO_PROJECT_BACKEND`。Runtime Activation 保持 `false / NOT_RUN`。内部 repository identifier 为 `piko`，
canonical GitHub repository 为 `corezilla/piko`。
