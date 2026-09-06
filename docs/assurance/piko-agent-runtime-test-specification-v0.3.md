# Piko Agent Runtime v0.3 测试规格

状态：STD 迁移候选；仅文档/fixture case 已具备执行入口  
日期：2026-09-07  
authority：Piko

## 1. 目标、范围与被测对象

被测对象是唯一 Piko Agent Runtime 及其 Pi、LLMTier、Workspace/Tool 和 CollaborationBridge
边界。本文保留原 QA/Test ID，并把具体输入、oracle 和 evidence obligation 分层。

## 2. 引用基线、环境与前置条件

- 设计：`piko-agent-runtime-design-v0.3.md`、`piko-collaboration-bridge-design-v0.3.md`；
- 契约：`piko-agent-runtime-contract-v0.3.md` 及其机器附件；
- V&V：`piko-agent-runtime-vv-plan-v0.3.md`；
- 当前自动入口：`python3 scripts/validate_v03_contract.py`；
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
| V03-E2E-095 | MX room/Element/close | encrypted/federated/embed/close/drain/restart | policy variants + pending obligation + partial failure + duplicate close | fail closed + ExternalLink；Closing 继续原 obligation；RecoveryRequired/Closed/AlreadyClosed 精确 | E2E package | P1 |
| V03-E2E-096 | MX delivery recovery | txn/event/outbound/failover | crash at durable boundaries | zero duplicate obligation/message | ledger evidence | P1 |
| V03-E2E-097 | MX multi-room | parallel rooms/page/filter/route | two Attempts/Sessions | exact route + stable pagination | E2E package | P1 |
| V03-E2E-098 | MX resolution | unresolved 3-party team | minority + evidence + user constraint | NeedsParticipantDecision，无越权 | Result/audit | P1 |
| V03-E2E-099 | MX Element decision | exact Session link/unavailable | active and unavailable source | ExternalLink/UserSession or typed 503 | browser/API evidence | P1 |
| LT-C-001 | MX-017 | exact model/Scope B | Worker vs worker；stream true；Chat | exact case；400/404 fail closed | adapter capture | P1 |
| LT-R-001 | AR-004 | lost response/replay | same key/digest；分别覆盖已有 Invocation ID 与首个 header/body 全丢失无 ID | 有 ID 则 GET；无 ID 则显式重放原 POST取得 outcome/ID；no new dispatch；typed disposition | client/server ledgers | P1 |

## 4. 正常、边界、负向与并发场景

正常路径覆盖 single/team success、room collaboration、structured Result 和 clean close。边界覆盖
零/满 Slot、deadline、最大 participant/message metadata、null last_message_at 和最后一页 cursor。
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
已记录后为 `Closed`；重复相同 close 为 `AlreadyClosed`。当前 Piko machine enum 未对齐 Slinky
v0.6 时，此 case 标为 Blocked，不把旧 `Unavailable/Unchanged` 当 Pass。

`LT-R-001` 的无 ID 子场景：在 LLMTier 接收/持久化首次 POST 后、任何 response header 到达前
丢弃连接。Piko 的 stock SDK `maxRetries=0`，但显式 adapter 在 D=24h 内复用同一 authenticated
client/source、endpoint/version、Idempotency-Key、canonical digest、body 和语义 headers 重放
原 POST。Oracle 是 LLMTier Backend dispatch count 仍为 1，且 replay 返回 canonical 200 或带
Invocation ID 的 202/terminal error；得到 ID 后才 GET。新 key、新 Attempt、第二 invocation 或
UnknownOutcome 自动重派均为 Fail。

## 6. 性能、容量、功耗或时序测试

首版测量 admission latency、Run state write latency、Slot claim contention、AS transaction ACK、
inbox/outbox throughput、oldest backlog age、cursor page latency、recovery RTO 和 Element descriptor
latency。阈值尚未冻结，因此当前只定义 measurement，不给 Pass 门限。

## 7. 执行步骤与自动化入口

文档期：

```bash
python3 scripts/validate_v03_contract.py
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
