<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky 固定 Stage Runtime 实现设计总纲

| 文档字段 | 值 |
|---|---|
| Document ID | `slinky-fixed-stage-runtime-isd` |
| Document Version | `0.3.0-draft.3` |
| Status | `Draft` |
| Project | `slinky` |
| Authority | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Authors | `Codex` |
| Created Date | `2026-09-09` |
| Last Modified Date | `2026-09-16` |
| Template ID | `design.definition` |
| Template Version | `0.1.0` |
| Template Conformance | `native` |
| Tailoring Reference | `none` |
| Migration Map Reference | `none` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/50_implementation_design/fixed-stage-runtime.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_COVER_END -->

> 2026-09-17 实施范围撤回通知：依据[用户最新裁决](../90_decisions/intelligent-process-scope-20260916.md)，本文中固定图自动业务推进、自动失败升级、容量/Seat/claim、模型级恢复、Cost、自定义通信/附件与跨系统close/drain条款退出当前authority。以下旧版正文仅供迁移定位；不能作为本轮已批准实施规格。无关的权限、版本一致性、真实质量证据仍保留，当前目标见新版系统设计、SRS和接口控制；下游须先完成对应修订再编码。此通知不把旧版本测试/签署改写为新版验证。

## 1. 目的、范围与上位输入

本 ISD 细化 [Project Runtime Engine](../40_module_design/runtime/design.md) 的固定 Stage 演进。
需求为 V03-RT-001..014、V03-RS-005、V03-TS-001、V03-UI-002；源代码基线 main@12f5ee7。
只使用当前 Runtime/BaseStage/Phase/Task 机制；本批交付设计、静态 Schema、fixtures 和测试设计。
物理 ledger 选型未批准，不在本批创建新的数据库、服务、进程、配置入口或兼容分支。

