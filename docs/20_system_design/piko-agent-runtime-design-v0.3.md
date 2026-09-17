<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Agent Runtime 总体系统设计
| 文档字段 | 值 |
|---|---|
| Document ID | `piko-agent-runtime-design-v0.3` |
| Document Version | `0.4.0-draft.21` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Architecture Owner |
| Authors | corezilla |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-17` |
| Template ID | `design.system` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/20_system_design/piko-agent-runtime-design-v0.3.md` |
| Supersedes | `docs/99_reference/design/agent-runtime-service-design-v0.2.md` |
<!-- STD_DOCUMENT_COVER_END -->

- Document ID: `piko-agent-runtime-design-v0.3`
- Version: `0.4.0-draft.21`
- Status: Review
- Runtime activation: `false`

## 1. 目的与边界

Piko 是 Pi 的薄任务外壳。一个 Piko 实例拥有一个独立 Agent；Slinky 将每个实例视为一个 IR，负责组织多个 IR、提供材料与角色、验收结果并决定业务下一步。Piko 不管理其他 IR，不拥有项目流程、正式 Memory、Reviewer/Expert/PM 分配或业务接受。

Piko 自持 Agent 历史、上下文裁剪与压缩、Pi session、工具循环、模型调用和执行内重试。每次模型调用由 Piko 向 LLMTier 发送当次所需完整上下文。LLMTier 是无 Agent 会话状态的 OpenAI-compatible 模型服务；它不拥有 Agent Conversation、工具循环、上下文压缩或后端 KV identity。

## 2. 采用 Pi 原生能力

Piko 直接集成固定版本 Pi 的 `AgentSession`、`SessionManager`、compaction、tool loop、abort、事件与有界模型重试。Piko 新增的只有任务持久化、授权边界、期限/预算计数、稳定结果和四项 HTTP 操作。已有 Pi 能力不复制为第二套会话或工具框架。

一个逻辑 Piko 实例只有一个 Agent execution slot。多个任务可以被持久化为 `Queued`，但同一时刻至多一个 Run 为 `Running` 或 `Cancelling`。每个 Run 默认创建独立 Pi session；不同 Run 不隐式继承对方上下文、工具结果或 Matrix 消息。实例级模型/profile 配置可以稳定复用，但不是外部请求中的 model selector。保留期内的历史通过稳定 `run_id` 查询，不另建历史列表或会话管理面。

任务接口只有：提交 `POST /runs`、状态 `GET /runs/{run_id}`、取消 `POST /runs/{run_id}:cancel`、结果 `GET /runs/{run_id}/result`。任务 `Completed` 只表示执行结束，不表示 Slinky 接受产物。

## 3. 执行与失败

状态为 `Queued -> Running -> Completed|Failed`。尚未取得 execution slot 的 Queued Run 可在同一事务中直接变为 `Cancelled`、发布零模型调用的稳定 Result，并返回 `CancelledBeforeStart`；Running Run 才经 `Cancelling -> Cancelled|Failed`，其 `StopRequested` 回执只证明停止意图已持久化，不证明执行已经停止。Run 与 Pi session/checkpoint 的绑定由内部 `RunSessionRecord` 固定；创建 Run、取得 worker lease、建立 session、提交 checkpoint、发布 Result 各有独立持久化边界和单调 generation。

Piko 在任务 deadline、模型/工具调用预算和工具安全约束内尽力完成任务。Pi provider retry 只包围建立 Responses stream 的请求；SSE 已产生首个事件后的断流不得透明重放。工具只有在只读、明确幂等或能够查询原动作状态时才可重试；副作用未知时先查询，不能盲目再次执行。进程重启后只从最后已提交的 Run/session/checkpoint 事实恢复；checkpoint 之后且无法核实的动作标为 Unknown，并以 `ExecutionStateUnknown` 或 `UnsafeRetryBlocked` 失败，报告部分结果和已知动作。

最终失败后的业务动作由 Slinky 项目经理决定：另派 IR、升级专家或交用户处理都不由 Piko 自动执行。Piko 不实现固定失败次数升级链。

