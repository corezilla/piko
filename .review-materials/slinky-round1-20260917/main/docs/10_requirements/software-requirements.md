<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky V0.3 软件需求与验收规格

| 文档字段 | 值 |
|---|---|
| Document ID | `slinky-software-requirements` |
| Document Version | `0.3.0-draft.6` |
| Status | `Draft` |
| Project | `slinky` |
| Authority | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Authors | `Codex` |
| Created Date | `2026-09-09` |
| Last Modified Date | `2026-09-16` |
| Template ID | `requirements.specification` |
| Template Version | `0.1.0` |
| Template Conformance | `native` |
| Tailoring Reference | `none` |
| Migration Map Reference | `none` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/10_requirements/software-requirements.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目的、范围与来源

2026-09-16修订：本版将用户最新业务裁决作为当前需求。未逐项改写的旧表述中，固定图自动推进、跨系统模型/容量/Session协议、Cost等与本版冲突的部分全部撤回；原ID保留追踪用途，不得作为第二实现依据。

本规格收敛 V0.3 已讨论的功能、边界和可验收条件；是 B1-A 设计候选，不是实现完成声明。
保留已有 V03-RT/PL/IR/PR/KM/RS/ML/TS/UI 标识，不用新编号替代旧需求。
用户批准的是版本启动和范围，不是本轮新增内部 DTO、存储选型或测试结果的批准。

| 来源代号 | 固定输入 / 当前细化入口 | Owner |
|---|---|---|
| BASE | [启动基线 §1.1](../00_management/version-development-plan.md) 中 V03-BASE-01..08 | 用户 / Slinky |
| RT | [Runtime](../40_module_design/runtime/design.md)；B1-A 源码基线 main@12f5ee7 | Runtime |
| PL | [Plan](../40_module_design/plan/design.md) | Plan |
| IR | [IR](../40_module_design/ir/design.md) | IR |
| PR | [PR](../40_module_design/pr/design.md) | PR |
| KM | [Knowledge](../30_subsystem_design/knowledge/design.md) | Knowledge |
| RS | [Research](../40_module_design/research/design.md) | Research |
| ML | [多语言工程](../40_module_design/component/design.md) | Web Engineering |
| TS | [Testing](../30_subsystem_design/testing/design.md) | Testing |
| UI | [View Contract](../60_interfaces/contracts/view-contracts.md) | 对应数据 owner / WebUI |
| EXT | [External Contract](../60_interfaces/contracts/external-service-contracts.md) | Slinky consumer；外部 provider |
| COMM | [项目通信决定](../90_decisions/project-communication-integration.md) | Runtime / WebUI；Piko transport |

旧详细草案的内容来源为 B0 inventory 中的固定 commit，不覆盖其历史测试结论。
表中 Verification 是必须执行的验收检查说明；自动生成的 AC-需求ID 只是本表行定位，不是已执行测试。

## 2. 系统/产品上下文

用户输入 Goal 或导入已有代码/设计/测试，Runtime 对新项目先执行 Research，对已有项目先执行 Analysis，再按用户确认的一个、多个或全部工程阶段推进；Plan 为所选范围及必要管理工作安排计划。V03-RT-001、V03-PL-002、V03-UI-002 和 V03-TS-001 的范围增量共同承接系统设计 §2.3：未选前驱用经过资格检查的精确版本资产满足输入要求，不伪造成功或隐式补跑。Project Assessment 视图展示现状、差异、资格和范围选择。测试复用只读项目基线，在隔离副本中运行目标阶段；具体验收为测试生命周期规格 V03-SCOPE-001..012，源码和机器契约仍待接线。
每个Work选择适用模板/标准、IR和必要PR。项目经理决定业务推进，Runtime校验与执行决定、回收结果并更新Actual。
Piko 独立提供单 Agent Run 执行和 Matrix 传输；Team 的逐成员 Run 编排与汇总归 Slinky；远端 LLMTier 提供模型服务。
Knowledge/Memory 的 Embeddings 调用不构成绕开 Piko 的生成推理路径。

