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

任务事务层由 `Task API`、`Policy Guard`、`Task Store`、`Single-Agent Scheduler`、`Run Worker` 和 Result publisher 组成：`Task API` 处理四项操作；`Task Store` 保存不可变任务定义、Run、`RunSessionRecord` 和稳定 Result；scheduler 提供一个 execution slot；worker 只协调事务边界并驱动 Pi，不实现第二套 Agent loop；Result publisher 把 Pi 输出与执行事实冻结为调用方可查询的结果。`Pi Adapter` 创建或恢复一个 `AgentHarness` + `JsonlSessionRepo` session/lane；`Usage Aggregator` 汇总 raw response usage；`Matrix Adapter` 只封装 `matrix-js-sdk` 的标准 Matrix Client-Server 行为，不启用并行 AS 路径。

`Pi Adapter` 只使用 Pi `AgentHarness` 公共面，也不替换 Pi provider adapter。它把固定 Harness 接到 `Models.streamSimple` 和 `openai-responses` provider；Piko 只配置 base URL、credential、model、`cacheRetention:none`、`streamOptions.maxRetries=0`、`supportsExplicitPromptCacheMode=false` 和任务约束，三个 prompt-cache 请求字段必须缺席。收到非 SSE body、缺少 terminal event 或提前断流时由 Harness 形成可恢复的 operation 事实，不静默切到非流式或第二调用路径。

## 2. Run、session 与持久化顺序

提交分为静态校验和新任务受理两阶段。先解析 JSON、执行 Schema 校验并验证唯一配置的 Slinky bearer principal，再按 `task_id` 查 Task Store。已存在且仍保留正文时，对象忽略成员顺序、path 集合字段忽略数组顺序、时间按 UTC instant、其他值按类型和值逐字段比较：相同直接返回原 Run，不重新检查 deadline/queue/dependency；不同返回 409 `TaskConflict`。仅新 ID 才检查 deadline、实例 policy、discussion、依赖和 queue capacity，并在一个事务中固定任务定义、创建唯一 Run。正文清理后的 task identity tombstone 永久拒绝重建并返回 410。`task_id` 不传给 Pi provider 或 LLMTier。

Worker 首次启动 Run 时创建确定性 `pi_session_id=run_id`、固定 lane `main` 和初始 `operation_id=run_id:initial`。普通任务调用 `lane.accept({kind:"prompt",operationId,prompt:typedInstruction})`；discussion 任务的同一次 accept 传 `[typedInstruction,PikoDiscussionMessage]`，其中后者对应提交事务写入的初始 Pending turn。instruction 不复制起始事件正文，accept 后通过 transcript `event_id` 把该 turn 标为 Consumed；崩溃恢复看到相同 `event_id` 时只补标记。所有输入都不经过 skill/slash/template 展开；workspace/material 通过受控 tools 暴露。实例 agent profile 生成 system prompt，其中列出允许的 read/write/output 路径、deadline 和预算，但真正授权仍由 Piko policy/tool context 强制。`task_id`、`run_id`、credential 和绝对宿主路径不进入模型上下文。

Run 与 Pi operation 一一恢复而非重复 accept：打开 session 后先看 Harness 返回的 `open` operations，再查 `lane.getResult(operation_id)` 和 transcript；已有 operation 就 `drive`/读取结果，只有三者均不存在才允许 accept。Pi 产生终态后，事务层从 `OperationResultRecord`、lane transcript、Harness tool facts、raw usage ledger 和声明输出路径生成 `AgentResult`；Slinky 不直接读取 Pi session，Pi 也不理解 Slinky 工作流。

Scheduler 只允许一个 Run 持有 execution lease；其他已受理 Run 保持 Queued。Worker 取得 lease 后，为该 Run 打开或创建独立 Pi session，并原子提交 `RunSessionRecord={run_id,pi_session_id,lane_name,active_operation_id,last_operation_id,observed_tip_id,lease_epoch}`，再把 Run 切为 Running。跨 Run 不复用消息历史。

