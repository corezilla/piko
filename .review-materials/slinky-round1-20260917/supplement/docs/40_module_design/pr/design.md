<!-- STD_DOCUMENT_COVER_BEGIN -->

# Slinky v0.3 PR 设计

| 文档字段 | 值 |
|---|---|
| Document ID | `v0.3-project-resource-management` |
| Document Version | `0.3.0-draft.3` |
| Status | `Draft` |
| Project | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Last Modified Date | `2026-09-16` |
| Template ID | `design.definition` |
| Template Version | `1.3.0` |
<!-- STD_DOCUMENT_COVER_END -->

候选移交、停止证明和清理释放的时序遵循 [SM002](../../20_system_design/mechanisms/work_delegation.md)；独立 Review 不要求保留作者运行资源，但清理前必须保存可授权读取的不可变候选。

对象 ID：`M005`；模块名：`PR`；直属父对象：`Slinky`；目标 code_directory：`src/pr/`。当前实现位置及迁移边界见本文基线章节；编号与目录以系统对象登记表为准。

## 1. 单元摘要：为什么存在

PR Management 管理可由项目计划分配的非 IR 资源，优先解决测试环境并发、隔离、冲突和 readiness 问题。

### 当前实现与本版增量

- Current Baseline：v0.2 测试环境多由脚本/Docker 临时组合，六套并行环境曾出现 workspace、port、service、account 等冲突。
- Approved Delta：环境预先封装为独立可排期 resource unit，由 Plan 预约、Runtime 激活 lease、Testing 使用并回收。
- `PR` 是暂定术语，最终展开名称在 Module Design 前冻结，但 stable object semantics 不变。

## 2. 需求、功能与验收条件

承接系统设计与 SRS 中原有 Requirement ID；第 14 章保留逐项验收映射。未知接口或阈值属于设计缺口，不是已实现但未运行。

## 3. UI、CLI 或设备操作面

向 Resources 的 PR 分区提供环境集合、预约、租约、健康、隔离指纹和回收阻塞；用户操作必须有权限和预期版本，不能通过页面直接删除运行中资源。

## 4. 外部边界与依赖

- 负责：resource profile/inventory、availability、capacity、Reservation、Lease、readiness、release、conflict、recovery。
- 不负责：执行测试、排 Gantt、管理 IR、启动任意 provider routing。
- authority：PR identity、calendar、reservation/lease state 和 readiness evidence。
- 上级设计与需求：Plan resource demand、Environment/Test Design、Tool profile。

## 5. 内部结构与实现位置

| 部分 | 职责 |
|---|---|
| Resource Catalog | Test Environment、Workspace/Host/Container、Browser/Device、Service Instance、Tool capacity |
| Reservation Manager | future time allocation/conflict |
| Lease Manager | active exclusive/shared usage and fencing |
| Readiness/Equivalence | probe、fingerprint、environment equivalence |
| Cleanup/Recovery | teardown、quarantine、reclaim |

具体文件变更仍以第 13 章和逐文件 ISD 为准；不得按概念框图虚构已存在源码。

## 6. 数据模型、状态与 ownership

Resource：`Discovered -> Provisioning -> Ready -> Reserved -> Leased -> Cleaning -> Ready`；异常为 `Degraded/Quarantined/Unavailable/Retired`。Reservation 与 Lease 是不同对象；Lease 需要 fencing token/expiry/owner execution。

## 7. 主流程与数据流

```text
discover/provision resource
-> validate topology/profile
-> readiness probe + fingerprint
-> publish availability calendar
-> Plan Reservation
-> Runtime Lease activation
-> execution heartbeat/observation
-> cleanup + evidence + release
```

## 8. 关键算法与业务规则

- exclusive resource 同时只能有一个 active lease；shared resource 必须声明 capacity unit 和 all-constraints membership。
- 多环境并行前先冻结 workspace/path/port/network/service/account/data ownership。
- Lease renew 失败时停止新步骤，在安全点收敛；不得让两个 runner 同时认为自己拥有资源。
- Plan 提前显示 demand/actual/shortage 时间窗并影响 critical path。