项目管理者使用四个顶部 View；用户和 IR 可以在同一 Matrix 房间讨论。
通信记录是证据，业务批准必须写入 Slinky 的有权限、有版本检查的决策对象。

## 3. 假设、约束与术语

- SHALL / 必须：本版验收约束；Priority P0 为安全/执行阻塞，P1 为本版必需功能，不等于可延期。
- 所有表格行当前均为 Candidate；通过静态检查不改变状态，不得从文档推断 provider 已实现。
- 工程阶段名称可复用；固定15节点自动推进规则退出目标设计，不因此新增任意DAG配置平台。
- Work 是计划项的执行单位；Phase/Task 是已有 Stage 内分解，不新增 Work Management authority。
- 研究与计划建议不得自行变更用户批准范围；智能角色在授权内决定工作安排，理由和证据必须可追溯。
- 硬件、电气、机械、热设计不在本产品交付范围；主机与测试环境属于 PR 外部依赖。

## 4. 功能需求

### 4.1 Runtime 与智能推进

| Requirement ID | Shall statement | 来源 | Priority | Verification | Status | Owner | Work |
|---|---|---|---|---|---|---|---|
| V03-RT-001 | 必须由项目经理等授权智能角色根据目标与事实决定工作推进；阶段用于组织与展示，不由固定15节点AND-join硬编码下一步。 | BASE/RT | P0 | 相同阶段的不同问题可产生不同合理决定；无批准决定不自动派单。 | Candidate | Runtime | V03-I01 |
| V03-RT-002 | 必须由 Plan 持有排期、Runtime 持有执行与 Actual；View 不拥有第二份业务状态。 | BASE/RT | P0 | 非 owner 修改被拒；改变预计时间不改写实际开始/完成。 | Candidate | Runtime | V03-I01 |
| V03-RT-003 | 必须检查任务输入、IR身份、workspace及工具授权，分别记录每个IR的任务事实，不依赖跨系统容量backing。 | RT | P0 | 多IR部分失败被如实展示，不以一个协调者成功替代其他成员结果。 | Candidate | Runtime | V03-I03 |
| V03-RT-004 | 必须由Piko处理执行内重试和恢复，最终失败由项目经理决定换IR或转用户；未知结果先查询任务。 | RT/EXT | P0 | 拒绝按失败次数自动换专家或盲目重派；无Tier Invocation/key依赖。 | Candidate | Runtime | V03-I04 |
| V03-RT-005 | 必须记录项目经理决定的调整范围；涉及改变用户约束或批准基线时取得相应批准。 | RT | P0 | 智能建议不能绕过用户批准或静默重做已完成操作。 | Candidate | Runtime | V03-I01 |
| V03-RT-006 | 必须恢复所有已记录的并行任务与决定，不以current_stage代表全部活动工作。 | RT | P0 | 多IR状态恢复不丢失，不自动生成新业务派单。 | Candidate | Runtime | V03-I01 |
| V03-RT-007 | 必须区分执行完成、机械校验结果与授权业务接受；质量要求保持有效。 | RT/TS | P0 | 任务完成但测试失败时不伪报接受；模型不能改写测试事实。 | Candidate | Runtime | V03-I01 |
| V03-RT-008 | 必须显式传递并隔离项目、Stage、Work、Attempt 和 workspace 执行上下文。 | RT/PR | P0 | 两项目同步执行、异常和线程复用后路径/summary/prompt 不串写；不修改进程全局 workspace。 | Candidate | Runtime | V03-I01 |
| V03-RT-009 | 必须将四级 Test Design 从执行前置条件中拆出，设计阶段不得等待尚未执行的上一级 Test Report。 | RT/TS | P0 | 无代码构建/测试报告/真实环境时仍能完成基于设计的策略、Case 和 Oracle；执行阶段保留门禁。 | Candidate | Testing | V03-I01 |
| V03-RT-010 | 必须按产物清单隔离提交和清理，不把另一个并行 Work 的文件提交、删除或标为本 Work 成果。 | RT | P0 | 外来 staged 文件、同路径写入与 rerun 竞态均阻断冲突操作且保留用户文件。 | Candidate | Runtime | V03-I01 |
| V03-RT-011 | 必须对同一已记录的业务决定实施本地并发及版本保护。 | RT | P0 | 重复事件不重复执行已落实的派单；不要求跨系统Seat或exactly-once。 | Candidate | Runtime | V03-I01 |
| V03-RT-012 | 必须区分局部执行范围完成和项目完成，并在暂停/关闭时收敛已持久化副作用。 | RT | P0 | stop_stage 完成不把未完成项目标完成；暂停不重开业务 admission，unknown 进入恢复。 | Candidate | Runtime | V03-I01 |
| V03-RT-013 | 必须在上游产物失效时阻止后续使用旧输入，保存受影响执行的证据并通知 Plan。 | RT/PL | P0 | 新版本到来与 claim/accept 并发时旧结果不被提升；无关分支继续。 | Candidate | Runtime | V03-I01 |
| V03-RT-014 | 必须把调度等待、资源等待、执行超时、外部结果未知和用户决策等待分别记录。 | RT/PL | P1 | 同一延迟场景给出具体 owner、原因、影响 Work 与恢复动作；不统一伪报执行失败。 | Candidate | Runtime | V03-I01 |

