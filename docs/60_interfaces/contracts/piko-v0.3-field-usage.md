<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko V0.3 跨系统字段使用表

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-v0.3-field-usage` |
| Document Version | `0.3.0-simplified.6` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Contract Owner |
| Authors | corezilla |
| Created Date | `2026-09-16` |
| Last Modified Date | `2026-09-25` |
| Template ID | `contracts.specification` |
| Template Version | `0.4.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/60_interfaces/contracts/piko-v0.3-field-usage.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

- Document ID: `piko-v0.3-field-usage`
- Version: `0.3.0-simplified.6`

| 字段 | 生产者/权威 | 用途与规则 |
|---|---|---|
| `task_id` | Slinky | 首次提交前生成的全局唯一逻辑任务 ID；一对一绑定不可变任务和 Run；重复提交不改变；tombstone 后也永不复用 |
| `instruction` | Slinky | Agent 工作目标；不授予权限 |
| `workspace_ref` | Slinky/Piko 配置 | 固定授权 workspace；Piko 解析真实边界 |
| `permissions.*` | Slinky 请求与 Piko policy 交集 | read/write/tool 的硬边界 |
| `limits.*` | Slinky | deadline 和模型/工具调用上限；只能收紧 |
| `output_paths` | Slinky | 可回收业务输出的相对路径范围 |
| `discussion.room_id` | Slinky，Piko核验Matrix事实 | 仅讨论任务可选；选择已有授权房间，不创建房间/任务 |
| `discussion.trigger_event_id` | Slinky，Piko核验Matrix事实 | 已可见的同room起始事件；不等同Run trigger或业务批准 |
| `run_id` | Piko | 本实例内 Run ID；不传给 LLMTier |
| `state` | Piko | 执行状态；不表示 Slinky 业务接受 |
| `cancel_requested` | Piko | Queued 原子取消可与 Cancelled Result 同时成为停止事实；Running 的 StopRequested 只表示意图，不等于停止 |
| `progress.model_calls` | Piko/Pi | 已准入的 durable provider-effect attempt 数，含 Harness retry；intent 与实际网络发送间崩溃时保守计数 |
| `progress.tool_calls`、`last_activity_at` | Piko/Pi | 已准入的唯一`(operation_id,toolCallId)`逻辑工具调用数及最后活动时间；before_tool重入和safe replay不重复计数 |
| `outputs[]` | Piko | path/hash/size 的稳定输出摘要 |
| `known_actions[]` | Piko | 已完成、失败或结果未知的外部动作；不含 secret |
| `usage.quality` | Piko | Complete/Partial/Unknown；未知不改变有效业务终态 |
| `usage.*_tokens` | Pi raw terminal response，Piko 汇总 | 规范化前捕获；每字段仅在全部durable provider-effect attempt均报告时返回完整sum，否则null并列入missing_fields；不得返回已知下界冒充总量；input含cache子集，total=input+output；迟到同attempt只更新内部ledger，不修改Result |
| `usage.model_attempts` | Piko adapter | durable Responses effect attempt总数，包括Harness受控retry；provider内部retry固定为0 |
| `usage.usage_observed_attempts` | Piko adapter | 至少收到一个raw usage字段的不同attempt数量，不得大于model_attempts；不表示任何单字段已覆盖全部attempt |
| `usage.missing_fields` | Piko | 未覆盖全部durable attempt的token字段；Partial至少一项但非全部，Unknown包含全部六项且observed attempts可非零 |
| `failure.code/cause_class/message` | Piko | 技术失败事实，不给调用方虚构resume动作；业务后续由Slinky PM决定 |

首次提交时，Piko 持久化完整已校验 POST body 作为不可变任务定义；再次提交同一 `task_id` 时不覆盖它。已有任务在动态deadline/queue/dependency检查之前返回；清理详细记录后永久保留`task_id/run_id/Gone` tombstone。未知字段一律拒绝。旧 model selector、binding、communication trigger、capacity、claim、message/content、release/drain 与模型 Invocation 字段不再接受。
