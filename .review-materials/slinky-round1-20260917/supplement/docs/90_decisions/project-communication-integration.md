<!-- STD_DOCUMENT_COVER_BEGIN -->
# 项目内 Element 通信视图集成决定

| 文档字段 | 值 |
|---|---|
| Document ID | `slinky-project-communication-integration` |
| Document Version | `0.3.0-draft.13` |
| Status | `Draft` |
| Project | `slinky` |
| Authority | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Authors | `Codex` |
| Created Date | `2026-09-09` |
| Last Modified Date | `2026-09-16` |
| Template ID | `decisions.adr` |
| Template Version | `0.1.0` |
| Template Conformance | `native` |
| Tailoring Reference | `none` |
| Migration Map Reference | `none` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/90_decisions/project-communication-integration.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_COVER_END -->

- Status: proposed（产品方向与最小导航补丁已获用户批准；Host跨方边界已限定接受，整体一致性审计与下游构建验证分开记录）
- Date: 2026-09-09
- Decision owners: Slinky Product/Runtime/WebUI owner；Piko 为外部接口 owner
- Supersedes: 旧 ExternalLink-only 产品限制；不单方面改写已冻结的 Piko machine contract

## Context

用户要求把已有四个 View 统一为顶部导航，并在 Communication 页内查看、参与 IR 讨论，而非另做一套 Chat 页面。Matrix homeserver 可能承载多个项目及其他客户端；Slinky 当前项目不能展示其他项目的 room。用户作决定时需要分歧摘要和原始讨论上下文。

先前 Piko descriptor 只保证 ExternalLink/UserMatrixSession，不支持据此推断任意 iframe。页面内 Element demo 已作为可行性输入；其静态计划/资源数据和本地部署不属于生产证据。

## Decision Drivers

复用 Element 原生 timeline/composer、用户自己的 Matrix 身份和同一份实时历史；保持 Slinky/Piko/Matrix 各自 authority。项目过滤、授权、切换与错误必须可验证；受限归档只用于证据与恢复，不作为第二实时 transcript 服务，不做万能 relay、登录代理或另一套 Team Chat。

## Considered Options

- 旧方案：只 external link。不能满足用户要求的项目页内对话，不再是目标方案。
- 自建 Slinky transcript/composer：重复 Matrix/Element 的状态与安全逻辑，不采用。
- 在既有 Shell 内承载受控 Element Web 原生 RoomView：采用目标；具体宿主、module API 和安全配置需 G1 冻结。

## Decision

### 1. 页面与边界

顶层固定为 Stage Process / Project Plan / Resources / Communication。Communication 的 Conversation tab 内是当前项目 room directory、选中房间原生 Element RoomView 和工作/决策 context；其余 tabs 为 Needs Response、Progress Reports、History。窄屏按 directory -> room -> context 导航，不让第二全局侧栏挤压内容。

内嵌客户端与独立 Element 都向同一 Matrix room 读写原生事件；独立 Element 是用户可另行使用的客户端，不是 Slinky 遇到嵌入错误时自动切换的 fallback。禁止以自建摘要/聊天转发服务替代无法打开的 RoomView。

### 2. Project 与 Room

Slinky 拥有 project_id、CollaborationSession/Topic、exact room_id 映射及成员生命周期决策，负责创建房间、邀请、关闭、归档与备份编排。Piko 提供稳定 Agent Matrix 身份，确认加入、执行绑定及收口事实。每个协作 Session 独占一个 room；一个 project 可有多个 Session/room，一个 Session 可有多个业务 Topic。不根据名称、room alias、展示 topic 或 Matrix 全量目录猜测归属。

查询顺序为：验证 Slinky principal/project permission -> 查询 Slinky Session 映射 -> 返回非 Secret directory projection -> 用户选中 exact session -> 校验当前 project/session/binding version -> 获取经 review 的 Element descriptor -> Element 以用户自己的 Matrix session 访问该 room。URL 中传入其他 project/room_id 不能绕过此链。

