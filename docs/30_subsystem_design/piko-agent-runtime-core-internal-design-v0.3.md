<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Agent Runtime Core 内部设计
| 文档字段 | 值 |
|---|---|
| Document ID | `piko-agent-runtime-core-internal-design-v0.3` |
| Document Version | `0.1.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Architecture Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | `2026-09-17` |
| Created Date | `2026-09-16` |
| Last Modified Date | `2026-09-17` |
| Template ID | `design.definition` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/30_subsystem_design/piko-agent-runtime-core-internal-design-v0.3.md` |
| Supersedes | none |
<!-- STD_DOCUMENT_COVER_END -->

- Document ID: `piko-agent-runtime-core-internal-design-v0.3`
- Version: `0.1.0`
- Status: Approved

## 1. 组件

`Task API` 处理四项操作；`Task Store` 保存请求摘要、Run、`RunSessionRecord` 和稳定 Result；`Single-Agent Scheduler` 提供一个 execution slot；`Pi Adapter` 创建或恢复一个 `AgentSession`；`Policy Guard` 强制 workspace/path/tool/deadline/budget；`Usage Aggregator` 汇总 Pi raw response usage；`Matrix Adapter` 只封装 `matrix-js-sdk` 的标准 Matrix Client-Server 行为，不启用并行 AS 路径。

`Pi Adapter` 不替换 Pi 的 provider adapter。Coding Agent 初始化时沿用 `setDefaultStreamFn(streamSimple)`，OpenAI Responses 模型由 Pi `openai-responses` provider 发出 `stream:true` 请求；Piko 只配置 base URL、credential、model、`cacheRetention:none`、`supportsExplicitPromptCacheMode=false` 和任务约束，三个 prompt-cache 请求字段必须缺席。收到非 SSE body、缺少 terminal event 或提前断流时按 Pi error 处理，不静默切到非流式或第二调用路径。

## 2. Run、session 与持久化顺序

提交先认证与解析，再计算 canonical request digest；相同任务 key 与 digest 返回原 Run，不同 digest 返回 409。新 Run、`client_task_id` 唯一索引和初始状态在启动 Pi 前提交。该任务级去重不传播到 LLMTier。

Scheduler 只允许一个 Run 持有 execution lease；其他已受理 Run 保持 Queued。Worker 取得 lease 后，为该 Run 打开或创建独立 Pi session，并原子提交 `RunSessionRecord={run_id,pi_session_id,session_version,checkpoint_generation,lease_epoch,model_attempts,tool_attempts}`，再把 Run 切为 Running。跨 Run 不复用消息历史。

每个 Agent turn 的顺序为：提交新增输入到 Pi session → 持久化 session/checkpoint generation → 允许下一模型/工具步骤。工具调用先记录 intent；完成后记录结果，再提交含工具结果的 checkpoint。崩溃恢复只信最后 durable generation；checkpoint 后的副作用一律先对账，无法证明时不重复执行。

Result 发布顺序为：阻止新步骤并 fence lease/writer → 等待或核实在途工具 → 固定输出摘要和 known actions → 以 attempt identity 汇总 usage → 原子写入 immutable Result generation → 最后把 Run 设为对应终态。若最后一步前崩溃，恢复器以已发布 generation 完成同一终态，不重跑 Pi。Queued 取消不取得 execution lease：Task Store 在一个事务中把 Queued 变为 Cancelled、写入 `cancel_requested=true`、发布 `model_attempts=0` 的 immutable Result，再返回 `CancelledBeforeStart`。Running 取消才写 stop intent、进入 Cancelling 并返回 `StopRequested`；已终态返回 `AlreadyTerminal`。

## 3. 重试与恢复

模型错误遵守 Pi 原生 retry policy，并受剩余 deadline 与模型调用预算约束。固定 Pi 的 `retryProviderRequest` 只包围 `client.responses.create(...).withResponse()`；`processResponsesStream` 位于其后。因此首个 SSE 事件后的中断不能被称作同一请求的安全 retry。后续若 Agent 仍可继续，只能形成一个明确的新 logical model call，并计入预算/usage attempt。工具重试要求工具元数据为 read-only/idempotent，或存在可验证的 operation status；否则记录 `KnownAction.status=Unknown` 并停止自动重放。

重启扫描非终态 Run，但只有持有最新 lease epoch 的 worker 能写状态。恢复器比较 Run、RunSessionRecord、Pi checkpoint 和 Result generation：已有 Result 则完成终态；checkpoint 一致且无未知动作则继续；存在不可核实动作则发布失败结果。不存在模型层 Invocation ledger 或 exactly-once 协议。

## 4. Matrix 与文件

