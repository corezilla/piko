<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky V0.3 版本开发计划

| 文档字段 | 值 |
|---|---|
| Document ID | `slinky-version-development-plan` |
| Document Version | `0.3.0-draft.3` |
| Status | `Draft` |
| Project | `slinky` |
| Authority | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Authors | `Codex` |
| Created Date | `2026-09-09` |
| Last Modified Date | `2026-09-16` |
| Template ID | `management.development-plan` |
| Template Version | `0.1.0` |
| Template Conformance | `native` |
| Tailoring Reference | `none` |
| Migration Map Reference | `none` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/00_management/version-development-plan.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目标、范围与交付产品

2026-09-09 用户正式启动 V0.3 设计与开发。产品域为 software；本计划取代“V0.3 仅在独立目录准备、等待 V0.2 测试结束后才能开发”的工作约束，但不代替设计批准、生产切换或用户验收。V0.2 原始测试结果保留，不能据启动决定宣称它已全部通过。

本轮从主干 `12f5ee7d3fe08c7b94687f8a4506e7af74503b4e` 出发，按文档映射归并设计来源 `2c36a5ba30692bea00409df55e987cb156df06cd`；不整体合并旧分支的源码、配置或旧目录。后续文档唯一编辑入口为主干分层 `docs/`，不再建立根目录 `V0.3/` 或第二套 STD 目录。STD 来源只由现有 `docs/std.lock.json` 固定。

V0.3 交付包含智能角色驱动的流程推进、Plan/Gantt、IR/PR、Knowledge/Memory/Skill、Research、多语言工程、Testing、统一 View，以及对外部 Piko/LLMTier 的唯一适配路径。2026-09-14 增加 Analysis（M012）、Project Assessment 视图、已有项目导入与一个/多个/全部阶段执行。测试使用已资格项目基线的隔离副本，只执行目标阶段；完整全流程仍保留发布回归。系统设计 §2.3、View Contract §12、测试生命周期规格 §12 承接本批概要；后续依次细化 Analysis 模块、唯一 Plan/Runtime Schema/ISD、实现、Contract/Recovery/Browser/E2E，不以文档或静态测试声明可运行。动态 Process/WorkItem/Wave 与自动跨 Stage 回退不进入本版；LLMTier Chat/SSE 继续属于 V0.4。

### 1.1 当前设计决定

2026-09-16用户已重新裁决系统边界，当前为[智能流程推动器设计修订](../90_decisions/intelligent-process-scope-20260916.md)。旧SLK-DF-20260916只保留历史，不再批准本轮撤回机制。未实现不构成设计阻塞，静态设计通过不等于运行验收。

| ID | 当前决定 |
|---|---|
| V03-BASE-01 | 智能角色决定业务动作；Runtime执行事实、Plan保存计划，不新增子系统 |
| V03-BASE-02 | 工程阶段保留为组织和展示；撤回固定15节点自动推进规则，不新增通用DAG编辑器 |
| V03-BASE-03 | 逐级细化计划，项目经理结合结果/风险调整，代码保留权限和结构一致性检查 |
| V03-BASE-04 | 一IR对应一Piko实例；多IR任务独立，不组合Slot/Seat/claim；PR安全独占保留 |
| V03-BASE-05 | Piko调用标准模型服务；Memory内部用embedding；无Slinky模型恢复控制面 |
| V03-BASE-06 | 任务最终失败由PM换IR或转待用户事务；Piko负责执行内恢复 |
| V03-BASE-07 | Slinky拥有记忆，Piko返回候选变更，经Slinky验收落库 |
| V03-BASE-08 | 保留token Usage和各自环境诊断恢复；Cost暂不做 |

原计划后续WBS中固定图、容量backing及复杂恢复相关工作撤回，不再按旧排序实施。执行顺序调整为：更新权威设计 -> 双方对齐最小接口 -> 在现有模块细化实现映射 -> 实现与验证。其他工程质量与隔离工作继续保留。

## 2. 生命周期模型与开发方法

采用固定 Stage + 渐进细化计划。每级设计完成即可开始下级设计与同级测试设计；Contract fixture、负例、环境准备与实现同步。T0-T8 是测试资产/执行生命周期，不能替代 Unit/Module/Subsystem/System 各测试层级。

