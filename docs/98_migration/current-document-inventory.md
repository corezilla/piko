# Piko 当前文档盘点与 STD 映射

状态：设计阶段；简化设计与机器契约已批准，尚无生产实现
日期：2026-09-17

## Current authority

| 路径 | Authority |
|---|---|
| `docs/10_requirements/piko-requirements-traceability-v0.3.md` | 当前需求追踪 |
| `docs/20_system_design/piko-agent-runtime-design-v0.3.md` | `0.4.0` 总体设计 |
| `docs/30_subsystem_design/piko-agent-runtime-core-internal-design-v0.3.md` | `0.1.0` Pi-first 内部设计 |
| `docs/50_implementation_design/piko-runtime-implementation-design-v0.3.md` | `0.1.0` 实现级设计；SQLite/模块/配置/恢复 authority |
| `docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md` | `0.4.0` 四项任务契约 |
| `docs/60_interfaces/contracts/piko-v0.3-field-usage.md` | `0.3.0-simplified.6` 当前字段使用 |
| `docs/60_interfaces/contracts/piko-llmtier-consumption-v0.3.md` | `0.3.0-simplified.6`，固定Pi所需标准Responses SSE消费 |
| `docs/70_verification/` | 设计、实现与联调门禁 |
| `docs/80_operations/piko-runtime-release-and-operations-v0.3.md` | `0.1.0` 运维设计；NOT_BUILT |
| `interfaces/openapi/agent-runtime-openapi-v0.3.yaml` | `0.3.0-simplified.6` HTTP authority |
| `interfaces/schemas/agent-runtime-v0.3.schema.json` | 数据 authority |
| `interfaces/schemas/piko-runtime-config-v0.3.schema.json` | 实例配置 authority；只允许 Secret reference |
| `interfaces/schemas/piko-tool-profile-v0.3.schema.json` | 工具 allowlist、权限与 replay policy authority |

## Retired from current authority

2026-09-17 简化候选一次性删除 collaboration bridge mechanism/internal design、Matrix 产品 OpenAPI/Schema/fixture，并从主 OpenAPI/Schema/error/fixture 删除 capacity/claim、binding/projection、trigger、product message/content、drain/release 与模型恢复面。它们只存在于 Git 历史，不是兼容分支或 fallback。

STD 仍使用项目锁定版本；模板迁移、候选批准、production implementation 与部署验证分别评审。
