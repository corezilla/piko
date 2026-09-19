<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky 固定 Stage Runtime 测试规格

| 文档字段 | 值 |
|---|---|
| Document ID | `slinky-fixed-stage-runtime-tests` |
| Document Version | `0.3.0-draft.2` |
| Status | `Draft` |
| Project | `slinky` |
| Authority | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Authors | `Codex` |
| Created Date | `2026-09-09` |
| Last Modified Date | `2026-09-16` |
| Template ID | `assurance.test-specification` |
| Template Version | `0.1.0` |
| Template Conformance | `native` |
| Tailoring Reference | `none` |
| Migration Map Reference | `none` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/70_verification/specifications/fixed-stage-runtime-tests.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目标、范围与被测对象

本规格指导固定 Stage Runtime 从设计验证到真实执行验证，不替代 T0-T8 总方案。
SUT 为现有 framework Runtime/Dispatcher/Stage/Phase/Task 的 V0.3 演进。
本批 RT-U01..04 仅有 design reference oracle/Schema 检查；RT-C/R/I 全为待实现执行用例，
不能因文档、mock、AST 或 test count 通过而标为 production Pass。

上位：[需求](../../10_requirements/software-requirements.md)、[Runtime ISD](../../50_implementation_design/fixed-stage-runtime.md)；
外部测试保持既有 LT-R-001、V03-E2E-095 等 ID，本文只通过 RT-R02 引用，不另造外部恢复协议。

## 2. 引用基线、环境与前置条件

B1-A source main@12f5ee7；STD 由 docs/std.lock.json 锁定；生产代码不在本批修改。
设计 fixture 为固定图、runtime-readiness 和 requirement traceability；runtime_configuration 均 false。
实际用例需要 exact implementation commit、全套配置 hash、测试 manifest、隔离 workspace、
受控 clock、可暂停在指定点的外部假端点，随后以真实 Piko/Tier 和 1/2/6 PR 环境重复。

Test Design 不要求真实测试环境先运行；执行 Case 才要求其依赖资格通过。
不得使用用户现有 workspace、账号、Matrix 房间或真实项目作为破坏性测试数据。
Runtime RT-G01..07 决定对应 Case 的 readiness，未关闭为 Blocked，不是 Fail 或 Pass。

## 3. Case Matrix