## 4. 模型调用

目标消费面是标准 OpenAI-compatible `GET /v1/models` 与 `POST /v1/responses`。固定 Pi `0.85.1`、commit `9767ba275f3e9a5ee0f5c5342249b629ab1b2282` 的首个正常 Agent turn 就需要 streaming：`packages/coding-agent/src/core/sdk.ts::setDefaultStreamFn(streamSimple)` 安装默认流函数；`packages/agent/src/agent-loop.ts::streamAssistantResponse` 对 `AssistantMessageEventStream` 使用 `for await`；`packages/ai/src/api/openai-responses.ts::buildParams` 固定 `stream: true`、`store: false`，并由 `processResponsesStream` 解析 SSE。非流式 Responses 不是 Piko 的共同基线，也不作为 fallback。

首个实现必须支持的标准流事件为 `response.created`、`response.output_item.added`、`response.output_text.delta`、`response.function_call_arguments.delta|done`、`response.output_item.done`、`response.completed|incomplete`、`response.failed` 与顶层 `error`。如果所选模型产生 reasoning/refusal，则还必须原样支持标准 `response.reasoning_summary_text.delta`、`response.reasoning_summary_part.done`、`response.reasoning_text.delta`、`response.refusal.delta`。Piko 当前工具使用标准 `function` tool；tool result 在下一次 logical call 的完整 `input` 中以 `function_call_output` 发送。完整 input 还保留 Pi 已产生的 assistant message、function call 及 opaque reasoning item 的 `id`、`encrypted_content`、`summary`/`content`；这只是无状态重放输入，不是 LLMTier Agent session。`response.completed|incomplete.response.usage` 提供 input/output/total、cached 与 reasoning token 事实。第一阶段固定 capability `supportsExplicitPromptCacheMode=false` 与 `cacheRetention:none`，因此 `prompt_cache_key`、`prompt_cache_retention`、`prompt_cache_options` 三个字段必须缺席；后端缓存仍是 LLMTier/provider 内部实现。

Piko 不向模型服务发送任务提交 key、Agent/Run/Session identity、自定义 Invocation、SourceInstance、Seat、claim 或恢复字段。当前 Pi 请求发送完整标准 `input`，不使用 provider continuation identity；模型响应丢失按上一段的 Pi/标准客户端安全边界处理，不设计跨系统 exactly-once。

模型不可用时，Piko 保留原任务与 session，在预算和 deadline 内重试；环境恢复后从原任务继续。若期限或预算耗尽则失败。Slinky 可以协调获授权的环境恢复，但不直接接管模型调用或把环境恢复认作任务成功。

## 5. Matrix 讨论与附件

每个 Piko 实例使用稳定 Matrix 身份。产品能力复用 Matrix 原生邀请、加入、当前 membership 核对、sync/receive、`m.room.message`、`m.in_reply_to` reply、leave 和标准 media。多个实例可以各自加入同一指定房间讨论。

唯一 Matrix 实现采用 `matrix-js-sdk` Client-Server API，不并行使用 Application Service 路径。需要持续讨论的普通任务可携带 `discussion={room_id,trigger_event_id}`。受理时 Piko 验证当前 membership、事件可见性和同 room 关系；每个 sync batch 先复核 membership/权限，忽略自身 sender 及已知 txn/event echo，再把事件去重事实和 `DiscussionTurn` 原子落盘，成功后才推进持久 sync cursor。任务循环按 turn 序号把 Pending turn 以确定性 entry ID 追加到同一 Pi session，先提交 Pi checkpoint，再把 turn 标记为 Consumed；崩溃恢复以 checkpoint 中的 entry ID 去重，不重复追加。发送先持久化内部 send record 与稳定 Matrix transaction ID，失败重试复用同一 txn。

讨论 Run 是有限普通任务，不是常驻 listener。Pi 每次完成一个原生 assistant turn 并回到 idle 后，Piko 再检查 durable Pending turn：存在则在同一 session 继续；不存在则立即发布正常 Result 并把 Run 置为 Completed，不为未来房间消息保持开放。后续消息不会唤醒终态 Run；需要下一轮讨论时由 Slinky 提交新的普通任务。取消、deadline、membership 丢失或权限撤销可更早终止；闲置房间消息不会自动创建 Run、模型调用、回复或正式批准。业务 Topic/Action 仍只由 Slinky 决定。