开发按可验收的纵向切片推进，而不是先把所有模块编码完才做系统联调。每批同时交付设计增量、接口、实现、测试资产、调试和复验记录。现有 Runtime 是迁移基线，不先创建第二 Runtime；没有通过接口 Gate 的外部调用不以 mock 自动降级上线。

## 3. 组织、职责和 authority

| Owner | 责任 | 不得替代 |
|---|---|---|
| 用户/Product owner | 范围、预算、风险承担、最终验收 | 未执行测试不能口头变 Pass |
| Slinky 设计/实现 owner | Project、Plan、IR、PR、Artifact、Testing、View | Piko/LLMTier 内部实现及批准 |
| Slinky Test owner | Case/Oracle、环境 admission、跨层 promotion、缺陷复验 | 仅凭 LLM/报告文字判定成功 |
| Piko owner | Pi Agent Runtime、execution capacity/claim、单Agent Run/Result、通信 binding/transport/ingress | Slinky Project/Session/Topic/Plan/Action/Artifact authority |
| LLMTier owner | Registry、模型路由、admission、ledger、Admin UI、Observation | IR、Agent、Project authority |
| Operator | 部署、Secret binding、用户权限、retention 配置 | 绕过 membership、开放不受控 iframe |

人员/Agent Slot 尚未分配到实名容量，表中是职责而非虚构资源承诺。跨项目交付通过现有 Matrix 协议提出，要求修改后的 immutable commit、字段摘录和执行证据，再 review 闭环。

## 4. 工作分解、里程碑、依赖与资源

完整开发 WBS 见 [机器计划](../60_interfaces/contracts/fixtures/version-development-wbs.json)。它是本项目开发计划证据，不是 Slinky Runtime 的第二配置入口。当前工期为人日范围估算，不是 LLM token 时间或交付日期承诺；外部等待时间另算。所有节点含 predecessor、owner、resource、output 和验收条件。达到模块/ISD Gate 后细化实现叶子项及测试，不能将未细化包算作完成。

| 批次 | 主要产物 | 出口 |
|---|---|---|
| B0 主干启动 | 文档归并、最新范围、开发 WBS、固定 DAG 检查 | 来源与 STD 校验；不修改生产运行路径 |
| B1 设计/契约 | Requirement、各级设计/ISD、Piko/Tier/Element 对齐、并行测试设计 | 所需字段/错误/状态/副作用和正负 fixtures 可执行 |
| B2 核心纵向切片 | 启动 -> 一条 PlannedWork -> IR/PR admission -> Piko -> Artifact/Actual | Unit/Contract/Module + 首个真实依赖 pilot |
| B3 完整能力 | Plan、资源冲突、Knowledge/Research/Testing、四 View | Subsystem、六环境 pilot、浏览器与用户决策 |
| B4 系统资格与切换 | 全周期 E2E、Recovery/Security/性能、迁移演练和遗留路径删除 | 独立 review、用户验收与显式发布 |

B0 开始于本次用户指令；设计归并、启动计划与首批测试骨架已完成技术检查，53 份来源检查、610 份 STD 文档/metadata 校验和 16 项设计测试通过。B1-B4 尚未完成，G0 的独立内容 Review 仍待执行。日期排程由实际已确认的执行人、环境和外部 ready 时间生成，不能以当前未实现的 Plan 模块作为制定开发计划的前提。

### 4.1 B1-A 当前交付

2026-09-09 继续首个设计切片：交付 [66 项需求与验收](../10_requirements/software-requirements.md)、
Runtime 模块原生细化、[固定 Stage ISD](../50_implementation_design/fixed-stage-runtime.md)、
19 个分层测试 Case、strict readiness Schema/fixture 与派生 traceability。
保留原 47 个需求 ID；补充上下文、共享 Git、早期测试设计、全前沿恢复等源码差距。

V03-D01/D02/D03 为 InProgress：本次仅 Runtime 范围候选，不把其余模块设计标完成。
V03-T01/T02 的 Runtime 测试预设计已交付，但全项目测试设计尚未完成，保持 Planned。
设计检查目前 54 项通过（含 B0 16 项），不代表 19 个真实 Runtime Case 已执行。
源码、运行配置、旧状态和 B0 证据均未改动；[B1 Review](../91_reviews/runtime-design-batch.md)
单独记录证据和 RT-G01..07。下一设计切片仍须完成系统主流程/Plan/IR/PR 细化及外部契约闭环，
不能因本次静态检查通过直接启用生产并行 Runtime。