### 4.2 Plan、IR 与 PR

| Requirement ID | Shall statement | 来源 | Priority | Verification | Status | Owner | Work |
|---|---|---|---|---|---|---|---|
| V03-PL-001 | 必须从研究计划开始覆盖全项目周期，以保守估计排后续阶段，在设计和 Test Design 后滚动细化。 | BASE/PL | P1 | PlanVersion 序列从粗阶段到文件/接口级；新增明细不遗失后续工作。 | Candidate | Plan | V03-I02 |
| V03-PL-002 | 必须展示并校验当前获授权计划的依赖与汇总，不强制固定测试join替代业务决定。 | PL | P0 | 不接受循环或矛盾计划，合法调整保留决定来源。 | Candidate | Plan | V03-I02 |
| V03-PL-003 | 必须根据IR能力、工作状态及PR实际约束向项目经理提供排期事实，不组合Tier/Piko容量池。 | PL/IR/PR | P0 | 资源冲突可解释且不生成Seat/claim要求。 | Candidate | Plan | V03-I02 |
| V03-PL-004 | 必须区分计划的结构/权限检查与项目经理的业务判断；代码不替代授权决策。 | PL | P0 | 越权或非法对象拒绝；合法候选由授权角色决定。 | Candidate | Plan | V03-I02 |
| V03-PL-005 | 必须为风险/用户问题显示影响任务、最迟安全解决时间和逾期预测。 | PL/UI | P1 | 延迟回答使 Forecast 改变，不伪改原基线或掩盖关键路径影响。 | Candidate | Plan | V03-I02 |
| V03-IR-001 | 必须把一个IR关联到一个独立Piko Agent实例，并记录其能力及任务状态。 | BASE/IR | P0 | 不存在Slot+Seat+Profile组合backing前置条件。 | Candidate | IR | V03-I03 |
| V03-IR-002 | 必须向项目经理提供任务能力需求与现有IR信息，由其选择执行者。 | IR | P1 | 需要专家时有理由和交接内容，不固定自动升级。 | Candidate | IR | V03-I03 |
| V03-IR-003 | 必须把IR所需模型能力交由Piko通过LLMTier标准接口使用；不建立Slinky模型调用控制面。 | IR/EXT | P0 | Slinky不查询Tier Invocation或接管调用恢复。 | Candidate | IR | V03-I03 |
| V03-IR-004 | 必须分别派发和跟踪多IR Review中每个Piko实例的任务。 | IR | P0 | 三个IR有各自结果、失败和讨论来源；一个Piko不管理其他Agent。 | Candidate | IR | V03-I03 |
| V03-IR-005 | 必须在重新派任务时保留旧IR失败原因、已有结果和已执行操作。 | IR | P1 | 交接不覆盖旧结果，不把重新派单声称为副作用回滚。 | Candidate | IR | V03-I03 |
| V03-PR-001 | 必须把未来 Reservation 与当前 Lease 分开，并拒绝资源不可共享范围内的重叠占用。 | PR | P0 | 两任务同时申请独占环境，只一个有效 Lease。 | Candidate | PR | V03-I03 |
| V03-PR-002 | 必须验证并行环境的workspace、端口、数据与用户身份隔离。 | PR | P0 | 无需SourceInstance；多项目不得串写。 | Candidate | PR | V03-T07 |
| V03-PR-003 | 必须在重启/所有权切换时拒绝旧持有者继续修改环境。 | PR | P0 | 旧 fencing token 的命令拒绝；unknown cleanup 不能复用环境。 | Candidate | PR | V03-I03 |
| V03-PR-004 | 必须以当前 fingerprint/readiness 验证环境，不沿用过期资格。 | PR | P0 | 镜像/配置变化或清理失败后 admission 拒绝并 quarantine。 | Candidate | PR | V03-I03 |
| V03-PR-005 | 必须在实际执行前向 Plan 提供预约冲突、准备时间及资源缺口。 | PR/PL | P1 | 环境晚就绪反映到 Forecast/PM，而非启动失败后才出现。 | Candidate | PR | V03-I03 |

