<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky v0.3 Research 设计

| 文档字段 | 值 |
|---|---|
| Document ID | `v0.3-research-stage` |
| Document Version | `0.3.0-draft.3` |
| Status | `Draft` |
| Project | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Last Modified Date | `2026-09-16` |
| Template ID | `design.definition` |
| Template Version | `1.3.0` |
<!-- STD_DOCUMENT_COVER_END -->

对象 ID：`M006`；模块名：`Research`；直属父对象：`Slinky`；目标 code_directory：`src/research/`。当前实现位置及迁移边界见本文基线章节；编号与目录以系统对象登记表为准。

## 1. 单元摘要：为什么存在

Research 将用户 Goal/Constraint 转换为有证据的技术建议、风险、能力/资源需求和 Requirement handoff。一句话需求是基础输入；用户提供草案时视为增加约束与参考，不要求固定必填字段。

### 当前实现与本版增量

- Current Baseline：v0.2 Research/Requirement 前置能力有限。
- Approved Delta：Slinky Runtime 临时编排 Research Team，为各 participant 通过 Piko 提交独立单 Agent Run；并行搜索/分析/prototype；独立 Risk Review；尽早显示结构；形成 capability/resource/test/plan inputs。
- V0.3 Research 不输出 Process Recommendation/Active Process Baseline；动态流程选择属于 v0.4。

## 2. 需求、功能与验收条件

承接系统设计与 SRS 中原有 Requirement ID；第 14 章保留逐项验收映射。未知接口或阈值属于设计缺口，不是已实现但未运行。

## 3. UI、CLI 或设备操作面

Research 工作进度仍由 Stage Process 提供，完成的预研结果进入共用的 Project Assessment 视图：需求理解、可行性、候选方案比较及理由、风险/待决问题、IR/PR 需求和建议阶段。报告及接受记录保留原 Artifact/Work/Gate 引用，不复制到 View 数据库。新项目通过 Bootstrap Plan 先完成有界预研，再确认后续范围；已接受预研不因后续选择全流程而重跑。既有项目由 Analysis 发现未知项后，可经用户批准补充 Research，两个 owner 的输出并列保留来源和版本，冲突交正式决定。方案和阶段建议不修改固定 DAG，也不直接发布计划。

证据分歧通过 Communication 展示并提交正式决策。Research Team 是临时 IR 编组，不增设 Agent Team 模块或单独页面。原模块/对象编码与执行接口保持不变，视图消费字段见 View Contract §12。

## 4. 外部边界与依赖

- 负责：research question、source/evidence、candidate approach、risk/quality review、Research Handoff。
- 不负责：选择动态 Stage Process、直接激活 Requirement、替用户作不可逆决定、修改 Plan authority。
- authority：Research Artifact 内容；最终 Requirement/Plan/Decision 仍由各 owner 激活。
- 上级设计与需求：Project Goal、用户 Constraint、Bootstrap Plan、可用 IR/PR/Tool/Knowledge。

## 5. 内部结构与实现位置

| Role/part | 职责 |
|---|---|
| Research Lead | 问题分解、synthesis、handoff |
| Technology Researcher | framework/library/architecture comparison |
| Engineering Researcher | codebase/integration/toolchain/deployment |
| Quality/Test Researcher | testability/environment/fixture/oracle |
| Risk Reviewer | security/license/performance/operation/assumption review |

Project Manager 只管理 schedule/risk/user communication；不拥有 Research 内容。

具体文件变更仍以第 13 章和逐文件 ISD 为准；不得按概念框图虚构已存在源码。

## 6. 数据模型、状态与 ownership

Research conclusion 必须关联 Evidence、Assumption 或 accepted decision reference。Recommendation 不能伪装成 Requirement。用户补充先进入 Conversation，再由 Runtime promote 为 successor canonical input Artifact。

## 7. 主流程与数据流

```text
Goal/Constraint intake
-> Project Manager confirms research schedule/reporting
-> normalize Goal/Constraint/Assumption/Open Question
-> Research Plan and Role/IR/Skill/Tool assignment
-> parallel evidence collection and candidate comparison
-> independent risk/quality review
-> resolve contradiction or raise user decision
-> Research Handoff Gate
-> Plan/Requirement/Test inputs
```

