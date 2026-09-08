# Piko 智能体运行时 Matrix/Element 协作设计草案

> **Superseded (prose scope)：** 本文的 CollaborationBridge mechanism/internal prose 已由
> `docs/design/piko-collaboration-bridge-design-v0.3.md` 与
> `docs/design/piko-collaboration-bridge-internal-design-v0.3.md` 取代。v0.3 OpenAPI、Schema、
> error catalog 与 fixtures 继续承担字段级 authority；本文保留用于历史审计。

版本：v0.3  
状态：Superseded（prose scope）
日期：2026-09-06  
基础版本：`agent-runtime-service-design-v0.2.md`  
冻结输入：Matrix 消息 `S-20260906-df6086da1916`、`S-20260906-1df5563ef488`

## 1. 文档目的与证据边界

本文定义 Piko Agent Runtime 内建 Matrix/Element 协作能力。它是 v0.2 单一
Agent Runtime 的增量设计，不是第二套运行时、兼容接口或外部桥接方案。

本文中的接口和不变式是待跨项目评审的契约草案。Piko 当前仍没有生产实现、
持久化数据库、固定版本的 Pi SDK、Matrix Application Service 或通过的执行测试；
不得把本文视为实现验收证据。

## 2. 已冻结的 v0.3 决定

1. 唯一身份模式为 `ApplicationServiceVirtualUser`；`ManagedUser` 延后，且不是
   运行时 fallback。
2. 每个 `(project_id, ir_id)` 对应稳定、唯一且不包含显示名称的 Matrix User ID。
3. v0.3 只允许 private、non-federated、non-encrypted room。加密房间必须以
   `EncryptedRoomNotSupported` fail closed。
4. 每个 `CollaborationSession` 独占一个 Matrix room；v0.3 不使用共享 room 或 thread。
5. Element 只使用 `ExternalLink`。用户以自己的 Matrix session 打开精确 room，
   Piko 不提供 iframe、自动登录或第二份 transcript。
6. Application Service registration、exclusive namespace 与 token 由 Operator 预配置，
   Piko API 只接收 `credential_binding_ref`。
7. 创建使用 `If-None-Match: *`，更新使用 `If-Match`/`ETag`；所有 mutation 都要求
   `Idempotency-Key`。Body 不重复 `expected_version`。
8. 入站使用 homeserver push transaction。`delivery_checkpoint` 是 Piko 私有状态，
   不进入 Slinky、Skill、Extension 或 PiWorkSession。
9. `POST /runs` 中的 `collaboration_contract` 与 AgentRun、Session、room provisioning
   intent 原子创建或恢复，不增加单独的 Session 创建接口。
10. Session 关闭使用显式 `:close`。v0.3 不允许 participant mutation；成员变化必须
    创建新的 Attempt、Run 和 Session。
11. 同一 Project 可并行存在多个独占 room。Session list 使用 cursor pagination，并按
    status、IR、WorkExecution 和 AgentRun exact filter；分页不得把 room 合并或按标题路由。
12. Team 无法达成一致时，严格 Result 可携带
    `CollaborationResolutionSummary`，完整保留 agreement、disagreement、每个
    participant 的 position/rationale/Evidence 与已尝试的解决动作。
13. Resolution 只陈述 Piko Team execution outcome，不创建 Expert/PM PlannedWork、
    ParticipantActionRequest、用户 Decision、Plan change 或 Artifact acceptance。
14. 用户通过 exact CollaborationSession 获取已有 `ElementConversationDescriptor`，并以
   自己的 Matrix session 打开完整讨论；Piko 不增加 transcript/summary API。
15. Tier model identity 来自 `GET /v1/models` 并保持 exact case。v0.3 Piko generation
    surface 仅为 non-stream Responses、Models 和 Responses recovery；Embeddings 由
    Knowledge/Memory consumer 验证，Chat/SSE 延至 v0.4，且不存在 fallback。

## 3. 权限边界

Slinky Runtime 拥有以下 authority：

- `ir_id`、IR version、`display_name` 和 `display_profile_version`；
- CollaborationContract，包括 participant、route、observer、reply obligation、
  message deadline、创建/关闭 intent 与 retention policy selection；
- WorkExecution、Attempt、Role assignment 和业务验收。
- 是否创建 Expert Work、Project Manager Work 或唯一 ParticipantActionRequest；用户
  Decision、Plan change、Artifact acceptance 及 explicit user constraint 的最终解释。