Room directory 投影自 Slinky 唯一 Session 业务记录，Piko 保存的是执行绑定，不建立第二项目房间 Registry。删除/归档项目按 Slinky 的 membership、retention 与 history 策略执行，不以隐藏目录代替撤权。2026-09-16 用户确认该所有权调整；原 Piko provisioning/目录契约需一次性修订，不并行保留两个 owner。完整状态、流程、备份范围与设计 gate 见系统设计 §7.4.3–7.4.4、§8.3.1。

### 3. 浏览器隔离与打开/切换流程

生产实现使用受控独立origin承载Element module及原生RoomView，token保留在该origin。官方Module API的builtins.renderRoomView被标为alpha；模块装载存在不等于跨origin宿主握手或项目隔离已被上游实现。用户2026-09-16批准最小导航隔离补丁：在已核对revision 52c6d24dbb756118ec07fd405b3e681b7e96cc6c上对现有导航提交/渲染路径统一执行exact room守卫，覆盖下表八类入口；不新增导航服务或composer，不放宽全站CSP。补丁仅用于受控嵌入构建，不能以隐藏侧栏代替守卫；独立Element使用仍遵守原Matrix权限。实际下游构建须同时pin源码revision、patch hash、lockfile、module/API版本与build hash；任一缺失为IntegrationNotReady，不回退浮动版本。上游来源和静态核验边界见[Element来源核对](../91_reviews/element-host-source-review-20260916.md)。

1. Parent 验证授权/descriptor 有效期和当前项目，建立一次 view generation；不接收任意 URL 作为嵌入源。
2. Element 在自己的 origin 登录、存储用户 session；Parent 不读取或接收 token。用户未登录时显示 Element 自身认证流程，不注入服务身份。
3. 宿主使用下述唯一postMessage协议；双方验证exact origin、window source、Schema、generation与project/session context。禁止通配符targetOrigin和任意script/URL/navigation消息。
4. 项目切换先销毁旧 RoomView/清空旧上下文、取消未完成查询，再查询新目录；旧 generation 的 descriptor/event 响应全部丢弃。不同项目不得共享选中 session、搜索结果、通知、草稿展示状态。
5. 用户 logout、撤权、membership 丢失或 descriptor 失效时终止读写并显示 typed unavailable/permission state；不复用旧缓存伪装可用，不自动退回外链或转发。
6. 只展示当前项目目录并不意味着用户 Matrix sync/cache 从未接收其他已授权 room。若要求数据本身隔离，必须进一步使用独立授权身份/tenant策略，由 Operator 明确决定；本版不作未实现的隔离承诺。

### 4. 宿主接口与实现义务

#### 宿主握手与事件定位

唯一机器定义为生命周期Schema的`ElementHostContext`与`ElementHostMessage`，protocol固定`slinky-element-host/v0.3`。该协议只连接Slinky父页面与受控Element子页面，不是Piko/Matrix产品消息wire。每条JSON对象必须包含protocol、request_id、context、kind、payload；unknown field拒绝，序列化UTF-8最大16KiB。不传Secret、正文、附件内容、任意URL或可执行代码。

context六项由父页面当前选择产生：view_generation为每次挂载新生成的128-bit随机小写hex；descriptor_id/version、project_id、session_id、room_id与本次Ready descriptor逐项相等。request_id也是128-bit随机小写hex，仅用于本generation内一问一答关联，不授予权限。描述符中的origin/build/allowed_actions由服务器决定，子页面仍以自己的Matrix用户核验membership；Ready中的matrix_user_id只供显示会话核对，不作为Slinky业务身份或授权来源。

| kind/方向 | payload与消费规则 |
|---|---|
| Mount：父到子 | 完整Ready ElementDescriptor；子页面逐项比较context、当前自身origin与受控parent origin、配置构建标识，检查有效期和Matrix用户membership后挂载当前room |
| Ready：子到父 | matrix_user_id；回显Mount request_id及context，仅在原生RoomView对当前room已就绪且动作权限已应用时发送 |
| Failed：子到父 | code=AuthenticationRequired/MembershipUnavailable/DescriptorExpired/IntegrationNotReady/SourceUnavailable；回显Mount request_id，父页面撤下内容并显示对应不可用状态 |
| LocateEvent：父到子 | event_id；仅Ready态、当前descriptor仍有效时发送；子页面只查询/定位当前room，不能通过event反查其他room后切换 |
| EventLocated：子到父 | 原event_id，回显LocateEvent request_id；仅定位已完成时确认 |
| EventUnavailable：子到父 | 原event_id与NotVisible/NotInCurrentRoom/Redacted/SourceUnavailable；保持当前room，不搜索其他房间或伪造替代事件 |