每个实例配置一个稳定 Matrix identity；adapter 仅使用 `matrix-js-sdk` Client-Server API 执行邀请接受、membership 检查、sync、标准文本/reply/media send/receive 和 leave。每个 sync batch 先复核认证与 membership；自身 sender 及已知 txn/event echo 只登记去重而不再次加入 session。外部事件的 `event_id` 去重、`DiscussionTurn` append 与处理版本同事务提交，成功后才推进 sync cursor；崩溃重放由 event dedup 吸收。发送先持久化内部 `MatrixSendRecord` 与由 Run/turn/action 派生的稳定 transaction ID，重试复用同一 txn；这只是 adapter 内部可靠性，不是产品 outbox 协议。

房间身份和任意 incoming event 都不创建 Run。Slinky 显式提交普通任务，`discussion.room_id/trigger_event_id` 只选择已授权起点。活跃 Run 的 Matrix pump 再核对 membership、room/event 和取消/deadline，把后续事件写成 `DiscussionTurn={run_id,event_id,turn_seq,entry_id,status=Pending}`；`entry_id` 由 run_id 与 event_id 确定性派生。

Task loop 按 turn_seq 领取 Pending turn，把带同一 entry_id 的 user entry 追加到该 Run 的 Pi session，然后提交新的 session/checkpoint generation，最后把 turn 标记为 `Consumed{checkpoint_generation}`。若崩溃发生在 turn 落盘后、checkpoint 前，turn 保持 Pending 并在恢复时追加一次；若发生在 checkpoint 后、Consumed 标记前，恢复器在 durable Pi session/checkpoint 中找到同一 entry_id，只补 Consumed 标记而不再次追加。

Pi 完成原生 assistant turn、工具循环结束并回到 idle 后，Task loop 重新读取 Pending 队列：有 turn 就继续同一 Pi session；没有 turn 就按正常 Result 发布顺序结束 Run，而不是等待未来房间事件。后续事件不重开终态 Run；Slinky 如需下一轮则提交新普通任务。deadline、取消、membership 丢失或权限撤销先到时按已有终止规则退出。reply 使用标准 `m.relates_to.m.in_reply_to`。附件只有在 membership/event/media ACL、大小/类型及 workspace path 全部通过后交给 Pi；access token 不进入任务或结果。

## 5. Usage ledger

`options.fetch` wrapper 是实际网络 dispatch 的唯一计数点：预算 CAS 与 `ModelAttempt{attempt_id,state=Started}` 必须先于 dispatch 落盘，每次 provider retry 都新增 attempt。Pi 的 `onResponse` 只补 HTTP 状态、headers 和 request id；Piko 在 `processResponsesStream` 对 terminal response/usage 规范化之前增加最小 observer hook，保存 raw token 字段与存在性。完整下一调用 input 原样包含 Pi 历史中的 assistant/function/`function_call_output` 与 opaque reasoning item（含 `id`、`encrypted_content`、`summary`/`content`）。

每次实际 `responses.create` 产生内部 attempt ID，状态为 Started/UsageObserved/Terminal/Unknown。usage 带原字段存在性保存；同 attempt 的迟到更新以版本替换，不追加。任务聚合保存 `model_attempts`、`usage_observed_attempts`、每个 token 字段的 sum/null 和 missing set。对每个字段 F 单独计算：仅当每个实际 attempt 都存在 F 时返回 `sum(F)`；否则返回 null 并把 F 放入 `missing_fields`。因此 `usage_observed_attempts` 只表示至少观察到一个 raw usage 字段的 attempt 数，不证明任一字段覆盖全部 attempt。`Complete` 要求六字段都完整且 `usage_observed_attempts=model_attempts`；`Partial` 至少一字段完整、至少一字段缺失；`Unknown` 六字段全 null，允许 `usage_observed_attempts>0`。零 attempt 的任务使用六项全零 Complete。标准算术与子集关系必须成立。Result 发布读取一个 ledger version 并冻结 UsageSnapshot；发布后的迟到更新只推进内部 ledger record version，不修改 Result、不创建新 generation。LLMTier 查询只可核对同一 request/response identity，不得与 response usage 二次相加。

## 6. 运维

部署 supervisor 负责进程启动/重启。诊断检查本实例 Task Store/schema、scheduler lease、Pi session/checkpoint、sandbox、Matrix identity/sync cursor 和标准 LLMTier endpoint。只读诊断与状态改变操作分离；启动、重启、credential 修改和强制 lease 回收需要 operator authorization。恢复确认必须证明 store 可写、旧 lease 已 fence、session/checkpoint 可读和依赖可达；不提供 Slinky 可编排的通用恢复状态机。