### 4.3 Knowledge、Research 与工程测试

| Requirement ID | Shall statement | 来源 | Priority | Verification | Status | Owner | Work |
|---|---|---|---|---|---|---|---|
| V03-KM-001 | 必须按产物类型先绑定必需模板/标准，再组合技能和经验。 | KM | P0 | 缺必需标准阻断执行；经验不能覆盖硬约束。 | Candidate | Knowledge | V03-F01 |
| V03-KM-002 | 必须为执行与独立 Review 分别生成能力覆盖清单。 | KM | P1 | Reviewer 缺失要求能力时拒绝，不复用作者自评替代。 | Candidate | Knowledge | V03-F01 |
| V03-KM-003 | 必须保持单一知识索引 authority，不另建平行 RAG。 | KM | P0 | 架构/调用点扫描，无第二索引或未授权跨项目检索。 | Candidate | Knowledge | V03-F01 |
| V03-KM-004 | 必须由Slinky管理记忆；更新时派普通Piko任务，返回建议经Slinky验收和版本检查后落库。 | KM | P1 | Agent建议不能直接覆盖正式记忆；冲突、失败及越权保留待处理结果。 | Candidate | Knowledge | V03-F01 |
| V03-KM-005 | 必须由统一 code.* Port 隔离代码后端差异并验证相同语义。 | KM | P1 | 替换后端通过同一 consumer Contract Test，无后端专用业务分支。 | Candidate | Knowledge | V03-F01 |
| V03-RS-001 | 必须接受一句 Goal，先安排 Research 计划，显式列假设与待答问题。 | RS | P1 | 最小输入产生可执行研究工作，不强求用户先填完整规格。 | Candidate | Research | V03-F01 |
| V03-RS-002 | 必须保留用户原始约束和变更，不静默由 Agent 改写。 | RS | P0 | 冲突结论产生问题/决策记录，而非覆盖用户约束。 | Candidate | Research | V03-F01 |
| V03-RS-003 | 必须将多 Agent 研究汇总为带来源、少数立场和未决项的结构化结果。 | RS | P1 | 三方不一致不被最后消息或多数票掩盖。 | Candidate | Research | V03-F01 |
| V03-RS-004 | 必须允许用户补充信息后安全恢复受影响研究范围。 | RS | P1 | 原证据保留，变更只失效相关输入/工作，不无条件重做全项目。 | Candidate | Research | V03-F01 |
| V03-RS-005 | 必须在授权范围内由智能角色提出研究与后续工作方案，不以固定Stage拓扑限制业务决策。 | RS/BASE | P0 | 变更用户范围需批准，不增加通用流程引擎。 | Candidate | Research | V03-I01 |
| V03-ML-001 | 必须覆盖前端和 Python 后端的真实构建、运行及联合验证。 | ML | P1 | 实际服务与浏览器交互有可复现证据，不仅静态页面通过。 | Candidate | WebEngineering | V03-F02 |
| V03-ML-002 | 必须以统一接口 Contract 检查跨语言请求与响应。 | ML | P0 | 正负例检查字段、类型、错误、版本一致，不靠人工猜测。 | Candidate | WebEngineering | V03-F02 |
| V03-ML-003 | 必须根据代码/接口依赖识别变更影响并重测相关范围。 | ML | P1 | 受控接口变更传播到正确 consumer，避免漏测与无关全量失效。 | Candidate | WebEngineering | V03-F02 |
| V03-ML-004 | 必须通过 toolchain adapter 使用语言工具，不加入平行语言专用业务流程。 | ML | P1 | 同一工程 Port 的双后端契约通过，不复制 Runtime。 | Candidate | WebEngineering | V03-F02 |
| V03-ML-005 | 必须记录浏览器、构建工具和环境矩阵 fingerprint。 | ML | P1 | 环境变化使旧资格过期，测试报告可定位 exact version。 | Candidate | WebEngineering | V03-F02 |
| V03-TS-001 | 必须由计划及项目经理安排测试设计和执行，尊重已确认输入与质量要求。 | TS/RT | P0 | 没有实现可先做测试设计；未执行测试不能算通过。 | Candidate | Testing | V03-I01 |
| V03-TS-002 | 必须报告真实 required case 数量和结果，未执行/无效/阻塞不计 Pass。 | TS | P0 | 报告计数与原始执行集合对账，not_pass/空执行不能通过。 | Candidate | Testing | V03-F02 |
| V03-TS-003 | 必须执行真实受控代码/规格/Contract mutation，验证测试能检出错误。 | TS | P0 | 提供 mutant diff、执行、kill/survive 证据，不能改预期答案伪造 kill。 | Candidate | Testing | V03-T03 |
| V03-TS-004 | 必须以隔离环境真实执行并保留 Lease/fingerprint/清理证据。 | TS/PR | P0 | 六环境压力下无共享文件污染，故障环境退出可用池。 | Candidate | Testing | V03-T07 |
| V03-TS-005 | 必须把系统测试发现的缺陷补到应检出的下层并重测后才 promotion。 | TS | P0 | 植入跨层缺陷被较低 Gate 阻断，再用同版本集成验证。 | Candidate | Testing | V03-T06 |
| V03-TS-006 | 必须使独立测试项目复用同一 Testing Core、Plan、IR、PR。 | TS | P1 | 独立测试入口与软件项目测试经过相同执行和证据机制。 | Candidate | Testing | V03-F02 |