Piko 不要求自定义 Topic/SID/RID、产品 envelope、outbox/ingress 分类、Run trigger 或跨系统 drain。Slinky 可以在自己的业务层维护 Topic 与 Action，但不得要求 Piko 解析这些对象才能参与普通房间讨论。

附件上传、下载和授权复用 Matrix Client-Server media 与既有 workspace/file permission。读取前重新核对 room membership、事件可见性、MIME/size 限制与 workspace write/read 边界；只有验证后的文件才能落入任务允许路径供 Pi 处理。Piko 不建设默认内容仓库、下载 token、代理下载或独立保留协议。

## 6. Memory 与 Usage

正式 Memory 属于 Slinky。更新 Memory 是普通任务：Slinky 提供当前材料、现有 Memory 和更新目标；Piko 返回建议变更或输出文件；Slinky 负责冲突检查、版本写入与索引。Piko 不直接修改正式 Memory，也不提供专用 Memory API。

Piko 在既有 Pi `options.fetch` 包装点为每个实际 HTTP dispatch 原子登记 model attempt 和预算；在固定 Pi `processResponsesStream` 对终态 response 规范化之前，以最小 Piko observer hook 保存 raw response identity、raw usage 和每个字段的存在性。该 hook 不替换 Pi provider adapter，也不形成第二模型路径。汇总使用标准原值：`input_tokens` 包含 cached/cache-write 子集，`total_tokens=input_tokens+output_tokens`，cache 子集不得超过 input，reasoning 子集不得超过 output；不得使用 Pi 为显示而扣除 cache 后的归一化 input。

Piko 从这些原始模型响应事实按任务逐字段汇总 `input_tokens`、`output_tokens`、`total_tokens` 以及 cache/reasoning token，并在 `AgentResult.usage` 返回。`model_attempts` 计实际发起的 Responses 请求（包括 provider retry），`usage_observed_attempts` 计至少出现一个 raw usage 字段的不同 attempt。对六个字段中的每一项，只有全部实际 attempt 都报告该项时才返回完整整数总和；任一 attempt 缺该项则该聚合字段必须为 null，并列入 `missing_fields`，不得返回已知下界冒充完整总量。`Complete` 表示六项都完整；`Partial` 表示至少一项完整且至少一项缺失；`Unknown` 表示六项均无法完整汇总，因此即使某些 attempt 曾报告部分字段，`usage_observed_attempts` 也可以大于零。零模型调用任务可以给出全零 `Complete`。Result generation 发布时冻结 UsageSnapshot；相同 response/attempt 的迟到事实只替换内部 attempt ledger，不重复相加、不修改已发布 Result，也不生成第二个 Result generation。费用不在本轮范围。

## 7. 运维边界

Piko/Pi 的 session store、worker、工具 sandbox 与 LLMTier 连通性诊断属于内部运维。状态改变、重启或凭据操作需要既有运维授权。恢复确认包括依赖可达、Pi session 可打开、workspace/tool profile 可解析；它不新增跨系统 readiness/compatibility 协议。

## 8. 退出的旧外部承诺

当前 authority 删除：容量 snapshot/shared constraint/quota/execution claim；跨系统 Session binding/version/projection/close/drain/execution release；自定义产品消息与内容服务；模型 Invocation/结果恢复；专用 readiness/compatibility；SourceInstance/Tier Seat；输入读取证据专用 artifact 协议。历史文件和 Git 记录仅作迁移溯源，不构成 fallback。

## 9. 跨方接口基线

Piko 对 LLMTier 的需求限定为固定 Pi 实际使用的 OpenAI-compatible Responses 子集：models 查询、SSE response events、function tool call/result 和标准 usage。任何差异必须以 LLMTier 实际机器字节复审；不得为此新增会话、调用方管理或自定义恢复面。
