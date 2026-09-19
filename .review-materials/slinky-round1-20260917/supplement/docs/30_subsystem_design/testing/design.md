<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky v0.3 Testing 设计

| 文档字段 | 值 |
|---|---|
| Document ID | `v0.3-testing-subsystem` |
| Document Version | `0.3.0-draft.3` |
| Status | `Draft` |
| Project | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Last Modified Date | `2026-09-16` |
| Template ID | `design.subsystem` |
| Template Version | `0.5.0` |
<!-- STD_DOCUMENT_COVER_END -->

对象 ID：`S03`；子系统名：`Testing`；直属父对象：`Slinky`；目标 code_directory：`src/testing/`。当前实现位置及迁移边界见本文基线章节；编号与目录以系统对象登记表为准。

## 1. 概述

Testing Subsystem 提供可独立设计、准备、运行、分析和审计的测试能力，并在 integrated mode 接入固定 Stage DAG。它解决 V0.2 低层测试通过但 System Test 仍大量失败、环境并发冲突和 evidence/oracle 假验证问题。

本对象直属 Slinky 软件系统；不递归包含软件子系统。Piko/LLMTier 不属于本对象。

## 2. 功能需求与设计约束

- 负责：Test design、case lifecycle、asset qualification、environment admission、execution、Evidence/Oracle、coverage、mutation、promotion、acceptance evaluation。
- 不负责：Product code/spec owner repair、Plan authority、PR inventory、Artifact business acceptance。
- authority：Testing Core lifecycle record 是测试 truth；Report 只引用 record/Evidence。
- 上级设计与需求：Requirement、Design、Contract、ProjectEngineeringGraph、IR/PR/Tool capability。

- Current Baseline：Unit/System Testing 已使用 Spec 与 RAG；traceability 已到 execution，但 success/not_pass/failed 曾都被标 covered；mock mutation 主要验证 evidence/oracle，不能代替 code/spec mutation。
- Approved Delta：Test Design 前置并行；Testing 可 integrated/standalone；T0-T8 lifecycle；真实 code/spec/contract mutation；Environment admission；promotion gate 和 independent acceptance。

## 3. 总体方案（第 0 层设计）

```text
T0 Baseline Activation
-> T1 Governance/Planning/Template Freeze
-> T2 Analysis and Test Design
-> T3 Test Asset Construction
-> T4 Asset Qualification
-> T5 Environment Preparation/Admission
-> T6 Functional Execution/Debug
-> T7 Regression/System/E2E/Mutation/NFR/Recovery
-> T8 Acceptance/Closure
```

Integrated mode 将 System/Subsystem/Module/Unit Test Design 放入固定 DAG；Standalone mode 使用内置 Testing Work Package，但复用同一 Runtime、Plan、IR、PR、Artifact 和 Testing Core，不形成第二 authority。

## 4. 软件架构与模块分解（第 1 层设计）

### 4.1 内部模块登记表

| 对象 ID | 名称 | 类型 | 直属父对象 | 目标 code_directory | 旧名称 | 职责 / 接口归属 | 验证关联 | Document ID / 详细设计路径 | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| M301 | Design | 模块 | S03 | `src/testing/design/` | Test Design | 测试层级、方法、风险、追踪与环境需求 | V03-TS-001 | 未分配 / 未编写 | Planned |
| M302 | Asset | 模块 | S03 | `src/testing/asset/` | Test Asset | Case、数据、Fixture、Oracle 与证据契约版本 | V03-TS-002/005 | 未分配 / 未编写 | Planned |
| M303 | Qualify | 模块 | S03 | `src/testing/qualify/` | Qualification | 受控错误检测与测试资产资格 | V03-TS-003/005 | 未分配 / 未编写 | Planned |
| M304 | Admission | 模块 | S03 | `src/testing/admission/` | Environment Admission | 检查 PR 租约、就绪、指纹及等价性 | V03-TS-004 | 未分配 / 未编写 | Planned |
| M305 | Execution | 模块 | S03 | `src/testing/execution/` | Execution | 委派测试、回收规范结果、执行记录及故障分类 | V03-TS-002/006 | 未分配 / 未编写 | Planned |
| M306 | Analysis | 模块 | S03 | `src/testing/analysis/` | Analysis/Acceptance | 覆盖、变异、缺陷、风险及测试接受政策评价 | V03-TS-002/003/005 | 未分配 / 未编写 | Planned |

本表是本子系统内部模块编号的唯一分配来源。无历史 S/M 编号或 Retired 对象；旧名称仅作映射，改名保持 ID。详细设计尚未编写，不以登记表替代接口 Schema 或实现证据。

![内部模块](../../assets/v0.3/testing-modules.svg)