### 4.4 View、通信与项目经理

| Requirement ID | Shall statement | 来源 | Priority | Verification | Status | Owner | Work |
|---|---|---|---|---|---|---|---|
| V03-UI-001 | 必须提供 Setup 的 readiness、Goal、初始化进度及可恢复错误。 | UI | P1 | Bootstrap 中断后恢复首个未完成 step，不重复建立项目。 | Candidate | Runtime/WebUI | V03-F03 |
| V03-UI-002 | 必须显示工程阶段、当前计划和多个IR的活动任务及决策理由。 | UI/RT | P1 | 并行、失败与待用户处理状态准确，不用固定图代替事实。 | Candidate | Runtime/WebUI | V03-F03 |
| V03-UI-003 | 必须由 Plan 提供甘特图，由 IR/PR owner 提供资源视图。 | UI/PL | P1 | 预计与实际可区分、冲突和失效来源可定位。 | Candidate | Plan/WebUI | V03-F03 |
| V03-UI-004 | 必须按当前项目列出并过滤多个 Agent 房间，并打开 exact Session 对应 Element 会话。 | UI/COMM | P0 | 两项目同名 IR/room 不混列，原生消息/引用可查看。 | Candidate | WebUI | V03-F04 |
| V03-UI-005 | 必须以有权限、有版本的 Action 提交用户决定，而不是从聊天文字自动批准。 | UI/COMM | P0 | 旧版本/重复/越权决定拒绝，少数立场、上下文和受影响 Work 可查看。 | Candidate | Runtime/WebUI | V03-F04 |
| V03-UI-006 | 必须显示真实 source error/stale 状态，并保持局部更新不重建通信会话。 | UI | P1 | 刷新/项目切换无假零、无旧项目数据闪现，RoomView 状态不被无关 tick 重置。 | Candidate | WebUI | V03-F03 |
| V03-PM-001 | 必须按周期、事件和用户输入调起同一项目经理逻辑角色，而非仅在故障时调起。 | BASE/RT | P1 | 三类触发均形成普通 Work；重复触发合并且每项目最多一个 active PM Work。 | Candidate | Runtime | V03-I01 |
| V03-PM-002 | 必须使项目经理依据计划、执行结果与环境事实决定业务处置；需要用户时进入待用户事务列表。 | BASE/PL | P1 | 最终失败可选择专家IR或转用户；无硬编码自动升级。 | Candidate | Plan/Runtime | V03-I02 |
| V03-COMM-001 | 必须按项目和用户实际授权提供讨论房间；多个IR通过各自Piko身份参与Review。 | COMM | P0 | 项目不可越权读取；无需授权投影版本或自定义消息envelope。 | Candidate | Runtime/WebUI | V03-F04 |
| V03-COMM-002 | 必须在页面集成 Element Web 原生 RoomView，使用用户自身 Matrix session，不托管登录或复制 transcript。 | COMM | P0 | exact room/原生 event/撤权/切换浏览器测试，Secret 不进入 Slinky DTO；失败无静默降级路径。 | Candidate | WebUI/Piko | V03-F04 |
| V03-COMM-003 | 必须支持争议经 Expert/PM 处理后升级用户，保留全部立场、讨论定位、方案影响和截止时间。 | COMM/PL | P1 | 三方争议无法解决时产生 Dossier，用户可看原讨论；决定只恢复授权的 Work。 | Candidate | Runtime | V03-F04 |

