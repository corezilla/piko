<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko V0.3 跨系统字段使用表

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-v0.3-field-usage` |
| Document Version | `0.3.0-finalization.9` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Contract Owner |
| Authors | corezilla |
| Created Date | `2026-09-16` |
| Last Modified Date | `2026-09-16` |
| Template ID | `contracts.specification` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/60_interfaces/contracts/piko-v0.3-field-usage.md` |
| Supersedes | none |
<!-- STD_DOCUMENT_COVER_END -->

> Machine source为 `interfaces/openapi/agent-runtime-openapi-v0.3.yaml` 与
> `interfaces/schemas/agent-runtime-v0.3.schema.json`；runtime activation=false。Slinky、LLMTier
> 各自生产字段仍由其机器契约授权。

通用规则：Bearer credential 产生 canonical `client_id`，不允许 body 自报替代；所有查询先认证并检查 Client 可见性；mutation 使用 `Idempotency-Key`，body 以 RFC8785 JCS UTF-8 SHA-256 进入 digest。无默认值的 required 字段不得省略；显式 nullable 字段必须发送 null。已受理Run的去重、Result与ClientTaskIndex至少保留至`max(request.deadline_at,Run.accepted_at)+7d`；未受理pre-admission rejection/key→digest binding至少保留至`max(request.deadline_at,decision_first_created_at)+7d`。后者的首次decision时间由Piko durable clock首次写入且不可因重评/重启推进；活动或未知义务不因窗口到达删除。

Run POST 的精确读取顺序是：认证与当前Client可见性→请求大小/JSON基础解析→JCS digest→key record读取→
digest比较。不同digest必为409；相同digest且`AcceptedRun`才返回原202，且不重做当前Session/deadline/
capacity admission。临时trigger 404是`RetryableRejection`，不是receipt；相同digest且deadline未到、
ingress version前进时才CAS重评。decision到期不删除key→digest binding，至少保留到7天窗口结束。
因此同key分别修改instruction、limits.deadline_at或communication_trigger都返回409且绝不返回原202。

## 1. HTTP header 与路径

| 字段 | 生产方/权威来源 | 消费用途 | 类型、required/null/default | scope/版本/可变性 | 鉴权、digest、保留与异常 |
|---|---|---|---|---|---|
| Authorization | Slinky credential store / Piko auth | canonical Client | Bearer；required；non-null；无默认 | Client scope；请求间可轮换 | 先于 ledger/query；撤销后不得重放回执；不入 digest/日志 |
| Idempotency-Key | Slinky logical command | submit/cancel/binding mutation 去重 | 1–255 string；mutation required | Client+endpoint scope；逻辑命令内 immutable | namespace 一部分，不在 body digest；同 key 异 digest 409；至少保留至资源 recovery window |
| X-Request-ID | Slinky HTTP caller | 单次 HTTP correlation | 1–256 string；required | 单次调用；重放可不同 | 不用于去重、恢复或授权；日志脱敏保留 |
| If-None-Match | caller/cache | read cache；create `*` | string；按 operation optional | resource scope | 不入 command digest；错误 412 |
| If-Match | Slinky/Operator | binding/profile update 并发 | update仅exact strong ETag；create禁止；weak/wildcard禁止 | resource version immutable | stale 412；非法组合400；缺少条件428 |
| If-None-Match | Slinky/Operator | create防覆盖或GET缓存 | PUT create仅`*`；GET可用exact ETag | representation version | create已存在412；与If-Match并存400；GET匹配304 |
| run_id | Piko admission | GET/cancel/result route | opaque path string；required | Client scope；immutable | 跨 Client/不存在统一 404；tombstone 过期 410 |
| project_ref | Slinky authority | identity/session binding scope | opaque path string；required | Client+Project；immutable association | Client 不可见统一 404 |
| X-Piko-Viewer-Matrix-User-ID | Slinky backend经当前用户会话 | attachment viewer identity | exact MXID；attachment GET required | exact Project+Session+room request | Piko复核room当前membership；浏览器不可自报直连；失败403 |
| X-Piko-Viewer-Authorization-Ref | Slinky authorization ledger | 当前Project/Session访问决定审计 | opaque non-Secret；attachment GET required | 单次授权决定/version | 本身不授予权限；Piko同时要求delegated scope、exact linkage和membership |

## 2. AgentTaskRequest

