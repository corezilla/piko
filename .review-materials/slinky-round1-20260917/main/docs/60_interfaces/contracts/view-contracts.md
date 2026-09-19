<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky v0.3 View Contract Specification

| 文档字段 | 值 |
|---|---|
| Document ID | `v0.3-view-contracts` |
| Document Version | `0.3.0-draft.2` |
| Status | `Draft` |
| Project | `slinky` |
| Authority | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Authors | `原方案作者（原始 attribution 见固定来源 commit）, Codex（主干设计归并）` |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-16` |
| Template ID | `contracts.specification` |
| Template Version | `0.1.0` |
| Template Conformance | `legacy-mapped` |
| Tailoring Reference | `none` |
| Migration Map Reference | `docs/98_migration/v03-mainline-rollin/migration-map.md` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/60_interfaces/contracts/view-contracts.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_COVER_END -->

> 2026-09-17：当前范围见[最新裁决](../../90_decisions/intelligent-process-scope-20260916.md)。以下旧View中固定图自动推进、Slot/Seat/claim、Cost、Tier调用恢复及复杂通信管理字段退出实施authority；对应页面须按新系统设计细化，不是兼容保留。

> 2026-09-09 主干归并：本文件是 V0.3 活跃设计候选。正式启动设计开发不等于文档 Approved 或 Runtime Activation。最新范围与外部接口修订统一见 [启动基线](../../00_management/version-development-plan.md)；原文中的旧测试隔离、STD 未锁定或 ExternalLink-only 描述不得作为新的实现指令。

## 1. Contract scope 与 authority

Communication 的 Session/Topic 目录、生命周期命令和备份投影统一消费 [会话生命周期操作契约](communication-lifecycle-contract.md)；其 Schema 是本轮字段候选。旧 Piko Session directory/close/element-view 不再作为当前 owner；VQ-COMM 仍是唯一页面查询入口，不引入第二聊天服务。

本 Contract 定义 View request/response/command DTO 的 required semantics。Runtime/Plan/IR/PR/Artifact/Knowledge/Testing/Piko/LLMTier record 仍由各 owner 持有；View DTO 是带 source manifest 的 transient projection。

## 2. Operation / Message / Event Catalog

| ID | Kind | Producer | Consumer | Sync/Async | Idempotency |
|---|---|---|---|---|---|
| `VQ-SETUP` | get_project_setup | View server | WebUI | Sync | N/A |
| `VC-START` | start_project | Runtime | WebUI | Async | required |
| `VQ-OPS` | get_system_operations_view | View server | WebUI | Sync | N/A |
| `VQ-HEADER` | get_project_view_header | View server | WebUI | Sync | N/A |
| `VQ-STAGE` | get_stage_process_view | View server | WebUI | Sync | N/A |
| `VQ-PLAN` | get_project_plan_view | View server | WebUI | Sync | N/A |
| `VQ-RES` | get_resources_view | View server | WebUI | Sync | N/A |
| `VQ-COMM` | get_communication_view | View server | WebUI | Sync | N/A |
| `VC-ACTION` | respond_participant_action_request | Runtime | WebUI | Sync command | required |
| `VC-INPUT` | promote_project_input | Runtime/Artifact | WebUI | Sync command | required |

## 3. Request、Response、Event 与数据对象

### 3.1 Common context

`ViewQueryContext`：project_id、principal_ref、authorization_context_ref、IANA timezone、locale、read_at、if_snapshot_token、correlation_id。Project Setup 改用 workspace-scoped `ProjectSetupContext`。

`CommandContext`：project_id、principal_ref、authorization_context_ref、correlation_id、idempotency_key。每个 command 另带 expected owner version。

`PageRequest`：cursor optional、limit default 50/max 200。`TimeRange.start_at` inclusive、`end_at` exclusive 且 start < end。

### 3.2 Project Setup

Request：workspace/principal/auth/timezone、requested mode、submitted goal/constraints/draft/reference、source bootstrap、budget/schedule/approval boundary、expected setup snapshot。

Response：readiness by Runtime/Plan/Piko/Tier/IR/PR/Artifact/Knowledge/Tool/Testing、source versions/valid_until、can_start/blockers、accepted modes、minimum input、Tier Admin link、snapshot token。

`start_project` 对 SoftwareDevelopment 只强制一句 Goal；缺失 constraint 使用显式 default/assumption。Bootstrap 按 B0 readiness、B1 project、B2 Goal/Constraint Artifact、B3 Plan、B4 Conversation、B5 IR、B6 release work 执行并可从首个未成功 step 幂等恢复。

### 3.3 Active project views

- Header：Goal、project/runtime/plan version、overall progress、active Stage、forecast/milestone、IR/PR pressure、open decisions、test quality summary。
- Stage：固定 Stage nodes/edges、current parallel WorkExecution、status/progress/Artifact refs。
- Plan：Gantt rows、dependency、IR/PR allocation、baseline/forecast/actual、critical path/risk/action deadline。
- Resources：IR 和 PR 分区、availability/allocation timeline、gap/conflict/health、selected detail。
- Communication：Conversation/NeedsResponse/ProgressReports/History、room summaries、selected Element descriptor、resolution、Decision Dossier。

### 3.3.1 Maintenance detail

系统设计 §9.3 的诊断信息扩展既有 VQ-STAGE、VQ-RES、VQ-OPS detail；下表为待机器化的字段义务，不新增 query/command endpoint。HTTP route 和 owner operation 的完整 Schema 尚待冻结。

| 字段组 | 类型/必需性 | 输入或返回规则 |
|---|---|---|
| query target | object，detail 查询必需 | Stage 使用 work_id + attempt_id；Resources 使用 resource_id + lease_id 或 ir_id；Ops 使用已登记 instance_ref。项目对象须有 project_id；不得传任意 URL、shell 或文件路径 |
| context / pagination | 既有 ViewQueryContext、TimeRange、PageRequest | principal 来自服务端认证；ops 系统 scope 单独鉴权；limit 50/200，cursor 绑定 scope/filter/version |
| identity | object，必需 | instance_ref、source_version、config_version、精确 target refs；外部 run/invocation 未取得时可 null，附 obligation 状态而非猜测 ID |
| freshness | array，逐来源必需 | authority、observed_at、valid_until、source status、last-known 标记及 typed source error；时间使用既有带时区格式，未知时间为 null 并说明原因 |
| progress / fault | object，可空但附原因 | last_completed_step、current_step、step_started_at、remaining_deadline_ms；fault 含 code、owner、retryability、affected_work_refs、解除条件及 evidence_refs |
| execution evidence | object，存在对应执行时返回 | launcher_ref、脱敏 argv/cwd/interpreter、必要环境项存在性、PID+启动时间或 container_id、exit code/signal、是否截断；实际值未知不填零 |
| evidence page | paginated object | item 含 evidence_id、hash、producer、created_at、size_bytes、authorized_read_ref、availability；每次读取/下载重验 scope，过期与缺失明确区分 |
| available operations | array，必需，可空 | owner operation_ref、target_ref、expected_version、eligible、denied_reason、impact、required_confirmation；后端执行时重新校验，字段不携带 shell command |

维护命令沿用 owner CommandContext 和版本/幂等语义，附 reason 与诊断 evidence_refs。返回 receipt_ref、owner、target、操作状态、版本及审计引用；执行完成与 blocker 解除分别读取原 owner 状态。Secret、完整环境变量和原始 Matrix transcript 不进入上述 detail。证据访问拒绝、来源冲突、查询失败、版本冲突各自显示；最后已知内容不作为新命令的当前版本。

### 3.4 Communication decision objects

`ParticipantActionRequestView` required fields：request type/question/context/options/recommendation/deadline/time remaining/affected work/schedule impact/supporting refs/lifecycle/health/respond capability。

Agent disagreement 产生的 Decision/Approval/RiskAcceptance 必须带 `DecisionDossierView`：decision boundary、exact collaboration sessions、agreed/disputed points、participant positions/rationale/evidence、alternatives、expert assessment、Project Manager recommendation、unknowns、full discussion links、completeness/source versions。

`ElementConversationSummary/View`：project/session/run/work/attempt、participants、status/attention、last activity、resolution/action refs。选中Session的嵌入信息统一读取Slinky GET sessions/{ref}/element-descriptor，使用[生命周期Schema](schemas/communication-lifecycle.schema.json)的ElementDescriptor；其embed_mode固定ElementRoomView、identity_mode固定UserMatrixSession，含exact room、Session/授权版本、受控构建与origin、有效期和允许操作。不消费Piko旧element-view，不含transcript/credential。Ready仅表示Slinky侧打开前置条件，浏览器仍须用户Matrix认证；导航覆盖尚未确认的构建只能Unavailable。

四个View使用顶部导航。Communication不建立第二composer/relay；房间目录只取Slinky当前授权project的Session mapping，Piko仅提供其binding/执行事实。Session与项目切换的generation/version必须匹配；stale result、跨项目URL、未授权membership、logout不能复用旧RoomView。通信生命周期HTTP读取统一见[现有操作映射](openapi/communication-lifecycle.openapi.json)，不是Piko旧Session目录。Element消费Piko产品codec的topic_id/sid/rid及原生reply event引用；Topic选择保留完整原生timeline，业务标签和正式记录由Slinky提供，不把Matrix thread当业务Topic。附件content_ref不得自行改成下载URL。字段级映射、导航义务及剩余附件读取门禁见[Communication ADR](../../90_decisions/project-communication-integration.md)。

## 4. 状态、错误和 blocker catalog

View state：`Ready/Degraded/NotReady/SourceError/NotModified`。Error 至少含 code/source/message/retryable/blocking/affected field or section/evidence refs。

标准错误：`MANDATORY_SOURCE_MISSING`、`SOURCE_CONTRACT_MISMATCH`、`SNAPSHOT_CHANGED`、`CURSOR_STALE`、`QUERY_RANGE_TOO_LARGE`、`VERSION_CONFLICT`、`PERMISSION_DENIED`、`ELEMENT_SOURCE_UNAVAILABLE`、`IDEMPOTENCY_CONFLICT`。

## 5. 幂等、并发、事务与一致性

- View Read 无 side effect；automatic refresh 不生成 state。
- Command 由 owner 执行 authorization/version/idempotency；View 不做 optimistic local success。
- start_project 已提交 step 不回滚重建；重复 payload 恢复，digest conflict 拒绝。
- Communication answer 不直接清理 Plan risk/Runtime blocker，等待 owner reconciliation。

## 6. Pagination、filter、ordering 与 retention

- Stage/Work/Resource/Communication/room list cursor 绑定 exact filter/source version。
- Room filter：status、IR、work execution、agent run、attention；排序稳定且分页不重不漏。
- View 不保存 transcript/history 副本；History 只是 canonical communication entry 的生命周期查询。

## 7. 身份、权限、Secret 与多项目隔离

Stable CanonicalRef 包含 ref_type/ref_id/version/display_name/effective_status。Artifact 必须 exact version；display_name 仅展示。不同 Project 的 source/join/room/action 不能混合。所有 DTO 做 Secret field denylist scan。

## 8. 版本、兼容性与迁移

每个 response 返回 assembled_at、snapshot_token 和 source version manifest。Source version 不一致返回 mixed snapshot warning；不能隐式缓存旧 owner result。旧 Dashboard endpoint 只有在调用者全部迁移后才能删除，迁移期间不得提供两个业务 authority。

## 9. Positive/Negative fixture 与 validator

### 文档规范包的新增消费义务

系统设计 §8.4/P16 的操作由现有 Setup/Resources 入口承接：读取默认及项目规范基线、导入候选、
选择整体替换或局部覆盖、预览解析后来源与影响、验证并按 expected version 激活、撤销覆盖。
mutation 携带 actor/project、幂等 key 与预期版本，query 不激活规范。
结果需包含包及条目版本/hash、覆盖键、来源、裁剪、资格、冲突及受影响 Work；失败保留当前基线。
这些是待机器化的接口语义，不新增未经冻结的 route/字段 alias。须补正负 fixture：默认离线、整包缺项、
局部覆盖、重复键、检查器不匹配、越权导入、版本竞争和在途升级；字段/错误映射未完成前标为契约待就绪。

Positive fixture 覆盖 initial lifecycle null、active project、parallel tasks、resource pressure、multi-room/decision dossier、Action response。Negative fixture 覆盖 missing source、malformed duplicate record、stale snapshot/cursor、unauthorized command、secret leakage、Element source unavailable、automatic rerender attempt。

## 10. Requirement → Contract → Test traceability

| Requirement | Contract | Test |
|---|---|---|
| V03-UI-001 | VQ-SETUP | readiness/snapshot/bootstrap E2E |
| V03-UI-002 | VQ-STAGE | fixed DAG + parallel current work |
| V03-UI-003 | VQ-PLAN/VQ-RES | Gantt and resource conflict |
| V03-UI-004 | VQ-COMM | multi-room pagination/exact Element |
| V03-UI-005 | VC-ACTION/VC-INPUT | decision and promotion authority |
| V03-UI-006 | all reads | no masking + patch-only fast path |

## 11. Activation Gate 与未决项

需冻结 route/OpenAPI、DTO JSON Schema、source mapping、permission matrix、snapshot/cursor algorithm、positive/negative fixture，并完成 browser E2E 与 fast-path regression。Piko/Element 未 Verified 时对应 field 必须 typed unavailable，不能隐藏。

迁移来源：`docs/60_interfaces/v0.3/v0_3_view_supporting_interface_contract_draft_20260806.md`。

## 12. 项目分析与执行范围契约

本节承接系统设计 §2.3/§4.2.2.1，是现有 Setup、Plan、Runtime 和 Artifact 接口的设计增量。以下为逻辑操作及待机器化 DTO，不声明已存在 HTTP 路由；与旧全流程字段冲突时须先更新唯一 Schema 和 ISD，不能增加另一套执行引擎。

### 12.1 操作、参数与返回

所有 query 使用 §3.1 context；所有 command 使用既有授权、幂等、expected version 和 durable receipt 规则。客户端不能指定 actor 权限或接受状态。`ref` 是 owner 可解析的 project-scoped ID + 不可变版本，不接受任意文件路径/URL。Stage ID 使用 DAG fixture 的 `runtime_stage_id`，不是图片中的显示记号。

| 逻辑操作 / Owner | 必填输入（除通用 context） | 返回数据与行为 |
|---|---|---|
| start_project 增量 / Runtime | entry_mode:`New\|Existing`、purpose:string、target_version:string、input_refs:ref[]（New 可空）、expected_project_version、idempotency_key | receipt_ref、project_ref、entry_work_ref、entry_kind:`Research\|Analysis`；New 在 Bootstrap Plan 下进入 Research，Existing 进入 Analysis，保留原预算/权限约束；导入引用须已授权且固定摘要 |
| get_project_assessment / WebUI 查询投影 | project_id、assessment_ref（首次未完成可为空，此时返回当前入口工作） | assessment_ref:null或ref、work_ref、status:`Pending\|Running\|Ready\|Failed\|Stale`、inventory[]、findings[]、recommended_stage_ids[]、baseline_candidates[]、source_manifest、errors[] |
| preview_execution_scope / Plan | assessment_ref、baseline_ref、selected_stage_ids:非空去重数组、expected_plan_version | candidate_ref、candidate_version、selected_stage_ids、dependency_bindings[]、deliverables[]、gaps[]、forecast_ref:null或ref、eligible:boolean；保存候选，不改变活动计划、范围和运行资源，不派发、不自动补阶段 |
| get_execution_scope_candidate / Plan | candidate_ref、candidate_version | 原不可变 ScopeCandidate、validity:`Valid\|Stale`、stale_reasons[]；项目内重新鉴权，供刷新和恢复后读取 |
| commit_execution_scope / Plan | candidate_ref、candidate_version、expected_plan_version、idempotency_key | receipt_ref、outcome:`Committed\|Blocked`、plan_ref:null或ref、scope_ref:null或ref、gaps[]；校验候选所绑定全部输入版本后原子发布计划与范围，失败保留当前计划 |
| start/continue 既有命令增量 / Runtime | 当前 plan_ref、scope_ref、expected_project_version、idempotency_key | 原命令 receipt/work refs、execution_authorization:`AwaitingStart\|Enabled`、start_receipt_ref:null或ref；start 持久化当前范围授权，continue 只恢复已授权范围；资格检查与资源准入分别执行 |
| get_stage_process_view 增量 / Runtime | project_id、scope_ref | assessment_ref、baseline_ref、scope_ref、selected_stage_ids、每阶段 selection:`Selected\|NotSelected`、原 execution_status（未执行可 null）、input_bindings[]、blockers[]、scope_result、project_delivery_result |

“全部阶段”由 UI 展开成唯一固定 15 个 canonical ID，不传另一个可漂移的 all 模式配置。重复 key/同请求返回原 receipt；不同请求同 key 返回 IdempotencyConflict。重新执行已完成阶段创建新的 scope/WorkExecution，continue 只恢复原义务。

### 12.2 字段及资格语义

| 对象 | 必需字段及约束 |
|---|---|
| InventoryEntry | artifact_ref、kind:`Code\|Design\|TestAsset\|TestEvidence\|Environment\|Standard`、content_digest、component_refs[]、source_ref、qualification_ref:null或ref；空资格不表示可复用 |
| AnalysisFinding | finding_id、kind:`Gap\|Conflict\|Unknown\|Risk`、summary、evidence_refs[]、affected_stage_ids[]、required_action；推断与实证分别记录，缺证据必须标 Unknown |
| BaselineCandidate | baseline_ref、manifest_digest、target_component_refs[]、code_revision:null或不可变代码版本、std_ref、toolchain_refs[]、artifact_refs[]、qualification_ref、qualification_status:`Pending\|Qualified\|Rejected\|Stale`、input_contract_version；可复用资格依赖这些精确版本及证据适用范围 |
| DependencyBinding | consumer_stage_id、input_key、predecessor_stage_id、source:`SelectedOutput\|BaselineArtifact`、artifact_ref:null或ref、qualification_ref:null或ref；SelectedOutput 未产出时允许空引用并等待，BaselineArtifact 两引用均必需且有效；一个必需 input_key 恰有一个来源 |
| ScopeCandidate | candidate_ref/version、project_ref、assessment_ref、baseline_ref、selected_stage_ids、dependency_bindings、deliverables、gaps、input_versions、expected_plan_version、candidate_digest、created_at、eligible；输入版本改变即失效；eligible 只表示静态范围满足，不能代表运行资源已取得 |
| ScopeGap | gap_id、reason:`MissingInput\|StaleInput\|ContractMismatch\|UnqualifiedEvidence\|UnsupportedStage`、affected_stage_ids[]、required_input、evidence_refs[]、suggested_stage_ids[]；建议不改变 selected_stage_ids |
| ScopeResult | scope_ref、status:`Pending\|Running\|Blocked\|Succeeded\|Failed`、accepted_output_refs[]、reused_input_refs[]、not_selected_stage_ids[]、unresolved_action_refs[]；与全流程交付状态分别计算 |

服务端验证 selected IDs 属于固定 DAG，依赖绑定覆盖每个所选节点全部输入要求，且基线证据适用于当前组件/代码/规范。不能只检查直接前驱：本次上游变更使下游基线的传递来源失效时重新资格。既有项目没有原 Slinky Stage 历史时按资产契约接受导入证据，不要求伪造执行历史。

### 12.3 失败、恢复与实现门

#### 候选保存与提交

Plan 在现有 Plan Version Store 保存不可变候选，落盘成功后才返回 candidate_ref/version。candidate_digest 覆盖项目、来源版本、阶段集合、输入绑定、交付物及 expected_plan_version；提交按引用读取原记录，不从当前页面选择或最新资产重建。预览只写候选记录，不改变活动计划、预算承诺或执行授权。重复预览可生成不同候选，均不产生业务执行副作用。

候选在来源与计划版本匹配且项目允许变更期间有效，不设置隐含短期 TTL。来源变化返回 CandidateStale，计划竞争返回 VersionConflict；项目归档后禁止提交。候选至少保留至项目既有保留期结束，已提交候选随 Plan/receipt 保留。刷新、重启和多实例从同一 Plan Store 查询；不可读取返回 SourceError，已删除或不存在按隐藏策略返回 NotFound，均要求重新预览而不自动替换候选。同一提交 key 重放先验证权限并返回原 receipt，不因首次提交已改变计划版本而重新提交。新 key 提交仍检查 expected_plan_version。

#### 发布与启动

commit_execution_scope 原子发布 Plan/scope 时，范围控制记录为 execution_authorization=AwaitingStart、start_receipt_ref=null。该字段属于既有 Runtime 范围控制，不复制工程运行状态。Project Plan 与 Stage Process 查询返回这两个字段；页面显示“等待启动”。

start 校验当前 plan_ref/scope_ref、项目版本、权限和输入资格后，在既有命令事务中记录 start receipt 并置 Enabled；资源不足仍由正常 admission 等待，不撤回已记录授权。响应丢失使用同一 key 恢复 receipt。continue 对 AwaitingStart 返回 ScopeNotStarted，不隐式授权。新范围发布必须重新启动，原授权不能迁移到另一 scope/Plan。claim/dispatch 在既有并发控制下复核当前精确范围及 Enabled；过期范围的新工作返回 VersionConflict，未启动范围返回 ScopeNotStarted。已派发义务按原身份收敛，不由新计划取消或重派。

Bootstrap Research、Analysis、PM 等工作检查各自已登记的授权目的与预算，不借其活动状态开启后续工程范围。重启恢复授权记录，不从项目 Running、Plan Committed 或已有 Research 结果推导 Enabled。

来源读取失败返回 SourceError，越权引用按既有隐藏策略拒绝，版本竞争返回 VersionConflict，未完成/失效分析返回 AssessmentNotReady，输入不足返回 ScopeGap，不自动创建修复 Stage。资格与状态变化由现有 owner 事件/版本查询传播；claim 和接受再检查，避免 preview 后资产变化。报告/计划写入复用 Artifact/Plan 的一致性设施，外部分析响应丢失使用同一 Piko obligation 恢复。

需在生产实现前完成：本节字段的唯一 OpenAPI/Schema、Plan/Runtime ISD 依赖资格语义、权限矩阵、正负 fixture、Browser/Recovery/E2E。测试 ID 为 V03-SCOPE-001..012（测试生命周期规格 §12）；静态文档检查不关闭这些实现门。

### 12.4 Project Assessment 页面投影与动作映射

评估结果与执行范围是同一 Project Assessment 视图的两个局部页签，复用 §12.1 操作和现有 Artifact/Resources/Communication 详情入口；不增加 View 自有事实存储。

`get_project_assessment` 增加以下页面所需字段；空引用表示尚无结果，不能伪造文档或资格：

| 字段 | 类型 / 来源 / 约束 |
|---|---|
| project_summary | object：purpose:string、current_version:string或null、target_version:string、component_refs:ref[]、summary:string；Project/Component 事实与 Analysis 结论分别标 source_refs，来源失败保留 typed error |
| reports | array：owner:`Research\|Analysis`、report_ref:ref、report_acceptance_ref:ref或null、work_ref:ref、source_version:string；每份报告分别保持接受状态，Ready 不推导 acceptance |
| recommendations | array：stage_ids:canonical ID[]、rationale:string、evidence_refs:ref[]；与 recommended_stage_ids 集合一致，只是建议，不充当用户选择 |
| progress | object：work_refs:ref[]、completed_item_count:非负整数或null、total_item_count:非负整数或null、pending_source_refs:ref[]；只统计已登记工作项，未知数量为null，不推算百分比 |

InventoryEntry 的资格明细经现有 Artifact/qualification 查询读取：qualification_ref、status、scope、evidence_refs、invalidated_reason；Environment 项的动态 readiness 另从 PR 查询，基线资格不代替当前设备可用性。

AnalysisFinding 增加 `impact_scope`（`ScopeConfirmation\|WorkAdmission\|OutsideSelection`）、`related_resource_refs:ref[]`、`action_ref:ref或null`、`basis:Observed\|Inferred\|Unknown`。impact_scope 与 affected_stage_ids 按当前候选投影，候选变化重新计算。无 action_ref 不显示可进入的正式决定；用户在现有正式问题机制中处理。少证据的推断标 Inferred/Unknown，不与已观察事实混排成同等确定结论。

`preview_execution_scope` 的 deliverables 元素固定为 `{stage_id, artifact_kind, description, acceptance_contract_ref}`；增加 `excluded_work:string[]`、`resource_constraints:array`（resource_ref可null、affected_stage_ids、reason、action_ref可null）。这些来自 Plan/IR/PR，缺少预估时只显示未知，不在 View 计算成本或工期。资源约束不并入静态输入 eligible；Runtime 独立检查准入。

| 页面动作 | Owner 操作 / 反馈 |
|---|---|
| 进入结果页 / 选择评估来源版本 | get_project_assessment；固定 assessment_ref、source_manifest 和请求代次，晚到响应不能覆盖当前版本 |
| 查看报告、基线或资产 | 原 Artifact 详情/版本读取；服务端校验项目与 ACL，显示精确版本而不是自动跳 latest |
| 查看资源缺口 / 正式问题 | 按 related_resource_ref / action_ref 定位现有 Resources / Communication；引用不可用显示来源错误，无隐式 mutation |
| 使用建议、勾选、全选或清空 | 仅本地编辑 selected_stage_ids；清除旧 candidate 的可提交资格；未选择不调用 preview |
| 检查范围 / 选择不同阶段详情 | preview_execution_scope 生成版本化候选；详情读取该候选的 dependency_bindings，不另写状态 |
| 确认范围并发布计划 | commit_execution_scope；显示 scope/Plan/receipt 或冲突，成功后定位 Project Plan；不顺带调用 start_project 或启动工程 Work |

已完成但输入过期、只完成部分来源、合法空项目、权限不足、无 Action 引用及资源暂不可用均须有独立页面状态。V03-SCOPE-008/011/012 增加 Browser oracle：选择改变使旧预览失效；跨页签选择保持；事实/推断、报告接受/资格/执行状态分开；提交后无工程 dispatch；窄屏和键盘可达全部控件。机器契约、实际 Artifact 详情 mapping 和 Browser capture 未就绪前保持设计候选。

### 12.5 新建与既有项目的统一评估

`get_project_assessment` 取代本批尚未实现的 get_project_analysis View 操作，不保留两个别名接口。Assessment 是 WebUI 对 Project、Research、Analysis、Artifact、Plan 的查询投影，不增加业务模块、独立 ledger 或另一套执行流程。`assessment_ref` 固定本次查询 source manifest 的版本 token，Plan 提交须逐个重验其 source_versions，不能把 View token 当作业务接受证明。

返回新增 `entry_mode:New|Existing`、`required_source_refs:ref[]`、`reports[]`、`research_summary:null|object`。New 必须有 Research 来源，Existing 必须有 Analysis 来源；追加的已授权预研进入 required_source_refs，任何必需来源未完成、失效或冲突未决时，对应范围不得因另一份报告 Ready 而通过。summary 包括 `goal_interpretation:string`、`feasibility:Feasible|Conditional|Infeasible|Unknown`、`approaches:[{approach_id,title,tradeoffs,evidence_refs}]`、`recommended_approach_id:string|null`、`resource_demand_refs:ref[]`，由 Research 提供，不由 UI 推断推荐或生成新需求。

新项目的 inventory 展示已生成的 Research/需求输入/STD 资产，其余代码与测试明确为尚未产生。InventoryEntry.kind 增加 `Research|RequirementInput`；BaselineCandidate.code_revision 在 inventory 无代码时允许 null，适用于 New 和 Existing。存在代码时必须绑定不可变代码版本；无代码时不填占位 commit。Existing 仅设计项目由 Analysis 资格化设计/接口/ISD 及接受记录，再选择 Coding；生成代码成为新的 Artifact 版本。需要现有实现的构建或测试阶段缺代码时返回 MissingInput，不能把允许 null 解释为免除阶段输入契约。

ScopeCandidate 增加 `completed_entry_ref:ref|null`，只引用同一项目已接受、版本仍适用的入口 Research Work/Gate。全流程集合仍为固定 15 个 ID，Plan 承接该 Research 的原执行事实，仅为未完成工作排新执行；若用户只选后续阶段，则按 BaselineArtifact 绑定预研输出。入口 Research 的执行成本只记一次。失效/缺 Gate/异项目引用拒绝；不能通过这个字段把任意未执行 Stage 标为完成。Existing 的 supplementary Research 与原 Analysis 分别保留来源，替换/覆盖结论须经 owner 接受及用户决定。

推荐方案、预研接受、用户范围确认和 Requirement 批准是独立事实。评估结果可接受但仍有范围外未知项；只有影响所选范围的 unresolved blocker 阻止确认。需要用户决定时沿现有 Communication Action 流程，页面不增加“接受所有结论”捷径。
