<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko 对 LLMTier 的消费契约
| 文档字段 | 值 |
|---|---|
| Document ID | `piko-llmtier-consumption-v0.3` |
| Document Version | `0.3.0-simplified.6` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Adapter Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | `2026-09-17` |
| Created Date | `2026-09-16` |
| Last Modified Date | `2026-09-17` |
| Template ID | `interfaces.control` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/60_interfaces/piko-llmtier-consumption-v0.3.md` |
| Supersedes | none |
<!-- STD_DOCUMENT_COVER_END -->

- Document ID: `piko-llmtier-consumption-v0.3`
- Version: `0.3.0-simplified.6`
- Status: Approved

## 1. 目的

LLMTier 为 Piko 提供无 Agent 会话状态的 OpenAI-compatible 模型服务。Piko/Pi 保存完整 Agent session、上下文与工具循环，并为每次 logical model call 构造完整当前 input。

## 2. 固定 Pi 依据与唯一调用方式

消费依据固定为 Pi `0.85.1` / commit `9767ba275f3e9a5ee0f5c5342249b629ab1b2282`：

| 文件/符号 | 对消费契约的含义 |
|---|---|
| `packages/agent/src/harness/agent-harness.ts::AgentHarness` | durable session、lane、operation、abort、结果与恢复边界 |
| `packages/agent/src/harness/runtime/drive/generation.ts` | 先提交 assistant effect intent，再调用 `lane.models.streamSimple` |
| `packages/agent/src/harness/execution/assistant.ts` | Harness 逐事件消费 `AssistantMessageEventStream` |
| `packages/ai/src/api/openai-responses.ts::stream` | 调用 `client.responses.create` 并处理标准 SSE stream |
| `packages/ai/src/api/openai-responses.ts::buildParams` | 请求固定 `stream:true`、`store:false`，携带完整 `input` 与标准 `tools` |
| `packages/ai/src/api/openai-responses-shared.ts::convertResponsesMessages` | tool result 编码为下一次请求的 `function_call_output` |
| `packages/ai/src/api/openai-responses-shared.ts::processResponsesStream` | 解析文本、函数参数、终态、失败和 usage SSE 事件 |

因此唯一共同调用方式为 `POST /v1/responses` 的标准 SSE streaming；非流式不是第一阶段支持面，也不是 fallback。`GET /v1/models` 用于配置/模型发现，不改变上述调用方式。

### 2.1 请求子集

必需：`model`、完整 `input`、`stream:true`、`store:false`。完整 input 保留 Pi 历史中的 assistant message、function call、`function_call_output` 及 opaque reasoning item 的 `id`、`encrypted_content`、`summary`/`content`；这不是 provider continuation 或 Tier session。有工具时携带标准 function `tools` 和可选 `tool_choice`；工具结果在下一次 logical call 的完整 `input` 中使用 `function_call_output {call_id, output}`。按所选模型能力还会使用 `max_output_tokens`、`temperature` 和标准 reasoning 配置。第一阶段 Piko 固定 `supportsExplicitPromptCacheMode=false` 与 `cacheRetention:none`，因此不发送 `prompt_cache_key`、`prompt_cache_retention` 或 `prompt_cache_options`；后端缓存不提升为跨系统要求。

### 2.2 SSE 响应子集

正常文本/工具循环必须支持：

- `response.created`；
- `response.output_item.added`，item 至少支持 `message`、`function_call`；
- `response.output_text.delta`；
- `response.function_call_arguments.delta`、`response.function_call_arguments.done`；
- `response.output_item.done`；
- `response.completed`、`response.incomplete`；
- `response.failed` 与顶层 `error`。

模型启用 reasoning/refusal 时还必须支持 `response.reasoning_summary_text.delta`、`response.reasoning_summary_part.done`、`response.reasoning_text.delta`、`response.refusal.delta`。第一阶段不要求 Pi 的 grammar/custom/deferred tool 扩展；若未来启用，需另行给出真实需求后再扩展标准事件子集。

终态 `response.completed|incomplete.response.usage` 需提供 `input_tokens`、`output_tokens`、`total_tokens`；可取得时提供 `input_tokens_details.cached_tokens`、`input_tokens_details.cache_write_tokens`、`output_tokens_details.reasoning_tokens`，缺失按未知处理而非伪造业务事实。

Piko 不向模型层发送 `task_id`、SourceInstance、Agent/Run/Session、Tier Seat、capacity claim、自定义 deadline/header 或 Invocation recovery 字段。第一阶段每次调用发送当前完整标准 `input`，不发送 `previous_response_id` 等 provider continuation identity；如未来固定 Pi 实际需要它，必须另行以具体需求复审，不能以“可选透传”预留协议。

## 3. Usage

Piko 以每个 Pi durable provider-effect attempt 的 raw 标准 usage 为任务级统计来源。Piko 在 Harness `before_request{runId,stepId,attempt}` 中先做 deadline/budget CAS；固定 provider `streamOptions.maxRetries=0`，由 Harness policy 建立下一次独立 attempt。固定 Pi 缺少稳定 `stepId` 和 normalization 前 raw usage 通知，因此只允许两个 additive adapter patch：补充稳定 `stepId`，以及 `onRawUsage` observer。补丁 manifest/hash 必须由启动配置固定；不得替换 provider adapter或建立第二调用路径。`input_tokens` 使用未扣除 cache 的标准原值，cache 是 input 子集，reasoning 是 output 子集，total 是 input+output。

保存 attempt/request/response identity 与原始字段存在性，汇总 input/output/total，cache read/write/reasoning 可用则汇总，不可用为 null。Complete 必须覆盖全部 durable provider-effect attempt；Result 发布冻结 UsageSnapshot，迟到事实只更新内部 ledger，不修改已发布 Result。若 LLMTier 另有统一 Usage 查询，它只按同一 request/response identity 对账或补齐，不能与 response usage 重复累计，也不成为任务完成前提。身份缺失则保持 Unknown。Cost 不消费。

## 4. 失败与恢复

provider 内部 retry 固定关闭。Harness 每次模型调用先提交 effect intent；失败是否再试由 Harness retry policy、deadline 和预算共同决定，并产生新的 durable attempt。崩溃后若 assistant effect 已提交而 outcome 不完整，恢复只从已提交 frame prefix 形成中断结果，不重新 dispatch 同一 effect。Piko 不要求 LLMTier exactly-once，也不用新协议查询 Invocation。任务最终失败由 Piko 报告，Slinky 决定业务后续。

## 5. 兼容审查边界

本文件给出 Piko 所需标准 surface；LLMTier 提供方的实际 OpenAPI/fixture 仍须按其稳定候选字节定向复核。任何差异或非标准扩展必须先给出已确认需求、标准不足、最小方案、成本和兼容影响；没有理由则删除，不做 optional 预留。