Piko 拥有以下执行责任：

- Matrix transport profile 的 Operator 配置与 readiness；
- IR 虚拟用户 provisioning、credential resolution 和显示资料 reconciliation；
- exclusive room、精确 membership、消息收发、去重与 durable delivery；
- Session/room mapping、关闭收敛、归档执行、retention enforcement 与审计；
- 无 Secret 的 Element conversation descriptor。
- 每个 Team Run 的结构化 resolution outcome；它只能陈述执行结果和建议下一步。

Matrix transcript 只是 communication Evidence，不是 Project、IR、Run 或工作成功的
authority。Pi AgentSession 不直接持有 Matrix credential、AS token、transaction ledger、
delivery checkpoint 或 room 管理权限。

## 4. 单一路径架构

```text
Slinky Runtime
  -> Agent Runtime API
     -> AgentRuntimeAdapter
        -> Run Coordinator
           -> CollaborationContract validator
           -> CollaborationSession Coordinator
              -> IRCommunicationBinding resolver
              -> Internal Collaboration Bridge
                 -> Application Service transaction ingress
                 -> Durable inbox/outbox + dedup/txn ledger
                 -> Matrix Client/Application Service adapter
              -> Element descriptor projection
        -> Pi SDK AgentSession adapter
           -> normalized CollaborationEvent port
```

`AgentRuntimeAdapter` 是 Slinky 调用 Piko 的唯一入口。Pi 只能通过规范化的内部
CollaborationEvent port 读写当前 Session；不得直接调用 Matrix API。不得接入外部
bridge、Codex task、文件 outbox、poll、heartbeat 或备用 Matrix client。

## 5. MatrixTransportProfile

Operator 通过 versioned singleton 配置：

- `matrix_homeserver_url`；
- `element_web_base_url`；
- 固定的 `ApplicationServiceVirtualUser`；
- Piko Secret boundary 内的 `credential_binding_ref`；
- 固定的 `ExclusiveRoom`、`Forbidden` encryption 与 `Forbidden` federation；
- `allowed_element_origins` 和允许选择的 retention policy reference；
- `enabled`。

接口为 PUT、GET 和 Probe。首次 PUT 要求 `If-None-Match: *`，更新要求当前 ETag。
Probe 只验证配置与外部依赖，不修改 profile、identity、room 或 cursor。Profile 未
Ready 时，依赖该 profile 的 Binding 和新 Run fail closed。

## 6. IRCommunicationBinding

路径固定为：

```text
PUT/GET /projects/{project_id}/ir-communication-bindings/{ir_id}
```

创建或更新时验证 path identity、认证 Client scope、IR reference、transport profile
exact version、display profile version 与 desired status。稳定 identity 使用以下
版本化算法：

```text
input = RFC8785_JCS({
  derivation_version: "piko-ir-mxid/v1",
  project_id: <exact project_id>,
  ir_id: <exact ir_id>
})
digest = BASE32_NOPAD(SHA256(UTF8(input))).lower()
localpart = "_piko_ir_v1_" + digest
matrix_user_id = "@" + localpart + ":" + verified_matrix_server_name
```

使用完整 256-bit digest，不截断。`verified_matrix_server_name` 来自 Probe 验证后的
homeserver，不从调用方 path 或 Element URL 推断。Piko 持久化 derivation version、
canonical input digest 和结果 MXID；显示名称不参与 localpart、幂等键或 routing。
若唯一约束发现同一 MXID 对应不同 canonical input，返回 `MatrixIdentityCollision`，
不得加随机后缀或切换算法。

必须同时保持：

- `(client_id, project_id, ir_id)` 唯一；
- `matrix_user_id` 唯一；
- 同一个绑定的 `matrix_user_id` 创建后不可变；
- `display_profile_version` 只能单调增加；
- `Active`/`Suspended` 不删除 identity、room、membership 或 history。

Rename 只更新 materialized display profile，并建立耐久 reconciliation obligation。
Matrix 更新暂时失败时，Binding 返回阻塞原因或降级 observation，不得换发新 MXID。

内部生命周期为：

```text
Nonexistent -> Provisioning -> Active <-> Suspended
                    |             |          |
                    +------> ReconciliationRequired
```