父页面先注册接收器再装载固定受控entrypoint，不把descriptor/room/token放URL。子页面接收器在其entrypoint启动阶段安装；iframe load后父页面发送一次Mount。双方使用descriptor中exact targetOrigin，父侧要求event.source===本generation iframe.contentWindow，子侧要求event.source===window.parent且父origin属于构建时受控配置；origin检查在处理payload之前执行。Schema/context/request_id任一不匹配时丢弃，不回显攻击者数据。

父状态为Loading -> Ready或Unavailable。Mount等待上限10秒；用户需要登录时Failed/AuthenticationRequired结束本次挂载，用户在受控Element认证流程完成后显式重新打开形成新generation，不在旧generation自动恢复。Ready之前不显示RoomView内容，不发送LocateEvent。有效期截止、撤权、logout、membership丢失、iframe再次load或项目/Session切换时立即转Unavailable并销毁该iframe、清空选择/草稿引用及pending请求；不发送teardown并等待ACK，也不重用旧generation。子页面独立按descriptor截止时间卸载RoomView，后台计时器延迟后恢复前先重新核验，不延长有效期。

LocateEvent同时最多一个pending，5秒无结果显示定位不可用并作废该request_id；用户新选择会取消前一请求。每个request_id仅接受一次匹配终态回包，迟到/重复/错误方向/非当前状态消息不能改变页面。重复Mount同request_id同descriptor只重发已有状态，不重复挂载；同request_id不同descriptor或第二Mount的新request_id要求销毁重建，不在现有子页面改房间。无自动重试、跨版本协商或回退wire。

### 4.1 同RoomView授权续验（用户已批准）

以下为唯一续验规则，补充上文六种消息而非第二协议；Mount仍不得用于原地更新。父页面在Ready后每次有效租期的中点发起一次无条件descriptor GET，最大间隔30秒，只允许一个续验在途。没有有效授权或时钟可信性时不挂载。父子运行环境UTC误差上界必须能保证2秒；各自有效截止取valid_until减2秒，并同时用单调计时器限制剩余期限，系统时钟跳变、后台恢复先核验，不能借时钟后退延长。无法保证该误差预算为SourceUnavailable并关闭，而不是声称任意浏览器时钟可靠。

父页面核验新200 Ready与原descriptor的descriptor_id、project/session/room、session_version、authorization_version、identity_mode、origins、build_ref/hash、codec_version、allowed_actions全部相同，新descriptor_version严格增加，issued_at不倒退且新valid_until更晚。任一授权或上下文变化先销毁旧generation；登录用户变化也不能连续续验。304、503或无法核验均不延长旧期限；本次续验失败不自动无限重试，撤权/不可用事实立即关闭，普通无响应至旧截止关闭。

父发送Revalidate：context为旧已提交context，payload仅含新完整descriptor和expected_matrix_user_id（来自本generation最初Ready）。子核对exact origin/source、旧context、request_id、当前Matrix用户及membership、新descriptor和自身构建；在旧有效截止前完成时原地安装新授权期限，不重挂RoomView，回Revalidated。回包context仍为旧context，payload仅descriptor_version（新版本）及matrix_user_id。父仅在旧截止前、5秒响应上限内接收对应回包，并提交新context版本。超时以min(发送时刻+5秒,旧截止)为界，失败销毁iframe；子独立按已安装期限截止，父销毁不等待子ACK。这是各端本地提交而非跨window原子事务；回包丢失宁可关闭，不允许父推断成功。