## 5. 接口需求

当前接口范围由 [Interface Control](../60_interfaces/external-service-interface-control.md) 与最小消费契约定义。旧 V03-EXT 中模型级幂等/Invocation恢复、容量backing、SourceInstance、Cost、自定义通信/附件与跨系统close/release要求撤回，不保留兼容解释。

| ID | 必需能力 | 验收 |
|---|---|---|
| V03-EXT-001 | Slinky通过Piko提交/查询/取消任务并取得结果 | 成功、失败、取消、未知均准确；取消受理不等于已结束 |
| V03-EXT-002 | Piko使用LLMTier标准OpenAI-compatible模型接口 | Slinky不参与模型请求恢复或Agent上下文管理 |
| V03-EXT-003 | Memory按需使用LLMTier标准Embeddings服务 | 分块、维度一致性、索引、检索由Memory内部负责 |
| V03-EXT-004 | LLMTier提供统一token Usage；Piko提供任务相关用量 | 实际/估算/未知不混淆，不要求Cost |
| V03-EXT-005 | Agent基本房间参与与消息/附件处理优先使用Matrix原生机制 | 不另建内容服务，不把项目协调桥当作已实现产品Runtime |
| V03-EXT-006 | 各系统设计环境诊断和恢复，Slinky协调业务影响 | 只读权限不能触发重启/清库/收费调用；无统一恢复协议 |

任务字段与运行接口的具体实现由下游按以上能力细化，不以旧机器包反向增加需求。

## 6. 性能与容量需求

任务期限和执行预算由Piko处理，服务并发与排队由LLMTier内部处理；Slinky不建设容量快照/共享池/配额组合/claim/Seat机制。PR环境安全隔离继续有效。