公开 `status` 仍只有 `Active|Suspended`；`Provisioning` 和
`ReconciliationRequired` 通过 operation outcome、readiness 与 `blocking_reasons`
表达，不扩展 Slinky 的公开状态枚举。创建先耐久写入稳定 identity intent，再执行
Application Service provisioning；外部结果不明时，同一 Idempotency-Key 重试只能恢复
该 intent。v0.3 不提供删除 Binding。`Suspended` 禁止新 Run admission、新出站消息和
Agent wakeup，但仍耐久接收已存在 Session 的入站事件并允许 close/recovery 收敛。

## 7. AgentRun 与 CollaborationContract

`AgentTaskRequest.collaboration_contract` 至少包含：

- 固定 `mode=ExclusiveRoom`；
- contract identity/version 与 exact transport profile/version；
- participant IR references、observer binding references；
- allowed participant routes、reply requirements、message deadlines；
- routing policy 与 retention policy reference；
- 固定 `close_policy=RuntimeIntent`。

Admission 必须确认每个 participant Binding 为 Active、transport profile exact version
Ready、retention policy 已被 Operator 允许，且所有 route、observer 和 reply obligation
只引用本 contract 的对象。

Run identity、Attempt index、idempotency record、CollaborationSession、exclusive-room
provisioning intent 与初始 delivery obligation 必须在同一 durable transaction 中建立。
外部 room 创建发生在事务提交后，并使用稳定 provisioning key 恢复；重复 Run dispatch
只能得到同一个 Run、Session 和 room。

room provisioning 固定使用 private visibility、private-chat preset 和
`creation_content.m.federate=false`，不写入 `m.room.encryption`。初始 invite/membership
集合必须精确等于解析后的 participant MXID 与已允许 observer identity；不得通过显示名称、
room alias 或 homeserver directory 补全成员。创建后必须读取并验证 room state、membership、
`m.federate` 与不存在 encryption state，验证成功前 Session 不进入 `Active`。一个 room ID
只能映射一个 CollaborationSession；检测到既有或后来写入的 `m.room.encryption` 时立即停止
新发送和 Agent wakeup，并返回 `EncryptedRoomNotSupported`，不得迁移到另一个 room。

## 8. CollaborationSession 生命周期

```text
Provisioning -> Active <-> WaitingForReply -> Closing -> Closed
       |             |              |             |
       +----------> Unavailable <----+-------------+
```

- `Provisioning`：内部状态；尚不能返回可打开的 Element descriptor。
- `Active`：允许 contract 内的新消息和 Agent wakeup。
- `WaitingForReply`：存在未完成且未过 deadline 的 reply obligation。
- `Closing`：停止新发送和 Agent wakeup，收敛 durable inbox/outbox obligation。
- `Closed`：完成归档执行并应用 retention policy。
- `Unavailable`：依赖、membership 或一致性问题导致当前不可用，不代表历史已丢失。

关闭命令必须带 `Idempotency-Key` 与当前 Session ETag。重复关闭返回同一 close outcome。
存在未决 delivery 时返回 pending count 和 blocking reason；不得虚报已 Closed。

## 9. ElementConversationDescriptor

Piko 提供 Project CollaborationSession list，以及：

```text
GET /projects/{project_id}/collaboration-sessions/{id}/element-view
```

Descriptor 只包含 exact room、Element route、Run/WorkExecution/Attempt reference、参与者
显示信息和当前状态。固定 `open_mode=ExternalLink`、`access_mode=UserMatrixSession`、
`allowed_embed_origin=null`。

Descriptor 禁止包含：access token、AS token、credential、device key、encryption key、
delivery checkpoint、自动登录材料或 transcript 副本。`element_route` 只能由已批准的
Element base URL 和精确 Matrix room ID 构造，不能接受调用者提供的任意 URL。

### 9.1 多 room 列表与稳定分页

同一 Project 可以同时存在多个 active、waiting、closing 或 historical Session；每个
Session 仍独占一个 room。列表支持 `cursor`、`limit`，以及 `status`、`ir_id`、
`work_execution_id`、`agent_run_id` exact filter。过滤在 Client/Project authorization
之后执行，组合条件使用逻辑 AND。