在途期间暂停LocateEvent并作废先前pending定位，子不自动产生导航；同request_id及完全相同payload可重发既有Revalidated，同ID异payload拒绝并关闭。新版本提交后旧context消息一律丢弃。撤权、logout、房间切换、iframe reload和截止优先于回包；已经销毁的generation永不复活。Failed可回复Revalidate request_id，沿用既有typed code并关闭。自然续验只更新授权快照，不更换room、timeline、composer或用户草稿；草稿保留于用户Element原域，父仅保留引用，不传正文，撤权后不展示旧草稿。

该定义是新的candidate.4宿主语义；Schema验证不证明浏览器隔离或时钟来源可用。最小补丁必须在alias解析后、实际room提交前以及RoomView读取/渲染前重复检查同一有效context；异步目标、升级room、history恢复不能绕过；未知目标先拒绝而非先挂载后隐藏。具体补丁实现和真实source/origin/RoomView行为仍须下游验证。

#### Element导航约束

宿主的当前选择固定为project_id/session_id/room_id/descriptor_version/view_generation。只有Slinky目录选择可以更换room；RoomView内部导航保留同room上下文，不能自行扩大当前项目集合。切换同项目另一个Session也重新取得descriptor并建立新generation，不复用旧room授权。以下入口使用同一宿主约束，不建立另一个聊天路由服务。

| 入口 | 允许行为 | 拒绝/失效行为 |
|---|---|---|
| Slinky目录选择 | 当前项目精确Session及当前授权descriptor；卸载旧RoomView后挂载新选择 | 不可见、过期、版本漂移先显示不可用；不打开旧缓存room |
| 原生事件/回复/thread定位 | event真实room等于当前room；thread只是Matrix事件关系，不代替业务Topic | room不一致、事件不可验证时保留当前房间并显示定位失败 |
| room ID permalink | 同当前room可定位；不同room交回Slinky目录选择流程 | 不直接调用全局openRoom或自动join |
| alias permalink | 宿主不把alias作为选择输入；需要用户从授权目录选择精确Session | 不按alias/name推断项目归属；不自动解析并跳转到另一个room |
| 全局搜索/通知/快捷切房 | 当前嵌入视图只提供当前room的搜索/提示 | 全局结果、其他room预览与快捷切房入口不得进入该视图；不能只用CSS遮盖结果 |
| 房间升级/前驱/后继链接 | 由Slinky验证已登记的successor映射并重新授权选择 | Matrix upgrade关系本身不授予项目Session权限 |
| URL hash、浏览器前进后退、module navigation | 每次回到Slinky当前project/session验证后形成新generation | 任意room参数不能直接驱动Element全局页面 |
| logout、descriptor expiry、撤权 | 立即撤下RoomView、清空该generation展示与草稿引用 | 迟到事件不得恢复旧视图或重新开启composer |

view_generation是显示竞态标识，不是权限凭据；Matrix自身仍验证用户membership。用户自己的Element sync缓存可能包含其其他已授权房间，宿主不得把这些房间显示为当前项目内容。项目显示过滤与Matrix授权分别执行。

源码核对已证明独立RoomView store存在，但官方module API不能被假定覆盖所有导航入口。因此采用§3已获批准的固定revision最小导航隔离补丁，宿主必须在读取/渲染其他room内容之前完成守卫；事后跳错再隐藏不算通过。不得超出已批准补丁范围另起导航服务或扩大权限，超范围变更按Rollback/Revisit重新评审。本表行为与单一实现方向已经确定；具体patch/build hash、逐入口浏览器测试是下游构建及激活门禁，不再列作“核心补丁未获授权”。Host跨方边界接受见L-20260916-01e21751480e及P-20260916-88ee23e135e7，二者不替代浏览器实测。

P-20260916-ed155f05022c 已确认唯一映射：agent_binding_ref 是身份，session_binding_ref 是 Session 授权，expected_session_binding_version 防止绑定漂移；不新增 Run endpoint。详细 null/错误/首次受理与恢复规则见系统设计 §7.4.4。该确认不等于机器 Schema 已修改或整包通过，RT-G08 继续负责一次性替换。