Piko自持Agent历史、压缩、工具循环和任务执行状态；LLMTier提供无Agent会话的模型服务，不管理项目、IR、STD或KV cache。SourceInstance与专门兼容协商不进入本轮需求。

只统计token用量；缺失是未知，估算须标记，零必须是真实零。Coding Plan不提供可直接对应单次调用的费用，本轮撤回Cost、币种及定价版本要求。

## 7. 安全、可靠性与合规需求

有副作用的业务操作必须检查操作者、项目、对象版本与授权，记录决定并避免重复执行同一已落实动作。
重启后恢复任务关联并向Piko查询；状态未知不因本地超时变成取消完成，不盲重派可能重复副作用的任务。
不读取 provider/Matrix credentials，Secret 仅在对应 owner 边界使用。
浏览器项目过滤与 homeserver membership 都必须满足；UI 过滤不能代替权限。

## 8. 运维、诊断与可观测性需求

| Requirement ID | Shall statement | 来源 | Priority | Verification | Status | Owner | Work |
|---|---|---|---|---|---|---|---|
| V03-OPS-001 | 必须在启动、模块准备、项目执行和异常恢复时给出 typed 状态、owner 与可执行恢复动作。 | BASE/RT/EXT | P0 | 依赖未就绪、配置错误和外部未知分别可定位，健康页不伪报整体 Ready。 | Candidate | Runtime/Integration | V03-I01 |
| V03-OPS-002 | 必须保留源版本、测试环境、输入、判定和缺陷复验链；发布前验证迁移与恢复，旧路径不作 fallback。 | BASE/TS | P0 | exact commit 的备份/恢复/切换演练、下层和上层复验、显式用户验收齐全。 | Candidate | Release | V03-R01 |

日志关联项目、计划版本、Work/Attempt、产物版本、IR和Piko任务；必要时关联房间与实际PR使用。
不要求暴露Tier Invocation、模型调用key或内部ledger。
告警须区分设计 Gate 未关闭、依赖故障和真实执行失败，不以重试次数掩盖未知状态。

## 9. 制造、部署、维护与退役需求

仅软件部署适用。正式开发不以“V0.2 必须已全通过”为前置，也不改写其报告。
升级必须停止旧 writer、备份原状态、校验 schema/归属、生成迁移报告。
缺失 Acceptance 证据的旧 summary 不能直接迁移为 Succeeded；新旧 writer 不同时接同一项目。
物理持久化与状态迁移 ADR 在 RT-G01 明确评审后才编码；当前 summary SQLite 不是执行 ledger。
发布和回滚演练见 V03-R01..R03，不在本批宣称完成。

## 10. 验收与 traceability

本版表格为当前需求；旧[需求映射](../60_interfaces/contracts/fixtures/requirements-traceability.json)及对应机器fixture只反映上一版，退出本轮验收authority，须在下游同步生成。原需求ID保留追踪，不以旧fixture恢复已撤回能力。

本批具体场景见[智能推进设计验证](../70_verification/specifications/intelligent-process-design-checks.md)；旧固定Stage测试设计保留为迁移参考。
其余 AC 行尚是验收义务，必须在各模块后续 Test Design 展开输入/步骤/Oracle。
不把“有一个 AC ID”当测试覆盖已完成。Release 必须逐条映射到执行证据/批准的适用性决定。

## 11. 未决问题与变更历史

2026-09-09 B1-A：首次原生 SRS，保留原 47 项稳定需求并补充源码差距和最新通信要求。
当前遗漏风险通过后续系统/各模块 Review 关闭，V03-D01 保持 InProgress 而非 Accepted。
阻塞表以 Runtime RT-G01..07 及开发计划 G1 为准；Plan、IR/PR、Knowledge、Testing/Web 的
全部 ISD、数值 SLA 和生产独立验证仍未完成；外部机器契约及逐字段消费的现有签署见三方冻结清单，不再统一标作等待 external owner 回包。详细实现未完成不等于已签署跨系统字段未定义；本规格 Candidate 状态也不代表运行验证通过。
