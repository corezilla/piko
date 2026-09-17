# Piko

Piko 是基于 Pi 的单 Agent 运行时设计。一个 Piko 实例管理一个 Agent；Slinky 负责组织多个 IR、提供材料、验收结果和决定业务下一步。本仓库当前保存已批准的设计与机器契约基线，不包含生产实现，`runtime_activation=false`。

当前唯一任务契约版本为 `0.3.0-simplified.5`，只提供 `POST /runs`、`GET /runs/{run_id}`、`POST /runs/{run_id}:cancel` 和 `GET /runs/{run_id}/result`。

Piko 复用 Pi 的 session、上下文、compaction、tool loop、abort 和有界重试；通过标准 OpenAI-compatible Responses 接口使用 LLMTier；通过 Matrix 原生身份、房间消息、reply 与 media 参与讨论。正式 Memory 属于 Slinky，Piko 仅通过普通任务返回建议变更。

旧 finalization 候选中的 capacity snapshot/claim、Session binding/drain/release、产品 Topic/SID/RID/message/content 服务、SourceInstance/Tier Seat、模型 Invocation 恢复和兼容协商不再是当前外部契约，也不存在并行 fallback。历史只能从 Git 或 v0.2 provenance 查看。

## 当前权威文件

- `docs/10_requirements/piko-requirements-traceability-v0.3.md`
- `docs/20_system_design/piko-agent-runtime-design-v0.3.md`
- `docs/30_subsystem_design/piko-agent-runtime-core-internal-design-v0.3.md`
- `docs/50_implementation_design/piko-runtime-implementation-design-v0.3.md`
- `docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md`
- `docs/60_interfaces/contracts/piko-v0.3-field-usage.md`
- `docs/60_interfaces/contracts/piko-llmtier-consumption-v0.3.md`
- `docs/70_verification/plans/piko-agent-runtime-vv-plan-v0.3.md`
- `docs/70_verification/specifications/piko-agent-runtime-test-specification-v0.3.md`
- `docs/80_operations/piko-runtime-release-and-operations-v0.3.md`
- `interfaces/openapi/agent-runtime-openapi-v0.3.yaml`
- `interfaces/schemas/agent-runtime-v0.3.schema.json`
- `interfaces/schemas/piko-runtime-config-v0.3.schema.json`
- `interfaces/error-codes/error-blocker-catalog-v0.3.json`
- `interfaces/vectors/v0.3/lightweight-runtime-finalization-fixtures.json`
- `tests/contract/validate_v03_contract.py`

本项目采用 STD `0.1.0-draft.21`，由 `docs/std.lock.json` 锁定；STD 升级与 runtime activation 均需独立批准。
