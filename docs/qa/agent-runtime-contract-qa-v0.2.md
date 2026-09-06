# Piko 智能体运行时契约 QA

版本：v0.2
状态：待处理
日期：2026-09-06
取代：v0.1 英文草案

本文是 Piko 单方维护并纳入版本控制的 QA 记录。Slinky 通过明确路径只读评审。
本文不是双方共同编辑的共享 QA，也不冻结任何契约决定。

| ID | 主题 | 当前候选语义或临时假设 | 未关闭时的影响 | 责任与下一步 | 状态 |
|---|---|---|---|---|---|
| QA-001 | `Degraded` admission | 仅当 `accepting_runs=true` 且请求所需的每个 exact scope 均 current、Ready 时接收；公开 `degraded_scopes` 和 `admission_blockers` | 阻塞最终 readiness Schema，不阻塞架构草案 | Slinky 评审 D1；有分歧时交用户决定 | 待处理 |
| QA-002 | Terminal Result | 每个对外可见的 terminal Run 都有 strict Result；可信 runtime 生成 failure Result | 阻塞最终 Run/Result Schema | Slinky 评审 D2 | 待处理 |
| QA-003 | Malformed output 后存在未知 side effect | 只要执行 side effect 未确认，就使用 `UnknownOutcome`，不能使用 `Failed` | 不阻塞架构，影响条件校验 | Slinky 确认 | 待处理 |
| QA-004 | Error/blocker catalog | 区分 API error、terminal execution error 和 planning blocker；删除 `SlotVersionMismatch` 别名 | 阻塞最终 code/HTTP mapping | Slinky 评审 D3 | 待处理 |
| QA-005 | `UnknownOutcome` 收敛 | 追加 immutable Result version，更新 current ref，历史版本保持可查询 | 阻塞 historical Result API 冻结 | Slinky 评审 D4 | 待处理 |
| QA-006 | JSON canonicalization | 使用 RFC 8785 JCS + UTF-8，计算时排除自身 digest 字段 | 阻塞可互操作 digest fixture | Slinky 提供或批准 vector | 待处理 |
| QA-007 | SSE retention 超窗 | 返回 `410 EventHistoryExpired`，包含 retention floor 和 current Run recovery ref | 阻塞 SSE 负向 fixture | Slinky 评审 D5 | 待处理 |
| QA-008 | Descriptor 起草责任 | Piko 起草 envelope；Slinky 提供或批准其 authority 对象的最低 descriptor | 不阻塞 envelope 草案，阻塞 execution validation | Slinky 提供或分配责任 | 待处理 |
| QA-009 | Pi SDK 与 OpenAI surface | 尚未选择 package、pinned version，以及 Pi 对 Responses / Chat Completions 的确切需求 | 不阻塞 external API 草案，阻塞 cloud model adapter | 边界 review 后由 Piko 调研 | 待处理 |
| QA-010 | OpenAI-compatible 云模型材料 | Piko 不消费 Tier Management/Observation API；尚未交付 cloud model credential binding、冻结 OpenAI surface、outcome query 和脱敏 fixture | 不阻塞设计，阻塞 integration Evidence | Slinky/Tier 提供 OpenAI-compatible fixture | 待处理 |
| QA-011 | Retention 时长 | Event、idempotency、Result 和 Audit retention 暂作为 deployment policy 参数 | 不阻塞 append-only model | 跨项目评审，有分歧时交用户决定 | 待处理 |
| QA-012 | SLO benchmark profile | Payload、并发、存储、Host 和冷/热条件未冻结 | 不阻塞功能草案，阻塞 performance claim | Slinky 提供 acceptance profile | 待处理 |
| QA-013 | Team shared-write policy | 缺少 explicit shared-write contract 和 serialization Schema | Single 与隔离 Team 可继续；shared write admission 阻塞 | Slinky 提供 descriptor 或设为非目标 | 待处理 |
| QA-014 | Result history endpoint | 候选路径为 `GET /runs/{id}/results/{result_version}` | 不阻塞 current Result query | Slinky 评审 | 待处理 |
| QA-015 | Liveness authentication | OpenAPI v0.2 暂定 liveness 无认证，其余 endpoint 均认证；需求 §8.2 又规定每个 request 携带 auth header | 不阻塞架构，阻塞最终 security contract | Slinky 确认 liveness 是否公开 | 待处理 |
| QA-016 | Planning blocker 的 terminal status | Accepted 后发现 blocker 时，所有 side effect 已知则暂定 `Failed`，否则 `UnknownOutcome` | 不阻塞草案，阻塞 Result fixture | Slinky 评审 mapping | 待处理 |
| QA-017 | Piko 视角的 LLM Tier | 对 Slinky 是 LLM Tier/Seat；对 Piko 是请求绑定的 OpenAI-compatible 云模型服务。Piko 不消费 Tier Management/Observation authority | 已确定总体边界；具体 OpenAI surface 仍由 QA-009/010 闭合 | 用户已确认，请 Slinky 纳入契约 | 已确认 |

## 推进规则

- 未决项具有安全、明确的临时假设，且不会扩大 authority、permission、resource 或
  side effect 时，继续起草。
- 未决项影响 authorization、exact identity/version、不可逆 side effect、第二条路径
  或 outcome truth 时，必须 fail closed，并发送 `NEEDS_INFO`。
- 跨项目分歧必须记录双方观点和可供用户决定的具体问题，不得隐藏为实现默认值。