## 5. 需求、设计、实现与集成方法

### 5.1 修订后的下游细化顺序

| 顺序 | 设计切片 | 退出条件 |
|---|---|---|
| D1 | 智能业务决定与现有Runtime记录映射 | 授权、版本和防重复执行明确，不恢复固定自动升级链 |
| D2 | 单IR/Piko任务与多IR Review | 最小任务字段、结果与失败交接一致，不含容量backing |
| D3 | Memory更新与用户事务 | Piko建议到Slinky验收落库、PM转用户全过程明确 |
| D4 | 标准模型/Embeddings/Usage与各自环境运维 | 提供方同步简化设计；只设计必要接口，不做Cost或统一恢复协议 |

各切片同步验证场景；旧fixed-stage ISD与机器包只能作迁移参考，不要求生产实现先完成才能审设计。

1. 以本计划、系统设计及用户确认项建立 Requirement/Acceptance 对照；沿用原 Requirement、Interface、Case ID，不重新编号掩盖遗漏。
2. 每份下级设计明确 provided/consumed interface、参数/返回、状态/错误、启动/关闭/恢复、数据 writer 和依赖；上位摘要不能替代详细 Contract/ISD。
3. 保留 53 份输入的章节和来源 SHA；它们是 legacy-mapped，不虚报已按 native 模板完成语义重写。分批将当前实现与目标内容核对到源码映射。
4. 从现有 Stage/Task/Artifact/Gate 机制演进，按受控提交替换旧调用点；未经过 Review 不新增配置路径、selector、fallback 或业务 authority。
5. 外部 Contract 按 owner 提供的 machine bundle materialize，Slinky 不自行补写对方已支持字段。嵌入式聊天先闭合 descriptor、project mapping、用户事件触发和安全契约再接生产。
6. 真实依赖 pilot 在 B2 开始，不推迟到 B4。完整系统测试是已通过层级测试的资格验证，不是首次检查账号、端口、目录、Oracle 或客户端兼容。

## 6. Coding/RTL/Documentation Standards

软件实现使用现有源码、测试和配置入口；每项行为必须有可执行 Oracle。生产 Schema/DTO 与实现共用单一 authority；fixture 只作测试输入，不做第二份运行时 Registry。未知 quota、缺失结果、局部失败不能转为零、成功或无限资源。

文档按现有 STD lock 与项目目录裁剪执行，封面和 metadata 同步。Document Status、review verdict 和 RuntimeActivation 分开；保留历史迁移/测试/批准记录，不因 V0.3 启动覆盖历史事实。RTL/FPGA 不适用。

## 7. Toolchain、环境、版本与可重复构建

- Python 依赖沿用 `tools/dependencies/`，测试入口为 `scripts/test.sh`，源码位于 `src/`；本地 Secret 只在既有 `.local/` 边界。
- 新文档/fixture 检查入口：`scripts/test.sh tests/unit/design_baseline/test_v03_baseline.py`；只验证设计候选，不调用外部服务。
- STD 校验：`/Users/ben/work/STD/scripts/validate-design --project-root /Users/ben/slinky --require-immutable-std`。
- 浏览器 Demo 位于独立实验项目，不能搬入其静态 Atlas 数据、账号或运行状态充当生产数据。记录的 Element 版本只作 pilot 输入；实际 production build/version/module API 必须在 B1 pin 并验证。
- 环境由 PR 封装：每套独立路径、端口、数据库/项目 namespace、browser profile、execution ID 和 cleanup；共享模型服务的内部隔离由提供方处理，不引入SourceInstance或恢复namespace消费要求。
- Test report 记录 Slinky/Piko/Tier/Element/Matrix commit、依赖 lock、配置脱敏 hash、Case/fixture 版本与环境 fingerprint；缺任何关键来源即 Blocked/Invalid。

## 8. Review、Verification、Validation 与 Gate

| Gate | 最低证据 | 阻断范围 |
|---|---|---|
| G0 Source/Design | 完整来源、STD/链接、Requirement/Case 不丢失，业务变更单列 | 合并/批准设计 |
| G1 Contract/ISD | typed DTO/error/state、exact version、并发/幂等/recovery、负例，Consumer/Provider 双方 review | 相关生产实现接线 |
| G2 Module | Unit/Contract/Module、controlled failure/mutation、reset/cleanup、源码到用例映射 | 子系统 promotion |
| G3 Integration | pinned 真实依赖 pilot、六环境隔离、启动/停止/重启、权限与 lost response | 系统 qualification |
| G4 Release | 全 E2E/Recovery/Security/性能、无假覆盖、迁移/回滚演练、遗留路径扫描 | 发布和 activation |

