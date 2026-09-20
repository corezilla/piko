<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Agent Runtime v0.3 测试规格
| 文档字段 | 值 |
|---|---|
| Document ID | `piko-agent-runtime-test-specification-v0.3` |
| Document Version | `0.4.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Verification Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | `2026-09-17` |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-17` |
| Template ID | `assurance.test-specification` |
| Template Version | `0.2.1` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/specifications/piko-agent-runtime-test-specification-v0.3.md` |
| Supersedes | none |
<!-- STD_DOCUMENT_COVER_END -->

- Document ID: `piko-agent-runtime-test-specification-v0.3`
- Version: `0.4.0`
- Status: Approved

| Test ID | Oracle |
|---|---|
| PK-T01 | OpenAPI 只有 submit/status/cancel/result 四个 path |
| PK-T02 | AgentTaskRequest拒绝外部model selector及未知binding/trigger/capacity/model-recovery字段 |
| PK-T03 | `task_id` 一对一绑定 Run；相同定义重复提交返回原 Run；同一 `task_id` 改变任一任务字段返回 `TaskConflict` 且不覆盖原任务；接口拒绝 `client_task_id` 且不存在额外提交 key/header/摘要 |
| PK-T04 | cancel 202 后仍为 Cancelling，不能当已停止 |
| PK-T05 | provider内部retry为0；Harness只在deadline/budget内建立新的durable retry attempt；已提交的orphaned assistant effect不重新dispatch |
| PK-T06 | 工具副作用 Unknown 不重放并产生 UnsafeRetryBlocked/known_actions |
| PK-T07 | 重启按RunSessionRecord/lease及确定性Harness operation恢复；不可核实动作时明确失败 |
| PK-T08 | 失败 Result 可含 partial output、failure、known_actions、usage |
| PK-T09 | Completed+非空 failure 被 Schema 拒绝 |
| PK-T10 | 同Pi attempt usage只计一次，迟到替换不相加，未知token为null/Partial或Unknown |
| PK-T11 | Matrix原生text/reply/media可参与显式discussion Run；idle房间消息不创建Run/调用/批准 |
| PK-T12 | Memory 更新任务只输出建议，不能写 Slinky authority |
| PK-T13 | 固定 Pi AgentHarness 在durable effect intent后调用`Models.streamSimple`，Responses payload为`stream:true/store:false`；fixture覆盖标准SSE子集且不存在非流式fallback |
| PK-T14 | 当前机器契约不存在 SourceInstance、Seat、claim、drain、release、产品消息/content endpoint |
| PK-T15 | 同一实例最多一个Running/Cancelling Run，其他已受理Run保持Queued |
| PK-T16 | 两个Run的Pi session/Harness operation互不继承；实例profile稳定但请求无model字段 |
| PK-T17 | sync cursor/event dedup/稳定txn ID在重启后不重复消费或发送 |
| PK-T18 | membership撤销、跨room trigger、media ACL/size/path失败均fail closed |
| PK-T19 | 成功业务结果在usage缺失时仍可Completed，但usage必须Unknown且不得填零 |
| PK-T20 | Result已发布但终态提交前崩溃，恢复完成同generation且不重跑Pi |
| PK-T21 | OpenAPI每个operation/status的x-error-codes与catalog/schema完全一致，ResultUnavailable存在500映射 |
| PK-T22 | 相对路径拒绝绝对、反斜线、空segment、`.`/`..`，解析后拒绝symlink越界 |
| PK-T23 | Queued取消原子发布零调用Cancelled Result；Running cancel仍只确认stop intent |
| PK-T24 | Harness `before_request`以稳定stepId登记attempt，additive hook在规范化前捕获raw usage；Complete覆盖全部attempt并满足精确算术/子集；迟到不改Result |
| PK-T25 | matrix-js-sdk单一路径中cursor在turn durable后推进，event/self echo去重，txn重试稳定 |
| PK-T26 | read-only preflight不调用Responses；opaque reasoning完整重放；explicit prompt cache capability为false且三个字段缺席 |
| PK-T27 | 两个attempt中一个完全无usage时六项aggregate均null且Unknown可有observed=1；不同attempt分别缺字段时逐字段覆盖不足者null，不能返回已知下界 |
| PK-T28 | DiscussionTurn enqueue前后崩溃通过Harness queue/transcript/operation probe只消费一次；Pi idle时只有intake原子进入Closing后才允许正常Completed，未来消息不重开 |
| PK-T29 | migration map把旧service design与旧STD基线明确标为历史，current/residual分类无矛盾且不升级STD锁 |
| PK-T30 | 一个已受理任务只向其独立 Pi session 写入一次 typed initial user message；Piko 不暴露 Pi session/loop 控制，也不实现平行 Agent loop；终态 Result 只由已提交Harness事实、输出和执行事实封装 |
| PK-T31 | 相同任务在deadline过期、队列已满或依赖离线后重交仍先返回原Run；仅新task_id检查动态受理条件 |
| PK-T32 | purge后永久保留`task_id/run_id/Gone` tombstone；该task_id永不重用且POST返回410 |
| PK-T33 | 配置只允许一个bearer principal及SecretRef；明文secret、缺principal或Matrix enabled缺凭据均拒绝 |
| PK-T34 | tool profile中read_only可标safe；任何非read_only的safe replay必须有recovery contract，never intent无outcome不盲重放 |
| PK-T35 | `pi_session_id=run_id`、lane=`main`及确定性operation ID在崩溃恢复时先probe再accept；不得依赖重复ID拒绝 |
| PK-T36 | Pi patch manifest/hash在启动时校验；仅允许stable stepId与raw usage observer两个additive patch，provider adapter与调用路径不替换 |
| PK-T37 | 同一`toolCallId`在before_tool重入或safe replay时只占一个tool预算；新logical call超限时block+terminate并映射BudgetExceeded |
| PK-T38 | discussion首次accept同时写typed instruction和一个PikoDiscussionMessage；trigger正文不复制，accept前后崩溃均只消费一次 |
| PK-T39 | Matrix插入turn与`Open→Closing`并发时由SQLite writer顺序决定；Failed/Cancelled把未消费turn终结为`Abandoned`，任何终态Run都不能残留Pending/QueuedInPi turn |
| PK-T40 | tool recovery ref必须存在并绑定已注册实现；Usage semantic validator拒绝attempt/算术/子集反例；Failed必须有started_at且路径拒绝控制字符 |

机器可表达部分由静态、单元和集成测试执行；真实依赖门禁由对应联调报告记录。直接 oMLX 验证状态见 `docs/70_verification/reports/piko-direct-omlx-debug-20260918.md`；Matrix 真实身份与重启注入的最新一轮证据见 `docs/70_verification/reports/piko-matrix-acceptance-20260919.md`，将 PK-T11/17/18/25/28/38 由 PARTIAL 转为 PASS。测试规格本身不维护重复的运行状态。