每个 Agent turn 的顺序由 Harness 控制：operation/input transaction → assistant effect intent → stream frame/终态 message transaction → tool effect intent → tool outcome transaction → operation result。Piko 不镜像这些阶段，只保存最近观察到的 operation/tip 与自身 Run generation。Harness JSONL 使用注入的 `PikoDurableFileSystem`：每次 append 完成后 `fsync(file)`，首次创建或 rename 后还 `fsync(parent directory)`；只有该 durability boundary 返回后才允许 Task Store 提交相应观察。跨库崩溃通过确定性 session/operation identity 和 Harness inspect/getResult 对账，不猜测日志。

Result 发布顺序为：阻止新步骤并 fence lease/writer → 等待或核实在途工具 → 固定输出摘要和 known actions → 以 attempt identity 汇总 usage → 原子写入 immutable Result generation → 最后把 Run 设为对应终态。若最后一步前崩溃，恢复器以已发布 generation 完成同一终态，不重跑 Pi。Queued 取消不取得 execution lease：Task Store 在一个事务中把 Queued 变为 Cancelled、写入 `cancel_requested=true`、发布 `model_attempts=0` 的 immutable Result，再返回 `CancelledBeforeStart`。Running 取消才写 stop intent、进入 Cancelling 并返回 `StopRequested`；已终态返回 `AlreadyTerminal`。

## 3. 重试与恢复

模型错误遵守 Harness retry policy，并受剩余 deadline 与总模型 attempt 预算约束。provider 的 `maxRetries=0`，因此每次 Harness attempt 至多执行一次 `responses.create`；下一次尝试必须由 Harness durable retry state 产生。orphaned `assistant.effect_pending` 恢复时只提交中断结果，不重新调用 provider。工具预算在 Harness `before_tool` hook 中以 `(run_id,operation_id,toolCallId)` CAS：首次出现写 Reserved 并占用一个逻辑调用名额；同 ID 重进或 recovery replay 复用原记录；超过 `max_tool_calls` 时返回 block+terminate 并由 worker 映射为 `BudgetExceeded`。观察到 Harness tool effect intent 后改 Started，outcome 后改 Terminal/Unknown。工具使用 Pi `AgentTool.replay`：缺省 `never`；只读工具可以声明 `safe`；非只读工具还必须让 `recovery_contract_ref` 在启动时解析到已注册实现，并验证 contract kind、工具名/effect 与实际 `AgentHarnessTool` 一致。恢复时只有 intent、当前工具定义和已绑定 contract 都允许 `safe` 才重放，否则合成 interrupted tool result，Piko 映射为 Unknown。

重启扫描非终态 Run，但只有持有最新 lease epoch 的 worker 能写状态。恢复器按 Result → Run → lease → deterministic Pi session → Harness open operation/result/transcript → raw usage → Matrix turn 的顺序比较：已有 Result 只补终态；有 open operation 就 drive；有 operation result 就封装；三者均无且 Task Store 尚未记录 Pi admission 才 accept。Harness fault、session invariant 损坏或不可核实的 `replay:"never"` 工具产生明确失败。不存在模型层 Invocation ledger 或跨系统 exactly-once 协议。

## 4. Matrix 与文件

每个实例配置一个稳定 Matrix identity；adapter 仅使用 `matrix-js-sdk` Client-Server API 执行邀请接受、membership 检查、sync、标准文本/reply/media send/receive 和 leave。每个 sync batch 先复核认证与 membership；自身 sender 及已知 txn/event echo 只登记去重而不再次加入 session。外部事件的 `event_id` 去重、`DiscussionTurn` append 与处理版本同事务提交，成功后才推进 sync cursor；崩溃重放由 event dedup 吸收。发送先持久化内部 `MatrixSendRecord` 与由 Run/turn/action 派生的稳定 transaction ID，重试复用同一 txn；这只是 adapter 内部可靠性，不是产品 outbox 协议。

房间身份和任意 incoming event 都不创建 Run。Slinky 显式提交普通任务，`discussion.room_id/trigger_event_id` 只选择已授权起点。discussion Run 的 intake 初始为 Open；Matrix pump 再核对 membership、room/event、取消/deadline 和 intake state，只能向 Open Run 写入 `DiscussionTurn={run_id,event_id,turn_seq,pi_entry_id?,pi_operation_id?,status=Pending|QueuedInPi|Consumed|Abandoned}`。`Abandoned` 只用于任务以 Failed/Cancelled 终止时封存尚未交给 Pi 的 turn，不等同于已消费。