一次性迁移清单：保留 Piko Operator MatrixTransportProfile PUT/GET/Probe；将 IRCommunicationBinding 的业务 IR 前提移除，改为稳定 Agent 身份绑定；退役 Piko Session list、element-view 和 Session :close authority；其自有 revoke/drain command/status 仅报告执行事实；删除 POST /runs 的旧 collaboration_contract 和原子建 Session/room 语义。轻量 Run 路径保持唯一。长期 SessionAgentBinding 与 RunCommunicationAttachment 分开，具体请求字段及旧接口删除版本由 RT-G08 固定；agent_binding_ref 不在本轮静默改成 Session 引用。Slinky/Matrix/Piko 撤权是分步持久对账，不是跨系统事务。

Session list、exact session Element view 和 Topic 管理由 Slinky 提供；Piko 承接 Agent 身份解析、加入确认、执行绑定、事件交付及撤销/收口事实。旧 Piko 项目目录/provisioning 契约一次性退役，不能与 Slinky 形成双 owner。以下是两方需分别实现的语义义务，机器字段使用生命周期Schema及已接受的Piko finalization.10 commit 4c63380f944e41d0047e9f47340689a182b62fba；不再等待另一套接口定义：

| 对象 | 必须表达 | 禁止 |
|---|---|---|
| Session directory | authorized project、session/room、participants、status、cursor/version | 跨项目泄露、以名字路由 |
| Element descriptor | exact project/session/room、受支持 embed mode/version、允许 origin、descriptor version/expiry、用户 session 要求 | token、device key、checkpoint、任意外部 URL |
| 宿主握手/导航 | source/origin/generation/context 校验、明确 ready/error | wildcard、绕过房间/项目校验 |
| 用户消息事件 | event_id、canonical sender、exact session/work、reply/mention target、去重与触发策略 | 聊天自动成为批准、新建无资源 Work |
| 异步决策 | Decision Dossier + discussion reference、Action expected version/idempotency | 多数票/最后一句话代替用户决定 |

Slinky 的 Element descriptor 需与选定 RoomView 集成契约一致，不以 Piko 的旧 ExternalLink descriptor 强制 iframe 适配。设计门要求 machine amendment、Schema/error/positive-negative fixture 和 owner review；consumer browser capture 是后续实现验证，不阻断设计评审。

### 5. 专家、PM 与用户闭环

#### Topic与原始事件消费

产品事件引用Piko唯一`ProductMatrixRoomMessageEvent/ProductMatrixMessageContent`，当前复核副本为finalization.10 commit 4c63380f944e41d0047e9f47340689a182b62fba，不在Slinky复制另一份产品wire Schema。EC-02区分真实raw事件与六字段受控投影；最终目录差异追溯见[piko-finalization10-operation-lineage](../91_reviews/piko-finalization10-operation-lineage-20260916.md)。外层`m.room.message`与`content.msgtype=m.text`保留原生Element正文显示；模块只增加业务标签和定位，不改写原始事件、不发送relay副本。具体字段如下。

| 字段路径 | Slinky/Element消费 |
|---|---|
| event.room_id | 必须等于当前descriptor.room_id；与Slinky Session映射不符时不显示为当前项目内容 |
| event.event_id | 当前room内的精确定位与去重引用；不从SID构造，不由浏览器生成 |
| event.sender | 原生Element显示Matrix身份；业务标签还须通过Piko ingress核验的identity映射，不按display name匹配 |
| event.origin_server_ts | 原生时间显示；业务接受/顺序不单独由该时间决定，不代替Piko accepted_at或记录版本 |
| content.body | 原生纯文本正文；不作为HTML解释，不解析其中的命令、批准或权限指令 |
| content.io.piko.agent.message.envelope_version | 只认piko-message/v0.3；未知版本仅保留原生正文与不可识别提示，不产生业务标签/调度 |
| 同扩展.topic_id | 使用当前project+session范围的Slinky Topic记录解析名称/状态；查不到时显示未关联，禁止创建同名Topic或跨Session查询补齐 |
| 同扩展.sid | 仅在当前Client+Session+derived sender范围使用；不作为全局event ID |
| 同扩展.rid | null为业务根消息；非空为父SID，必须由可信索引证明同room同Topic，不按最近一条消息推断 |
| 同扩展.sender_identity_ref | 标签来源是Piko验证后事实与Slinky参与者映射；浏览器扩展中的自报值不授予业务身份 |
| 同扩展.recipient_identity_refs | 展示已授权的精确收件对象，不推导整个房间广播；不可见对象不跨权限查询详情 |
| 同扩展.message_type | Request/Answer/Notice只决定标签；Answer不自动完成Action，Request不自动创建Run |
| 同扩展.attachments | attachment_id/media_type/size_bytes/sha256仅展示声明，content_ref是不透明受控引用；未取得当前授权读取与校验结果前，不生成下载URL或预览，不交给Matrix media downloader |
| content.m.relates_to.m.in_reply_to.event_id | rid非空时定位到经Piko证明的父事件；关系缺失、跨room/topic或与父SID不符时业务关联无效 |