分页使用稳定 keyset cursor。cursor 至少绑定 Client、Project、filter digest、查询
snapshot upper bound、排序键和过期时间，并由 Piko 签名；调用方不能修改或跨 filter
复用。排序固定为 `last_message_at DESC NULLS LAST, collaboration_session_id ASC`。
在同一 cursor snapshot 内，并行 room 的新增消息不会导致已返回 item 重复或跳过；
snapshot 后新建的 Session 由下一次无 cursor 查询看到。无效、过期或 scope 不匹配的
cursor 返回 typed error，不回退到第一页。

每个 summary 至少返回 Session identity/version、AgentRun、WorkExecution、Attempt、
participants、status、`last_message_at`、blocking reasons 和最新 resolution reference。
可以保留 exact room ID、retention 与 pending-delivery observation，但禁止 Matrix message
body、transcript 摘要、Stage、PlannedWork、room attention 或 ParticipantActionRequest。
后五类 Project/View 字段由 Slinky 使用 exact refs 本地组合。

### 9.2 CollaborationResolutionSummary

当 Team 有结构化 resolution outcome 时，Piko 把可选
`CollaborationResolutionSummary` 写入严格 `AgentTaskResultV03`。该对象包含：

- exact resolution 与 CollaborationSession reference；
- `Resolved|NeedsExpert|NeedsProjectManager|NeedsParticipantDecision|Blocked`；
- agreed points、disagreement items；
- 每个 participant 的 position、rationale 和 Evidence reference；
- attempted resolution references、聚合 Evidence 与 recommended next step。

参与者 position 集合必须与当前 CollaborationContract 的 participant IR 集合精确相等；
不得遗漏少数立场，也不得从多数票、最后一条消息或 transcript 自动推导 resolution。
所有 Evidence 都必须是已有、可授权读取的 exact reference。`recommended_next_step` 是
非权威建议；Piko 不把它执行成 Expert/PM Work、ParticipantActionRequest、用户
Decision、Plan change 或 Artifact acceptance，也不得用多数票覆盖 explicit user
constraint。

### 9.3 用户决策与完整讨论

当 resolution 为 `NeedsParticipantDecision` 或 Slinky 需要用户裁决时，Slinky 使用
summary 中的 exact `collaboration_session_ref` 调用既有 `element-view`。Piko 只返回
`ExternalLink + UserMatrixSession` descriptor；descriptor source 不可用时显式返回
`ElementConversationSourceUnavailable`，禁止伪造 URL、返回缓存 transcript、代理登录或
降级为 iframe/token URL。

## 10. Matrix transport 与 durable delivery

Application Service transaction ingress 的处理顺序：

1. 验证真实 homeserver/AS binding 与 transaction envelope；
2. 验证 room、sender MXID、Session、participant route 和 membership；
3. 在一个事务中写入 Matrix event ID 去重记录、规范化 Event、delivery obligation 和
   transport-owned checkpoint；
4. 事务提交后才确认 homeserver transaction；
5. 独立 worker 按 obligation 唤醒或投递给当前 Pi AgentSession。

出站在持久化 outbox 与稳定 Matrix `txn_id` 后才能调用 homeserver。HTTP 结果丢失时
复用相同 `txn_id`，不能生成新消息。Event ID、transaction ID 和业务 message identity
分别去重，不互相替代。

单写者使用 lease 与 fencing token。失去 lease 的实例不得继续确认入站 transaction、
发送 outbox 或推进 Session version。

## 11. 重启与故障恢复

重启后按以下顺序恢复：

1. 获取新的 writer lease/fencing token；
2. 校验 profile、credential binding reference 与 schema version；
3. 恢复未确认 AS transaction 和 event dedup；
4. 恢复未完成 outbox，保持原 `txn_id`；
5. 恢复 Session delivery/reply/close obligation；
6. 恢复 rename、membership、archive 和 retention reconciliation；
7. 仅在 exact scope Ready 后恢复 Agent wakeup 和新发送。

credential rotation 不改变 IR MXID、Session 或 room。checkpoint 损坏、ledger 不一致或
writer ownership 不可证明时必须停止推进受影响 scope，并公开结构化 blocker。

## 12. 安全设计

- 只允许 HTTPS homeserver 与 Element URL；禁止 loopback、link-local、未批准重定向和
  DNS rebinding 后落入受限地址，测试环境例外也必须由独立 Operator policy 明示。
- room 创建时固定 private、non-federated、non-encrypted；加入已加密 room 或检测到
  `m.room.encryption` 时返回 `EncryptedRoomNotSupported`。