| Case ID | Requirement | 场景 | 输入 | Oracle | Evidence | Priority |
|---|---|---|---|---|---|---|
| RT-U01 | V03-RT-001、V03-RS-005 | exact DAG/ID | 15 节点、原 11 canonical key、四个新增设计 key | 无别名、循环、未知/重复前驱；SD 后双分支 | graph diff、schema/semantic result | P0 |
| RT-U02 | V03-RT-001、V03-TS-001 | AND join | SD 通过；四级测试逐一缺自身 TestDesign | 全 eligible 集合精确；缺任何前驱均阻断 | case input/result | P0 |
| RT-U03 | V03-RT-007/013 | false pass/stale | finished、Succeeded 无 Gate、旧版本、effective=false | 结构错误整体拒绝；失效/版本不符不 eligible | negative fixture、validator error | P0 |
| RT-U04 | V03-RT-011、V03-UI-002 | scope/identity | 同名不同 project、重复 ID、多余前驱、工作已执行 | invalid 请求整体拒绝；已 claim 不再 eligible | positive/negative pairs | P0 |
| RT-C01 | V03-RT-008 | 上下文隔离 | 两项目、各两 Stage/worker，用 barrier 强制交错及异常 | workspace/prompt/summary 无交叉；全局 env 不变；复用线程无旧值 | 原始文件树/hash、context trace | P0 |
| RT-C02 | V03-RT-011 | 双 tick 竞争 | 相同 state/work version 同时 claim；同 key replay、异 key 并发 | 单 Work 一次 claim；stale version 拒绝；无重复副作用 | owner transaction、dispatch counter | P0 |
| RT-C03 | V03-RT-003/011 | Ready 后资源失效 | evaluate 后 Plan/Seat/Lease/input 改版，dispatch 前阻塞点 | 旧候选不能 dispatch；完整准备才 Running | before/after snapshots、owner log | P0 |
| RT-C04 | V03-RT-006 | 全活动前沿 | SSD Running 与 STD Preparing，并含多个 Work | snapshot 同时保留两支；不选一项当 current_stage | runtime query、durable records | P0 |
| RT-C05 | V03-RT-007/013 | accept/invalidation 竞争 | 结果回收后、Gate 提升前更新 upstream version | 旧结果不 accepted，无关分支不 rollback | version chain、gate result | P0 |
| RT-C06 | V03-RT-010 | Git/cleanup 归属 | A/B 同时 staged、外来用户文件、重叠 canonical path | 不提交/删除其他 owner 文件；失败保持原状 | exact commit tree、manifest、用户文件 hash | P0 |
| RT-C07 | V03-RT-012 | 局部完成 | selected task、stop_stage，后续阶段未运行 | scope Completed，但 Project 未 Completed | run/project 两种状态 | P0 |
| RT-C08 | V03-RT-012 | pause/resume/cancel | Running 外部调用、unknown outcome、已持久化 outbox | 新 admission 停止，原义务可 drain；unknown 不提前 release | intent/lease/adapter trace | P0 |
| RT-R01 | V03-RT-003/006、V03-IR-001/004 | 本地与资源恢复 | 本地claim、PR准备、逐participant Piko admission前后及两支active时kill | 原Work/Attempt/intent与已受理Run恢复；部分backing不标完整，不回滚已执行业务；summary不冒充ledger | crash point、原202/claim、重启状态、owner证据 | P0 |
| RT-R02 | V03-RT-004 | 无 ID/有 ID lost response | Responses与Embeddings分别注入dispatch后、persist后未dispatch、admission拒绝；Piko Run独立注入；与LT-R-001对齐 | 分别总数1/至多1/0；原key；Responses有ID用recovery GET、无ID原POST，Embeddings始终原POST；Piko按自身窗口恢复，unknown不盲重派 | client capture + server ledger/effect count | P0 |
| RT-R03 | V03-RT-010/012 | publication/reset 崩溃 | Gate 接受后 Git 失败、commit 返回前断线、cleanup 中断 | 只恢复同 publication；不重跑 Agent、不重复提交或删除别支产物 | manifest/hash、commit ref、journal | P0 |
| RT-I01 | V03-RT-009、V03-TS-001 | early Test Design | SD/STD、SSD/SSTD、MD/MTD、ISD/UTD；无代码/测试报告/真实部署 | early Design 可接受策略/Case；不造 TestPassed，不依赖未来报告 | 真实阶段日志和 Artifact | P0 |
| RT-I02 | V03-RT-001/009 | 双分支重叠与执行 join | 两个真实 Piko IR、独立写集合；延迟其中一个 TestDesign | 设计区间确实重叠；Test 仍等待所有 Gate；同 Phase 无双 owner | wallclock区间、同版本 graph、report | P0 |
| RT-I03 | V03-RT-014、V03-PL-005 | 等待和进度预测 | queue/PR readiness/external unknown/user decision 四类注入 | 各 wait owner/原因/影响任务/最迟安全时间可分辨，Forecast 改变 | Plan/Actual/Action/PM 快照 | P1 |
| RT-I04 | V03-PM-001/002 | PM 周期/事件/用户 | 受控 clock 多 tick、critical event 与用户提问竞争 | 每项目最多一个 active PM；不丢 critical input，建议非自动批准 | trigger ledger、普通 Work、decision trace | P1 |

以上 19 个 Case 是后续执行义务。自动化设计检查可能参数化为更多 pytest item，不能用 item 数代替 Case 完成数。

## 4. 正常、边界、负向与并发场景

### V03-AG-001 委派边界用例

以下八项新增用例为 Planned，使用具备预算、固定参与者、评审证据及恢复契约的 Piko 版本执行；
字段未双边冻结时为 Blocked。使用隔离代码仓库、可控编译失败、版本化产物和 provider 端计数器，
先运行受控契约端点，再用真实 Piko 复验。证据包含请求/结果 hash、Run/Attempt、IR/lease、工具执行、
产物与评审版本、预算和 Gate；fixture/mock 结果不能替代真实执行。