模块共享既有子系统状态与恢复机制，不各建配置入口、执行器或状态库。后续接口规格按本表确定 provider/consumer 对象，验证项沿用原 ID 关联被测模块。

## 5. 运行设计

按 [V03-AG-001](../../91_reviews/agent-delegation-design-issue.md)，Agent 可编写测试资产、执行授权调试并作语义分析。
Testing 保留资产资格、环境准入、工具结果、证据完整性及接受政策的确定性检查。独立 Review 结论
绑定评审者身份和最终产物版本；资产修改后重新取得适用的检查与评审证据。产品修复交对应工作 owner，
测试 Agent 不通过改变 Oracle 或接受标准消除失败。测试规格必须覆盖活动 Run 内修复、终态后新执行、
预算耗尽升级、虚假成功、证据缺失及丢响应恢复，分别判定执行完成与业务接受。

- System Design 后立即开始 System Test Design；后续 Test Design 依赖同级 Design 和上一级 Test Design。
- T3/T5 可在输入稳定范围内并行准备；Case execution 只接受 T4 qualified + T5 admitted scope。
- 并发 batch 先 pilot，达到 error-rate/capacity threshold 后再扩展；环境和 Tier congestion 反馈 Plan。
- 上游 Artifact 变化使受影响 Design/Case/Execution/Promotion 自动 stale，不跨 Stage 自动 rollback。

## 6. 数据与状态设计

`TestCaseLifecycleRecord` 最低覆盖 Draft/Designed/Built/Qualified/Admitted/Executing/Passed/Failed/Blocked/Invalid/Stale/Accepted。Execution outcome 与 Acceptance coverage 分开：只有 policy-valid PASS Evidence 才计入 acceptance coverage。

Traceability：`Requirement -> Suite -> Scenario -> Family -> Case -> Execution -> Evidence`，每条 reference 指向 exact version/attempt/environment fingerprint。

## 7. 接口设计与 interfaces 映射

- Consumed：Effective Requirement/Design/Contract、Artifact invalidation、Plan work、IR assignment、PR lease、Tool/Test Adapter。
- Provided：TestPlan/TestDesign、Case lifecycle、execute/read result、Evidence manifest、coverage/mutation/promotion/acceptance summary、defect/upstream rework proposal。
- TestExecutionPort 由各 language/tool adapter 实现；先通过 Contract Test 才能成为 Active Binding。

## 8. 关键业务流程与机制协作

### 8.1 测试环境与执行证据闭环