| 字段 | 生产方/权威来源 | 消费用途 | 类型、required/null/default | scope/版本/可变性 | 鉴权、digest、保留与异常 |
|---|---|---|---|---|---|
| client_task_id | Slinky | ClientTaskIndex、业务关联 | ASCII `[A-Za-z0-9._:-]` 1–128；required | Client 内唯一；immutable | 入 digest；换 key 复用返回 409 ClientTaskConflict；随 Run ledger 保留 |
| instruction | Slinky prompt assembler | 单 Agent 任务内容 | UTF-8 1–256KiB；required | Run immutable | 入 digest；不是权限；超限/未知字段 400 |
| workspace_ref | Piko 预配置 binding，Slinky选择 | 定位授权 workspace | opaque 1–256；required | Client scope；受理时解析固定版本 | 入 digest；不可见 403/404；不接受宿主绝对路径/URL |
| service_level_id | LLMTier `/v1/models`，Slinky exact选择 | LLMTier generation | exact-case 1–128；required | Run immutable | 入 digest；不 lowercase/alias/fallback；不可见 422 |
| agent_binding_ref | Piko Agent identity config，Slinky选择 | 固定执行/通信身份 | 顶层string|null；required | Client scope；受理快照 | 入digest；不可见404；无Session时可独立使用；旧`bindings`对象400 |
| session_binding_ref | Slinky Session authority，Piko核验投影 | exact Session/room授权 | 顶层string|null；required | Client+Project+Session；版本化 | 入digest；非空要求agent/version；不匹配409 |
| expected_session_binding_version | Slinky 读取的投影版本 | 防 stale admission | 顶层positive integer|null；required | 与session ref成对 | 入digest；stale412；session null时必须null |
| communication_trigger | Slinky trusted dispatch | 将已验证 event 关联本 Run | object|null；required | Run immutable | 入 digest；非空要求 session binding；失败不降级 |
| communication_trigger.provider | Schema const | provenance，不是 selector | const `SlinkyRuntime`；required in object | V0.3 immutable | body 值不授信，Bearer Client 才是 caller authority；非法400 |
| communication_trigger.dispatch_ref | Slinky | 一次逻辑调度身份 | ASCII ID 1–128；required in object | Client内唯一；immutable绑定task+session+event+agent | 入digest；任一组成变化409 TriggerMismatch；同task换dispatch为409 ClientTaskConflict |
| communication_trigger.trigger_event_id | Matrix event，经Slinky调度且Piko ingress核验 | exact event route | Matrix event ID 2–255；required in object | room event immutable | 入digest；ingress暂缺404+durable rejection decision；deadline到达统一422，不声称事件永久不存在 |
| permissions.read_paths | Slinky在 workspace授权内选择 | 文件读取 guard | unique relative path[]，0–256；required | Run immutable | 入 digest；每次操作解析 symlink 后复检；越界403 |
| permissions.write_paths | Slinky在 workspace授权内选择 | create/modify/delete guard | unique relative path[]，0–256；required | Run immutable | 入 digest；空=只读；release 后 writer fence 禁写 |
| permissions.tool_profile_ref | Piko预配置，Slinky选择 | shell/network/process/tool权限 | opaque；required | Client scope；受理固定版本 | 入 digest；instruction不能扩大；不可见403/404 |
| limits.deadline_at | Slinky | task queue+execution+wait 截止 | RFC3339 UTC Z；required；首次必须未来 | Run immutable，不可延长 | 入 digest；同key改deadline先409；相同digest AcceptedRun才返回原回执；无Run且过期422 |
| limits.max_model_calls | Slinky | 新逻辑 LLMTier invocation 上限 | integer 1–100000；required | Run immutable | 入 digest；恢复/GET不重复计数；到限 Failed/ModelCallLimit |
| limits.max_tool_calls | Slinky | 新逻辑 tool operation 上限 | integer 0–100000；required | Run immutable | 入 digest；结果查询不计数；到限 Failed/ToolCallLimit |
| limits.stop_grace_seconds | Slinky | 停止/对账宽限 | integer 1–3600；required | Run immutable | 入 digest；不授予新业务步骤；耗尽且未知→RecoveryRequired |
| input_evidence_requirement | Slinky | 是否要求可信材料读取证据 | Required\|NotRequired；required | Run immutable | 入digest；Required时resolved tool profile必须支持PikoTrustedInputBroker，否则422 InputEvidenceUnsupported且不创建Run |
| output_paths | Slinky | 预期输出提示与结果核对 | unique relative path[]，0–256；required | Run immutable | 入 digest；不扩大 write_paths；缺失不伪造 Result |

四种唯一请求形状（其余必填字段相同，示例省略值不表示可省略）：

