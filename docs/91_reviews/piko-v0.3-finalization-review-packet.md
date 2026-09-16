# Piko V0.3 Finalization Review Packet

| 字段 | 值 |
|---|---|
| Package ID | `piko-v0.3-finalization` |
| Package Version | `0.3.0-finalization.9` |
| Status | Review；runtime activation=false |
| Authority | Piko |
| Request | `S-20260916-191ab7c8184c` |
| Machine authority | `interfaces/openapi/agent-runtime-openapi-v0.3.yaml` + JSON Schema + error catalog |
| Hash manifest | `docs/91_reviews/piko-v0.3-finalization-manifest.json` |

## 1. A 类跨系统设计结论

Piko-owned跨系统字段或行为没有遗留到联调再决定。四项Run API、全部请求/响应/错误、ClientTaskIndex、
7天恢复、404/410、workspace/tool/agent/session binding、identity provisioning、invite核验、revoke/drain、
communication trigger、产品消息send/receipt/event/ingress、release/strict close组合和旧wire删除版本均已定义。
Pre-admission rejection使用不可变`decision_first_created_at`，保留至
`max(request.deadline_at,decision_first_created_at)+7d`；合法重评在同一serializable事务重新检查
ClientTaskIndex、完整dispatch tuple、当前projection/权限/model/workspace/tool/capacity，并以unique/CAS保证
两个不同key暂拒同一task后并发重评最多产生一个Run/intent/claim。

Finalization.5关闭机器一致性复审三项：Schema用条件约束拒绝Unclassified却可dispatch、Sent缺Matrix
事实、Queued提前带Matrix事实及Failed+AgentFinished；13项HTTP operation补齐401/403、createRun 410、
GET/PUT ETag及配置PUT唯一create/update前置条件矩阵；产品消息唯一编码为
`m.room.message + content.io.piko.agent.message`，并冻结body/reply/sender/room/附件与分类规则。
Finalization.6补齐三个配置PUT在exact strong If-Match更新目标不存在时的机器404 NotFound响应，并增加
`put-precondition-update-missing-resource`负例，明确不得隐式创建资源；其余finalization.5语义不变。
Finalization.7关闭Element消费的两项A类缺口：同一provider增加受控附件上传与按exact
message/SID/attachment读取，要求Slinky当前授权、Piko delegated scope及viewer当前room membership同时成立；
不提供content_ref直查、URL/token或Client级列表。另将`ProductMatrixRoomMessageEvent`固定为六字段受控投影，
raw homeserver event允许`unsigned`等标准外层字段，但非message state event及sender/room不一致一律拒绝。
Finalization.8精确冻结附件摘要、retention和条件读取：logical digest使用domain prefix、uint64 metadata
长度、JCS metadata UTF-8与actual content SHA-256原始32字节再哈希；同key异digest 409优先于完整性422。
tombstone只从实际`bytes_deleted_at`起算30天，blocker推迟删除；读取先核验当前授权/membership/link和
redaction/retention，最后才判断ETag，因此撤权/410/404不能被304覆盖。

Finalization.9关闭用户批准的DF-13/14设计范围。DF-13提供只读、Client-scoped且非预留的
ExecutionCapacitySnapshot；unit固定为`piko_concurrent_agent_run`，解析唯一execution class/version，
同一snapshot返回direct、全部shared/overlapping constraints与quota，Unknown/Partial/过期fail closed。
只有POST /runs受理事务可原子创建quantity=1的execution claim；Queued即Held，429/503无claim，重放和
重启不重复。逐participant的202+Held claim齐备才是完整backing，部分受理不能冒充Team完整或回滚业务事实。

DF-14以`PikoTrustedInputBroker`为唯一可信producer，冻结对象版本/hash/size/byte-range事实、安全派生的
系统证据路径、writer fence→generation→证据artifact/digest→AgentResult原子发布顺序及至少
`max(request.deadline_at,result.published_at)+7d`的bytes窗口。Complete只表示记录器完整，不证明Slinky
所需材料集合覆盖或模型理解；Agent自述、stdout、普通日志和execution_log_ref均不构成覆盖证据。