2026-09-14 范围增量：系统设计 §2.3 已增加新项目 Research / 旧项目 Analysis 共用 Project Assessment，以及用户选择一个/多个/全部工程阶段。
本文以下 StageSnapshot/ReadyWorkRequest 及 reference oracle 仍是全流程算法，尚不支持导入资产的依赖资格。
部分范围接线前须在同一 DTO/validator 中加入 scope_ref、基线输入绑定和传递失效检查；
“所有前驱 Succeeded”仅适用于本次也选择了全部前驱的范围，不得用于要求旧项目重跑全部流程。
未选 Stage 不产生成功快照；部分范围结果与全流程交付分开。字段语义见
[View Contract §12](../60_interfaces/contracts/view-contracts.md#12-项目分析与执行范围契约)，
验收为 V03-SCOPE-001..012。本增量机器契约与生产实现未完成，保持独立未关闭项。

范围接线同时承接 View Contract §12.3：工程 ready/claim/dispatch 校验精确 Plan/scope 的 execution_authorization=Enabled 与 start_receipt_ref；发布事务建立 AwaitingStart，start 事务保存授权，continue 不隐式启动。恢复区分原执行义务和新派发。Plan 候选在现有 Store 保存及按引用恢复，提交重验原候选摘要/来源版本；无代码设计基线允许 code_revision=null，但每阶段必需输入分别资格。上述字段、原子边界和故障 oracle 须进入同一机器契约及实现测试后才启用部分范围执行。

本文是跨文件实现设计总纲（cross-level），不是单文件编码 ISD，也不登记第二个 target_file。
按 [本项目 ISD 规则](README.md)，后续仍须原地修订 source_target_manifest 和每个目标文件的 ISD；
本文的候选接口与源落点只作为其上位输入。V03-D03 的逐文件退出条件本批尚未满足。

## 2. Ownership 与边界

Runtime 是 WorkExecution/Attempt/Stage transition 和恢复的 owner；Plan 是 PlannedWork/PlanVersion owner。
Gate/Artifact owner 提供 exact version 的 Acceptance，IR/PR/Tool owner 提供可使用资源证据。
Piko owner 管 Agent Run/Result/Matrix transport，LLMTier owner 管 admission/Invocation。
源码中的 task_state/summary/repository 是现有内部设施，不获得业务审批 authority。

Slinky 不调 LLMTier generation；本 ISD 不重新定义其外部 wire state/headers。
SourceInstance 仅作观测关联，不成为恢复 namespace。不同项目不可复用 Work、Room 或资源 claim。

## 3. Current Baseline 与 Approved Delta

已确认范围：固定 DAG、早期 Test Design、Plan/Runtime 分离、IR/PR、唯一 Piko 路径。
未实现事实：当前 11 节点线性 dispatcher；单 current_stage；进程全局 WORKSPACE_ROOT；
测试设计与执行共用晚期前置检查；共享 Git index；summary SQLite 只存完成摘要。
可运行的 Phase 并行不能证明 Stage 并行安全。

本 ISD 提议内部函数和记录结构，须 G1/RT-G01..07 对应 owner 审阅。
不把候选数据模型自动映射到现有磁盘格式；更不能边运行旧 writer 边写新模型。

## 4. 设计概览与主流程

```text
Runtime.run
  recover outstanding obligations
  read same-version Plan + full Stage/Work snapshot + accepted Artifact refs
  StageDispatcher.evaluate_ready -> all dependency-ready Work IDs
  claim_work(expected revision, Plan ref, inputs) -> Preparing
  validate IR qualification/non-reserving capacity; prepare PR/Tool -> Ready
  recheck invalidation/deadline -> durable per-participant intent -> single-Agent Piko Run
  persist original 202/claim or rejection; retain partial backing without rollback
  record Result -> Reviewing -> Gate + artifact publication -> Succeeded
  update Actual + summary projection -> recompute graph frontier
```

evaluate_ready 不分配资源、不写磁盘、不选择模型、不生成计划、不自动重试。

`Reviewing`是Slinky的接受检查状态：按Plan固定的参与者和证据来源，收集各单Agent Run的outputs与评审Artifact，
校验评审身份、最终产物hash、Finding、工具证据及输入有效性。Piko没有多Agent Team Run或团队Result字段；
团队组织与汇总由Slinky负责。计划要求独立Review Work时等待其证据；已满足同一评审义务时不重复Review，
也不逐条将Finding变成Runtime编辑指令。作者修改产物后，旧hash的评审不能用于新产物接受。
多个 ready 的实际启动由 Plan priority/due time 与 owner admission 决定；返回顺序不承诺执行顺序。
同一 tick 最多 claim 一次同一 Work；两个 tick 的相同读取需由 CAS 阻止双领。

每级设计完成只释放其固定后继。分支未通过不会阻断所有工作；
没有 ready 不等于 Completed，必须检查等待集合、未决 obligation、scope 完成条件。

## 5. 内部分解与依赖

2026-09-16 下游设计起点为 `main@649aca74c2`，上游批准范围由
[SLK-DF-20260916](../91_reviews/three-party-design-freeze-decision-20260916.md) 固定。
本次新增 §7.3..7.7 的 R-D02 事务/恢复细化，不修改已冻结的提供方工件。
逻辑记录和事务是待逐文件 ISD 落实的设计；物理存储迁移仍须 RT-G01 审阅，不等于运行态已实现。

### 5.1 Stage identity 与注册

图上 id 为 B0 设计记号；runtime_stage_id 是 canonical 代码名。
新增四个 Test Design 只在现有 config/factory 注册，不开 runtime graph file 配置。
原 isd_design/*_testing 名称保留；生产解析器不接受 isd、unit_test 等别名。
fixture 是设计证据，不由生产服务加载；实现必须与同一固定边表的 Contract Test 对齐。

### 5.2 测试设计和执行唯一归属

| 层级 | 现有源码/Phase | 早期 Test Design owner | 后期 Testing owner |
|---|---|---|---|
| System | system_testing_stage/runtime.py、models.py、design_phase.py 等 | design 中的策略/范围/风险/环境需求；suite/scenario/family/case_design 与测试数据/脚本构造说明 | case/data/script 的实际资产、环境部署/preflight、execution/traceability/report |
| Subsystem | subsystem_testing_stage/runtime.py、scope_phase.py、scenario_phase.py 等 | scope_and_topology、scenario_design；接口/数据/环境设计要求 | interface_and_data_prepare 的实体资产、environment_prepare、execution、interface_state_verification、report |
| Module | module_testing_stage/runtime.py、scope_phase.py、case_phase.py | scope_and_contract、case_design 和构造方法 | data_prepare、script_prepare、execution、report |
| Unit | unit_testing_stage/runtime.py、interface_phase.py 等 | interface/catalog/group/case 中来自 ISD 的接口、覆盖、Case、Oracle | script/smoke/execution/fix；代码实现核对、构建与运行资格 |

不是简单把 PHASE_ORDER 截一半：例如 System design 含 environment_deploy/readiness 内容，
必须把“部署要求”与“部署执行结果”分开；前者可在无真实环境时完成，后者只能在 execution side 生成。
Unit interface 当前含执行产物和其他 phase task 预创建行为，必须改为读取已接受 ISD，
且不得提前创建 Coding/Test Execution 的完成状态。已审 case 不在后期重新推导另一版本。

在既有各 testing package 中移动/reuse Phase 实现，为四个新 Stage 提供同一 BaseStage 的入口类。
不复制 design_phase/Case 算法；同一 Phase 实例不得跨 Work 共享可变 runtime context。
旧 Testing Stage 只消费 TestDesign Artifact，删除同职责的旧注册，避免双路径。

### 5.3 前置条件按使用位置分离

- Test Design：对应设计、上级 Test Design（若有）、模板/标准和知识能力已接受；不读取未来 Test Report。
- Testing：本级 Test Design、固定前级 Test Report（Unit 为 Coding）、资产资格、环境与资源就绪。
- PreparedTestingStageRuntime.prepare 的前级报告检查保留在 execution side，不能整体移除。
- SystemTestingStageRuntime.prepare 的 Subsystem Report Gate 同样不得被 early Design 调用。
- 测试设计有准确 Case/Oracle，但还没有脚本实测时只能 DesignAccepted，不能 TestPassed。

### 5.4 产物与清理

保留现有 test/{level}/design、Case manifest、runtime/report 语义与唯一 writer。
新旧具体路径归属清单由 RT-G06 检查：每个文件只能有一位当前 owner，引用必须带版本。
移交的是设计 authority，不通过复制目录建立新旧两套可写测试资产。

prepare_stage_rerun 不得按测试根目录删除另一个分支的 accepted design。
旧 unit clear_stage_outputs 中的 tests/unit 根删除、System design before_run 的旧索引清理
必须纳入 scope manifest；触及非本 Work 文件、symlink 外逃或活跃引用时返回 CleanupConflict。
删除前保存可恢复清单和归属校验；用户文件不自动 reset/checkout。

## 6. 接口与契约

以下是**内部 Python 接口候选**，不是新增 REST 路径。名称/签名在 G1 后才可用于 production types。
Schema 仅覆盖 evaluate_ready；其他操作的完整机器 DTO 属于 RT-G02，不能用 Any dict 直接接线。

| Operation | 参数 | 返回 | 错误 / 副作用 |
|---|---|---|---|
| StageDispatcher.evaluate_ready | ReadinessRequest：schema_version、project_id、plan_version、state_revision、stages[15]、candidates[] | ReadinessResult：同 project/plan/revision、eligible_work_ids[]、blocked[{work_id,reasons[]}] | Schema/Scope/Graph/IdentityInvalid；纯函数、零 I/O |
| Runtime.claim_work | project_id、work_id、plan_version、expected_state_revision、expected_work_version、input_refs[]、command_key、actor_ref | WorkExecution ref/version、attempt_id、status=Preparing、intent_ref；同 key replay 原结果 | ScopeDenied/VersionConflict/InputStale/AlreadyClaimed/IdempotencyConflict；本地事务写 claim+intent |
| Runtime.record_result | project_id、work_execution_id、attempt_id、external_run_id、result_ref/hash、expected_work_version、command_key | result_receipt_ref、new_work_version、status=Reviewing | ForeignResult/HashMismatch/UnknownRun；持久保存 receipt，不接受 Artifact |
| Runtime.accept_work | project_id、work_execution_id、expected_work_version、gate_ref、exact_input/output_refs、command_key | acceptance_ref、new_work_version、publication_status | GateRejected/InputStale/PublicationBlocked；接受与 publish intent 同事务 |
| Runtime.recover_project | project_id、expected_schema_version、writer_epoch | active_work_refs[]、pending_obligation_refs[]、blockers[] | StoreCorrupt/WriterConflict/ContractMismatch；恢复原记录，不创建新 Attempt |
| Runtime.read_runtime_snapshot | project_id、actor_ref、known_revision（可空） | revision、active_stage_ids[]、work snapshots、wait reasons、scope_status、project_status | ScopeDenied/SourceUnavailable；只读投影，不由日志反推 |

同 key/digest replay 返回原记录的命令结果；最新状态通过 read query 获取，不把旧 receipt 改写为当前态。
expected version 只在新命令 admission 时比较；已授权同 key 的 replay 先检查身份/digest 再返回原结果，
不得因当前版本已变化而重复执行。旧 key 改 body 为不可重试 IdempotencyConflict。

### 6.1 ReadinessRequest 字段

| 字段 | 类型与约束 |
|---|---|
| schema_version | 常量 slinky-runtime-readiness/v1；candidate，不是磁盘/网络版本 |
| project_id / plan_version | 非空 opaque string；调用方已授权 project |
| state_revision | 非负整数，来自同一原子快照 |
| stages | 恰好 15 条 StageRecord；canonical stage_id 唯一且集合精确 |
| StageRecord.status | Pending/Running/Succeeded/Failed/Blocked/Cancelled/Stale |
| StageRecord.gate | null 或 {decision:Accepted, output_version:非空, effective:boolean}；Succeeded 必有 Gate |
| candidates | WorkCandidate 数组；work_id 唯一，project_id 与快照相同 |
| WorkCandidate | work_id、project_id、stage_id、work_status、inputs[] |
| inputs | 恰为固定直接前驱集合；每项 stage_id + pinned output_version，顺序无语义 |

stage status=Succeeded 但 gate.effective=false 表示刚收到失效信号的快照，必须阻断，
不能在消费端自动重写状态为成功。Schema 只验证结构，语义 validator 检查集合/唯一/项目/前驱集。
投影只有在必需 publication 完成后才给出 Succeeded 且 effective=true；保存了 Acceptance 但尚未发布
不能提前投影该组合。生产 Gate owner 与 projection 的接线必须另由 RT-C05/RT-R03 验证，reference 不证明它。
失败验证必须整体返回错误，不能 partial success。输入不存在的 future output_version 可作为计划占位，
但只有有效 Gate 的 exact version 一致时才进入 eligible。

ReadinessResult 的原因枚举：WorkNotPlanned、StageNotRunnable、PredecessorNotAccepted、
InputVersionStale。多个原因按枚举顺序去重；eligible/blocked 互斥且并集等于所有候选 Work，
按 work_id 排序。这是依赖 oracle，不包含 Plan 到期、资源可用或外部 admission 成功的承诺。

### 6.2 消费接口的前后置条件

| Owner | 调用时机 / 输入 | 必须返回 / 失败行为 |
|---|---|---|
| Plan | tick：project、active version、due frontier；claim 前重读版本 | Work ID、scope、due/priority、IR/PR requirements；过期版本阻断 claim |
| Artifact/Gate | ready 与 dispatch/accept 前：exact input refs | effective refs、accepted gate、version；missing/stale 不当成功 |
| IR/PR/Tool | Preparing：原 intent identity、Work scope、需求 | exact binding/lease version、到期、readiness；unknown 保留 obligation |
| Piko | 原 dispatch intent：固定 consumer Contract DTO | Run ID、strict Result 或 typed error；无 ID 丢响应按该接口幂等恢复 |
| View | 已授权 query | owner snapshot/revision、SourceError/Stale；不返回外部 Secret |

尚未冻结的字段只能记为 Gate，不能由 Runtime 自造默认值再声称 Contract 已满足。

## 7. 数据、状态与生命周期

### 7.1 逻辑记录与事务不变量

| 记录 | Key / writer | 不变量 |
|---|---|---|
| Project execution | project_id / Runtime | state_revision 单调，schema_version 明确，只有一个合法 writer epoch |
| Stage progress | project + canonical stage / Runtime | required Work 基线、accepted output refs 与状态一致 |
| WorkExecution | project + work_execution_id / Runtime | 绑定 PlannedWork/PlanVersion；input refs 固定；至少有一个业务 Attempt |
| Attempt | execution + attempt_id / Runtime | transport retry 不换 identity；业务 retry 必须已知前一结果且经策略允许 |
| Dispatch/acquire obligation | attempt + operation identity / Runtime adapter | 先 durable intent 后外部调用；unknown 不删除 |
| Result/Acceptance | attempt + result/gate refs / owner | 不变证据与 hash；success 和 accepted 分离 |
| Publication checkpoint | accepted scope + manifest hash / Runtime/Repository | 保存 intent、base/commit ref、outcome；Git 失败不重跑业务 |
| JSON/SQLite summary | scope + source revision / projection writer | 可重建，不准反写执行 authority |

RT-G01 尚未决定具体物理表/文件；现有 RuntimeSummaryStore.sync_summary 会清非终态数据，
不得直接增加几列就声称满足上表。先评审复用既有持久化设施的最小方案与迁移协议，
确实需要新机制时必须单独批准，不在这一 ISD 里暗中引入。

### 7.2 原子边界

claim：检查 Plan/Work version、保存 Preparing+Attempt+acquire intents，在一个本地事务完成。
外部资源无法和本地事务分布式原子提交：逐 owner 幂等确认；失败收敛/补偿，未全部确认不 Running。
accept：重新检查输入有效性、保存 Gate/Acceptance + publication intent；后续 Git/summary 是可恢复发布。
下游必须同时满足 Gate 有效及 required publication 完成；发布未完成不触发新 dispatch。
publication checkpoint 与 Work Succeeded 的先后关系由同一状态版本控制，不从 Git log 猜接受事实。

### 7.3 R-D02 记录约束与存储复用候选

逻辑记录采用 §7.1 的同一组实体，不建立第二个事件总线或恢复服务。下表是内部持久化约束，
不是提供方 DTO，也不是已经执行的 DDL；最终列类型、迁移和连接策略须进入逐文件 ISD。

| 记录 | 唯一性与版本 | 必须保存 / 不得推导 |
|---|---|---|
| Project execution | project_id 唯一；state_revision、writer_epoch 单调 | active Plan/scope/start receipt refs、当前写者、模式与 schema version；不能由 summary 重建 |
| WorkExecution / Attempt | project+work+execution；execution+attempt 唯一；work_version CAS | pinned Plan/scope/input refs、状态、blocked_from；同 execution 最多一个允许新派发的 Attempt，旧未知义务始终保留 |
| Command receipt | project+actor scope+operation+command_key 唯一 | digest algorithm/version、digest、不可变原结果引用；receipt 与对应本地变更同事务提交 |
| Acquire / dispatch intent | attempt+participant+operation identity 唯一；intent_version CAS | exact provider/binding/endpoint、原 key/task、语义 headers、request digest 与受保护请求引用、发送资格；不能从日志再造 body |
| External evidence | intent+provider record identity+version 唯一 | 原202/拒绝/Run/claim/Result 的受限证据引用及 hash、观测时间；乱序版本不覆盖较新事实，同版本异内容阻断 |
| Publication checkpoint | acceptance_ref+manifest hash 唯一；publication_version CAS | exact owned path/hash/size、expected Git base、目标产物与提交证据、未决状态；Git commit message 不是业务 receipt |
| Actual / projection checkpoint | owner+source transition identity 唯一 | 已应用 source revision、目标 owner receipt；Actual 由 Plan owner 更新，Runtime 仅保存其确认 |

所有跨记录引用必须归属同 project/execution/attempt；外部 Run ID 还必须匹配原 Client、task 与 binding。
删 Work、重排 Plan、投影清理均不能级联删除未决 intent/receipt。command key 的过期策略须与业务恢复窗口一起审阅，
在尚未定义该策略前禁止自动清除；不能直接照搬提供方的7天窗口作为所有本地记录的TTL。
保存请求引用的受保护字节先固化并验 hash，事务再绑定；缺失或损坏为恢复阻塞，不从 Prompt/template 最新值重建。
credential 不固化进请求证据，发送时使用现有 Secret binding 且重验当前权限。

物理复用首选候选是现有 `meta/runtime_summary.sqlite3` 中增加与摘要表隔离的权威表，
继续使用 `src/utils/sqlite.py` 的唯一加载入口；不新增数据库路径、配置或进程。
该候选尚未批准：当前 `_connect` 的 NORMAL 同步级别、每次建表、仅进程内 RLock、
`sync_summary` 清非终态和读取时跳过坏 JSON 均不能直接沿用于权威记录。
若采用此候选，连接/显式事务/迁移入口必须分责，summary clear/rebuild 只准操作三张摘要表；
任何删除整个数据库文件的调用都必须禁止。权威坏记录应 StoreCorrupt 并关闭写入，不允许跳过后继续派发。
后续须先审计所有 db path/reset/backup 调用再裁决；若现有设施不适合，先报告取舍，不暗中另开 Store。

### 7.4 R-D02 本地事务与外部确认顺序

每个 mutation 先做当前授权和基础结构校验，再比较同 scope 的 command digest；
已有同 digest receipt 返回原结果，异 digest 拒绝。新命令才比较 writer_epoch、expected versions 及前置状态。
事务更新 work_version/state_revision 并写 receipt，任一失败整体回滚；不得跨网络、Tool 或 Git 调用持有数据库事务。
commit 的返回不确定时重新读取原 command receipt；存储不可读时停止新副作用，不能假设回滚而重做。

| 边界 | 一个本地事务内 | 事务外动作及再次确认 |
|---|---|---|
| TX-01 claim | 校验 active Plan/scope/start 与输入版本；写 Preparing、Attempt、prepare intents、receipt | 各资源 owner 按原 identity prepare；记录逐项结果，不承诺跨方原子预留 |
| TX-02 dispatch qualification | 重验 Work/授权/输入、资源证据有效期；绑定每 participant 的不可变请求与 dispatch intent | 提交原 Piko POST；存在 intent 不代表已受理。Piko admission 是最终裁决，snapshot 不是保证 |
| TX-03 provider confirmation | 关联原 intent，保存原 receipt 与 claim/version；同事务推进本地 backing 投影 | 所有 participant 的受理及 Held 证据齐备才完整 backing；已完成的 participant 保留历史受理而不虚构当前 Held |
| TX-04 Result capture | 校验原 Run/task/attempt，绑定完整不可变 Result 及输出摘要引用，进入 Reviewing | 通过原授权读取 Artifact/可信输入证据，按自己的材料清单与 Gate 规则验收；无代理推理或第二证据通道 |
| TX-05 acceptance preparation | 重验 pinned inputs、当前 Gate 和授权；记录 Acceptance 与 publication intent | 该 Acceptance 尚不对下游 effective；Repository 按 manifest 发布，失败不重新执行 Agent |
| TX-06 publication confirmation | 核验 publication 证据及最新 invalidation revision；保存 checkpoint，符合条件才 Succeeded/effective；写 Actual 更新意图 | Plan owner 幂等应用 Actual；summary/View 由已提交 revision 重建。不属于同一 Store 的 Actual 不声称与 TX-06 原子 |
| TX-07 owner acknowledgement | 保存 Actual/release 等原 owner receipt 与版本、完成相应 obligation | 单项已释放不清除其它 Run、claim、Tier Seat 或 communication drain 义务 |

本地版本 CAS 只证明本地输入没有变化。对远端或不同 owner 的输入，必须记录授权 observation/版本/有效期，
由相应 owner 在操作入口复核；不宣称跨系统 ACID。失效在 TX-05 后到达时即使 Git 发布完成，
TX-06 也不得把该产物宣布为有效；保留已发生的发布事实并阻断后继，由正式修复策略处理，不自动撤销 Git。
同一接受引起的 Actual 更新使用固定 source transition identity；丢确认时查询/重放同一内部命令，不能再次累计耗用。

### 7.5 R-D02 写者、发布和启动恢复

每次新本地 mutation 都校验当前 writer_epoch；旧 epoch 的回调不得直接变更权威记录。
恢复写者可以按原 intent 重新取证。RLock 只保护单进程，epoch 也不能停止已经在执行的 shell/Tool/Git。
因此取得本地写者记录不等于接管完成：旧 writer/tool/wakeup 必须有可验证的 fence，
无法证明时保持只读恢复与 RecoveryRequired，不因租期或机器失联自动开始新副作用。

Repository 发布先固定 owned manifest、expected base 与 publication identity；检查 index/工作文件没有其它 owner 的写入。
发现外来 staged 文件或 base/version 变化返回 PublicationConflict，保留用户改动，不 reset、unstage 或扩大提交集合。
Git 已完成但本地确认丢失时，恢复必须核对原 publication 所绑定的 base、完整树差异及每项内容摘要；
仅看到相同提交信息/HEAD 已前进不足以确认。无唯一证据时保持未决，不盲目再提交或重跑 Work。
所需 Git 证明格式及防止 check-to-commit 竞争的具体写者隔离留在 RT-G03 逐文件设计中，不以本表宣称已实现。

启动顺序固定：读取 schema/项目身份并校验完整性 → 取得合法本地恢复写者 → 校验旧 writer fence →
枚举所有未决 prepare/dispatch/Result/publication/Actual/release → 按原 identity 查询确认 →
重建同 revision 投影 → 重读 Plan/scope/start/失效集合 → 计算完整 frontier。
暂停项目允许读恢复与安全收口，不允许新 claim/dispatch；一条异常不能被跳过后把整个项目宣布 Completed。
过期外部恢复窗口、404/410 或权限不足均保留明确 blocker，不能通过新 Attempt 消除未知执行事实。

### 7.6 R-D02 故障注入与定位 oracle

以下是必须进入实现测试的 Case 设计，不是已运行测试结果。首次归属以首个违反约定的边界为准；
证据不足为 Unlocalized。共同证据只含 scoped identity、digest/version、typed code、脱敏 evidence refs，不跨方传原始内容。

| Case | 注入点 | 必须观察 / 禁止结果 | 首查 owner 与内部检查 |
|---|---|---|---|
| RD02-01 | TX-01 提交前/后进程退出 | 无半个 Attempt；提交后按原 receipt 恢复，同 Work 不双领 | Runtime：事务、唯一键、expected version |
| RD02-02 | 本地 commit 成功但调用方未收到 | 同 key 返回原结果，Work/Actual 不重复推进 | Runtime Store：receipt 与 mutation 是否同事务 |
| RD02-03 | Piko 接受后响应丢失 | 原 task/key 恢复同 Run；socket 写成功不算202，无第二身份 | adapter → Piko：intent digest、原 admission record |
| RD02-04 | N participant 部分202、部分429/未知 | 保留每项真实结果，不标完整 backing，不用取消伪造回滚 | Runtime：participant 集合；Piko：对应 claim |
| RD02-05 | 旧 writer 恢复、延迟回调到达 | 旧 epoch 更新失败；未证明 Tool fence 不恢复派发 | Runtime/Tool：epoch CAS、writer/wakeup fence evidence |
| RD02-06 | Result 重复/乱序/同版本异 hash | 重复无副作用；较旧不覆盖；异 hash 阻塞接受 | adapter：原 Run 关联；Artifact：bytes/hash |
| RD02-07 | 接受后、发布前或确认前输入失效 | 保存历史证据，effective=false，后继不派发 | Runtime/Gate：invalidation revision 与 TX-06 |
| RD02-08 | Git 成功后 TX-06 前退出；混入外来 index | 唯一证据确认原发布，否则阻塞；外来文件不提交、不清理 | Repository：base、manifest、tree、写集合 |
| RD02-09 | Actual 应用后确认丢失；投影丢失 | 同 transition 只累计一次；投影重建不写执行事实 | Plan：原 Actual receipt；summary：source revision |
| RD02-10 | DB/WAL 缺失、坏 JSON、schema 不兼容 | StoreCorrupt/ContractMismatch，零新派发，不跳坏行继续 | Store：一致备份、schema/version、完整性 |
| RD02-11 | Required 输入证据缺失、篡改或只覆盖部分 | 不接受覆盖、不用 Agent summary 补足；原 Result 不改写 | Artifact：outputs 唯一路径/generation/hash/ranges |
| RD02-12 | 仅 Piko claim Released，Tier/drain 仍未知 | 单项释放如实记录，Session 不 Closed | 各 owner 的原 release evidence/version，不手改 ledger |

### 7.7 R-D02 进入编码的退出条件

本批完成逻辑事务与恢复切片，R-D02/RT-G01..03 仍未整体关闭。下一步按同一设计细化：
`runtime.py/models.py` 的完整内部 DTO 与状态转换；现有 summary/SQLite 设施的权威表隔离、
迁移版本与旧 writer 停机协议；Repository/context 的 writer fence 与 manifest 提交。
物理方案须明确 durable commit 的同步/文件系统前提，以及 DB+WAL 一致备份与恢复后禁派发检查；
不得只复制在线主数据库文件，旧 summary 不迁成虚构的成功执行记录。
DDL、迁移回滚限制、内部命令保留策略及逐文件目标映射审阅完成后才能编码权威 writer；
之后运行 RD02-01..12 的多进程/crash/恢复测试，才能关闭对应实现门禁。此次不新增 REST/外部 DTO，不需重新请求三方 ACK。

## 8. 控制流、并发与时序

### 8.1 Ready 与 dispatch

1. Runtime 在只读一致快照中读 Plan、Stage 和 Work；对不可同事务读取的外部版本保存 observation ref。
2. validator 检查 fixed graph identity、15 Stage、唯一 Work、same project、exact predecessor input set。
3. 对每个 Planned candidate：本 Stage 必须 Pending/Running，所有前驱 Succeeded、Gate effective 且版本匹配。
4. 返回全部 eligible 和 blocked；按 ID 排序仅为复现性。
5. Runtime 按 Plan 排序尝试 claim；CAS 失败重读，不复用旧结果继续写。
6. Preparing 完成后、真正 dispatch 前再次检查输入、期限、Seat/Lease；旧外部 observation 不保证 admission。
7. 保存 dispatch intent 后调用 Piko。Result 到达先归属校验、保存，再 Review/Gate/Accept。
8. 发布成功后更新 Actual/summary，重新计算两个分支；不是 next_stage += 1。

### 8.2 上游变化与并行失败

upstream version 变更先标 invalidation，再生成受影响 Work 集合；
Preparing/Ready 不能 dispatch；正在执行的外部调用只在安全边界收敛，结果不得按旧输入自动接受。
不修改正在执行 Work 的 pinned inputs，不自动跨 Stage rollback。
失败的 Design/TestDesign 后继阻断；无因果依赖的其他 Work 可继续。
同一 scope 的业务 retry 需显式失败事实/策略，不能在外部 UnknownOutcome 时套用现有 max_attempts 循环。

### 8.3 Lost-response 的三个 dispatch oracle

Piko/Tier adapter 依对应 owner Contract 恢复；Slinky 不直接实现 Tier 的第二 recovery client。
已有 ID：查询原 Run/Invocation；无 ID：在冻结窗口内重放同 endpoint/body/key/digest/语义 headers。
stock SDK retry 关闭不等于禁止显式 recovery adapter。

- 已有受控 dispatch 证据后丢响应：总 dispatch=1，重放新增=0。
- durable record 后、首次 dispatch 前丢失：原记录可以从 0 推进到最多 1；不增加第二 dispatch intent。
- admission 拒绝或 dispatch 前取消：dispatch=0。
- UnknownOutcome：仅 query/reconcile，不创造新 key/Attempt 掩盖未知。

### 8.4 上下文、产物与 Git

复用 prompt_context 的 capture/set/restore，显式传入 workspace/project/stage/work/attempt。
创建 Phase worker 时捕获父 context，finally 恢复先前 context；作用域结束后无残留。
所有读 workspace 的入口包括 task_state、summary、filesystem、prompt 和 Stage clear 都须迁移，
只改 Runtime 的 with 块不足以隔离。

同 project 的 canonical 写入用 owner manifest 检查重叠；冲突只串行该写集合。
Repository 的 task staging + stage commit 必须放到同一受控 publication 边界，按 exact manifest
确认 staged 文件只属于该批次；不能只给现有无 pathspec commit 加一次重试。
外来 staged 文件保持原状并返回 PublicationConflict，不自动 unstaging/reset 用户修改。
可并行的是独立工作生成，不是共享 Git index 的无限并发提交。具体实现 RT-G03 审阅后决定。

### 8.5 暂停、取消和完成

pause 禁止新业务 claim/dispatch，已有查询、收据持久化和安全 drain 可继续。
release 只有 owner 已确认结果安全时执行；timeout 不等于外部 cancel 成功。
resume 首先恢复旧 obligation 再评价新的 eligible。
selected task/stop_stage 只关闭 invocation scope；整个 project 必须满足全部 required Stage、
待办问题/发布要求和收尾检查才 Completed。

## 9. 失败、恢复与可观测性

| 触发点 | 记录与处理 | 返回主路径 |
|---|---|---|
| Schema/身份/前驱集错误 | typed validation error，无任何 claim 或 side effect | 修正调用输入，重新读快照 |
| Plan/状态版本竞争 | VersionConflict，零外部调用 | 读取新版本后重新评估 |
| Gate 失效 | InputStale，标受影响 Work，通知 Plan | 明确新输入/restart 决定 |
| IR资格/PR准备失败或逐Run部分受理 | 提交前失败不dispatch；提交后保留原202/claim与拒绝，unknown按原key恢复，取消不证明回滚 | 不标整队完整backing；已受理Run不能遗忘后重派，原义务独立收口 |
| 外部超时/断线 | 原 Attempt obligation，禁止 blind retry | 相同身份恢复到已知结果 |
| Result 传输截断/暂不可读 | 保存查询错误，保留原 Run/result 引用 | 在原恢复窗口重读，保持原身份 |
| 持久终态 Result 越 scope/缺字段 | 保存原 bytes/hash 和 Contract blocker，禁止业务接受 | Piko owner 诊断并提供明确处置；不改 immutable Result、不本地补 JSON、不自动重跑 |
| 合法终态 Result 的产物/Review 不合格 | 保存候选、失败证据与版本；原 Attempt 保持原结论 | 正式修复 Work 消费候选；新执行身份与新证据 |
| 活动 Run 的授权内编译/检查失败 | Piko 在预算内修复，Runtime 继续跟踪原 Run | 修复并复验后提交最终结果；不新增业务 Attempt |
| 活动 Run 预算耗尽/需要新专家 | Piko 停新业务步骤、安全收口，返回未解决项和用量 | 原义务对账、安全释放后经 Plan/P05 安排后续工作；未知先恢复 |
| Git/summary 写失败 | PublicationBlocked，保留 Gate/manifest/ref | 仅重试该发布义务，不重跑 Agent |
| ledger/ownership 不可证明 | project quarantine，只读诊断 | 经备份/恢复核对，不从 summary 猜造事实 |

每个日志/metric 至少带 project、work、attempt、stage、state_revision、plan_version、owner/error_code。
记录 ready/blocked 数量、各等待类别和起始时间、claim conflict、恢复义务年龄、publication lag。
日志或 UI 状态不是唯一 oracle，测试必须核对 owner ledger、artifact hash、实际外部 effect。

## 10. 资源、容量、性能与限制

资源总数不能用 Stage concurrency × Phase threads 推算可用额度；
调度需同时受 IR/PR owner 及同项目写集合约束。真实两分支重叠是功能验收，不是吞吐 SLA。
本批无默认 tick/PM/lease 数值；RT-G05 必须定义工作负载、保守上限、采样窗口、p95 和截止时间。
无可用环境只阻断需要该环境的 Work，不让纯设计 Work 等待未来测试部署。

## 11. 安全与隔离

在读 ready 前已完成 actor/project authorization，claim 时再次验证；内部 Schema 的 project_id 不代表权限。
路径必须来自已授权 project workspace 和 manifest，不从 Agent 输出拼任意路径。
跨项目 ID、过期 writer、symlink 外逃、Secret 注入、room membership 撤销都 fail closed。
新版本不从旧 Role/Tier/mlexp 设置读隐式 fallback；不新增任意 stage selector。
清理/重跑动作记录发起者与范围，不能删除不可证明归属的文件。

## 12. 实现映射与变更范围

| 顺序 / 文件 | 计划修改 | 同批必须删除或迁移的旧调用 | 验证 |
|---|---|---|---|
| 1 config.py / dispatcher.py | 固定 canonical DAG、集合 ready | 线性 next_stage 和 Research topology skip，所有调用点 | RT-U01..04 |
| 2 models.py / runtime.py | Work/Attempt、CAS、全前沿恢复、scope completion | 单 active_stage_name 恢复、宽松 finished 成功判断 | RT-C02..05/07/08、RT-R01 |
| 3 task_state.py / prompt_context.py / filesystem callers | 显式 context、worker propagation | 运行中 os.environ workspace 写入与隐式读取依赖 | RT-C01 |
| 4 factory.py / 四级 testing package | 注册新 TestDesign，迁移唯一 Phase owner | 晚期 TestDesign 重生成、early Gate 依赖未来报告 | RT-I01/02 |
| 5 summary/runtime_summary.py / 既有持久化设施 | 基于批准 ADR 的执行持久化与投影修订 | summary 当 ledger、单 current_stage 权威恢复 | RT-R01/03 |
| 6 repository/repository_manager.py / clear-stage helpers | exact manifest publication/cleanup | 无归属 whole-index commit、共享根删除 | RT-C06、RT-R03 |
| 7 Runtime integration / existing adapter boundary | 唯一 Piko 及 owner resource contracts | TierClient/direct legacy 路径，切换时全链移除 | RT-R02、V03-T05 |
| 8 View consumers | active Stage 集合、Work/blocker、Actual | 从单 scalar current_stage 猜当前进度 | V03-UI-002 |

以上顺序有依赖重叠，不是一次大补丁：图纯函数可先验证；production orchestration 必须先完成
state/context/Phase/publication 的一致切换设计。局部 coding 不等于可启用整个 V0.3 Runtime。
具体新文件类名由 existing package 的扩展方案 Review 决定，不预创建未批准服务。

### 12.1 Agent 步骤处置

下表承接 V03-AG-001，约束上一节的源码盘点和实现；不是新增执行路径。实际符号和调用点由逐文件
盘点补齐，尚未完成该清单时不能宣称旧路径已删除。

| 现有步骤类别 | V0.3 处置 | 实现核查与验收 |
|---|---|---|
| 生成策略、提示后再逐轮修改文件 | 委派 Piko Agent；Slinky 组装目标、来源和授权 | 工作派发后 Runtime 不逐工具调用驱动编辑 |
| 模型文本/Markdown JSON 提取和补字段 | 从结果接收路径删除；保留严格 Result 解码和 schema 校验 | 非法结果拒绝，不走文本猜测或补成功字段 |
| 按 Review 文本硬编码修改循环 | 委派固定 Team 内协作；保留独立评审资格和版本检查 | 不重复 Review；旧 hash 的意见不接受新产物 |
| 应用模型输出的文件补丁 | 文件操作由 Piko 执行；Slinky 保留写范围、manifest、hash 与正式发布 | 跨范围文件拒绝，Git publication 继续原唯一确认链 |
| 编译失败自动重发整个任务 | 活动 Run 内修复；终态后显式修复 Work | 内部迭代一个 Attempt，终态新执行可追溯 |
| 工具执行结果采集、测试 Oracle | 保留工具证据与 Testing 确定性判定；语义分析交 IR | 自报成功不能覆盖命令失败/证据缺失 |
| 资源准入、取消、恢复、Gate | 保留原 owner 路径 | 无重复副作用、权限扩张或第二状态来源 |

后续盘点每项记录旧文件/符号、调用者、处置、替代边界及负向 Case，切换时扫描全部旧消费者。

## 13. Verification、测试义务与证据

[测试设计](../70_verification/specifications/fixed-stage-runtime-tests.md) 给出 RT-U/C/R/I 分层。
设计期 pytest 验证图、Schema、语义负例和源代码 gap characterization；
后者只提醒 source mapping 漂移，不证明实现通过。生产补丁落地后必须把对应 gap 改为真实行为测试。

| Requirement | Design element | Method | Evidence | Status |
|---|---|---|---|---|
| V03-RT-001/007/011 | graph/validation/claim | analysis + contract + concurrency | RT-U01..04、RT-C02/03 | design-only slice |
| V03-RT-006/012 | recovery/frontier/scope | crash + scenario | RT-R01、RT-C04/07/08 | Planned |
| V03-RT-008/010 | context/manifest | interleaving + crash | RT-C01/06、RT-R03 | Planned |
| V03-RT-003/004 | preparation/idempotency | provider fault injection | RT-R01/02 | Planned |
| V03-RT-009/013/014 | phase split/invalidation/wait | branch integration + mutation | RT-C05、RT-I01..04 | Planned |

## 14. Review Checklist、未决项与 Gate

沿用 Runtime RT-G01..07，不另起一套 Gate 编号。
本批具备 canonical ID 映射、输入/输出/副作用、源码落点、负例、故障 oracle；
尚缺物理事务方案批准、完整 mutable DTO、Phase 逐资产清单、资源/外部契约回包和真实并发证据。
G1 未关闭前，本 ISD 标 Draft；生产代码和旧运行数据保持原状。
后续先 review 该 Runtime 切片，同时推进 Plan/IR/PR 与 System Test Design，不等待整个版本文档都完成才测试。