```json
{"client_task_id":"t0","instruction":"x","workspace_ref":"w","service_level_id":"Junior","agent_binding_ref":null,"session_binding_ref":null,"expected_session_binding_version":null,"communication_trigger":null,"permissions":{"read_paths":[],"write_paths":[],"tool_profile_ref":"tp"},"limits":{"deadline_at":"2026-09-17T00:00:00Z","max_model_calls":1,"max_tool_calls":0,"stop_grace_seconds":60},"input_evidence_requirement":"Required","output_paths":[]}
```

```json
{"client_task_id":"t1","instruction":"x","workspace_ref":"w","service_level_id":"Junior","agent_binding_ref":"a1","session_binding_ref":null,"expected_session_binding_version":null,"communication_trigger":null,"permissions":{"read_paths":[],"write_paths":[],"tool_profile_ref":"tp"},"limits":{"deadline_at":"2026-09-17T00:00:00Z","max_model_calls":1,"max_tool_calls":0,"stop_grace_seconds":60},"input_evidence_requirement":"Required","output_paths":[]}
```

```json
{"client_task_id":"t2","instruction":"x","workspace_ref":"w","service_level_id":"Junior","agent_binding_ref":"a1","session_binding_ref":"sb1","expected_session_binding_version":7,"communication_trigger":{"provider":"SlinkyRuntime","dispatch_ref":"d1","trigger_event_id":"$e1"},"permissions":{"read_paths":[],"write_paths":[],"tool_profile_ref":"tp"},"limits":{"deadline_at":"2026-09-17T00:00:00Z","max_model_calls":1,"max_tool_calls":0,"stop_grace_seconds":60},"input_evidence_requirement":"Required","output_paths":[]}
```

```json
{"client_task_id":"t3","instruction":"x","workspace_ref":"w","service_level_id":"Junior","agent_binding_ref":null,"session_binding_ref":"sb1","expected_session_binding_version":7,"communication_trigger":null,"permissions":{"read_paths":[],"write_paths":[],"tool_profile_ref":"tp"},"limits":{"deadline_at":"2026-09-17T00:00:00Z","max_model_calls":1,"max_tool_calls":0,"stop_grace_seconds":60},"input_evidence_requirement":"Required","output_paths":[]}
```

前三例分别是无身份无房间、仅身份无房间、身份与Session匹配；第四例固定为400
`InvalidBindingCombination`。任何顶层三字段缺失，以及出现旧`bindings`对象，均为400 Unknown/InvalidRequest；
不存在同时接受两种形状的兼容期。

## 3. RunView、Cancel 与 AgentResult