浏览器不能把原始事件Schema通过等同Piko验证通过。业务归类以Slinky后端取得的exact ingress fact为准：ProductEnvelopeValid且dispatch_eligible=true，再校验当前Topic、Action、项目权限和版本。原始事件被redact、Session撤权或边界推进后，历史“可调度”快照不能继续授权；最终Piko Run admission仍检查当前binding/epoch/boundary。

V0.3业务Topic不用Matrix thread、edit或room topic字段路由。用户在原生Element composer发送的普通讨论/原生回复继续原生显示，但不附加或伪造Piko产品扩展，不自动关联正式Action。用户明确安排处理时使用既有Slinky Work/Action命令。Needs Response/Progress Reports/History按Slinky正式记录和事件引用组织，不在模块建立第二份聊天正文数据库。

选择Topic后，Slinky context面板显示正式Topic与关联事件引用，RoomView仍是该Session完整原生timeline；不把过滤后片段冒充完整历史。点击事件引用只在当前room定位，缺失/redacted/未同步时显示定位不可用，不搜索其他房间或伪造替代事件。Matrix原生thread标签与业务Topic标签分开显示。

附件采用已复验的Piko EC-01契约，不再缺授权读取定义。Slinky backend通过既有Piko Client credential调用exact binding下`GET /messages/{sid}/attachments/{attachment_id}`，不以content_ref直查；必须具备content:read:delegated，并从当前用户会话/授权记录产生X-Piko-Viewer-Matrix-User-ID和非Secret的X-Piko-Viewer-Authorization-Ref。浏览器不得自报身份直连Piko或取得Piko credential；授权引用本身不授予权限，Piko独立核对exact linkage及当前room Joined membership。Slinky不从opaque ref臆造URL、MXC或签名token，也不增加第二内容存储/下载通道。

读取顺序为认证401→delegated scope/当前授权/membership 403→exact path/link/visibility 404→redaction或bytes lifecycle 410/404→条件ETag；匹配ETag不覆盖撤权、redaction或过期，只有当前可读才304。200的exact bytes、Content-Length、X-Content-SHA256须与授权附件元数据匹配，失败不向用户呈现为有效附件。未绑定24h、绑定accepted_at+7d仅为最早删除资格；pending/RecoveryRequired/unknown义务推迟实际删除，30d墓碑从bytes_deleted_at计算，半开窗口内410、精确终点起404。长期保存由既有Slinky授权Artifact/backup接管，不能拿Piko短期窗口承诺永久历史。精确digest与retention接受见[piko-finalization8-attachment-acceptance](../91_reviews/piko-finalization8-attachment-acceptance-20260916.md)；当前提供方机器基线按finalization.10 commit 4c63380f944e41d0047e9f47340689a182b62fba固定，不以本文另创wire。

Agent 无共识时，由 Slinky 安排总结/评审 Work，根据参与者结果及授权讨论证据整理全员立场、分歧与依据；Piko 返回单 Agent 任务结果，不成为团队结论 owner。Runtime 根据授权安排 Expert/PM Work，Plan 计算影响任务与最迟安全决策时间。需用户承担的 scope/budget/risk/approval 生成 ParticipantActionRequest。用户可以在原生 RoomView 看上下文、讨论；正式决定仍调用既有 respond/promote command，经权限、版本、幂等校验后由 owner 发布 successor。普通 Matrix message 不是自动批准。