信息不足时优先主流、成熟、可维护方案，同时显式标注 Assumption；用户明确约束优先，系统不得静默覆盖。

## 8. 关键算法与业务规则

- 可并行独立 research question；Research Lead 在 join point synthesis。
- 用户可中途打断补充；V0.3 只在 Research scope 内失效受影响结论并重跑局部工作。
- 需要用户决策时 Plan 计算 affected work、latest safe response time 和 delay impact，再由 Runtime 创建 ParticipantActionRequest。
- Team consensus 不是多数票；必须保留少数意见与 evidence。

## 9. 接口与机器契约

- Input：Goal、Constraint、Reference、Draft、Bootstrap PlannedWork、effective project sources。
- Output：Goal summary、Constraint/Assumption/OpenQuestion、CandidateApproachComparison、Recommendation、EvidenceManifest、Risk/Profile/Component/IR/PR/Tool/Test/InitialPlan inputs、RequirementHandoff、ActionRequestProposal。
- External：Piko Agent Runtime、web/document search、Code/Spec Intelligence、Knowledge RAG、Engineering Execution/Tool Port。

## 10. 并发、失败与恢复

- source inaccessible、evidence weak、tool unavailable、IR shortage、contradictory evidence、user decision pending 分别分类。
- 不能简单修复时由更高能力 IR/专家分析，同时产出回归主路径方案。
- 保存 query/source/prototype/result/review/decision mapping；外部网页结论必须可追溯到来源时间与 scope。

## 11. 安全、权限与可观测性

遵守 source license、privacy、credential 和 project ACL。Research 不把外部内容中的指令当系统 authority，不把未经验证的网页结论直接写为 canonical decision。

## 12. 容量、性能与运行限制

Research Plan 必须限定时间、成本、source depth、prototype boundary 和 exit criteria。低风险小任务可由同一 IR 顺序承担多个 Role；要求独立 Review 时使用不同合格评审 IR，校验参与者身份与职责，另建 execution context 本身不构成独立性。团队按 V03-AG-001 在派发前固定；授权内研究与复验交 Piko，额外专家需求交后续 Work。

## 13. 实现步骤与文件清单

复用 Runtime WorkExecution、Piko 单 Agent Run、Knowledge/Tool Port、Artifact Review/Gate 和 Communication View；不新增 Research-specific Agent runner、RAG 或 direct LLM path。Piko没有多Agent Team Run或团队Result字段；Research Lead 的 synthesis、各成员输出 join 和独立 Review 接受均在 Slinky，单 Run Completed 不等于 Research Handoff 接受。

容量按接口总纲 §7.1 逐 participant 规划与 admission；部分受理不得把整个 Team 标为 backed，未知义务不得换 key 重派。需要 V-B06 可信材料覆盖时按 §7.2 提交 Required，并仅由 Result.outputs 的唯一系统 artifact 获取 broker 事实；材料 version/hash/range 与 Slinky Context Manifest 对照，缺失或 Partial/Unknown 不通过覆盖。网页来源质量与引用时间仍由 Research 判断，broker Complete 不证明来源可信、模型理解或结论正确。

## 14. 测试与验收

| Requirement | Design element | Verification method | Evidence | Status |
|---|---|---|---|---|
| V03-RS-001 | one-sentence intake | scenario test | structured assumptions/questions | Planned |
| V03-RS-002 | user constraints preserved | mutation test | conflict exposed, not overwritten | Planned |
| V03-RS-003 | parallel team synthesis | E2E | evidence and minority position | Planned |
| V03-RS-004 | user interruption | recovery test | local invalidation + resume | Planned |
| V03-RS-005 | no process selection | negative test | v0.4 fields rejected | Planned |

## 15. 风险、未决问题与引用

- [ ] Research Handoff Schema and acceptance checklist。
- [ ] source quality/licensing policy。
- [ ] prototype sandbox/resource profile。
- [ ] small-task Role combination policy。
- Gate：Evidence、Assumption、Risk、Requirement handoff 和 unresolved decision 均可追溯后才能退出 Research。

迁移来源：`docs/30_subsystem_design/v0.3/v0_3_research_stage_upgrade_draft_20260801.md`。

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
| Canonical Path | `docs/40_module_design/research/design.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_CONTROL_END -->