| 字段 | 生产方/权威来源 | 消费用途 | 类型/规则 | 版本/可变性 | 重放、保留与异常 |
|---|---|---|---|---|---|
| run_id/client_task_id | Piko/原请求 | exact查询和关联 | opaque / 原 ID；required | immutable | Client scope；404/410规则见§1 |
| state | Piko Run ledger | 执行事实 | Queued/Running/Stopping/RecoveryRequired/Completed/Failed/Cancelled | 单调受状态机约束 | Unknown不伪报失败；终态不被迟到cancel覆盖 |
| state_version | Piko | cache/concurrency | positive integer | 可见状态/progress/recovery/release变化即递增 | ETag与此一致 |
| accepted_at/started_at/finished_at | Piko durable evidence | 生命周期时序 | UTC；后两项 nullable | 首次写后不可改，除 null→值 | finished只在正常终态存在 |
| result_available | Piko | 是否可GET Result | boolean | 随状态一次变 true | 仅 Completed/Failed/Cancelled=true；否则409 |
| execution_released | Piko release evidence | 判断旧任务能否再唤醒/写入 | boolean | false→true 单调 | 不由 cancel ack、Session close、membership标签或timeout推断 |
| release_evidence | Piko fencing/obligation ledger | 精确证明资源释放或隔离 | object|null；execution_released=true时必填 | 写后immutable | 含agent/tool/writer/wakeup refs、external status/refs、isolation boundary、released_at；不代表Tier Seat释放 |
| execution_claim | Piko admission ledger | Piko执行占用事实 | claim_id、unit=`piko_concurrent_agent_run`、quantity=1、class id/version、Held/Released/Unknown、version/times/evidence | Run受理时与Run/ClientTaskIndex原子创建；状态版本化 | Queued即Held；429/503无Run无claim；replay不重复；Unknown fail closed；释放不推导drain/Tier Seat |
| input_evidence_capability | Piko resolved tool profile | 暴露本Run可信读取记录能力 | Auditable\|NotAuditable\|Unknown | admission snapshot | Required仅允许Auditable；Unknown/NotAuditable不产生Complete |
| progress | Piko observation | 诊断 | null或 message≤4096B+time | 可变并递增state_version | 不作完成/接受判据 |
| recovery | Piko obligation ledger | 未决原因/动作 | null或 reason+refs+Wait/OperatorAction | RecoveryRequired必填 | unresolved未清不得过期删除 |
| recoverable_until | Piko retention policy | 自动恢复截止 | UTC | 运行中不得缩短 | 固定为 max(deadline,accepted)+7d 下限；活动/未知可超期延长 |
| resolved_bindings_ref | Piko admission snapshot | 审计实际 workspace/tool/agent/model版本 | opaque；required | immutable | 无Secret；随Run保留 |
| communication_attachment | Piko admission/fencing ledger | Run与Session/event精确关联 | object|null | attachment版本固定，status可Attached→Fenced→Released | 不能从最新消息推断 |
| attachment_id/session_id/room_id/identity refs | Piko核验投影 | route/fence/audit | non-null when attachment exists | immutable | Client/Session scoped；不暴露token/checkpoint |
| resolved_session_binding_version | Piko | 证明受理版本 | positive integer | immutable | revoke更新binding但不改原attachment |
| wakeup_epoch | Piko | 拒绝旧消息唤醒 | positive integer | 每次授权世代递增 | 不由Slinky/body提供；late epoch只作Evidence |
| attachment.status/revoked_at | Piko | fence/release | Attached/Fenced/Released；UTC|null | 单调 | Released后event不能恢复Run写入 |
| CancelRequest.reason | Slinky | 操作员说明 | UTF-8 1–4096B | command immutable | 入cancel digest；不授予权限 |
| CancelReceipt.command_id/accepted_at/outcome | Piko | 固定取消回执 | opaque/time/StopRequested|AlreadyTerminal | immutable | 同key返回原回执；StopRequested不是停止/release证据 |
| AgentResult.state/reason_code/detail_reason_code | Piko terminal ledger | 执行结论 | strict enum；全部required | immutable | task deadline=`Failed/DeadlineExceeded/TaskDeadlineExceeded`；caller/catalog先到=`Failed/ExecutionError/ModelRequestDeadlineExceeded|ServiceEffectiveDeadlineExceeded`；晚到成功仅Evidence |
| AgentResult.summary | Agent，经Piko封装 | 最终答复 | UTF-8 0–256KiB | immutable | 不作安全/接受判据 |
| AgentResult.outputs | Piko稳定generation测量 | 文件清单 | path/hash/size，≤256 | immutable | Piko计算；文件后续变化不改历史Result |
| AgentResult.usage | Piko counters + LLMTier observations | 计量 | calls非负；tokens nullable；cost decimal nullable+currency | immutable | unknown为null非0；恢复不重复计数 |
| AgentResult.input_access_evidence | PikoTrustedInputBroker | 引用可信读取证据bytes | status Complete/Partial/Unavailable/Unknown、producer/version、path/hash/size/generated/available；全部required/null显式 | 与result_generation原子发布 | Complete只表示recorder无gap；不表示Slinky材料清单覆盖/模型理解；Required且无法发布时Run保持RecoveryRequired |
| AgentResult.result_generation/published_at | Piko Result ledger | 稳定输出与证据发布世代 | positive integer + UTC；required | immutable | writer fence、evidence、outputs完成后才原子可见 |
| execution_log_ref | Piko | 授权日志引用 | opaque|null | immutable | 不要求chain-of-thought；无凭据 |

### 3.1 ExecutionCapacitySnapshot 与逐Run claim

唯一观察操作为只读`POST /agent-runtime/v1/execution-capacity/snapshots:query`。使用POST仅承载最多256个
异构selector；它没有Idempotency-Key、不写reservation/claim/Run/dispatch intent，响应200带强ETag，
`If-None-Match`匹配同一有效representation可得304；认证/授权及scope检查先于ETag。