按 [系统设计 §13.4–13.5](../../20_system_design/system-design.md#134-并发测试与环境隔离)，Design（M301）固定 Case 模式、目标 scope 和预算；Asset（M302）构建可独立 materialize 的数据闭包；Qualify（M303）验证 runner、Oracle 及真实 mutation；Admission（M304）消费 PR（M005）租约与环境证据，并在实际 target 检查真实消费者。

Execution（M305）启动后核对首条记录的身份、版本和 lease，再逐步扩展批次。排队与各层 timeout 计入原期限；异常保留 Case/Attempt、外部义务和过程证据，恢复使用原执行入口。Analysis（M306）独立计算功能结果、证据有效性、清理状态、接受覆盖和 batch 聚合，不把退出码、报告或容器状态直接等同于 PASS。

中止后的 Case 先完成原 obligation reconciliation，再按真实结果决定继续原运行或创建新 Attempt。数据/代码修复形成新的验证基线，按根因 family 复验；非目标 Case/环境必须保持不变。对应输入、Oracle、测试层级与原问题映射见 [V03-ENV 回归矩阵](../../70_verification/specifications/test-lifecycle-specification.md#11-v02-环境问题回归矩阵)。

设计工作只要求同级设计与上级测试设计，不要求未来代码/报告。构造、资格化、环境准入和执行分别记录；失败按产品、资产、Oracle、环境归属分流，修复后新增受控执行证据，原失败不能被报告覆盖。

## 9. 配置管理设计

沿用系统配置来源和唯一 active binding。启动先校验自身 Schema、输入版本与外部能力，按受影响 scope 返回就绪状态；不得新建子系统专用的配置发现或 fallback。具体参数字段及生效分类仍须补入接口目录后才可编码。

## 10. 异常处理、可靠性与安全设计

失败必须区分 Product Defect、Spec/Contract Defect、Test Asset Defect、Oracle/Evidence Defect、Environment/Resource Blocker、Tool/Adapter Defect、Flaky/Unknown。修复正确 owner 后只重跑受影响 scope，并保留原 attempt。

恢复读取 Testing Core record；不得通过 report 文件或目录扫描补状态。多环境冲突、lost response、partial evidence、cleanup failure 和 provider schema mismatch 均有 typed blocker。

fixture/data/credential 按 classification 管理；测试环境隔离和清理必须有 Evidence；production endpoint 或真实账号使用需显式 policy。Mutation 只在授权副本执行。

## 11. 可调试性设计

诊断先读取当前 owner record、输入版本和 Evidence；只读查询不得触发执行。故障注入仅限隔离测试 profile，退出后检查租约、数据和指纹。未冻结调试操作字段前不开放 production mutation。

## 12. 可维护性与升级设计

统计区分成功、失败、Blocked、Invalid 和 Stale；日志绑定 Project/Work/Attempt。升级先停止新工作，保留未完成义务；迁移必须对账版本、引用与历史证据。回滚不能把报告或索引重新提升为业务 authority。物理存储迁移方案仍需下级设计。

## 13. 可部署性、可测试性与验证设计

| Requirement | Design element | Verification method | Evidence | Status |
|---|---|---|---|---|
| V03-TS-001 | Test Design parallel DAG | behavior test | Stage transition evidence | Planned |
| V03-TS-002 | coverage truth | controlled outcomes | failed/not_pass not accepted | Planned |
| V03-TS-003 | real mutation | code/spec/contract mutants | kill/survive evidence | Planned |
| V03-TS-004 | multi-environment isolation | six-environment E2E | leases/fingerprints/no collision | Planned |
| V03-TS-005 | promotion prevents escape | seeded defects | lower gate blocks System Test | Planned |
| V03-TS-006 | standalone reuse | E2E | same Testing Core/Plan/IR/PR | Planned |

部署与复位使用 PR 环境指纹和本 scope 的清理 manifest。先执行真实单环境纵向链路，再扩大至并行环境；每层记录独立结果，不把静态 Schema 校验当成子系统执行通过。

## 14. 性能与资源设计

Test Environment 是 PR；Test Engineer/Reviewer 是 IR；Test Adapter/Browser/Service 是 Tool/PR reference。System/E2E batch 必须受 IR/Tier seat、environment lease、service capacity 与 execution deadline共同约束。

Agent 工作按 participant 独立单 Run 规划与 admission，Piko execution capacity 与 Tier Seat 分别核算；快照不是 N-slot 预留。部分受理保留原 Run/key/claim，不把未受理成员或整队记为已 backed。测试进程 exit、Piko Result、测试 policy-valid PASS 与 Artifact 接受是不同事实。PR 清理、Piko execution release/claim release、Session close 和 Tier Seat release 各自取原 owner 证据，不能因测试通过或取消已受理而互相释放。可信输入覆盖按接口总纲 §7.2 消费系统 outputs artifact，不以 Agent summary 或工具 stdout 自证。

## 15. 实现与下游详细设计

在现有 Unit/System Testing、Artifact/RAG、Runtime/Review 机制上建立单一 Testing Core 和 TestExecutionPort。旧 coverage 误判与 mock-only mutation 逻辑必须迁移删除，不能并存。

- [ ] Testing Core state/command Schema。
- [ ] T0-T8 Part-level Test Specifications。
- [ ] Coverage/Mutation/Flaky/Environment equivalence policy。
- [ ] real frontend/backend consumer/provider matrix。
- [ ] acceptance and residual risk authority。
- Gate：T4 qualification、T5 admission 和 lower-level promotion 未满足时不得进入对应执行层级。

迁移来源：`docs/30_subsystem_design/v0.3/v0_3_testing_subsystem_upgrade_draft_20260801.md`、`v0_3_test_design_draft_20260806.md` 与 T0-T8 子方案。

## A. 输入与适用性

输入是 v0.3-system-design、SRS、原子方案和其既有接口/测试 ID。结构采用新模板，具体配置、机器接口和部署细节尚未全部闭合，因此保持 legacy-mapped，不宣称原生完整设计。

## B. 文档控制与修订记录

2026-09-14：按系统对象登记补齐内部模块编码、父对象、短名称、目标目录、接口职责和验证关联，新增内部模块结构图。模块详细设计保持 Planned。

2026-09-13：从旧 design.definition 迁移到 design.subsystem 0.5.0；保留全部原章节正文与验收 ID，新增运行、配置、调试、部署与验证承接。尚未批准发布或 runtime activation。

### 文档控制字段

<!-- STD_DOCUMENT_CONTROL_BEGIN -->
| 字段 | 值 |
|---|---|
| Authority | `slinky` |
| Authors | `原方案作者（原始 attribution 见固定来源 commit）, Codex（主干设计归并）` |
| Created Date | `2026-09-07` |
| Template Conformance | `legacy-mapped` |
| Tailoring Reference | `none` |
| Migration Map Reference | `docs/98_migration/std-software-upgrade/migration-map.md` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/30_subsystem_design/testing/design.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_CONTROL_END -->
