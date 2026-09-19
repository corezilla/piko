<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky 会话生命周期操作契约

| 文档字段 | 值 |
|---|---|
| Document ID | `slinky-communication-lifecycle-contract` |
| Document Version | `0.3.0-draft.9` |
| Status | `Draft` |
| Project | `slinky` |
| Authority | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Authors | `Codex` |
| Created Date | `2026-09-16` |
| Last Modified Date | `2026-09-16` |
| Template ID | `contracts.specification` |
| Template Version | `0.3.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `v0.3-tailoring-manifest` |
| Migration Map Reference | `none` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/60_interfaces/contracts/communication-lifecycle-contract.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_COVER_END -->

> 2026-09-17 实施范围撤回通知：依据[用户最新裁决](../../90_decisions/intelligent-process-scope-20260916.md)，本文中固定图自动业务推进、自动失败升级、容量/Seat/claim、模型级恢复、Cost、自定义通信/附件与跨系统close/drain条款退出当前authority。以下旧版正文仅供迁移定位；不能作为本轮已批准实施规格。无关的权限、版本一致性、真实质量证据仍保留，当前目标见新版系统设计、SRS和接口控制；下游须先完成对应修订再编码。此通知不把旧版本测试/签署改写为新版验证。

父设计：v0.3-system-design §7.4/8.3；章节重组依据 TAIL-008。

## 1. Authority

字段候选唯一来源为 [JSON Schema](schemas/communication-lifecycle.schema.json)，运行行为候选由本文定义。[HTTP映射](openapi/communication-lifecycle.openapi.json)把现有Runtime execute与View query绑定到唯一传输路径，不增加第二执行器或通信服务。Piko的字段片段是Slinky消费约束，最终provider OpenAPI由Piko签署和一次性替换；本文件不能激活其服务。既有View的VQ-COMM使用下述查询。

## 2. 操作签名

所有 mutation 统一 `execute(Command) -> Receipt | Error`。actor、Client、权限和调用时间从可信服务上下文取得，body 不允许自报 actor。载荷 UTF-8 JSON 上限 64 KiB，拒绝重复 JSON key、未知字段和非法时间，字段字符上限与传输字节上限同时检查。

| payload.kind | target_ref / expected_version | 首次权限和守卫 | 结果 |
|---|---|---|---|
| CreateSession | 调用方稳定 Session ID / 0 | 项目 communication.manage；同 ID 不存在；身份可见，记录 intent 后才建房 | Receipt；Session Provisioning |
| InviteMember | Session ID / 当前 Session 版本 | manage；Session Active/Provisioning；身份可见且匹配项目授权 | Receipt；成员 Invited |
| RevokeMember | Session ID / 当前版本 | manage；立即撤销本地授权并保存撤权 operation | Receipt；成员 Revoking |
| CloseSession | Session ID / 当前版本 | manage；同操作先重放；新 key 对 Closed 返回 AlreadyClosed | Receipt；Closing 或原阶段恢复 |
| CreateTopic | 父 Session ID / 当前版本 | communication.write；Session Active | Receipt；服务端分配 Topic ID，operation result 给出引用 |
| ChangeTopic | Topic ID / 当前 Topic 版本 | write；跨级决定需相应 Action 权限；按 §4 状态表 | Receipt；operation result 给出新 Topic 版本 |
| CreateBackup | Session ID / 当前版本 | backup.create；指定当前已授权 policy；允许关闭等待期备份 | Receipt；operation result 给 BackupManifest |
| RestoreBackup | Session ID / 当前版本 | backup.restore；backup 必须属该 Session/project | Receipt；RestoreResult 默认 Isolated |
| DeleteBackup | Session ID / 当前版本 | backup.delete；无 hold/活动引用/未决义务/被依赖增量 | Receipt；仅删除该备份，审计与外部义务引用保留 |

`get_operation(project_id, operation_ref)` 返回 operation_ref、status=Pending|Succeeded|RecoveryRequired|Failed、result_ref|null、error|null；所有字段必需。Succeeded 必须有 result_ref，Failed 必须有 error；操作结果仍通过下述类型读取。Receipt 的 Accepted 只是持久受理，不代表副作用完成。

Operation字段组合固定如下；error中的correlation_id关联原受理操作，不因查询请求ID改变。

| status | result_ref | error | 消费规则 |
|---|---|---|---|
| Pending | null | null | 原操作执行中；查询原operation，不重新提交业务操作 |
| Succeeded | 非空引用 | null | 读取对应类型结果；状态终态且不改写为失败 |
| RecoveryRequired | null或已保存的受限部分结果引用 | 必填Error | 引用仅供诊断，不代表完成；只恢复同一operation及原义务 |
| Failed | null | 必填Error | 已证明无法完成且没有未决副作用；终态，不用新key自动重做 |

Pending可转Succeeded、Failed或RecoveryRequired；RecoveryRequired在新证据确认原义务可安全继续时转Pending，也可凭收口证据转Succeeded或Failed。Succeeded/Failed不可重新开放。外部结果未知、清理未完成或残余写入不能证明停止时，使用RecoveryRequired而非Failed。部分结果读取仍执行当前权限检查；它不取得Verified/ReadOnlyReady资格。

CreateSession的expected_version必须为0，其余八种命令必须为正整数，Schema先拒绝非法组合。正整数与当前对象版本相等属于首次受理事务中的CAS条件；同key/digest已受理重放不重查当前版本。CreateTopic仍校验父Session版本，不把尚不存在的Topic版本伪装为0。

`get_session/get_topic/get_backup/get_restore_result(project_id, ref)` 返回相应 Schema 对象。先做权限/存在性隐藏，再读记录；强 ETag 绑定各自 representation，If-None-Match 相同返回 NotModified，无伪造空对象。

`list_sessions(project_id, status[], cursor|null, limit=50)` 返回 `{items:Session[],next_cursor:string|null,snapshot_ref,valid_until}`。limit 1..200；过滤排序固定 session_id 升序；游标绑定 actor授权版本/project/filter/排序/快照/expiry，不允许跨 scope 复用或过期回退第一页。首次固定快照，后续页只读取该快照；权限变化使游标无效。

### 2.1 HTTP映射与安全边界

唯一命令路径为POST /api/runtime/communication/commands，请求体直接使用Command，不另包一层、不接受第二份Idempotency-Key header；重复来源避免歧义，客户端只提交body.idempotency_key。X-Request-ID必须等于correlation_id，否则400 InvalidRequest。所有成功受理均为202及原Receipt，包括AlreadyClosed；不把202转换为副作用完成。媒体类型application/json；大于64KiB为413 InvalidRequest，媒体类型不支持为415 InvalidRequest。

查询由/api/view/projects/{project_id}/communication下的sessions、topics、backups、restores、operations资源读取，精确路径及operationId见OpenAPI。Operation.result_ref是本项目不透明引用，不是可任意请求的URL；其类型由原Command.payload.kind确定：Session类操作读Session、Topic类读Topic、CreateBackup读BackupManifest、RestoreBackup读RestoreResult。DeleteBackup完成后的result_ref保留为删除回执/墓碑引用，通过原Operation确认Succeeded，不重读已删Backup；引用不授权跨项目访问。

HTTP只接受Slinky用户访问Bearer，认证服务解析当前principal、Client与项目权限，不接收body自报actor。WebUI通过既有用户认证获得Slinky访问权限，Piko/Tier/Matrix凭据不能代用。无有效认证401；项目不存在或不可见404；项目可见但缺操作权限403。Session/Topic/Backup等ref均先约束project_id，跨项目与不存在统一404；mutation重放仍先查当前访问权，不能用历史key绕过撤权。证据下载需backup.read及当前项目授权，不能因已得到Manifest而免检。

精确查询200返回强ETag和Cache-Control: private, no-cache。ETag只绑定当前representation；授权先于If-None-Match，匹配后304无body且返回同ETag。命令/列表/错误返回no-store。没有有效缓存对象时客户端不得用304合成空DTO。网络失败只保留带来源版本的旧展示，不据此发新命令。

### 2.2 快照与游标

列表采用服务端保存的随机不透明cursor，至少128位熵，无客户端可编辑payload，不增加签名配置入口。记录绑定principal、Client、project_id、授权版本、规范化status集合、limit、session_id升序、snapshot_ref和下一偏移。快照有效期固定首次读取后300秒，后续翻页不续期；跨实例/重启共用既有View snapshot store，不在失去快照后重新读取latest冒充同页。

cursor未知、到期、filter/limit改变或快照不可恢复返回409 CursorStale；当前权限先独立检查，撤权时403/404，不泄露旧分页内容。空结果仍返回有效snapshot_ref、valid_until和next_cursor=null。next_cursor=null结束；HTTP首次不传cursor，空字符串或字面null为400。客户端收到CursorStale后明确刷新完整列表，不静默拼接旧页。快照至少保留到valid_until；过期删除快照不删除Session业务记录。

### 2.3 Element descriptor查询

GET /api/view/projects/{project_id}/communication/sessions/{ref}/element-descriptor返回唯一ElementDescriptor。ref是Slinky Session ID，不是Piko binding ID；授权、隐藏404、强ETag/304遵守§2.1。该查询不创建Session/room、不邀请成员、不取得Matrix token。

同一Schema中的ElementHostContext/ElementHostMessage定义父页面与受控Element子页面的唯一宿主wire，protocol=slinky-element-host/v0.3。Mount/Ready/Failed与当前room的LocateEvent/EventLocated/EventUnavailable逐消息字段、方向、10秒挂载/5秒定位超时、exact source/origin校验及generation失效规则见[集成ADR §4](../../90_decisions/project-communication-integration.md)。这不是HTTP命令或Piko产品codec，不接受任意导航、URL或Secret；JSON Schema不能替代浏览器来源与当前授权检查。

| 字段 | 来源与消费规则 |
|---|---|
| descriptor_id/descriptor_version | View在既有projection store保存的身份/版本；同principal/project/session保持descriptor_id。条件GET在表示未变时可返回同版本/304；无条件GET重验权威授权并签发递增descriptor_version及新期限，不复用旧版本续期 |
| project_id/session_id/session_version | Slinky当前Session事实；宿主必须与当前选择匹配，不按room名称定位 |
| authorization_version | 当前Slinky principal+Client+project的授权版本；版本变化使旧descriptor不可使用；不是可转移的访问凭据 |
| room_id | Session精确room；未建立时null且Unavailable；Ready必须非空 |
| status/reason_code | Ready仅表示Slinky授权与集成来源满足打开前置条件；Unavailable必须给固定原因，且没有可加载origin/build或actions |
| embed_mode/identity_mode | 固定ElementRoomView/UserMatrixSession；无外链模式和服务身份fallback |
| element_origin/parent_origin | Operator批准的当前集成配置提供精确origin；生产为HTTPS，规范origin不得含userinfo、path、query或fragment；两者必须不同，禁止通配符 |
| build_ref/build_sha256 | 唯一受控Element模块构建配置引用及散列；该配置固定Element revision、module API/锁文件与启动入口；浏览器从受控配置解析入口，不接受用户URL或任意脚本 |
| codec_version | 固定piko-message/v0.3；对应提供方机器Schema，不能以AgentTeams协议代替 |
| issued_at/valid_until | View可信时钟产生；valid_until为issued_at后60秒与各授权/来源有效期中最早者，必须晚于issued_at；过期后须重取，缓存304不能延长期限 |
| allowed_actions | Ready必须含Read；Compose仅在Session Active且当前communication.write授权成立时出现；Closing/Closed/恢复阶段只读，Unavailable为空 |

View以current principal、Session版本、授权版本和build配置版本组合生成descriptor。无If-None-Match的GET必须重新读取当前权威授权并签发新issued_at/valid_until与单调递增descriptor_version，返回200；同principal/project/session保持descriptor_id，版本分配复用既有View持久版本事务。并发响应可乱序，消费者拒绝旧版本。条件GET仍可304，但绝不续期；宿主主动续验必须使用无条件GET，不增加endpoint或续期命令。引用的任何来源过期、撤权或事实变化立即使旧版本不可用，不等60秒。无法读取必要权威来源且不能确定状态时503；已知配置未完成为200 Unavailable/IntegrationNotReady，已知Session未具备房间为SessionNotReady，已知membership缺失为MembershipUnavailable；SourceUnavailable只用于已记录的来源不可用事实，不把未知当Ready。

同RoomView续验仅按ADR §4.1的Revalidate/Revalidated执行；成功续验不重建RoomView或清空其原生草稿。改变project/session/room、identity、origin/build、Session/authorization版本或allowed_actions不属于连续续验，必须销毁旧generation后重新授权挂载。未完成续验的旧截止时间仍生效；不允许本地TTL顺延、304续期或截止后grace。

Ready不证明浏览器已登录Matrix。Element仍以用户自己的session确认登录与membership；登录未完成显示自身登录流程而非自动发消息。Compose是Slinky侧必要条件，不覆盖Matrix ACL。服务端从不把用户Matrix credential写入descriptor，父页面不接收它。view_generation由父页面为每次挂载分配，不进入服务端descriptor、不参与权限判断；旧generation响应丢弃。

宿主在加载前验证Schema、时间关系、当前上下文、exact origin与受控build散列绑定。未知字段、secret、任意URL、不同项目、旧版本或不可解析build均拒绝挂载。descriptor字段现已定义；官方Module导航覆盖与握手实现仍按ADR门禁核对，不能因字段齐全就令未批准构建Ready。

## 3. 幂等与事务顺序

namespace=authenticated Client+project+operation kind+idempotency_key；摘要为规范化 target_ref、expected_version、payload 的 JCS SHA-256，correlation_id 不参与。仅校验认证、基础格式与当前项目访问权后查记录：同 key/digest 返回原 Receipt，不重查当前版本、binding readiness 或容量；不同 digest 为 IdempotencyConflict。无记录才检查 expected_version 和状态/权限。相同 Session ID 换 key 不能建第二房间，返回冲突。

Slinky 只在自己的事务中写版本、intent 和回执；外部 Matrix/Piko 操作分别确认，不声称跨系统 ACID。重启恢复原 operation，不改变 room/txn/binding identity。创建响应未知且无可证明幂等能力时为 RecoveryRequired，禁止盲重建；邀请/撤权重试先核对真实 membership。回执不因后台对象变化重写。

### 3.1 Matrix建房未知结果

核对依据为[Matrix Client-Server v1.15 createRoom](https://spec.matrix.org/v1.15/client-server-api/#post_matrixclientv3createroom)：该POST没有txnId参数，不能继承消息send的去重保证。这是接口依据，不声明当前部署已通过v1.15资格验证。

Slinky既有operation在外发前持久保存建房intent与精确scope；成功响应的room_id落入同一原operation后才能后续绑定。外发后丢响应或“服务端成功、本地未落盘”窗口保持RecoveryRequired；重读原Slinky key只返回原operation，不再次POST createRoom。仅凭房间名、alias、超时或没有本地日志不能证明未创建，也不能自动接管候选room。恢复须通过既有授权对账取得原操作与exact room的可验证关联，否则保持阻塞并交Operator，不新建去重代理或备用房间。已明确未外发与外发结果未知必须区分；邀请/撤权按当前membership对账，不能把invite成功当Joined。

## 4. 状态守卫

Session：Provisioning 仅在房间、必需成员及授权绑定核验后 Active；Active 到 Closing 后不能再开放。RecoveryRequired 带 recovery_phase，核验原 intent 后只回原阶段或完成原关闭；Closed 为终态，继续讨论需显式新 successor。Closed 的机器必要条件见 Session.close_facts；运行时还必须验证 evidence 来源、版本、覆盖全部当前 attachments，不能信任调用方上传的 true。

Topic：Open→WaitingForDecision/Resolved/Cancelled/Transferred；WaitingForDecision→Open/Resolved/Cancelled/Transferred；Resolved/Cancelled/Transferred→Archived。Resolved 必须有已接受结论且相关 Action 已解决；Cancelled 必须有授权撤销证据，不能抹除 Action；Transferred 必须有同项目已建立 successor 与双向引用；Archived 保存原 disposition 及对应证据。其它转换拒绝，不能通过快照覆盖绕过状态机。

关闭采用严格收口。unknown 外部义务阻断 Closed；备份 Verified 不替代 drain、Task release 或 Tier release。COMM-EXT-01 生效：关闭、恢复和清理均不写 Tier 状态或调用 replay/cancel/reconcile；Piko 的对账是独立、当前授权的原义务恢复。

## 5. Binding 消费约束

RunBindingInput 是完整轻量 Run body 的片段，不是第二 Run API。agent_binding_ref、session_binding_ref、expected_session_binding_version三个顶层键均required，空值显式null；缺省或旧bindings嵌套对象为400，不设置语法兼容。session非空必须agent/version非空。绑定不可见先404，版本错412，已授权可见身份不匹配409，绑定非Active或租约过期409。null/null为独立执行；仅agent为无房间身份任务；匹配三项才创建attachment。

communication_trigger为required nullable对象；非null时包含provider常量SlinkyRuntime、dispatch_ref、trigger_event_id，且session_binding_ref非null。trigger_event_id从Slinky已核验的调度事实取得，不从“最新消息”猜测。Slinky先读Piko exact binding下GET /ingress-events/{matrix_event_id}，只有ProductEnvelopeValid且dispatch_eligible=true的可信事件才进入业务授权检查并显式调度。Piko ingress不自动建Run，wakeup_epoch由Piko受理时生成。无触发普通Run提交null。

dispatch_ref绑定client_task_id+session_binding_ref+trigger_event_id+agent_binding_ref；同dispatch改tuple为409，同task换dispatch为ClientTaskConflict。Piko受理重放先当前认证/可见性、基础解析、JCS digest、key查找和digest比较；只有同digest AcceptedRun返回原202。trigger暂缺404属于持久RetryableRejection，不是回执；deadline前且ingress version前进才CAS重评，deadline后422，decision到期不遗忘digest。未受理前不产生LLMTier请求。

身份目录来自getAgentCommunicationIdentityBinding/getSessionAgentBindingProjection；RunView只给resolved_bindings_ref和可选communication_attachment。当前提供方依据为finalization.10 commit 4c63380f944e41d0047e9f47340689a182b62fba的受控消费工件；finalization.3仅历史输入。各修订接受见评审目录，整目录追溯仍须完成，不能以本文代替provider签署。

## 6. 备份与恢复

BackupManifest 只引用受限加密对象，不包含 token、checkpoint、Piko payload 或 Tier 内容。事件覆盖清单引用固定游标/事件集合；文件 object_ref 唯一，hash/长度实读核验；增量链同项目/Session、无环且父备份存在，expires_at>created_at。Verified 仅表示指定边界完整，不能证明包含后来消息。Partial 可诊断但不能 ReadOnlyReady。

恢复先核验当前 ACL/删除记录、完整基线/增量、对象 hash 和真实 Matrix/Piko 引用。缺失时 Isolated；ReadOnlyReady 也不能开启执行。新执行使用单独授权的正常 Run admission，不能由 RestoreBackup 返回执行凭证。清理须检查当前策略及 hold，不用备份旧策略恢复权限。30/90天和RPO/RTO保持未批准候选，自动清理不开启。

### 6.1 策略配置与批准

CreateBackup.policy_ref解析到既有项目配置中不可变的BackupPolicy版本，不增加配置文件查找路径。policy_id+version唯一；引用固定该版本，不解析latest。其JSON Schema与生命周期对象共用一个文件。所有字段required，无隐含30/90天默认；配置与时间字段使用整数秒，容量字段使用字节。Secret仅通过storage_binding_ref/encryption_key_binding_ref在服务端解析，不进入备份或View。

| 字段 | 产生/消费及规则 |
|---|---|
| policy_id/version/project_id | 项目配置owner产生，Runtime验证精确项目与版本；版本内容不可变 |
| approval_ref/enabled | approval_ref引用当前有权Operator对该精确版本的批准；enabled=true必须有可核验批准，只有字符串不算授权 |
| schedule_interval_seconds | >=60；既有备份调度的两次计划触发间隔，重启补记漏期，不无限追赶创建多个包 |
| archive_retention_seconds | >=1；仅约束Slinky自有归档内容，自Closed时间计算最早清理时间，不控制Matrix服务器或外部ledger |
| backup_retention_seconds | >=1；由备份created_at计算expires_at，过期是最早清理条件，不等于立即删除 |
| max_backup_bytes/project_backup_budget_bytes | 均>=1，单包上限不得超过项目预算；预算统计完整、Partial及仍被增量引用的对象，物理共享对象不重复计费 |
| max_concurrent_exports | 1..16，项目级上限；配合既有资源准入，不承诺所有项目同时满额可用 |
| rpo_target_seconds/rto_target_seconds | 均>=1；只作为批准设计目标，schedule_interval_seconds不得大于rpo_target_seconds；实际覆盖间隔和恢复时长另记Evidence，不能从配置推导SLA已满足 |
| storage_binding_ref/encryption_key_binding_ref | 当前项目可用的既有受限存储/密钥配置引用；key只允许服务端使用，不序列化密钥值 |
| automatic_cleanup_enabled | true必须enabled且批准明确覆盖清理；未批准配置不启动计划导出或自动清理 |

除Schema单字段约束外，配置激活必须比较单包/总预算、间隔/RPO、当前权限、存储与密钥readiness。无批准、不可解析、跨项目、数值关系不成立一律NotReady；现有业务聊天不因此自动删除或被伪报为已有备份。未配置策略时CreateBackup返回409 RetentionBlocked，备份能力显示未配置；禁止猜测保留期。Operator可批准各部署不同数值，字段及失败语义保持唯一。

### 6.2 导出、预算与清理顺序

Runtime先按同一operation做项目预算/并发预留，再从已授权Matrix边界导出。预估不足或实际流式累计触及上限时停止本次导出，保存Partial、missing_refs及可定位的原operation；不静默截断为Verified，不删除旧包腾空间，不放大预算。重试同operation沿原覆盖边界补齐，引用/hash不变的对象复用原对象；对象内容改变须保留差异并重新核验，不能覆盖已Verified版本。

只有覆盖清单及附件均完成、父增量链完整且当前策略允许时发布Verified。失败释放未使用预留，但已落盘Partial对象仍计入预算，清理须经过同一授权检查。并发与重启复用原预留/operation身份，不能重复占额或因重启忘记Partial占用。

清理逐项检查expires_at、当前批准版本、legal hold、删除基线、父子依赖和未决外部义务引用。子增量仍依赖父包时保留父包或先生成并验证新的独立基线，不能悬空引用；后者是正常CreateBackup，不靠清理隐式运行。未决外部引用独立保留到对账完成，不随聊天正文或备份滚动删除。删除失败记录原operation并安全重试，不伪报已删除；不得调用Tier/Piko ledger删除、replay或cancel。

源Matrix事件redaction/删除后立即执行当前访问限制，旧备份不向普通查询重新暴露正文；包内受限对象由当前删除策略清理或隔离，审计保留内容无关的hash/关系/失效事实。restore持续重验当前ACL与删除版本；权限检查失败即Isolated，不能用备份旧权限覆盖当前权限。

### 6.3 历史导出覆盖判定

[Matrix v1.15 messages](https://spec.matrix.org/v1.15/client-server-api/#get_matrixclientv3roomsroomidmessages)提供分页历史：chunk为空但有end仍可能有后续；无end也可能只是当前用户可见范围结束，不证明全房间历史完整。Slinky因此不把分页结束单独当Verified证据。

同一备份operation固定既有覆盖清单/边界和授权scope，用返回end继续原分页，按event_id去重，不从origin_server_ts推断无缺口。空页有end继续；重复游标、不前进、来源不可用或预算耗尽结束本次导出并保留Partial及missing_refs，不无限循环、不换最新边界重做。分页到可见终点后仍核对要求事件集合、父增量和授权附件bytes/hash；已知缺失或无法证明覆盖时不发布Verified，不扩大用户权限补洞。并发新消息属于下一覆盖边界，redaction/撤权按当前限制处理，不从旧包复活正文。分页token留在原operation的受保护恢复状态，不能当业务引用或写入可移植备份作为恢复凭据。

具体homeserver构建、room version与权限/历史保留配置在现有部署资格记录中固定并实测上述矩阵；不依赖浮动默认。配置或实现不支持所需边界时对应能力NotReady，不能以协议文档存在证明部署可用。此项不新增transport、配置路径或自动重建策略。

## 7. 错误映射

| HTTP 映射 | code | 重试 |
|---|---|---|
| 400 | InvalidRequest、InvalidBindingCombination | 修正输入；不得静默补值 |
| 401/403 | Unauthorized、ScopeDenied | 不换身份绕过 |
| 404 | NotFound、BindingNotFound | 隐藏跨 scope 存在性 |
| 409 | IdempotencyConflict、InvalidTransition、ObligationPending、ArchiveIncomplete、RetentionBlocked、CommunicationBindingMismatch、CommunicationBindingUnavailable、CursorStale | 不自动换key；CursorStale明确刷新整个列表，其余观察原操作或解决守卫 |
| 412 | ResourceVersionMismatch | 重读并由调用者重新确认 |
| 503 | DependencyUnavailable、RestoreIsolated | 保留原 identity；恢复隔离不因重试自动解除 |

Error.retryable 只表达同一操作查询/安全重试资格，不授权新业务。恢复不完整通过 Operation RecoveryRequired+错误引用展示；不能返回 Succeeded+假空备份。

## 8. 一次性迁移清单

| 旧 Piko 项 | 处置 | 当前责任 |
|---|---|---|
| MatrixTransportProfile PUT/GET/Probe、AS身份 provisioning | 保留 | Piko Operator |
| IRCommunicationBinding | 移除 IR/团队语义，替换稳定 Agent identity | Piko 身份配置；Slinky 组织 |
| Session list / element-view | 退役旧 provider 目录 | Slinky VQ-COMM/descriptor |
| Session :close | 退役业务 close；保留自有 revoke/drain 事实 | Slinky execute CloseSession |
| POST /runs collaboration_contract/原子建房 | 删除 | 单 Agent 轻量 Run + 显式 Session binding |
| Piko 团队 ResolutionSummary | 不作团队 authority | Slinky 总结/评审 Work 的接受结果 |

切换版本由双方发布清单一次性绑定，不发布兼容 alias。旧条款只作迁移来源。机器契约候选的静态测试不代表外部 provider 已支持。

## 9. 验证

`tests/unit/design_baseline/test_communication_lifecycle_contract.py` 验证 Schema 正负例、Closed/Unknown 守卫、版本隔离、Topic 状态、归档完整性、只读恢复、幂等回执。它是独立设计 oracle，不导入生产 Runtime，不是新增运行时状态机。执行命令和结果记录在本轮 review evidence；真实成员/外部 ledger/故障注入/容量测量留给实现验收。

## 10. Requirement → Contract → Test

| Requirement | Schema/规则 | 静态 Case | 后续环境 |
|---|---|---|---|
| V03-COMM-106 | RunBindingInput/Attachment/Command | binding_positive/invalid_combinations/errors | Piko admission + Matrix 邀请 |
| V03-COMM-107 | Topic + §4 | topic_action_transfer_archive | Slinky Action/Topic 状态事务 |
| V03-COMM-108 | Session/DrainEvidence/Receipt | closed_rejects_missing_evidence/replay_after_revoke/epoch | 多 Run fencing 与丢响应 |
| V03-COMM-109 | BackupManifest/RestoreResult | backup_negative/restore_never_enables_execution | 授权媒体导出与隔离恢复 |
| V03-COMM-110 | COMM-EXT-01、§6 | readonly_restore/unknown_keeps_original_recovery_phase | 当前删除记录、legal_hold、外部义务保留 |

## 11. Gate 与裁剪

本说明保留 STD contracts.specification 的 scope/catalog/types/state/concurrency/pagination/security/migration/fixture/traceability/gate 内容，章节按操作阅读顺序裁剪：类型在 §2/5/6 与 Schema，分页在 §2，安全在 §1/2/6，状态和错误分别在 §4/7。不增加运行时机制。

已定义：Slinky业务操作及DTO、Runtime/View HTTP映射、快照游标、身份/Session分离、显式trigger、严格关闭、恢复只读、错误和迁移；BackupPolicy数值关系及预算清理守卫；§3.1未知建房不重建和§6.3历史覆盖fail closed。Element Topic显示、Host续验/导航及附件读取遵循集成ADR draft.12，不再列作未定义wire。仍需完成本文件与机器/测试的整体一致性复审。具体部署数值、homeserver/build/room版本资格、浏览器与真实导出/恢复证据是下游配置/实现验证，不改变已定义字段和失败行为；不因静态PASS宣告RT-G08运行激活。

现有 provider 未改前不得发送新 payload；设计文档中旧 heavy/session owner 已移为迁移来源。渲染、静态检查、provider 签署、运行故障/容量测试分别记录。本次只申请候选契约评审，不申请运行激活。