| 字段 | 生产/authority | 消费用途 | 精确定义 | 异常/保留 |
|---|---|---|---|---|
| selectors[] | Slinky | 描述每个participant的拟提交形状 | selector_id + quantity=1 + workspace_ref + exact service_level_id + nullable agent_binding_ref + tool_profile_ref + evidence requirement | 与Run相同Client可见性和解析；未知字段400，unsupported422 |
| selector_resolutions | Piko Binding Resolver | selector→execution class | Resolved含stable execution_class_id和positive class_version；Unsupported/Unknown为null class并带reason | Unknown/unsupported不得规划为可用 |
| snapshot identity/time | Piko Capacity Projector | 缓存与有效性 | snapshot_id/version、Client scope_ref、observed_at、valid_until、ETag | 过期fail closed；scope不可枚举，越权404 |
| status/unit | Piko | 完整性和单位 | Complete/Partial/Unknown；unit恒为piko_concurrent_agent_run | Partial/Unknown不填0，不能用于完整backing |
| execution_classes[] | Piko | class级当前事实 | class id/version、Known/Unknown、available/held/queued nullable、constraint_ids全集 | Unknown三个quantity均null；不跨class相加available |
| constraint_facts[] | Piko | all-constraints可行性 | stable constraint_id、DirectClass/SharedWorkerPool/ClientQuota、覆盖class IDs、Known/Unknown、limit/held/available/shortfall_for_next_unit、blocking/reason | 每个participant quantity=1；按constraint覆盖的class需求求和并逐项比较；Unknown数值全null且阻塞；不泄露host/process |

异构N个participant的可行性算法唯一为：先要求全部selector Resolved、snapshot Complete且未过期；再把每个
participant的quantity=1按resolved class映射到每个`constraint_fact.execution_class_ids`，对每项constraint求
demand合计，要求Known且`available_quantity>=demand`。不能把class available或重叠constraint available相加。
snapshot只是非预留预测；只有每个原`client_task_id/key`提交均得到202且RunView内Held claim齐备，Slinky才可称
完整Piko backing。部分202是真实事实，不自动补偿取消，也不回滚已执行业务。

### 3.2 Input access evidence

`input_evidence_requirement=Required`时，admission先核对resolved tool profile能强制所有workspace读取经过
`PikoTrustedInputBroker`；不支持则422且不创建Run。证据保留路径固定为
`.piko/evidence/input-access/v1/<run_scope_token>/<result_generation>.json`，其中
`run_scope_token=lowercase-hex(SHA-256(UTF8(canonical client_id)||0x00||UTF8(run_id)))`。不得使用
`client_task_id`拼路径；`.piko/**`是system-only保留前缀，Agent/shell/普通writer不可写，也不扩大write_paths。

证据document逐对象记录relative path、object_version、content hash/size、coverage、规范化ranges、read count和
观测时间。同一object_version+hash的ranges按start排序并合并重叠/相邻范围，重复读取不增加covered bytes；
空文件实际读取为`FullContent,size=0,ranges=[],read_event_count>=1`。MetadataOnly不等于内容覆盖；
ChangedDuringRead记录前后version/hash并令recorder Partial；broker旁路、recorder failure、Unknown execution均写gap，
不得产生虚假Complete。Complete只证明记录器从start到close无gap；Slinky仍以自己的必需材料版本/hash/range集合判定。

发布顺序固定为Agent writer fence→Tool writer终止/隔离→trusted recorder close→证据bytes fsync+hash→outputs
generation快照→AgentResult generation与ETag原子发布。任一步失败时`result_available=false`且Run进入
RecoveryRequired；Unknown execution的evidence为Unknown且不发布终态Result。证据bytes通过原workspace/artifact
授权读取模式按Result给出的path/hash/size取得，不新增Piko下载endpoint或第二通道；至少保留到
`max(request.deadline_at,result.published_at)+7d`。Slinky须在窗口内核验并接管长期Artifact，Result仍可查询不等于
证据bytes仍可读。

## 4. Identity、Session binding、revoke 与 drain