LLMTier语义消费固定为Amendment 8：三位毫秒deadline header、digest、408优先于缓存429、无ID原POST恢复、
单调用到期即停止Run新业务、晚到成功仅作Evidence、non-stream Responses/Models/recovery/tool-loop且无
Chat/SSE/fallback。当前LLMTier目标已更新为`0.3-finalization-candidate.2`，commit
`57aacfa1fa58cf4e98370281b73d861572e59b53`、OpenAPI SHA-256
`67eee679a2fea478e10fae158a8aed36f081663738e1a36be709cbd7b57dbce9`。固定批次只提供这些标识，未携带
OpenAPI/compatibility manifest/fixture机器字节，本项目也无其授权消费副本；Piko未复算或完成
candidate.1→candidate.2差异审查。状态是“candidate.2目标标识已知、机器内容待Matrix交付”，不冒充签署。

## 2. 一次性退役

从 `0.3.0-finalization.9` 起删除v0.2 heavy request/result、participants/team/collaboration resolution、
`runs:by-attempt`、manual reconcile、Run SSE、Piko Session list/element-view/:close、原子建房
`collaboration_contract`及旧嵌套`bindings`。不提供alias、转换器、双写或runtime fallback。

## 3. B 类内部下游设计

durable DB/HA/DDL、worker排程实现、Pi hook、workspace/tool sandbox和部署拓扑由Piko内部继续设计；
不得修改A类字段、状态、错误、digest、retention或authority。

## 4. C 类联调与激活证据

真实LLMTier SDK capture、Matrix/Element/AS、Pi、Tool/Workspace、crash/failover、安全/retention、性能与
RPO/RTO仍未执行。失败只能保持activation=false，不能恢复旧wire。

## 5. 验证摘要

- `python3 tests/contract/validate_v03_contract.py`：exit 0；36 Schema case、77 semantic case、16 path、43 error。
- 四个消费者反例均被Schema拒绝；raw Matrix root/reply正例与reply/version负例通过；配置PUT create/update/
  缺头/双头/wildcard/stale oracle均由validator核验。
- 附件上传/读取、大小与摘要、单消息绑定、参与者授权、保留/tombstone以及raw event投影、sender/room/state
  负例均由validator核验；真实homeserver与浏览器访问仍为C类联调证据。
- 附件摘要golden vector由validator按domain-separated preimage重算；撤权/redaction/过期+匹配ETag和
  actual-deletion起算的半开30天tombstone边界均有静态oracle。
- DF-13 fixture覆盖shared pool不重复计数、snapshot竞争、N participant部分受理、202丢响应、claim Unknown、
  restart、release/drain/Tier独立及过期/越权；DF-14覆盖安全路径、range并集、空文件、metadata-only、
  changed/unmediated、profile能力、Unknown执行、发布故障与证据窗口。
- Draft 2020-12 Schema check、全部interfaces JSON parse、OpenAPI YAML parse：exit 0。
- Piko-owned DF-13/14字段与语义无“实现时再确认”；唯一外部输入是LLMTier candidate.2机器正文，用于复算
  已知hash与差异审查，明确留在baseline binding gate，未转移到联调。
- 仅用项目内`docs/std.lock.json`与`docs/std-source-manifest.json`核验8个本包metadata：7个template hash
  与锁定draft.21一致；`design.system`文档已采用4.0.0/hash `ec2800...`，与lock内旧hash `96d14...`
  不一致，明确列为STD迁移项。未跨仓读取、未擅自升级项目STD lock，也不宣称全部STD校验通过。
- 系统Git被本机未接受Xcode license阻断（exit 69）；使用Codex runtime fallback Git执行diff/check/status与
  本地review commit，不推送。

## 6. 评审判定

请求Slinky/LLMTier只审A类跨系统契约；B/C不作为设计冻结阻塞，但保持runtime activation=false。
若A类无字段矛盾，下一计划阶段为各方内部下游设计，之后按本包唯一wire联调。
