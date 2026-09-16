<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Communication Provider 内部定义

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-collaboration-bridge-internal-design-v0.3` |
| Document Version | `0.4.0-draft.8` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Architecture Owner |
| Authors | corezilla |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-16` |
| Template ID | `design.definition` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/30_subsystem_design/piko-collaboration-bridge-internal-design-v0.3.md` |
| Supersedes | none |
<!-- STD_DOCUMENT_COVER_END -->

> Parent为 `piko-collaboration-bridge-design-v0.3`；runtime activation=false。

## 1. 内部分解

| 模块 | 输入 | 持久状态 | 输出/不变量 |
|---|---|---|---|
| TransportProfileStore | Operator profile/ETag/key | singleton profile/version | Secret只以credential binding ref出现 |
| IdentityProvisioner | client/project/agent/display | stable identity map、rename ledger | stable MXID；display不参与route |
| SessionProjectionStore | Slinky binding/version/lease | exact session/room/agent/status/valid_until | 不取得Session authority；Active且lease有效才admit |
| ApplicationServiceIngress | AS transaction | txn/event/dedup/delivery obligation/checkpoint | 原子落盘后ACK；checkpoint私有 |
| MatrixEventProjector | raw homeserver event + binding | raw evidence ref、六字段受控投影 | 非state message、exact sender/room；产品content严格校验 |
| ContentStore | multipart metadata+bytes | domain-separated digest、bytes、binding CAS、redaction、actual-deletion tombstone | 64MiB单项；exact message读取；无URL/token |
| TriggerResolver | Run request + ingress event | consumption key ledger | exact room/identity/boundary；不猜最新消息 |
| RunAttachmentStore | admitted Run + projection | immutable route snapshot、wakeup epoch/status | 同Run唯一attachment；epoch单调 |
| RevocationCoordinator | operation/version/key | revoke receipt、fence generation | 新wakeup/admission/权限获取同时阻断 |
| DeliveryDrainer | inbox/outbox/remote evidence | obligation状态、counts、unresolved/isolated refs | Drained不等于Session Closed |
| RecoveryWorker | lease/fencing + ledgers | recovery attempt/audit | 原identity/key/txn恢复；Unknown不盲重派 |

## 2. 事务边界

Run admission按credential visibility、基础解析/JCS digest、key record lookup、digest compare、record kind、
task/dispatch conflict、deadline、projection lease/version/status、trigger fact顺序检查。只有相同digest的
AcceptedRun可直接返回existing receipt；RetryableRejection不是receipt。随后原子写：IdempotencyRecord、ClientTaskIndex、Run、resolved binding snapshot、可选
RunCommunicationAttachment、完整dispatch tuple/trigger consumption key、resource claim和原202 receipt。
admission与revoke以同一projection record做CAS；commit前无Pi/LLMTier/Tool/Matrix外呼。

AS ingress事务原子写：transaction ledger、event record、event-id dedup、delivery obligation和delivery checkpoint；提交后才ACK homeserver。Outbound在首次发送前持久化stable txn_id，retry不生成新txn。

Outbound codec在稳定txn持久化后生成`m.room.message`：顶层`msgtype=m.text`、body逐字节复制，
`io.piko.agent.message`扩展由outbox canonical request与exact projection生成；event_id/server timestamp字段只在
homeserver响应后写入。Reply先由SID索引解析父Matrix event并校验同room/topic，再生成唯一
`m.in_reply_to`；不生成thread/edit关系。Ingress先校验外层sender/room，再校验extension/body/reply/附件元数据；
缺extension归Unclassified，存在但非法归Rejected，均写ledger但不产生dispatch资格。附件解析使用content store
ACL快照与当前authorization交集，hash/size不符不得发送或分类为valid。

配置PUT的事务分支只接受一个条件头：`If-None-Match:*`创建或exact strong `If-Match`更新。条件组合在读取/
写入前判定；更新CAS失败412，成功的200/201与新strong ETag在同一事务提交。GET先做credential/scope，
再检查current授权/membership、exact link、redaction和actual-deletion tombstone，最后才比较If-None-Match，
避免通过304/404/410泄露资源存在。tombstone时钟只从`bytes_deleted_at`开始，blocker未清零不删除bytes。

Revoke事务原子写：operation receipt、binding version/status、new-admission fence、permission-acquisition fence、wakeup epoch fence。Matrix membership请求在事务后异步，不能回滚本地撤权。

## 3. Trigger与消费去重

消费键：`(client_id, session_binding_ref, trigger_event_id, agent_identity_ref, dispatch_ref)`；dispatch ledger另
保存不可变`client_task_id+session+event+agent`tuple。同dispatch变tuple为TriggerMismatch；同task换dispatch为
ClientTaskConflict。相同Matrix event只有Slinky显式新dispatch+client_task_id时可用于另一Agent/Run；
Piko ingress/retry从不生成dispatch。

ingress暂未出现时不预占Run/ClientTaskIndex，但保存RetryableRejection digest/decision与不可变
`decision_first_created_at`并返回可恢复404；调用方保留原key/body。若event在deadline前到达，同请求以
record-version CAS重评；若deadline已到且无Run，统一DeadlineExpired，优先于trigger/binding失败。迟到event
不使原请求复活。decision至少保留至`max(request.deadline_at,decision_first_created_at)+7d`。
`decision_first_created_at`由Piko durable clock首次写入，重评/重启不得推进；decision到期不删除key→digest
binding，重启恢复同一record/version/首次时间，不伪造event。

CAS重评在一个serializable transaction内重新读取并锁定ClientTaskIndex与TriggerDispatchIndex，校验完整tuple、
当前projection lease/version/status、权限、exact model、workspace/tool和capacity，再以unique constraints原子写
Run、索引、snapshot、claim与原202。两个不同key的暂拒record指向同一client_task_id时，最多一个winner；
loser返回ClientTaskConflict且不产生第二Run/dispatch intent/claim。

## 4. Wakeup与writer fencing

每个SessionAgentBinding拥有单调`wakeup_epoch`。RunAttachment保存受理时epoch；event delivery必须同时匹配Client、Session、room、identity、binding version、epoch和边界。revoke/close推进epoch，所有旧attachment失去唤醒资格。

writer fence由workspace lease generation控制；Agent/Tool child必须持当前generation写入。release推进generation并撤销进程/句柄。late外部结果只可更新隔离obligation record，不能修改workspace或Result generation。

## 5. Release证据

`execution_released=true`要求：

1. Agent supervisor不可再次调度；
2. Tool child已终止，或被OS/sandbox证明无授权workspace写路径；
3. workspace writer lease/fencing generation已推进；
4. Run wakeup epoch已fence；
5. 所有已知可能写入的外部回调被终态确认或路由到只写obligation ledger的quarantine；隔离引用继续
   出现在DrainView并使其RecoveryRequired，直至义务终态。

该结论不改变LLMTier Invocation/Seat、Matrix membership、Piko drain或Slinky Session状态。

## 6. Restart

新实例先取得lease/fencing，再恢复profile、identity、session projections、idempotency/client-task index、Run/attachment、txn/event/outbox/inbox/revoke/drain ledgers。先查询远端权威状态，再推进原obligation；不得从日志或时间推断terminal。旧writer和旧epoch始终拒绝。

## 7. 数据表候选（内部B类设计）

建议唯一键：`idempotency(client,endpoint,key)`、`client_task(client,client_task_id)`、`identity(client,project,agent_identity_ref)`、`mxid(matrix_user_id)`、`session_binding(client,session_binding_ref)`、`event(room_id,event_id)`、`trigger_consumption(client,session,event,agent,dispatch)`、`run_attachment(run_id)`、`revoke_operation(client,session,operation_id)`、`outbound_txn(txn_id)`。

具体数据库产品、DDL、索引和分区属于Piko内部下游设计，可独立推进但不能改变外部wire、去重scope或retention语义。

## 8. Observability与Secret

指标仅暴露counts/age/status，不以原始高基数ID作label。Audit记录operation、version、outcome和Evidence ref，不含token、device key、checkpoint、prompt/transcript或credential。诊断导出遵守Client/Project scope。

## 9. Verification

单元/contract验证组合规则、消费键、stale version、revoke fence、drain状态和secret absence；recovery验证txn/outbound/restart/old-writer；E2E验证真实AS invite、同event多Agent、late event、partial revoke和strict close。实现证据未完成前activation=false。
