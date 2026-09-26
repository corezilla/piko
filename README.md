# Piko

Piko is a single-agent durable task runtime around the pinned Pi AgentHarness. It exposes the four v0.3 HTTP operations, persists task/run/result and effect ledgers in SQLite, keeps Pi JSONL sessions durable, and optionally consumes discussion turns through the native Matrix Client-Server SDK.

## Run locally

Requires Node.js 22.19 or newer. Copy `config/runtime.example.json` to `config/runtime.json`, adjust the absolute paths and LLMTier endpoint, then provide the referenced secrets:

```sh
npm install
PIKO_API_BEARER=... PIKO_LLM_API_KEY=... npm start
```

The pinned Pi checkout lives at `upstream/pi` (commit `9767ba2…`). On a fresh checkout, install that checkout's locked dependencies and apply `patches/pi-v0.85.1-piko.patch` there before starting Piko; startup verifies the Pi commit, patch markers, and hashed adapter manifest.

The example listens only on `127.0.0.1:8787`. Run `npm run check` for type, unit, and contract checks. Real LLMTier, Matrix, crash-recovery, and security acceptance remain deployment gates rather than startup-time claims.

LLMTier uses HTTPS outside a single-host development setup. For local integration only, the runtime schema also accepts an HTTP LLMTier URL on `127.0.0.0/8`, `localhost`, or `[::1]`; it does not permit plaintext LAN or public endpoints.

Piko 是基于 Pi 的单 Agent 运行时。一个 Piko 实例管理一个 Agent；Slinky 负责组织多个 IR、提供材料、验收结果和决定业务下一步。本仓库同时保存已批准的设计、机器契约与对应实现；真实外部依赖联调和生产激活仍是后续 Gate。

当前唯一任务契约版本为 `0.3.0-simplified.6`，只提供 `POST /runs`、`GET /runs/{run_id}`、`POST /runs/{run_id}:cancel` 和 `GET /runs/{run_id}/result`。Slinky 在提交前生成全局唯一 `task_id`；一个 `task_id` 只定义一个不可变逻辑任务并永久绑定一个 Run。

Piko 复用 Pi AgentHarness 的 durable session、lane/operation、上下文、compaction、tool loop、abort 和有界重试；通过标准 OpenAI-compatible Responses 接口使用 LLMTier；通过 Matrix 原生身份、房间消息、reply 与 media 参与讨论。正式 Memory 属于 Slinky，Piko 仅通过普通任务返回建议变更。

旧 finalization 候选中的 capacity snapshot/claim、Session binding/drain/release、产品 Topic/SID/RID/message/content 服务、SourceInstance/Tier Seat、模型 Invocation 恢复和兼容协商不再是当前外部契约，也不存在并行 fallback。历史只能从 Git 或 v0.2 provenance 查看。

## 当前权威文件

- `docs/10_requirements/piko-requirements-traceability-v0.3.md`
- `docs/20_system_design/piko-system-design.md`
- `docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md`
- `docs/60_interfaces/contracts/piko-v0.3-field-usage.md`
- `docs/60_interfaces/contracts/piko-llmtier-consumption-v0.3.md`
- `docs/70_verification/plans/piko-agent-runtime-vv-plan-v0.3.md`
- `docs/70_verification/specifications/piko-agent-runtime-test-specification-v0.3.md`
- `docs/80_operations/piko-runtime-release-and-operations-v0.3.md`
- `interfaces/openapi/agent-runtime-openapi-v0.3.yaml`
- `interfaces/schemas/agent-runtime-v0.3.schema.json`
- `interfaces/schemas/piko-runtime-config-v0.3.schema.json`
- `interfaces/schemas/piko-tool-profile-v0.3.schema.json`
- `interfaces/error-codes/error-blocker-catalog-v0.3.json`
- `interfaces/vectors/v0.3/lightweight-runtime-finalization-fixtures.json`
- `tests/contract/validate_v03_contract.py`

本项目采用 STD `0.1.0-draft.41`，由 `docs/std.lock.json` 锁定；STD 升级需独立批准。