| 字段 | authority/生产方 | 用途 | 类型/状态 | 版本/鉴权 | 冲突、重启与保留 |
|---|---|---|---|---|---|
| agent_binding_ref/agent_identity_ref | Piko | 稳定Agent身份 | opaque | Client+Project；versioned | MXID不因display rename改变；collision409 |
| matrix_user_id | Piko AS provisioning | exact Matrix route | MXID string | identity immutable | 不按display name路由；AS Secret不返回 |
| display_name | Slinky展示意图，Piko投影 | Element显示 | 1–255 string | 可按版本更新 | rename不换MXID/room/history |
| SessionAgentBinding session/room | Slinky authority，Piko核验 | exact授权投影 | opaque session + Matrix room | binding_version单调 | room/identity不匹配409；encrypted/federated422 |
| authorization_valid_until | Slinky projection | 有界授权租约 | UTC required | 每个binding_version固定 | 到期fail closed 409；不能靠缓存无限延长 |
| status | 各自ledger | admission/fencing | Provisioning/Active/Revoking/Revoked/RecoveryRequired | Active+未过期才允许新Run | restart先ledger后Matrix对账，不回Active猜测；本地CAS裁决revoke/admission竞争 |
| Revoke operation_id/version/reason/time | Slinky | 幂等撤权命令 | strict fields | Client+Project+binding | 同key/digest原回执；stale412 |
| Revoke receipt fences | Piko | 证明新wakeup/admission/权限获取已阻断 | booleans+outcome | 本地提交后不可回退 | membership可异步；证据未齐Revoking |
| Drain counts/unresolved/isolated refs/boundary/evidence | Piko | Slinky strict close输入 | nonnegative counts、refs、event/evidence nullable | 逐session_binding投影 | Drained需counts=0、两类refs=[]及authorization/writer/wakeup证据；membership只指该Agent虚拟用户；不等于Session Closed |

## 5. Message send、event view 与 Run 路由

当前AgentTeams bridge的Topic/SID/RID可见头和`io.agentteams.comm`仅是协作基础设施，不自动成为产品wire。
产品接口复用Piko现有outbox/AS ingress，不建立第二transport：

- POST `/projects/{project_ref}/session-agent-bindings/{session_binding_ref}/messages`；
- GET 同prefix `/messages/{sid}`；
- GET 同prefix `/ingress-events/{matrix_event_id}`（event ID按URL编码）。

| 字段 | authority/生产方 | 消费用途 | 类型/required | identity/digest/retention | 缺失、冲突、重放、重启 |
|---|---|---|---|---|---|
| envelope_version | Piko Schema | codec选择 | send/event均const `piko-message/v0.3` | contract version | 未知版本400 UnsupportedMessageVersion |
| topic_id | Slinky Topic authority | 业务归类 | ASCII ID required | Project+Session；immutable | Archived/unknown拒绝；不按room name猜 |
| sid | 发送方logical message ID | outbox去重/GET | ASCII ID required | `client+session+derived sender+sid`唯一 | 同SID同digest原202；异digest409 MessageIdConflict |
| rid | 发送方指定父SID | reply关系 | ID|null required | 必须同room、同Topic、sender可见 | 跨Topic/room/未知父409 ReplyTopicMismatch |
| sender_identity_ref | Piko projection + Matrix event.sender | 权威发件身份 | send request中不存在；event view required | 从path binding派生并与MXID核验 | body不能自报；不匹配Rejected |
| recipient_identity_refs | Slinky/Agent route | exact目标 | unique nonempty[] required | Client+Session授权 | 空、未授权、重复或广播409；不继承全房间 |
| message_type | Piko Schema | obligation类别 | Request/Answer/Notice | immutable | 未知type 400；不从body猜 |
| body | sender | 人可读内容 | UTF-8≤256KiB | 入message digest；按Session policy | 不授予Run/Tool权限；redaction保留关系 |
| attachments | sender+Piko content store | 附件引用 | ≤64；单项≤64MiB、合计≤256MiB | id/media/size/hash/content_ref入digest；ACL scoped | content_ref不是任意URL；读取复核size/hash，失败422 |
| matrix_room_id | Piko exact projection/Matrix event | route evidence | send request中不存在；event required | binding immutable association | path binding冲突409 |
| matrix_event_id | Matrix send/ingress | 远端去重/trigger | send前不存在；receipt中null直到Sent；event required | Matrix immutable | 不得预造；lost response按outbox txn恢复 |
| matrix_origin_server_ts | Matrix origin_server_ts | Matrix排序证据 | integer ms；Sent/event required，Queued时null | Matrix authority | 不替代event-id/coverage |
| accepted_at / piko_ingested_at | Piko durable clock | 本地审计 | UTC | 非Matrix时间 | 不冒充created_at；重启保持原值 |
| classification_status | Piko codec+binding verifier | ingress分类 | ProductEnvelopeValid/UnclassifiedNativeMessage/Rejected | event immutable | 仅ProductEnvelopeValid可继续判dispatch |
| dispatch_eligible | Piko ingress verifier | Slinky调度前置 | boolean | exact event/version/boundary | false不能用于trigger，返回409 MessageNotDispatchEligible |

### 5.1 唯一 Matrix codec 字段映射