软硬件容量按 [系统设计 §6.5](../../20_system_design/system-design.md#65-软硬件与模型服务容量设计) 计算：先扣共享服务、安全余量和已有租约，再对 CPU/RAM/磁盘等逐项求约束交集；混合负载按需求求和，启动峰值与稳态分别计入。Docker VM 的实际限额、Browser/AVD/构建进程和可写盘均须计入，不能以宿主标称内存或容器个数宣告支持并发。PR 返回 profile/version、需求与可用量、限制维度、计算上界、已验证并发及证据引用；缺实测资格时只返回规划候选。IR 的模型容量是独立约束，最终联合并发由 Plan 排定。

## 9. 接口与机器契约

- Consumed：EnvironmentTopologyProfile、EnvironmentExecutionProfile、PlannedWork demand、Adapter probe。
- Provided：catalog/calendar、match demand、reserve/update/cancel、activate/renew/release lease、readiness/fingerprint/conflict/detail。
- Plan 只看 scheduling unit；Runtime 只拿已验证 resource reference；底层 credential 不上送。

## 10. 并发、失败与恢复

### 10.1 测试环境闭包与重用准入

承接 [系统设计 §13.4](../../20_system_design/system-design.md#134-并发测试与环境隔离)。Resource Catalog 保存锁定的源码/镜像/依赖/配置引用、只读和可写挂载、执行身份、工具链、端口与外部 binding；Readiness/Equivalence 在实际 target 身份下验证，结果绑定当前 lease/version/有效期。编排主机的静态检查与 target 的动态准入分别留证。

PR 的 reserve/activate/readiness/renew/release 既有接口需在详细 Schema 中承接以下数据义务，不另增入口：

| 操作 | 输入及条件 | 返回与失败语义 |
|---|---|---|
| reserve / activate | Resource/version、Work/Attempt、profile/mode、capacity、预计区间 | reservation 与 lease/fencing 分开；缺容量、版本或资源冲突明确返回，不假定 ready |
| readiness | 当前 lease、source/fixture/config/binding refs、真实 target 身份、预算 | 按维度返回 expected/observed、时间/有效期、Evidence、failed dimension/owner/影响 Work；任一必需项未知不得 Ready |
| renew | 精确 lease/owner/fencing、当前执行引用 | 记录有效期或续约失败；停止新步骤，不能仅因到期声明空闲 |
| release / reclaim | 当前 owner、stop/drain/cleanup/reset Evidence、未知外部 obligation | 清理成功且旧 writer 已 fenced 才释放；部分失败保留占用或 quarantine，返回 pending obligation 和修复 owner |

可写目录以固定 UID/GID 策略创建和清理，stamp、锁和 DB sidecar 与只读源码分开；容器工具链不能复用 Host 绝对 symlink。Runtime 派发前取得闭包引用；PR 经既有 Adapter probe 取得其授权 target 的身份与环境指纹，绑定实际 lease/version。Piko RunView 的 resolved_bindings_ref 仅是绑定快照引用，不是通用 target 指纹或完整环境探测报告；不得要求不存在的 Run 响应字段。PR 必需 probe 证据未知时不得 Ready，不从本地 PID、端口或目录名推断外部身份。具体 probe DTO/验证器属于既有 PR Adapter 下游设计；若需新增提供方事实，必须先评审契约，不由实现自行扩展 Piko wire。

Plan 的联合并发是规划结果，不是外部 admission 保证。PR reservation/lease 不预留 Piko execution capacity 或 Tier Seat；Piko 每个 participant 的单 Run claim、execution release、communication drain 和 Tier release evidence 分别消费，不能用 PR 清理成功替代其他 owner 的释放证明。

### 10.2 换批、模式切换与资源恢复

已有 Cleanup/Recovery 依次执行停止新 admission、精确进程树和远程义务收口、证据保存、owner 范围清理、基线复位、实际模式/指纹复验。任何旧 campaign 监听者、orphan、权限错误或未知远程结果均隔离受影响单元；禁止跨 batch 隐式删除及重启共享 LLMTier。受影响以外的 lane 继续满足原资格时可运行。

容量阈值、冷启动/替换/停止/清理预算、采样与回滞参数沿用 EnvironmentExecutionProfile，由 T5 实测冻结；预算必须覆盖嵌套操作，不引入平行 timeout 配置。V03-ENV-001–014 是下游设计/回归义务，具体见测试生命周期 §11；其通过才构成环境实现证据。

- Readiness failure：Blocked，携带 failed dimension、owner、retry_after、affected work。
- Partial provision：清理或 quarantine，不返回 Ready。
- Runtime crash：lease 保留到 expiry/fencing recovery；新 owner 必须显式 reclaim。
- Evidence：probe result、fingerprint、reservation/lease transitions、cleanup report、conflict audit。

## 11. 安全、权限与可观测性

- Secret write-only/ref-only；View 只显示配置状态。
- Project/work execution 级 workspace、network、data 和 service isolation。
- 测试污染、stale state 或 fingerprint mismatch 必须 quarantine。

## 12. 容量、性能与运行限制

资源 profile 必须封装复杂内部拓扑，让调度器只处理有限维度：capacity、calendar、exclusive/shared、setup/teardown time、location/failure domain、compatibility tags。未知容量不得伪零或无限。

## 13. 实现步骤与文件清单

V0.3 优先实现 Test Environment 与 Workspace/Container resource type，再扩展 Browser/Device/Service/Tool。不得让每种环境在 Plan 内形成专用调度分支。

## 14. 测试与验收

| Requirement | Design element | Verification method | Evidence | Status |
|---|---|---|---|---|
| V03-PR-001 | Reservation/Lease separation | state test | illegal overlap rejected | Planned |
| V03-PR-002 | six-environment isolation | concurrency E2E | no shared path/port/account collision | Planned |
| V03-PR-003 | fencing/restart | recovery test | single active owner | Planned |
| V03-PR-004 | readiness/fingerprint | mutation test | stale environment rejected | Planned |
| V03-PR-005 | forecast visibility | plan integration | shortage before execution | Planned |

## 15. 风险、未决问题与引用

- [ ] PR full name and type registry。
- [ ] Reservation/Lease schema and fencing semantics。
- [ ] Test Environment equivalence policy。
- [ ] setup/cleanup SLO and quarantine process。
- Gate：未获得 valid Lease + readiness evidence 的 WorkExecution 不得 Running。

迁移来源：`docs/30_subsystem_design/v0.3/v0_3_environment_management_draft_20260802.md`。

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
| Canonical Path | `docs/40_module_design/pr/design.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_CONTROL_END -->
