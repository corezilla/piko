<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Agent Runtime V0.3 契约说明
| 文档字段 | 值 |
|---|---|
| Document ID | `piko-agent-runtime-contract-v0.3` |
| Document Version | `0.4.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Contract Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | `2026-09-17` |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-17` |
| Template ID | `contracts.specification` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md` |
| Supersedes | `agent-runtime-v0.2-heavy-contract` |
<!-- STD_DOCUMENT_COVER_END -->

- Document ID: `piko-agent-runtime-contract-v0.3`
- Version: `0.4.0`
- Machine version: `0.3.0-simplified.6`

## 1. 唯一外部任务面

机器 authority 为 `interfaces/openapi/agent-runtime-openapi-v0.3.yaml`、`interfaces/schemas/agent-runtime-v0.3.schema.json`、error catalog 与 fixture。仅有 submit/status/cancel/result 四项操作。

这四项操作是 Piko 任务事务层的边界，不暴露 Pi session 或 Agent loop 控制。Slinky 提交任务并读取稳定 Result；Piko 负责把任务适配进 Pi、保存执行事实和封装结果，执行内步骤由 Pi 驱动。

`POST /runs` 的 body 必须包含 Slinky 在提交前生成的全局唯一 `task_id`。一个 `task_id` 只定义一个不可变逻辑任务并绑定一个 Run。重复提交已有 `task_id` 返回该 Run 的当前或终态视图，不创建、复制或重启执行；若携带的已校验任务定义与首次提交不同，保留原任务并返回 `TaskConflict`。详细记录清理后同一 ID 返回 `Gone`。新任务必须使用新 `task_id`。

`GET /runs/{run_id}` 无副作用。Queued Run 的取消以 200 `CancelledBeforeStart` 返回，并在同一事务发布零调用的 Cancelled Result；Running Run 的 202 `StopRequested` 仅表示取消意图落盘；已终态返回 200 `AlreadyTerminal`。`GET .../result` 在非终态返回 `RunNotTerminal`；结果一旦发布，其 generation 内容不可变。

## 2. 请求与权限

第一阶段整个 endpoint 只配置一个 Slinky bearer principal；credential 缺失或不匹配返回 `Unauthorized`，不支持请求内 principal 切换。请求只包含任务、workspace、read/write/tool 权限、deadline/调用预算、输出路径，以及讨论任务可选的标准 Matrix `discussion={room_id,trigger_event_id}`。model 由该 Piko 实例配置，不是外部必填或可选 selector。instruction 不扩大权限。所有路径必须是规范 workspace 相对路径，禁止绝对路径、反斜线、`.`/`..` segment、空 segment；解析 symlink 后仍须位于授权根内。

处理顺序固定为：JSON/Schema → bearer principal → 按 `task_id` 查记录。已有完整任务先做定义比较并返回原 Run 或 `TaskConflict`；tombstone 返回 `Gone`。只有不存在的 ID 才检查 deadline、队列、依赖及动态授权事实，因此外部重试不会因环境变化改变已经受理任务的身份语义。

一个 endpoint 面向一个稳定 Piko/Agent 实例；不传 agent/session/team/IR/Topic 对象。Slinky 若需要多个 Agent，分别调用多个实例。实例同一时刻只运行一个 Run；其他受理任务排队。每个 Run 使用隔离 Pi session，保留期内以 run_id 查询历史。

## 3. 结果

结果包含状态、partial、summary、outputs、known_actions、task token usage 和 failure。`Completed` 强制 `partial=false/failure=null`；`Failed` 必须有 failure；`Cancelled` 必须映射 `CancelledByRequest/Cancellation`。`Completed` 不代表业务接受。失败也必须尽可能返回部分输出、已知动作和 usage。Usage 的 Complete/Partial/Unknown 与 null/missing_fields 由机器 Schema 约束；每个 token 字段只有在全部 durable Pi provider-effect attempt 都提供该字段时才返回完整 sum，否则为 null 并列入 missing_fields。Complete 表示六项都完整，Partial 表示部分字段完整，Unknown 表示无字段能完整聚合；Unknown 的 usage_observed_attempts 可以非零。零模型调用的 Cancelled Result 使用全零 Complete。跨字段attempt数量、加法与token子集关系由契约版本绑定的executable semantic validator在Result持久化前强制；Schema `x-semantic-invariants`列出相同规则。Result 发布冻结 UsageSnapshot，迟到 usage 不修改 generation；未知不填零。Cost 不存在于本契约。

## 4. 标准外部服务

Matrix 讨论与 media 使用标准 Matrix API，不属于本 OpenAPI。LLMTier 使用标准 OpenAI-compatible API，不属于本 OpenAPI。Piko 不对外承诺容量观察、通信产品协议、内容仓库、跨系统 release/drain 或模型调用恢复。

## 5. 保留与 404/410

Run、完整任务定义和 Result 至少保留到 `max(request.deadline_at, accepted_at)+7d`。之后可清理大对象，但永久保留最小 `{task_id,run_id,Gone}` tombstone；该 `task_id` 永不复用，POST/GET 都可据此返回 410。活动任务或未知副作用事实不得仅因窗口到达删除。

## 6. HTTP 与 typed error

每个 operation/status 可返回的 typed code 由 OpenAPI `x-error-codes` 与 error catalog `operation_status_codes` 双向一致性测试强制。createRun 的讨论 room/event 冲突为 409 `InvalidDiscussionContext`；本地队列满且未创建 Run 为 429 `QueueFull`；终态 Run 丢失 durable Result 为 500 `ResultUnavailable`，不得伪装成 404 或成功空结果。不存在面向调用方的 same-run resume 动作或 `retryable_by_same_run` 字段。