| Case | 输入及故障点 | Oracle | 证据 |
|---|---|---|---|
| RT-AG01 | 活动 Run 首次编译失败，Agent 在预算内修改并成功复验 | 同一 Run/Attempt；无 Runtime 重派；最终有效证据才接受 | provider Run、编译两次记录、最终 hash、Gate |
| RT-AG02 | 作者 A/评审者 B；评审 hash H1 后作者改成 H2，分别注入有/无 H2 新评审 | 无 H2 评审拒绝接受；新合格评审可接受；无重复语义 Review | participant、review hash、调用计数 |
| RT-AG03 | 作者冒充独立评审者；Agent 自报完成但工具退出非零或证据缺失 | 独立性和工具证据检查分别拒绝；Stage 不晋级 | 身份校验、工具日志、Gate reason |
| RT-AG04 | 固定Team分别注入提交前成员资格/有效容量约束不齐，以及快照后竞争导致两Run202/一Run429；运行后请求新增专家 | 提交前不具备完整规划前提时零派发；竞争后保留两个已受理Run和partial backing，不标整队Available、不声称撤销即业务回滚、不换key盲补；新增专家经Plan显式后续Work，不由Piko单Run扩员 | snapshot/class/constraint、逐participant原key/task/202/claim、拒绝事实及后续Work |
| RT-AG05 | 受控时间/费用/调用/迭代限额分别触顶 | 停新业务步骤，原义务收口；报告用量；不自动扩预算或释放未知资源 | 预算计数、外部副作用计数、stop/release |
| RT-AG06 | 分别注入传输截断、持久 terminal 缺字段、合法 Result 产物失败 | 重读原结果 / Contract blocker 不改 Result / 正式修复 Work；三条分开 | 原 bytes/hash、query/dispatch 计数、Work lineage |
| RT-AG07 | 已修改部分文件后丢响应或重启，部分工具副作用未知 | 恢复原 Run；不重新应用补丁或重派完整任务，未知先对账 | workspace diff、provider ledger、effect count |
| RT-AG08 | 接受前 Agent 尝试改 Oracle/接受标准或写范围；另用合法 Team 结果与显式 Review Work 两个计划 | 越权拒绝；按派发前指定证据来源接受，缺证据不切换其他路径 | 请求约束、标准版本、计划依赖、Gate |

其中 RT-AG04/05 的触顶后停止与释放以外部确认判定；等待中的 Reviewer 整 Work 占用也必须进入
Plan 负荷。RT-AG02 需验证不同 execution context 仍不能让同一作者身份通过独立评审资格。

每个 Case 至少含正常输入、最小边界、非法字段/状态、关联版本变化；RT-C 使用 barrier/latch 固定竞争点，
禁止用随机 sleep 偶然“测过并发”。schema validator 开启严格 unknown field 与真实 format/type 检查。

构造两个 project、同名 Stage/IR/room label、不同真实 ID，以证明隔离不是依赖名称。
Stage output refs 使用可控 v1/v2；同一个消费者 pinned v1，在上游 v2 生效后必须失效。
Test required set 包含成功、失败、未执行、无效和阻塞各项，不能用总报告 status 字符串作为唯一 oracle。