普通用户原生Matrix消息只作为讨论内容，Piko分类为UnclassifiedNativeMessage、dispatch_eligible=false，reply/mention不直接产生Agent任务。只有冻结产品codec核验通过、属于当前Session且dispatch_eligible=true的事件，才由Slinky核验Topic/Action与调度权限、显式分配dispatch_ref/client_task_id并提交唯一Run API。用户要求Agent处理普通讨论时，通过Slinky既有Work/Action操作明确安排，不能把原生事件伪装成合法product trigger。关闭Session停止新admission，已落盘义务按原identity drain。

## Consequences

关闭及备份共同遵守系统设计 §8.3.2 COMM-EXT-01：仅保存授权的非内容 Tier 引用，Session/Topic 状态、成员撤权和备份操作不改变 Tier Invocation/Seat/M2-C；恢复不调用 Tier 或恢复旧 key 发送权限。选择唯一关闭策略为关联外部义务全部收口后才 Closed，Running 保持 Closing，未知保持 RecoveryRequired。允许期间备份，但不以 Verified 代替执行收口。不增加 external_pending 关闭分支或 Tier 接口。该条款来自 L-20260916-c423d704df60 的定向评审，具体 oracle 沿用 V03-COMM-108..110。

收益是复用成熟聊天体验和同一讨论记录；代价是增加受控嵌入部署、浏览器权限测试及 Piko 契约修订。改动不增加独立项目管理子系统、通信数据库或聊天转发 authority。项目切换、用户撤权、通知/搜索泄露和 third-party origin cookie/登录策略是必须关闭的风险。

旧 ExternalLink-only 的 UI/ICD 条款需同步修正。旧 Piko runtime 未升级前不得把新 UI 作为已可激活能力；其它无依赖模块可以继续开发。

## Verification and Evidence

复用既有 V03-E2E-097..099 的多 room、决策、Element 要求并增加如下 case；这些是待执行义务，不是 production Pass：

| Case | Oracle |
|---|---|
| V03-UI-007 | 四 View 顶部导航、窄屏可用，页面刷新不重建 Element 会话 |
| V03-COMM-100 | 同 homeserver 的 A/B 项目并行；A 的 directory/URL/搜索/通知不暴露 B 的 projection |
| V03-COMM-101 | project 切换时延迟 descriptor/message 到达不会重新打开旧 room |
| V03-COMM-102 | 内嵌和独立 Element 双向发消息显示同一 event_id/room/sender，不产生第二条 relay 消息 |
| V03-COMM-103 | 跨 origin/source/generation/room 注入、撤权、logout、membership 变更均 fail closed |
| V03-COMM-104 | 无共识 -> Expert/PM -> 用户 Dossier/原始讨论 -> 正式 Action，未经 command 聊天不改变 Plan/Artifact |
| V03-COMM-105 | Session close/restart drain 原 obligation；重复 close key 返回原结果，不重复 archive |

实测应绑定 Element source/module API、Matrix/Piko/Slinky commit、账号权限和环境 fingerprint。Demo 的静态 Plan/Resources、单机浏览器证据不满足全矩阵。跨项目请求见 `S-20260909-2f06d9392004`。

## Rollback / Revisit Conditions

若官方嵌入能力、用户认证或受控 origin 无法满足当前环境，先维持能力未激活并提交单一替代方案供用户决定；不默默恢复 ExternalLink-only，不增加 shadow chat。更新 Element/Piko Schema、project room ownership、E2EE 或用户隔离要求必须重新 Review 相关测试。

## Traceability

用户确认：IR 对话视图、Element 集成、多项目仅看当前项目、顶部导航与四 View 统一 Demo。上位：[系统设计](../20_system_design/system-design.md)；接口：[View Contract](../60_interfaces/contracts/view-contracts.md)；测试：[Test Lifecycle](../70_verification/specifications/test-lifecycle-specification.md)。原详细 UI、Piko、View Contract 文档仍保留原 ID，与本次 amendment 一起读取。
