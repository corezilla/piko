<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Communication Provider 内部定义

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-collaboration-bridge-internal-design-v0.3` |
| Document Version | `0.4.0-draft.2` |
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
| TriggerResolver | Run request + ingress event | consumption key ledger | exact room/identity/boundary；不猜最新消息 |
| RunAttachmentStore | admitted Run + projection | immutable route snapshot、wakeup epoch/status | 同Run唯一attachment；epoch单调 |
| RevocationCoordinator | operation/version/key | revoke receipt、fence generation | 新wakeup/admission/权限获取同时阻断 |
| DeliveryDrainer | inbox/outbox/remote evidence | obligation状态、counts、unresolved/isolated refs | Drained不等于Session Closed |
| RecoveryWorker | lease/fencing + ledgers | recovery attempt/audit | 原identity/key/txn恢复；Unknown不盲重派 |

## 2. 事务边界

Run admission按credential visibility、existing receipt、conflict、deadline、projection lease/version/status、trigger
fact顺序检查，再原子写：IdempotencyRecord、ClientTaskIndex、Run、resolved binding snapshot、可选
RunCommunicationAttachment、完整dispatch tuple/trigger consumption key、resource claim和原202 receipt。
admission与revoke以同一projection record做CAS；commit前无Pi/LLMTier/Tool/Matrix外呼。

AS ingress事务原子写：transaction ledger、event record、event-id dedup、delivery obligation和delivery checkpoint；提交后才ACK homeserver。Outbound在首次发送前持久化stable txn_id，retry不生成新txn。

Revoke事务原子写：operation receipt、binding version/status、new-admission fence、permission-acquisition fence、wakeup epoch fence。Matrix membership请求在事务后异步，不能回滚本地撤权。

## 3. Trigger与消费去重

消费键：`(client_id, session_binding_ref, trigger_event_id, agent_identity_ref, dispatch_ref)`；dispatch ledger另
保存不可变`client_task_id+session+event+agent`tuple。同dispatch变tuple为TriggerMismatch；同task换dispatch为
ClientTaskConflict。相同Matrix event只有Slinky显式新dispatch+client_task_id时可用于另一Agent/Run；
Piko ingress/retry从不生成dispatch。

ingress暂未出现时不预占Run/ClientTaskIndex，但保存rejection digest/decision并返回可恢复404；调用方保留
原key/body。若event在deadline前到达，同请求以record-version CAS重评；若deadline已到且无Run，统一
DeadlineExpired，优先于trigger/binding失败。迟到event不使原请求复活。decision至少保留至
`max(deadline_at,accepted_at)+7d`，不伪造event。

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