RT-I01 将 TestDesign 需要的设计 Artifact 准备齐全，但刻意不创建 test/*/report。
TestDesign 成功后仍不创建执行报告。晚期 Test 缺前级报告时必须失败门禁，
防止通过“统一移除 prepare 验证”修复早期阻塞却放宽真正执行。

## 5. Recovery、重放、幂等与故障注入

固定窗口：本地事务提交前/后、外部已接收未响应、有响应头无 body、全部响应头丢失、
Result 已存未 Gate、Gate 已存未发布、Git 成功未记录、资源 release 结果未知。
注入器必须说明前置证据，不把“连接断开”当成“服务端已执行”。

RT-R02 三组 oracle：有 dispatch 证据总数1；仅 durable record 原调用0->最多1；
拒绝或 dispatch 前取消最终0。replay 新增0是“不产生第二次调用”，不阻止原异步调用首次合法执行。
同 logical obligation 保留 key/namespace/body/digest/deadline；业务 Attempt 不增长。
Responses/Embeddings按Tier D=24h及resolved-terminal后至少168h规则分别检查；Piko Run按其recoverable_until/7天记录规则，不套Tier窗口。超出对应允许恢复窗口或UnknownOutcome时转明确恢复问题，不改key继续试；请求deadline到达不等于Invocation已terminal或Seat已释放。

RT-R03 不能用 git commit exit code 猜是否已提交；原 publication identity、manifest 与 commit tree
必须能证明同一结果。证据不足则 Blocked/reconcile，不重做业务。
Session close 复用 V03-E2E-095：同 key replay 返回原 Closing/Closed/RecoveryRequired receipt，
新合法 key 在已 Closed 时才可 AlreadyClosed；机器 enum 未对齐时该外部 Case 为 Blocked。

## 6. 性能、容量、功耗或时序测试

设计图只有 15 节点，Work 数可多，reference 检查不是吞吐测试。
真实测试先固定两分支与两 IR，再执行 1/2/6 环境矩阵，记录排队/准备/执行/发布各段时间，
P50/P95、最大等待、样本量、失败/unknown 数及环境 fingerprint。
Stage 与 Phase 两层并发共同受可用 IR/PR 约束。RT-G05 阈值未批准前仅可报告 measured，
不能报告满足 SLA；功耗/硬件时序不适用本软件切片。

## 7. 执行步骤与自动化入口

1. 从干净的 exact implementation commit 创建隔离工作目录，记录环境/依赖/Schema hash。
2. 运行 JSON Schema 和 semantic negative qualification，确认删边、改版本、跨项目、fake pass 均被检出。
3. 当前设计入口：scripts/test.sh tests/unit/design_baseline；generator 使用 --check 验证派生映射。
4. Runtime 编码后，以同输入执行生产 dispatcher，逐例与独立 reference oracle 对比。
5. 执行 RT-C/R 的控制点与故障注入；先 mock 可重复，再在真实 provider 重跑其必需部分。
6. RT-I01/02 在真实两个 IR 和 artifact/Gate owner 下执行，再做带 Plan/View 的 I03/04。
7. 每个 defect 指定本应检出的最低层，补对应负例，先下层重跑，再回上层。

目前没有 RT-C/R/I 的生产执行入口。本规格明确阻断未实现用例，不写一个总返回 Pass 的占位 runner。

## 8. Pass/Fail/Blocked/Invalid 判定

Pass：该 Case 的所有 required 子场景在声明层级执行且 oracle 全满足。
Fail：SUT 偏离契约或出现重复副作用/越权/漏测。
Blocked：前置契约、资源或 Gate 尚未就绪，记录 owner/解除条件。
Invalid：测试数据、故障点或 Oracle 不合法，不能计成功/失败覆盖；先修测试再复验。

设计期结果只能标 DesignCheckPass；从同一 Python helper 算 expected 再比较 actual 无效。
各 Case 的 expected 集合/效应计数独立指定，受控 mutation 不得同时改 Oracle。
V03-TS-003 的真实代码 mutation 尚未执行，本批结构 mutation 不作为其完成证据。

## 9. Artifact、日志、测量与证据保存

每次 Run 保存 case/subcase ID、Requirement、implementation/provider/SDK commit/version、
环境/配置 hash、input fixture、fault point、实际 timeline/HTTP/event、外部 effect count、
expected/actual、verdict、defect、复验链、artifact SHA、时间与操作者。
摘要、JUnit 和图表不能替代原始 execution records；unknown 与未执行必须可见。

B1-A 证据单独保存在 docs/91_reviews/evidence/runtime-design-b1/；
不覆盖 docs/98_migration/v03-mainline-rollin 中的 B0 固定证据。
当前证据明确 production_runtime_tested=false、runtime_activation=false。

## 10. 安全、清理与可重复性

fixtures 只含合成 ID，不含 credentials、项目真实消息或用户数据。
故障注入只在授权隔离环境执行；清理以本次 namespace/manifest 为界。
未知外部调用、房间归属、占用 Lease 未解决前不得把环境归还池。
保留外部审计与摘要，禁止为过测试删除失败记录或重建一个看似全新的 Attempt。