- participant/observer membership 必须来自 exact contract 与 Operator catalog；显示名称
  不授予权限。
- 所有日志、错误、descriptor 和 audit projection 均脱敏。
- Slinky 与 Pi 不得读取 AS token、credential、device material、checkpoint 或 ledger。
- v0.3 不产生或保管 E2EE device key；未来 E2EE 必须另行设计和迁移评审。

## 13. 接口并发与错误语义

- mutation 同时要求业务幂等与资源版本前置条件；两者用途不可互换。
- 首次创建缺少 `If-None-Match: *` 或更新缺少 `If-Match` 时返回前置条件错误。
- stale ETag 返回 `412 ResourceVersionMismatch`。
- create collision 返回 `412 ResourceAlreadyExists`。
- 相同幂等键配不同 canonical request digest 返回 `409 IdempotencyConflict`。
- 隐藏、无权和不存在的跨 scope 资源统一按授权策略返回不可枚举的 NotFound。
- unsupported identity、room topology、encryption、federation 或 embed policy 均 fail closed。

## 14. 验证计划

### Unit

- 稳定 MXID 派生、碰撞检测、同名 IR 隔离；
- ETag、If-None-Match、Idempotency-Key 和 canonical digest；
- rename 单调性及 identity/session/history 不变；
- route、membership、reply obligation 和 deadline；
- descriptor 与日志 Secret 扫描；
- event ID、AS transaction 和出站 `txn_id` 三层去重。

### Contract

- Profile PUT/GET/Probe；
- Binding PUT/GET；
- Run 中 collaboration contract；
- Session list、element-view 与 `:close`；
- 所有正负错误、ETag 和幂等重放 fixture。
- 多 room cursor pagination、四类 exact filter 与跨 filter cursor 拒绝；
- resolution Schema 正负样例、所有 participant position 完整性与 authority overflow 拒绝。

### Recovery

- 入站落盘前/后 crash 与 transaction replay；
- 出站提交前/后 crash、response loss 与同 txn retry；
- checkpoint 损坏、credential rotation、rename 部分失败；
- writer lease 过期、双实例竞争与 fencing；
- Closing 中重启、pending delivery 收敛与 archive 重放。
- 并行 room 更新期间分页 snapshot 恢复，以及 latest resolution reference 的单调恢复。

### Security

- 跨 Client/Project/IR/Session 越权和资源枚举；
- 非成员 sender、伪造 route、过期 Binding；
- 加密、联邦、shared-room/thread 和 iframe 请求 fail closed；
- homeserver/Element URL SSRF 与 redirect；
- API、日志、descriptor、Evidence 与 audit 中的 Secret 泄漏。
- list 不包含 Matrix message body/transcript；少数立场与冲突 Evidence 不丢失；
- `NeedsParticipantDecision` 不创建或执行 Slinky-owned action。

### E2E

覆盖 Slinky `V03-E2E-093..099`：profile/binding 并发与身份、rename/同名隔离、
ExternalLink/unsupported policy、transaction/txn/checkpoint/writer failover、多 room
分页与 exact route、resolution/少数立场保留、用户 decision descriptor 与越权阻断。

## 15. 实现门槛与未决项

以下项目不阻塞草案评审，但在实现或 activation 前必须关闭：

- 已固定 Pi SDK package/version；AgentSession collaboration hook 仍需实测；
- Operator retention policy catalog 的完整 Schema 与实际时长；
- Matrix homeserver/Application Service 支持版本与 Probe 判定；
- 规范化 CollaborationEvent、route、reply deadline 的 machine-readable fixture；
- room membership/invite、archive 与 retention 的失败重试期限；
- Element route 的规范编码和目标版本兼容测试；
- Matrix transport 容量、backpressure 与 SLO profile。

完整记录见 `docs/qa/agent-runtime-contract-qa-v0.3.md`。

## 16. 非目标

- ManagedUser、身份模式自动切换或 fallback；
- E2EE、federation、shared project room 或 Matrix thread；
- iframe、自动登录或 Piko 代持用户 Element session；
- 独立 Session create endpoint 或 participant mutation；
- 外部 bridge、Codex task、文件 outbox、poll 或 heartbeat；
- 为虚拟用户运行普通 Matrix Client `/sync`；
- 把 transcript、display name、room alias 或 Element title 当作 routing authority；
- 声称已完成 production implementation、security verification 或 release。