| Matrix字段 | 生产/authority | 产品映射与使用 | 缺失/冲突行为 |
|---|---|---|---|
| event.type | Piko sender / Matrix | 固定`m.room.message` | 其他type不属于产品消息；Rejected或其它Matrix分类，不dispatch |
| content.msgtype | Piko codec | 固定`m.text`，供Element原生显示 | 非m.text且存在产品扩展为Rejected |
| content.body | HTTP MessageSendRequest.body | 逐UTF-8字节相同；Matrix/Element显示正文 | 与outbox canonical body不一致为Rejected |
| content.io.piko.agent.message | Piko codec | 唯一namespaced扩展；包含version/topic/sid/rid/derived sender/ref recipients/type/attachments | 缺失为UnclassifiedNativeMessage；未知version或畸形为Rejected |
| content.m.relates_to.m.in_reply_to.event_id | Piko SID索引 | 仅rid非空时存在；解析到同room/topic且对应rid | rid为空却存在、rid非空却缺失、跨room/topic均Rejected |
| event.sender / room_id | homeserver + exact projection | 与derived MXID/room逐项核验；不信content自报 | 不匹配Rejected；不按display name路由 |
| event.event_id / origin_server_ts | homeserver | Sent/ingress事实；发送前不存在 | caller预填不被接受；lost response由outbox txn恢复 |
| attachment content_ref | Piko content store | 当前Client+Session+sender/recipient ACL解析；复核media/size/hash；Matrix仅保留元数据ref | 不可见、hash/size不符422；不生成URL/token，不从Matrix取得额外权限 |

### 5.2 Attachment upload、binding、read 与 retention

| 字段/事实 | 生产/authority | 使用 | 范围/格式 | 冲突、恢复与保留 |
|---|---|---|---|---|
| upload metadata | Slinky backend | 创建受控content_ref | attachment_id、expected binding version、media_type、size≤64MiB、sha256；全部required | 令M=RFC8785 JCS(metadata) UTF-8、H=SHA-256(content bytes)原始32字节、P=ASCII(`piko-content-upload-digest-v1`)后接`00`、L=uint64 big-endian len(M)；wire digest=`lowercase-hex(SHA-256(P||L||M||H))`。boundary/part header/filename/content-transfer encoding不入摘要；同key异digest 409优先于声明/实际不符422 |
| content bytes | Slinky backend / Piko content store | 待发送附件 | multipart binary；实际≤64MiB | actual size/hash与metadata不符422 ContentIntegrityMismatch；超限413 ContentTooLarge |
| ContentReferenceView | Piko | MessageAttachment来源 | content_ref、scope、binding version、media/size/hash、status、created/unbound/retained/redacted/deleted/tombstone times、etag；nullable时间显式null | 仅exact binding可见；未绑定24h；相同content_ref只允许CAS绑定一个logical message，loser409 ContentAlreadyBound |
| message attachment link | Piko outbox transaction | 将content_ref固定到SID/attachment_id | exact Project+Session binding+SID+attachment | metadata逐项相等才受理；成功后至少保留message accepted_at+7d；未知delivery义务不得删除 |
| attachment GET route | Piko | Slinky backend代理当前用户读取 | exact binding+SID+attachment_id；无content_ref直查/list | 固定先后：认证401→delegated/current授权/current membership 403→exact linkage/visibility 404→redaction/retention 410/404→ETag 304。匹配ETag不得覆盖前置失败 |
| content tombstone | Piko retention | 防过期误恢复 | eligibility为未绑定created_at+24h或已绑定accepted_at+7d minimum；blocker推迟实际删除；`tombstone_until=bytes_deleted_at+30d` | 只有实际删除才写bytes_deleted_at并启动半开窗口；`[deleted,until)`为410 ContentExpired，精确until起404；redaction为410 ContentRedacted；长期副本由Slinky授权artifact/backup保存 |

浏览器不取得Piko credential、content_ref读取权或临时URL。Slinky必须先验证当前Project permission与Session
membership，再由backend调用；Piko独立核对exact Matrix room membership。`X-Piko-Viewer-Authorization-Ref`
只用于绑定Slinky授权证据和审计，不能单独覆盖scope/link/membership失败。

### 5.3 Raw Matrix event 与六字段受控投影

`RawMatrixRoomMessageEvent`是AS收到的原始输入：允许`unsigned`等外层标准字段，但禁止`state_key`且
type必须`m.room.message`；严格content仍完整验证。Piko随后抽取
`type/room_id/event_id/sender/origin_server_ts/content`形成additionalProperties=false的
`ProductMatrixRoomMessageEvent`。因此原始extra不参与权限判断，但也不被复制到产品投影。sender/room必须与
exact binding核验；修改任一项为Rejected。原生无扩展消息为Unclassified，state event不进入产品消息消费。

