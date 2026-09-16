<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Agent Runtime v0.3 测试规格

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-agent-runtime-test-specification-v0.3` |
| Document Version | `0.4.0-draft.10` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Verification Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | none |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-16` |
| Template ID | `assurance.test-specification` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/specifications/piko-agent-runtime-test-specification-v0.3.md` |
| Supersedes | none |

> 仅现有 contract validator/fixture case 具备执行入口；其余案例保持 Planned/Blocked。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目标、范围与被测对象

被测对象是唯一 Piko Agent Runtime 及其 Pi、LLMTier、Workspace/Tool 和 CollaborationBridge
边界。本文保留原 QA/Test ID，并把具体输入、oracle 和 evidence obligation 分层。

## 2. 引用基线、环境与前置条件

- 设计：`piko-agent-runtime-design-v0.3.md`、`piko-collaboration-bridge-design-v0.3.md`；
- 契约：`piko-agent-runtime-contract-v0.3.md` 及其机器附件；
- V&V：`piko-agent-runtime-vv-plan-v0.3.md`；
- 当前自动入口：`python3 tests/contract/validate_v03_contract.py`；
- runtime/DB/homeserver/LLMTier E2E 环境尚未建立，对应 case 状态为 Blocked/Planned。

## 3. Case Matrix

| Case ID | Requirement | 场景 | 输入 | Oracle | Evidence | Priority |
|---|---|---|---|---|---|---|
| MX-U-013 | MX-013 | cursor metadata/scope/filter | valid/tampered/expired/cross-filter cursor | exact typed result；不回退第一页 | unit vector | P1 |
| MX-U-014 | MX-014/015 | resolution Schema | Resolved/unresolved/unknown field | conditional + strict schema | fixture validator | P1 |
| MX-C-013 | MX-013 | 多 room list/filter | 2+ rooms + four filters | AND filter、stable order、无 body | OpenAPI + fixture | P1 |
| MX-C-014 | MX-014 | Result optional resolution | all participant positions | participant set exact | Schema + semantic validator | P1 |
| MX-C-015 | MX-016 | descriptor source unavailable | exact Session + unavailable source | 503 typed；无 fallback | OpenAPI + fixture | P1 |
| MX-R-013 | MX-013 | cursor snapshot restart | page1 后 update/restart/page2 | snapshot 内无重复/跳项 | DB query trace | P1 |
| MX-S-013 | MX-014/015 | minority preservation | 3 participants，1 minority | position/rationale/evidence 全保留 | persisted Result | P1 |
| MX-S-014 | MX-015/016 | authority overflow | ParticipantActionRequest 字段/动作 | strict reject；无外部 action | error + audit | P1 |
| V03-E2E-085..092 | AR core | admission/result/recovery | Slinky black-box fixtures | frozen Run/Result contract | E2E package | P1 |
| V03-E2E-093 | MX profile/binding | ETag/idempotency/identity | create/update/replay/stale | stable identity + typed 412 | E2E package | P1 |
| V03-E2E-094 | MX rename/isolation | same display + rename/restart | two IR + monotonic profile | MXID/room/history unchanged | E2E package | P1 |
| V03-E2E-095 | MX room/Element/close | encrypted/federated/embed/close/drain/restart | policy variants + pending obligation + partial failure；K 首次 Closing、Session 后续 Closed、重放 K；已 Closed 后另一合法新请求 | fail closed + ExternalLink；Closing 继续原 obligation；重放 K 返回已记录 Closing 且 archive 不重复；新请求可为 AlreadyClosed；key/digest 冲突失败 | E2E package | P1 |
| V03-E2E-096 | MX delivery recovery | txn/event/outbound/failover | crash at durable boundaries | zero duplicate obligation/message | ledger evidence | P1 |
| V03-E2E-097 | MX multi-room | parallel rooms/page/filter/route | two Attempts/Sessions | exact route + stable pagination | E2E package | P1 |
| V03-E2E-098 | MX resolution | unresolved 3-party team | minority + evidence + user constraint | NeedsParticipantDecision，无越权 | Result/audit | P1 |
| V03-E2E-099 | MX Element decision | exact Session link/unavailable | active and unavailable source | ExternalLink/UserSession or typed 503 | browser/API evidence | P1 |
| LT-C-001 | MX-017 | exact model/Scope B | Worker vs worker；stream true；Chat | exact case；400/404 fail closed | adapter capture | P1 |
| LT-R-001 | AR-004 | lost response/replay | same key/digest；已有 Invocation ID；无 ID 且分别在已证实 dispatch 后、durable record 后/dispatch 前、dispatch 前拒绝或取消处断线 | 有 ID 则 GET；无 ID 则重放原 POST；已 dispatch 总数=1，未 dispatch 原 Invocation 为 0..1，拒绝/取消=0；replay 不新增 intent/Invocation | client/server ledgers | P1 |

## 4. 正常、边界、负向与并发场景

正常路径覆盖 single/team success、room collaboration、structured Result 和 clean close。边界覆盖
零/满 execution capacity、deadline、最大 participant/message metadata、null last_message_at 和最后一页 cursor。
负向覆盖 schema/header mismatch、stale ETag、digest conflict、unknown model、encrypted room、
unauthorized query 和 authority overflow。并发覆盖 duplicate Run、two writers、rename+send、
close+inbound、page update 和 lease failover。

## 5. Recovery、重放、幂等与故障注入

每项外部动作在 intent commit 前、commit 后/dispatch 前、dispatch 后/response 前和 outcome
record 后注入 crash。恢复断言：复用原 Run/Session/key/txn/obligation；未确认 outcome 保持
UnknownOutcome/Unavailable/Closing；不得以新 Attempt、room、message 或 invocation掩盖失败。

`V03-E2E-095` 的 close oracle：进入 Closing 后禁止新业务 admission/message/wakeup，但 harness
必须允许并观察关闭前已确认 outbox/inbox 继续以原 txn/obligation drain；部分失败和重启期间为
`RecoveryRequired`，pending count/blocker 准确；仅 obligation 清零、archive 成功、retention
已记录后为 `Closed`。令 key K 的首次 close 返回并记录 `Closing`，待 Session 随后 Closed 后重放
K，仍必须返回已记录的 `Closing` 语义且不得重复 close/archive；Session 最新状态由既有查询读取。
对已 Closed Session 使用另一合法新 key 的请求，通过 authorization/version 检查后可返回并记录
`AlreadyClosed`；K 配不同 digest 必须返回 `IdempotencyConflict`。当前 Piko machine enum 未
对齐 Slinky v0.6 时，此 case 标为 Blocked，不把旧 `Unavailable/Unchanged` 当 Pass。

`LT-R-001` 的无 ID 子场景均在任何 response header 到达前丢弃连接。Piko 的 stock SDK
`maxRetries=0`，但显式 adapter 在 D=24h 内复用同一 authenticated client/source、endpoint/version、
Idempotency-Key、canonical digest、body 和语义 headers 重放原 POST；返回 canonical 200 或带
Invocation ID 的 202/terminal error，得到 ID 后才 GET。按故障点证据使用三个 oracle：

1. ledger/受控 Backend 已证实首次 Backend dispatch，随后丢失响应：logical Invocation 总
   dispatch 数保持 1，replay 新增数为 0；
2. durable record 已提交但首次 Backend dispatch 尚未发生：初始计数为 0，原 Invocation 可正常
   执行到最多 1；replay 不得创建额外 dispatch intent 或第二 Invocation；
3. admission 拒绝或 dispatch 前取消：最终 Backend dispatch 数保持 0。

新 key、新 Attempt、第二 Invocation 或 UnknownOutcome 自动重派均为 Fail；“replay 新增数为 0”
不得被解释为阻止原异步 Invocation 完成其首次合法 dispatch。

## 6. 性能、容量、功耗或时序测试

首版测量 admission latency、Run state write latency、execution claim contention、AS transaction ACK、
inbox/outbox throughput、oldest backlog age、cursor page latency、recovery RTO 和 Element descriptor
latency。阈值尚未冻结，因此当前只定义 measurement，不给 Pass 门限。

## 7. 执行步骤与自动化入口

文档期：

```bash
python3 tests/contract/validate_v03_contract.py
/Users/ben/work/STD/scripts/validate-design docs
python3 -m json.tool docs/std.lock.json
git diff --check
```

实现期为每个 Case 生成 immutable execution manifest；真实 Secret 通过 test credential binding
注入，不写入 fixture 或日志。

## 8. Pass/Fail/Blocked/Invalid 判定

- Pass：全部 oracle 成立且 Evidence 可打开、可关联 immutable baseline。
- Fail：执行有效但任一 oracle 不成立。
- Blocked：依赖、环境、版本或授权缺失，未执行完整 oracle。
- Invalid：环境/fixture/采集不可信，结果不能用于判定。

禁止将 Planned、mock shape、Schema parse 或未执行 case 标为 Pass。

## 9. Artifact、日志、测量与证据保存

保存 test manifest、case ID、commit、config fingerprint、dependency version、request/response
shape（脱敏）、state/ledger extract、metrics、browser evidence 和 SHA-256。Matrix body、prompt/output、
token、credential、device material 不进入默认 evidence；需要时只存 approved redacted projection。

## 10. 安全、清理与可重复性

测试账号/room/database 使用隔离 namespace；结束后按 retention policy 清理，但不能删除失败审计。
并发和 recovery 测试固定 seed/clock/fault point。跨 Client/Project 测试必须由 harness 创建 synthetic
scope，不能读取其他真实项目数据。

## 11. V0.3 finalization 追加 Case Matrix

| Case ID | 类别 | 前置/刺激 | Oracle | Evidence 层级 |
|---|---|---|---|---|
| PIKO-V03-FIN-001 | Contract | 顶层agent/session/version四种组合及旧嵌套bindings | 全null与仅agent通过；session缺agent/version失败；匹配三项通过；旧嵌套拒绝 | static fixture |
| PIKO-V03-FIN-002 | Idempotency | 同key/body；同key分别改instruction/deadline/trigger；换key同client_task | 仅相同digest AcceptedRun返回原202；三种改body均409且不重查当前binding；换key同task 409；只创建一个Run | static + DB fault待联调 |
| PIKO-V03-FIN-003 | Trigger | ingress晚到、decision expiry、重启、deadline与binding同时失败 | 404为RetryableRejection非receipt；`decision_first_created_at`首次写入后重评/重启不推进；保留至`max(request.deadline_at,decision_first_created_at)+7d`；deadline前晚到原key可CAS受理；decision expiry不遗忘digest；deadline后统一422且迟到event不能复活 | static + Matrix联调 |
| PIKO-V03-FIN-004 | Trigger fanout | 同event派两个Agent/Run；同key重放；异key同task；同dispatch改tuple | 仅显式不同dispatch+task合法；同key原回执；同task换dispatch及同dispatch改tuple均409 | static + Matrix联调 |
| PIKO-V03-FIN-005 | Revoke | projection lease过期、revoke/admission CAS竞争 | 过期fail closed；revoke先胜拒绝admission；admission先胜的既有Run被fence且不能取新权限 | fault/E2E |
| PIKO-V03-FIN-006 | Release | cancel accepted、unknown writer、quarantine | 前两者不release；完整进程/tool/writer/wakeup/quarantine证据才true；隔离ref仍令drain RecoveryRequired | fault/E2E |
| PIKO-V03-FIN-007 | Strict close | per-binding membership、零Agent房、human仍Joined、Topic/Archive组合 | human无需Left；仅Piko drain与全部Slinky guard满足可Closed；Tier Seat不由通信状态推断 | contract + E2E |
| PIKO-V03-FIN-008 | Retention | 7d到期、tombstone、active/unknown | tombstone 410；不可见404；active/unknown不删除 | clock/fault |
| PIKO-V03-FIN-009 | Message | send request→receipt→event/ingress、Topic/SID/RID、recipient/reply/attachment/native message | event ID/time仅Matrix后置；exact route；同SID异body/跨Topic reply/非法附件拒绝；native message不dispatch | contract + Matrix联调 |
| PIKO-V03-FIN-010 | Removal | 生成OpenAPI/client | 无heavy fields、Session list/element/:close、reconcile/SSE path | static validator |
| PIKO-V03-FIN-011 | Model deadline | task、request、catalog effective三种deadline先到及late success | task→DeadlineExceeded；单调用→ExecutionError detail；全部停止新业务；late success仅Evidence | static + LLMTier联调 |
| PIKO-V03-FIN-012 | Rejection re-admission race | 两个不同key已保存同一client_task_id的RetryableRejection，分别使用相同或不同dispatch tuple并发重评 | 重评事务重新核对ClientTaskIndex、完整dispatch tuple、deadline、projection/权限/model/workspace/tool/capacity；unique/CAS最多一个Run/intent/claim，loser为ClientTaskConflict | static + DB fault待联调 |
| PIKO-V03-FIN-013 | Conditional Schema | 构造Unclassified+eligible、Sent缺event、Queued带event、Failed+AgentFinished | 四项均Schema拒绝；合法Product/Sent/Queued/AgentResult组合通过 | static fixture |
| PIKO-V03-FIN-014 | HTTP matrix | createRun tombstone；所有GET auth；三个配置PUT create/update/缺头/双头/wildcard/stale/update目标不存在 | 410；401/403；201/200带ETag；428/400/400/412/404，update missing不创建资源，GET 200带ETag及304 | OpenAPI static |
| PIKO-V03-FIN-015 | Matrix codec | root/reply raw event、普通native、未知version、body/sender/room/reply/attachment不一致 | 唯一m.room.message+namespaced扩展；Matrix生成event/time；普通消息Unclassified，其余畸形Rejected，全部不可dispatch | Schema fixture + Matrix联调 |
| PIKO-V03-FIN-016 | Attachment content | digest golden、不同multipart表示、同key冲突+完整性错、并发绑定、参与者读取、redaction、到期 | 复算domain-separated digest；boundary/header/filename不改摘要；异digest 409优先于422；第二消息绑定409；非当前成员403；redaction 410；pending义务推迟删除 | static fixture + Matrix联调 |
| PIKO-V03-FIN-017 | Conditional attachment read | revoked/redacted/expired且ETag匹配；authorized available且匹配 | 403/410/410优先于304；仅仍可读返回304；精确tombstone_until返回404 | OpenAPI + fixture static |
| PIKO-V03-FIN-018 | Attachment retention clock | eligibility已到但unknown blocker；blocker清零后实际删除；30d半开边界 | blocker期间bytes仍在且无tombstone；deleted时启动30d；边界前410，精确边界404 | clock fixture + fault injection |
| PIKO-V03-FIN-019 | Raw event projection | 带unsigned的raw message、sender/room篡改、state event | raw外层扩展允许但只抽取六字段；sender/room不一致及state event拒绝且不可dispatch | Schema fixture + Matrix联调 |
| PIKO-V03-FIN-020 | Execution capacity snapshot | shared pool覆盖多个class、Unknown/Partial/过期、跨Client、snapshot后竞争、N个participant部分受理 | unit固定；完整all-constraints；不重复求和；snapshot非预留；只有逐Run 202+Held claim构成完整backing | Schema/semantic fixture + DB fault待联调 |
| PIKO-V03-FIN-021 | Execution claim recovery | 202响应丢失、同key重放、重启、claim查询Unknown、release但drain/Tier未知 | Run+claim原子；不重复claim；Unknown fail closed；release事实互不替代 | semantic fixture + DB fault待联调 |
| PIKO-V03-FIN-022 | Trusted input evidence | safe path、range并集/重复、空文件、metadata-only、changed/unmediated、不可审计profile、Unknown执行 | 仅broker可产生；Complete仅记录器完整；缺失/不可信不通过；路径不可由task注入 | Schema/semantic fixture + sandbox待联调 |
| PIKO-V03-FIN-023 | Evidence publication/retention | writer fence、generation、artifact/digest、Result发布各故障点；窗口内/外读取 | 固定顺序且原子Result；失败不造Complete；bytes至少至max(deadline,published)+7d，长期接管归Slinky | semantic fixture + storage fault待联调 |
| PIKO-V03-FIN-024 | Capacity POST precondition | If-None-Match匹配、不匹配、`*`、非法weak/list，且检查valid_until | 匹配/`*`为412；不匹配200完整snapshot；非法400；从不304且不延长期限；其他GET 304不变 | OpenAPI + semantic fixture static |
| PIKO-V03-FIN-025 | Evidence single output authority | FullContent缺digest/空range/非法range/gap、Complete含Changed；Required Result证据缺失/重复/path/hash/size/document generation不一致 | 可表达组合由Schema拒绝；range与覆盖由semantic validator拒绝；证据只在outputs恰出现一次并与JCS bytes及Result generation一致 | Schema + semantic fixture static |

Static validator通过只代表候选自洽。Matrix、Pi、LLMTier、workspace/tool和crash evidence属于C类联调，
不得倒推修改A类wire或启用旧兼容路径。