修复必须补触发缺陷的层级测试，再执行该层及受影响上层回归；不得只修 System Case。调试与复验是 WBS 独立工作，不从测试预算中省略。mock、文档检查与 real-service evidence 分级记录，当前通过多少静态测试都不意味着 G2-G4 通过。

## 9. 配置、变更、问题和缺陷管理

每个工作保留 Requirement -> design -> Contract -> code -> Case -> execution evidence -> defect -> rerun 链。范围/接口变更先更正唯一当前文档和机器契约，再执行对应正负测试；历史 review 结论保持原 commit 作用域。

本次依赖请求：`S-20260909-2f06d9392004`，已发给 Piko、LLMTier 并要求双方答复。内容包括最新设计/实现 commit、实际支持 endpoint、真实测试、blocker 和首批联调条件。当前记录为 WaitingForReply，不创建新的监控器、定时轮询或代表会话。

## 10. 安全、质量、供应链与第三方依赖

Element/Pi/Matrix/模型 SDK 需固定来源、版本、license 与更新边界；不能因为 demo 运行就批准生产。浏览器自己的 Matrix session 由 Element 持有，Slinky DTO 不包含 access token、AS token、设备 key 或 checkpoint。跨项目目录过滤不等于 homeserver 授权隔离；独立验证 membership 和用户撤权。

模型资源/网络异常先保留 durable obligation，再由 owner reconcile。无 Invocation ID 时允许 D=24h 内重放同一 POST/key/digest；已有 ID 则 GET。未知外部结果不能新建 key/Attempt 盲重派。Prompt/output privacy 配置必须满足已冻结的 canonical result/tombstone retention，不静默缩短。

## 11. 发布、维护、迁移与退役

正式开发可以开始，生产切换仍需 G4 和用户授权。既有环境可继续运行旧已部署版本；同一 V0.3 release 不保留两条 runtime route 作为 fallback。迁移演练先备份并验证恢复，失败时停用新 release、恢复经批准的整体部署/数据快照，不在运行时偷偷直连 Provider。

逐步补齐 ISD、运营手册、部署/回滚/Secret rotation、备份恢复与最终验收。历史 V0.2 文档和测试结果留作 provenance；旧 `V0.3/` 工作树不再是当前写入 authority，但不删除用户工作树。

## 12. 度量、报告、风险与 Tailoring

进度按完成的验收条件统计，不按文档行数、Case 数、Agent 发言或“计划完成”文字。报告实际开始/结束、剩余估算、依赖等待、资源队列、缺陷逃逸层级、Blocked/Invalid/Flaky、风险最迟决策时间。

| 风险 | Owner | 必须解决前 | 处置 |
|---|---|---|---|
| Element 新嵌入要求与旧 ExternalLink machine contract 不一致 | Slinky/Piko | B1 G1 | 独立 Contract amendment + browser security fixture；不做双路径 |
| Piko Session/Close enum 或 recovery 仍有待对齐项 | Piko/Slinky | B2 adapter 接线 | exact commit/字段/正负 fixture 复审 |
| LLMTier production/retention/capacity 证据尚未确认 | LLMTier/Slinky | B2 pilot | 获取实际 manifest 与执行记录，不以旧 Matrix 摘录当当前事实 |
| 文档有结构迁移但缺少源码/接口细化 | 各 owner | 相应模块编码前 | B1 逐模块 source mapping/ISD，不能一次宣布全部设计完成 |
| 实际人员/IR/PR 容量未分配 | 用户/执行 owner | 承诺交付日期前 | 保守工时范围，确认后计算日期和资源平衡 |
| 多环境共享数据/账号造成干扰 | PR/Test owner | G3 | 1 -> 2 -> 6 套逐级 pilot、独立 namespace、quarantine |

裁剪见 [design-tailoring](design-tailoring.md)。新增开发计划使用完整 native 模板；归并的旧文档如仍是 legacy-mapped，必须在相应设计批次关闭内容缺口。本文是启动后的执行计划草案，不是“全版本已实现”声明。