Run Worker 按 turn_seq 领取 Pending turn并构造 `PikoDiscussionMessage`，其持久字段含 `event_id`，provider 投影只含可见正文/附件引用。若 Harness operation 正在运行则调用 `followUp`；若 lane 已 idle，则用确定性 `pi_operation_id=run_id:turn:<turn_seq>` accept 新 operation。调用前后都扫描 `watch().snapshot.queues` 与 transcript 中的 `event_id`：已存在即补 `pi_entry_id/status`，不存在才写入。崩溃发生在 Pi commit 后、SQLite 标记前时不会重复加入。

Pi 完成原生 assistant turn、工具循环结束并回到 idle 后，Run Worker 以 `BEGIN IMMEDIATE` 检查 Pending/QueuedInPi：存在则保持 Open 并继续同一 Pi session；为空则以 Run generation/lease fence 把 intake 从 Open CAS 为 Closing；恢复时已经 Closing 且仍无 pending 的判断是幂等成功。Matrix ingestion 的写事务若先取得 writer lock，turn 会阻止 CAS；若 CAS 先完成，该事件只登记 dedup/cursor，不再附着到本 Run。只有 Closing worker 可以进入 Completed Result 发布；Failed/Cancelled 的终态事务先把剩余 Pending/QueuedInPi 标为 Abandoned，再把 intake 改为 Closed。后续事件不重开终态 Run；Slinky 如需下一轮则提交新普通任务。deadline、取消、membership 丢失或权限撤销先到时也先关闭 intake。reply 使用标准 `m.relates_to.m.in_reply_to`。附件只有在 membership/event/media ACL、大小/类型及 workspace path 全部通过后交给 Pi；access token 不进入任务或结果。

## 5. Usage ledger

Harness `before_request` hook 是预算入口；Piko 的固定 adapter patch 为该事件增加 `stepId`，以 `(pi_operation_id,step_id,attempt)` 做 CAS 并写 `ModelAttempt{state=Reserved}`。provider `maxRetries=0`；reservation 后若没有形成 Harness effect intent，恢复时释放且不计数；已形成 effect intent则计为 Started，即使进程在实际 socket write 前崩溃也保守占用预算，避免重复调用。OpenAI Responses parser 的固定 `onRawUsage` patch 在归一化前保存 raw response identity、字段存在性和 token 值；`onResponse` 只补 HTTP status/headers/request id。完整下一调用 input 原样包含 Pi Harness 历史中的 assistant/function/`function_call_output` 与 opaque reasoning item（含 `id`、`encrypted_content`、`summary`/`content`）。

每个已形成 Harness provider-effect intent 的 durable attempt 使用内部 attempt ID，状态为 Started/UsageObserved/Terminal/Unknown；它与实际 socket dispatch 之间的崩溃空隙也保守计数。usage 带原字段存在性保存；同 attempt 的迟到更新以版本替换，不追加。任务聚合保存 `model_attempts`、`usage_observed_attempts`、每个 token 字段的 sum/null 和 missing set。对每个字段 F 单独计算：仅当每个 durable attempt 都存在 F 时返回 `sum(F)`；否则返回 null 并把 F 放入 `missing_fields`。因此 `usage_observed_attempts` 只表示至少观察到一个 raw usage 字段的 attempt 数，不证明任一字段覆盖全部 attempt。`Complete` 要求六字段都完整且 `usage_observed_attempts=model_attempts`；`Partial` 至少一字段完整、至少一字段缺失；`Unknown` 六字段全 null，允许 `usage_observed_attempts>0`。零 attempt 的任务使用六项全零 Complete。标准算术与子集关系必须成立。Result 发布读取一个 ledger version 并冻结 UsageSnapshot；发布后的迟到更新只推进内部 ledger record version，不修改 Result、不创建新 generation。LLMTier 查询只可核对同一 request/response identity，不得与 response usage 二次相加。

## 6. 运维

部署 supervisor 负责进程启动/重启。诊断检查本实例 Task Store/schema、scheduler lease、Pi session/Harness operation、sandbox、Matrix identity/sync cursor 和标准 LLMTier endpoint。只读诊断与状态改变操作分离；启动、重启、credential 修改和强制 lease 回收需要 operator authorization。恢复确认必须证明 store 可写、旧 lease 已 fence、session/operation/transcript 可读和依赖可达；不提供 Slinky 可编排的通用恢复状态机。