`ProductEnvelopeValid`机器上恒有`dispatch_eligible=true`及非null envelope；
UnclassifiedNativeMessage/Rejected恒为false且envelope=null。Queued/Failed/RecoveryRequired receipt恒无Matrix
event/time；只有Sent同时具有两项。AgentResult状态组合固定：Completed仅AgentFinished/null，Cancelled仅
UserCancelled/null，Failed仅ExecutionError/DeadlineExceeded/ModelCallLimit/ToolCallLimit；ExecutionError必须
有四个明确detail之一，DeadlineExceeded必须TaskDeadlineExceeded，两种limit的detail为null。

`MessageSendRequest`不含sender/room/event/time；202只证明outbox command已落盘。`MessageSendReceipt`在Queued时
Matrix字段为null，Sent后填Matrix事实。普通原生`m.room.message`保存为UnclassifiedNativeMessage且
dispatch_eligible=false；不自动发Run。Slinky可GET exact ingress fact，验证自身Topic/Action后才提交Run。

TriggerDispatchIndex完整值为`client_task_id+session_binding_ref+trigger_event_id+agent_binding_ref`。
同dispatch变更任一值为409 CommunicationTriggerMismatch；同task换dispatch为409 ClientTaskConflict；同event只有Slinky
显式新dispatch+task才可建立另一Run，Piko retry不生成dispatch。trigger暂缺时404但保存
`RetryableRejection`及digest，不生成202 receipt；deadline前event出现可CAS重评，deadline到达统一422并
保留terminal decision。可重评decision到期也不遗忘key→digest binding，至少保留至
`max(request.deadline_at,decision_first_created_at)+7d`；`decision_first_created_at`首次写入后不可变，迟到event永不受理该请求。

重评与首次admission共享同一serializable transaction边界：锁定原decision version后，重新检查
ClientTaskIndex、完整dispatch tuple、当前projection/权限/model/workspace/tool/capacity，并用unique constraints
原子写Run、索引、snapshot、claim和原202。两个不同key先后保存同一client_task_id的RetryableRejection时，
并发重评最多一个事务建立Run；另一事务固定返回ClientTaskConflict，不创建第二dispatch intent/claim。

## 6. Release、drain、membership 与 Session close组合

| execution_released | drain | 该 Piko binding membership | Slinky Session | 结论 |
|---:|---|---|---|---|
| false | 任意 | 任意 | Closing/RecoveryRequired | 旧执行仍可能写/唤醒，禁止Closed |
| true | Draining | 任意 | Closing | Run安全释放，但Piko消息义务未收口 |
| true | RecoveryRequired | 任意 | RecoveryRequired | unresolved/isolated external refs保留，禁止Closed；隔离只释放Run资源，不关闭Session |
| true | Drained | RevocationRequested/Unknown | Closing或Revoking | 业务执行已安全；等待membership/授权证据，不能把标签当事实 |
| true | Drained | Left或该Session无Piko binding | 仍有Topic/Action/archive blocker则Closing | Piko条件满足但Slinky严格守卫仍生效；人类及Slinky归档身份无需退出 |
| true | Drained | Left或该Session无Piko binding | Closed | 仅当Slinky自己的topics/actions/archive/close boundary全部满足；历史只读访问仍由Slinky/Matrix策略决定 |

“外部义务已隔离”只允许在以下证据同时存在时令 `execution_released=true`：Run Agent进程不可调度、Tool child已终止或被不可写sandbox隔离、workspace writer lease/fencing generation已推进、Run wakeup epoch已fence、late model/tool/message结果只能写隔离的obligation ledger而不能写Result generation/workspace。该隔离不声明 LLMTier Invocation terminal、不释放Tier Seat、不删除UnknownOutcome，也不替Slinky完成Session close。

## 7. A/B/C边界

- A（本轮冻结）：本表、V0.3 OpenAPI/Schema/error/fixtures、四Run API、只读capacity snapshot/逐Run claim、可信input evidence、binding/trigger/revoke/drain、消息映射、保留与旧接口删除。
- B（Piko内部下游设计）：DB/HA产品、表DDL、worker调度算法、Pi hook实现、workspace sandbox实现；不得改变A的wire和状态语义。
- C（联调）：真实Pi/LLMTier/Matrix/Element、crash/failover、RPO/RTO、性能与Secret扫描证据；失败只能保持activation=false，不能回退旧wire。
