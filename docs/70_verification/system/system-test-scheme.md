<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko system-test-scheme

> **本文件遵守 STD（工程文档标准），STD 为最高优先级；修改本文件之前必须先读 STD 入口。**
> STD 入口：[项目采用说明与标准导航](../../../README.md#std-entry)。入口的**编写索引**已列出本类文档的全部硬性义务：不必通读规范，但**每一条都必须遵守**。

| 文档字段 | 值 |
|---|---|
| Document ID | `system-test-scheme` |
| Document Version | `0.1.0-draft.2` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode, corezilla |
| Created Date | `2026-10-10` |
| Last Modified Date | `2026-11-04` |
| Template ID | `tests.system-test-scheme` |
| Template Version | `0.8.18` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/system/system-test-scheme.md` |
| Supersedes | none |
| Std Conformance Total | 14 |
| Std Conformance Passed | 12 |
| Checklist Total | 53 |
| Checklist Conformed | 42 |
<!-- STD_DOCUMENT_COVER_END -->

> **编写建议**：本模板是系统测试方案，与 design.software-system（系统设计阶段）一一对应。方案只登记测试分类与 Case 清单（每 Case 一行责任摘要），不写 Case 细节；逐 Case 展开一 Case 一文档（tests.system-case）；黑盒边界纪律、真实系统 Oracle 分层、对接前检与工具资产化方法见系统测试指南（STD `docs/ai-guides/system-testing.md`，见锁定的 `docs/std.lock.json` 所指 STD 版本），不在本模板重复。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。

> 本方案绑定软件系统：父设计 Document ID 经 `--parent-document-id` 写入 metadata；系统设计 ID/版本在 §1 固定。

### 模板定位：方案、用例与计划的边界

> **编写建议**：本方案对应系统设计阶段（design.software-system；总体设计的软件分支同用本模板）。分母来源是系统设计的端到端流程（§7）、对外接口（§8）、系统约束与预算，以及机制的端到端保证（design.system-mechanism §15 承接进入本分母——机制不单独立测试文档）。子系统层归 tests.subsystem-test-scheme；验收活动不在本家族，按项目 tailoring 承接。

- **权威分工**：系统层测试的 Case 清单（ID、分类、优先级、责任摘要、设计状态）以本方案为唯一登记处；单 Case 展开归 `tests.system-case`（一 Case 一文档）；活动组织归 `tests.system-test-plan`。
- **只有摘要**：本方案每条 Case 只写责任摘要（要测什么），不写输入构造、Oracle 或步骤。
- **下层 PASS 不关闭本层**；本层 PASS 不关闭上层组合目标。

### 状态语义：用例状态

> **编写建议**：本方案只持有 用例状态（Designed / Gap / Tailored-N/A）；实现状态（Planned/Implemented）在对应 case-design 文档，执行状态与 Verdict 只在 Run 报告。混层即违例。

> 本文档对设计验证项（VRC/V-xxx）的引用规则：只引用 ID 与状态，不复制定义/判据；判据与契约权威归 design 与 tests.asset-design，本文档若细化执行断言需在变更时回溯设计修订并记录。

- **用例状态**：`Designed` / `Gap`（具名缺口） / `Tailored-N/A`——唯一权威：本方案 §6 登记；禁止：未设计写成已设计、N/A 无设计事实依据。

> **完成条件**：任一 Case 在本方案中只报设计状态；实现与执行状态可沿 Case ID 追到 case-design 文档与 Run 报告。

## 1. 目标、范围与被测对象

> **本节目的**：固定整软件系统组装层的对象与边界。
>
> **必须写清楚**：被测系统与设计基线；真实子系统；外部依赖真实或边界替身及证明边界；黑盒边界纪律——本层全部 Case 的布景入口清单（公开接口/外部控制面）、观察点清单（外部可观察事实）、禁读内部状态自查项，逐 Case 在 `tests.system-case` §2 声明；不证明的真实环境与验收目标。
>
> **抽象示例**：虚构 EX-APP 方案覆盖启动/配置/停止流程与机制端到端。
>
> **完成条件**：读者能说清系统层测什么、验收承接什么。

- **被测对象、设计基线与父对象**：


- **本阶段测试边界（真实组成 / 边界替身）**：


- **不证明的组合保证及承接入口**：


## 2. 测试方法与测试设计技术

### 2.0 分卷结构（大分量项目适用）

> **本节目的**：Case 登记规模超约 200 时，方案按**被测面**拆为「1 入口 + N 面分卷 + 契约分卷」，防单文件爆炸与清单漂移。

**本项目不适用分卷**：本层登记 21 条 Case，远低于约 200 的分卷阈值，全部登记在本入口文档内。
若日后 Case 数越过阈值，按下述结构拆分（`volume_of_document_id` 指向入口，分卷不嵌套）：

| 分卷 | Document ID | 面 | 范围 | Case 家族与数 |
|---|---|---|---|---|
| 入口 | `system-test-scheme` | — | 清单总账、维度词表、裁决 | 全量登记与分类 |
| 面分卷 | ⟨待建⟩ | ⟨被测面⟩ | 该面的 Case 登记 | ⟨家族 × 数⟩ |
| 契约分卷 | `tests.system-test-environment` | — | ENV 类型、装配、就绪判据 | 无 Case |
| 契约分卷 | `tests.system-test-script-architecture` | — | 脚本目录、硬约束、公共库 | 无 Case |
| 契约分卷 | `tests.system-test-assets` | — | 公共过程/库索账/维度→件映射 | 无 Case |



> **本节目的**：固定系统层"怎么测"的方法论——单元层测试设计技术比较单一（mock 为主），上游测试常**多方法共存**，需逐一描述与边界。
>
> **必须写清楚**：测试设计技术（按 Case 家族用哪些——等价类划分/边界值/状态转换/决策表/错误猜测/属性测试/变异测试等，写明对哪些 family 用哪种及不用哪种）；入场标准（设计文档到位、方案清单冻结、Case 实现就绪、替身 Verified、环境齐）；离场标准（分母每条来源有 Case 或缺口、Verdict 齐全、缺口有主、设计变更触发重跑）；自动化策略（哪些进 CI、单 Case 选择入口、断点/重跑规则、flaky 不掩盖根因）。
>
> **抽象示例**：见本节 example 围栏示例）。
>
> **完成条件**：每个 §6 Case 行能指出所用方法与环境类型；入场/离场可判定；环境类型与 asset-design 契约对应；无未声明的环境依赖。

### 2.1 家族方法登记

> **本节目的**：为每个适用家族登记具体技术、环境引用与判定规则——§6 Case 行的方法出处。
>
> **必须写清楚**：每家族一条记录，三字段齐；判定规则含失败处置；家族不适用不在此登记（转 §7）。
>
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：每个 §6 登记行的家族能命中本节一条记录。

#### 2.1.1 Family · normal（基础家族）

**测试设计技术**：`等价类划分 + 状态转换（四项操作状态流）`

**环境类型引用**：`ENV-LOOPBACK`

**自动化与判定规则**：`tests/integration/http-api.test.ts`；按响应码与 `TaskView`/`AgentResult` 字段判定；缺字段即 INVALID


### 2.2 测试设计技术选型记录（按 Case 家族）
> **本节目的**：固定本层"怎么测"——按 Case 家族显式选用的设计技术与反模式；技术选择归本表不在灰例中重复。
>
> **必须写清楚**：每个 Case 家族显式给出选用技术、选用理由与不选用的反模式；家族不适用走 §7 Tailored-N/A，不允许空行；技术替换须连同 §6 清单复核同步，不得只在表里改词。
>
> **抽象示例**：见下方占位表的既有示例结构。
>
> **完成条件**：七家族均有技术或 §7 裁决；每行"不选用反模式"非空。

#### 2.2.1 Family · normal

**选用的设计技术**：等价类划分 + 边界值抽样

**选用理由**：`覆盖合法输入空间，验证主路径`

**不选用的反模式**：`不用全部输入矩阵（规模爆炸）`

#### 2.2.2 Family · boundary

**选用的设计技术**：边界值（上下限/零/1/刚好满）

**选用理由**：`边界是缺陷高发区，验证边界 + 边界附近 1 步`

**不选用的反模式**：`不用无 Oracle/无口径的随机与模糊；固定种子+统计判据下受契约约束的随机化合法`

#### 2.2.3 Family · negative

**选用的设计技术**：错误猜测 + 反例驱动

**选用理由**：`异常路径以"设计已识别的反例"为准`

**不选用的反模式**：`不用模糊异常注入（无 oracle / 无归因）`

#### 2.2.4 Family · concurrency

**选用的设计技术**：线程对偶 / 顺序交错

**选用理由**：`状态机驱动，固定种子控制时序`

**不选用的反模式**：`不用无种子/无交错复现的随机并发`

#### 2.2.5 Family · recovery

**选用的设计技术**：kill/异常路径 + RAII 恢复

**选用理由**：`资源归还与回滚基线需在失败路径覆盖`

**不选用的反模式**：`不用"重试"模拟恢复（掩盖根因）`

#### 2.2.6 Family · performance

**选用的设计技术**：单 Case 基线采样 + 多次回归比对

**选用理由**：`上游已验证语义，非性能预算基线`

**不选用的反模式**：`不用负载/容量测试（本层不负责系统预算）`

#### 2.2.7 Family · security

**选用的设计技术**：鉴权/注入/脱敏冒烟 + 资产级契约

**选用理由**：`上游/集成层已覆盖，本层仅冒烟`

**不选用的反模式**：`不用无 Oracle/无归因的模糊安全测试`

### 2.3 对象类型×必测维度展开表

> **本节目的**：让 ST 编写者按面/流类型展开全部必测格；与 §6.1 控件网格、§6.2 数据网格互补：本表管"每类面怎么测"，网格管"具体哪一格"。
>
> **必须写清楚**：系统对外可观察面按类型对号入座；参数类非法断言不应出现在本层（下沉 UT/MT，条 11 分载）。 删行必须给 tailoring 理由并登记缺口；新增对象类型按同格式补行。
>
> **抽象示例**：表内示例列。
>
> **完成条件**：每类面至少一个锚点家族且 §6.1/§6.2 网格逐格闭合。

#### 2.3.1 对象类型 · E2E 业务流

**被测对象（系统功能/入口归属）**：`system-design` §3.6.2 的 5 条用户任务（派 Run / 查状态 / 取消 / 读结果 / 读诊断），入口见 §8.1

**必测维度（展开规则）**：每主旅程×1 ＋ 每主旅程异常出口×1 ＋ 幂等重放×1 ＋ 跨旅程状态可见性×1

**判定要点**：

黑盒三清单齐（布景只走公开入口／观察点只用公开查询／未用内部状态自查）

**覆盖 Case / 缺口**：`ST-EXEC-001`（端到端闭环，已登记）；异常出口、幂等重放、跨旅程可见性格未登记 → `G-ST-DIM-1`

#### 2.3.2 对象类型 · 控件面（§6.1 网格）

**被测对象（系统功能/入口归属）**：Tailored-N/A —— Piko 无 UI 控件面（`system-design` §3.6、§8.4）

**必测维度（展开规则）**：—

**判定要点**：

无控件即无控件面；公开面只有 HTTP 四项 operation 与 operator 两项维护入口，登记在 §6.1 暴露面清单

**覆盖 Case / 缺口**：—（裁决见 §7.1.1）

#### 2.3.3 对象类型 · 数据面（§6.2 网格）

**被测对象（系统功能/入口归属）**：`system-design` §7.2 业务数据结构与 §6.5 数据面搬运；响应数据项见 §6.2.1

**必测维度（展开规则）**：round-trip 逐值对账×1 ＋ 搬运失败不改终态×1 ＋ 投递幂等×1 ＋ 白名单外拒绝×1

**判定要点**：

跨观察点逐值对账；呈现值＝权威存储（`system-design` §7.10 一致性策略）

**覆盖 Case / 缺口**：`ST-DATA-001`（round-trip，已登记）；失败不改终态、投递幂等、白名单拒绝已由 `ST-DATA-002/004/005` 承担但未按本型登记 → `G-ST-DIM-1`

#### 2.3.4 对象类型 · 权限矩阵

**被测对象（系统功能/入口归属）**：`system-design` §13.1 身份边界与 contract §2 授权；错误目录 `Unauthorized` / `ScopeDenied`

**必测维度（展开规则）**：token 类×端点类抽样×1 ＋ 401 路径×1 ＋ 403 路径×1

**判定要点**：

401/403 语义与文案可辨；内部 fence 码不得外泄为客户端码

**覆盖 Case / 缺口**：`ST-SEC-001`（鉴权收口，已登记）；401 与 403 分别成格未登记 → `G-ST-DIM-1`

#### 2.3.5 对象类型 · 真实通道

**被测对象（系统功能/入口归属）**：P0↔P1 本地 IPC 与 P1→Pi / LLMTier / Matrix / scp 外部通道（`system-design` §8.2）

**必测维度（展开规则）**：通道可达×1 ＋ 通道失败 typed 化×1 ＋ 半截数据不得形成终态×1

**判定要点**：

跨观察点对账，不经内部状态；通道失败不得反向控制业务或伪造成功

**覆盖 Case / 缺口**：`ST-LLM-001`（LLMTier 通道，已登记）；通道失败与半截数据格未登记 → `G-ST-DIM-1`

#### 2.3.6 对象类型 · 系统机制锚点

**被测对象（系统功能/入口归属）**：`system-design` §3.5 的 9 份机制文档（MECH-RUN/CONFIG/STARTUP/USAGE/MATRIX/RECOVERY/CANCEL/TRANSFER/TESTEXEC）

**必测维度（展开规则）**：每机制端到端保证×1

**判定要点**：

复现与修复分开记录；机制保证按执行位置进入本层分母，不单独立测试模板

**覆盖 Case / 缺口**：`ST-EXEC-001`（MECH-RUN 闭环，已登记）；其余 8 份机制的端到端保证未登记 → `G-ST-DIM-1`

#### 2.3.7 对象类型 · 性能预算

**被测对象（系统功能/入口归属）**：Tailored-N/A —— `system-design` §11.1 未声明系统性能预算

**必测维度（展开规则）**：—

**判定要点**：

无预算口径即无预算格；不以覆盖率为由强造阈值（裁决见 §7.1.3）

**覆盖 Case / 缺口**：—（裁决见 §7.1.3）

#### 2.3.8 对象类型 · 成本护栏（optional：外部计费系统必选）

**被测对象（系统功能/入口归属）**：Tailored-N/A —— contract §3 无 Cost，无外部计费系统

**必测维度（展开规则）**：—

**判定要点**：

无计费面即无成本格（裁决见 §7.1.2）

**覆盖 Case / 缺口**：—（裁决见 §7.1.2）

#### 2.3.9 对象类型 · 恢复/灾备

**被测对象（系统功能/入口归属）**：MECH-RECOVERY（`system-design` §6.4 停止/取消/重启与异常恢复）

**必测维度（展开规则）**：恢复扫描×1 ＋ 补写×1 ＋ 幂等重放×1

**判定要点**：

恢复完成判据分开；恢复后不得重跑 Pi，已发布 Result generation 冻结

**覆盖 Case / 缺口**：`ST-REC-001`（恢复扫描，已登记）；补写与幂等重放格未登记 → `G-ST-DIM-1`

#### 2.3.10 对象类型 · 安全样本

**被测对象（系统功能/入口归属）**：`system-design` §13.1 与 M010 transfer 白名单（`known_hosts` / `target_allowlist`）

**必测维度（展开规则）**：路径逃逸×1 ＋ 凭据脱敏×1 ＋ 审计留痕×1

**判定要点**：

零泄漏观察点（响应＋日志＋存储）；敏感值不得进 config/DB/Result/log

**覆盖 Case / 缺口**：`ST-DATA-005`（白名单与路径逃逸，已登记）；凭据脱敏与审计留痕格未登记 → `G-ST-DIM-1`

#### 2.3.11 对象类型 · 升级兼容（optional：有存量数据/配置时）

**被测对象（系统功能/入口归属）**：M003 Task Store 的 SQLite schema 与 retention 策略（`system-design` §7.11、§10.4）

**必测维度（展开规则）**：旧 schema 迁移×1 ＋ 迁移后读回一致×1

**判定要点**：

迁移有验证记录；迁移路径未定案时按缺口记，不得静默通过

**覆盖 Case / 缺口**：Gap —— 存量 schema 升级路径未定案（裁决见 §7.1.8）

#### 2.3.12 对象类型 · absence 红线

**被测对象（系统功能/入口归属）**：`system-design` §8.1 声明的四项 operation 与 contract §1 的负面要求（tombstone 永不复活）

**必测维度（展开规则）**：未声明路径 404×1 ＋ tombstone 410 且 `task_id` 永不复用×1

**判定要点**：

按需求负向逐条；已删除的路径不得复活

**覆盖 Case / 缺口**：`ST-APP-006`（tombstone，已登记）；未声明路径 404 格未登记 → `G-ST-DIM-1`

#### 2.3.13 对象类型 · 可观测性/诊断（optional：无运维/诊断面时写 N/A）

**被测对象（系统功能/入口归属）**：M009 observability；诊断面 `GET /diagnostics`（`src/server.ts`）与 `audit_events` 表

**必测维度（展开规则）**：诊断面可达且鉴权×1 ＋ 审计事件落库×1 ＋ 指标与日志三出口内容×1

**判定要点**：

诊断面须鉴权；输出不得含明文凭据；只读不改业务状态

**覆盖 Case / 缺口**：`ST-OBS-001`（诊断面可达，已登记）；审计落库与三出口内容格未登记 → `G-ST-DIM-1`

#### 2.3.14 对象类型 · 流式/SSE

**被测对象（系统功能/入口归属）**：Tailored-N/A —— Piko 对外四项 operation 均为请求-响应，不暴露 SSE；内部 LLMTier SSE 通道归 §2.3.5 真实通道

**必测维度（展开规则）**：—

**判定要点**：

Piko 对外无长连接读端点；LLMTier SSE 事件序在通道型 Case 断言

**覆盖 Case / 缺口**：—（裁决见 §7.1.9）

#### 2.3.15 对象类型 · 上游依赖失败

**被测对象（系统功能/入口归属）**：LLMTier（模型）、Matrix homeserver（讨论）、scp 对端（数据面）、Secret provider（凭据）

**必测维度（展开规则）**：依赖不可达×1 ＋ 认证失败×1 ＋ 超时/限流×1 ＋ 部分失败×1

**判定要点**：

依赖失败必须产出明确失败事实（typed 错误码），不得伪装成成功

**覆盖 Case / 缺口**：`ST-MX-001`（membership 丢失 → `DiscussionAccessLost`，已登记）；其余三类依赖失败格未登记 → `G-ST-DIM-1`

#### 2.3.16 对象类型 · 准入/队列/限流

**被测对象（系统功能/入口归属）**：M004 scheduler 的 slot 准入与队列容量；错误目录 `QueueFull` / `DependencyUnavailable`

**必测维度（展开规则）**：准入放行×1 ＋ 队列满拒绝×1 ＋ 依赖未就绪拒绝×1

**判定要点**：

拒绝须带可辨错误码与 `retry-after`，不得静默排队或丢弃

**覆盖 Case / 缺口**：`ST-PROC-001`（并发受理，已登记）；队列满与依赖未就绪两格未登记 → `G-ST-DIM-1`

#### 2.3.17 对象类型 · 并发编辑（乐观并发）

**被测对象（系统功能/入口归属）**：Tailored-N/A —— Piko 的并发由 lease epoch fencing 承担（`system-design` §5.1），无资源编辑冲突

**必测维度（展开规则）**：—

**判定要点**：

并发语义归 §2.3.6 机制锚点与 `ST-PROC-001/002`，不重复立型

**覆盖 Case / 缺口**：—（裁决见 §7.1.10）

#### 2.3.18 对象类型 · 分页/边界

**被测对象（系统功能/入口归属）**：Tailored-N/A —— Piko 的四项 HTTP operation 均无分页参数（contract §1）

**必测维度（展开规则）**：—

**判定要点**：

无分页面即无分页格；参数边界归 UT/MT 层

**覆盖 Case / 缺口**：—（裁决见 §7.1.11）

### 2.4 影响面全覆盖原则（建议）

> **本节目的**：固定"一个功能要检查它影响到的所有面"——一项功能通过 ≠ 其 API 返回正确。
>
> **必须写清楚**：系统层每个功能都会外溢到多个面；列出本项目功能的典型**影响面**，并要求功能 Case 在步骤中覆盖该功能的**全部影响面**；只覆盖单面视为断言不足。

Piko 的系统功能外溢到的**影响面**（取自 `system-design` §3.4 的进程/职责划分与 §5.1 的四项 operation）：

| 影响面 | 本项目的具体面 | 承接 Case |
|---|---|---|
| 路由候选 | HTTP 路由与错误收口（404/400/401/409/410/429/503） | `ST-APP-005`、`ST-APP-006` |
| 就绪探针 | 启动就绪顺序（`bootstrap` S1–S8）与就绪后才受理 | `ST-APP-001` |
| 对外接口 | 四项 HTTP operation 的响应体与状态码 | `ST-APP-001..004` |
| 用量 | `Usage` 聚合与冻结 | `ST-LLM-001`、`ST-LLM-002` |
| 审计 | `audit` 事件写入与脱敏 | `ST-OBS-001` |
| 日志 | 结构化日志与级别 | `ST-OBS-001` |
| 诊断 | `GET /diagnostics` 快照 | `ST-OBS-001` |
| 数据面 | 输入拉取 / 产出投递（scp） | `ST-DATA-001..005` |
| 对话面 | Matrix discussion intake / reply | `ST-MX-001` |
| 恢复 | 恢复扫描与补写 | `ST-REC-001` |

**要求**：`ST-APP-001`（提交）不是只断言「返回 202」——它必须同时覆盖「就绪探针」「用量」「审计」三个面，
否则该 Case 断言不足。各 Case 当前覆盖的影响面登记在 §6.1 的责任摘要里。

### 2.5 UI 类测试方法（按行为模式）

> **本节目的**：把 UI 行为按**模式**固定下来——每种模式规定"构造什么状态 → 做什么操作 → 断言什么 DOM → 断言什么网络调用 → 什么证据"。
>
> **必须写清楚**：至少覆盖以下模式及其"必须断言"与证据。

**本项目无 UI**：Piko 是无界面的服务进程，§2.3.2 的「控件面」对象类型与 §6.1 的暴露面清单都据此裁剪
（§7.1 已登记 `Tailored-N/A —— Piko 无 UI 控件面`）。因此本节不列 UI 行为模式。

若日后引入 UI，按下表补齐（**必须断言**与**证据**两列不得省略）：

| 模式 | 构造什么状态 | 做什么操作 | 必须断言 | 证据 |
|---|---|---|---|---|
| 数据变体渲染 | 元素数据项的各等价类/边界/变体 | 加载页面 | DOM 呈现值＝权威存储逐值相等 | DOM 快照 + 后端查询结果 |
| 控件交互 | 正常态/禁用态/边界态 | 点击/输入 | 触发的网络调用与参数正确；后端落库值正确 | 网络调用记录 + 后端读回 |
| 输入溢出 | 超长/特殊字符/空 | 输入 | 显示截断/占位/报错符合设计 | DOM 快照 |
| 错误态 | 依赖失败态 | 操作 | 错误提示与后端错误码一致 | DOM + 后端 |

## 3. 替身使用策略与边界

> **本节目的**：固定系统层替身的使用，让 §6 清单的替身选择可解释可复核。
>
> **必须写清楚**：替身决策准则（按所有权/可控性/真实性分类——内部真实/边界 fake/真协议测试实例/容器等）；替身形态（mock/fake/stub/spy 的取舍与代价）；替身保真度——契约与自检归 `tests.asset-design`（一资产一文档），方案与 Case 只引用其 ID 不复制行为；交互断言 vs 返回值断言（优先返回值，必要时断言关键调用序，但不耦合内部实现）；反模式（不 mock 你不拥有的接口、不 mock 值对象/纯数据、不为凑覆盖率而 mock、不过度断言内部细节）；与 §1 边界、§6 Case 清单、`tests.system-case` §2 替身选择一致。
>
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：每个 §6 Case 行能指出替身类型与契约文档 ID；替身矩阵与 asset-design 一一对应；反模式逐项被排除并有理由。

#### 3.1 替身 · LLMTier

**替身形态**：`fake`

**替身契约文档（tests.asset-design）**：`FAKE-LLM`

**决策理由**：`必须验证真实请求/响应形状，故用真协议 fake；不 mock 传输层`


## 4. 测试环境类型（方案定义）
> **必须写清楚**：每种环境类型给出用途、真实性边界（哪些依赖真实、哪些替身）、契约与版本引用（资产 ID）与并发/隔离约束；ENV 实例分配归计划 §4。

> **本节目的**：固定本层"在哪类环境上跑"——列出环境**类型**（抽象类别）及其行为/真伪与契约文档（tests.asset-design 或产品规范）；同一类型可多套实例（多 docker 用于并行），具体**实例编号与分配**由 `tests.system-test-plan` §4 编排，Case 在 §5 通过「环境类型 + ENV 实例编号」引用，不在本文档重复描述环境本身。

> **抽象示例**：见本节 example 围栏示例）+ 环境拓扑（ENV 类型 → ENV 实例 → 被测对象）。
>
> **完成条件**：每个 §6 Case 行能指出所用环境类型；类型与 asset-design 契约对应；无未声明的环境依赖。

#### 4.1 环境类型 · ENV-LOOPBACK

**行为/真伪**：`真 Piko 组件 + 本机 fake LLMTier + 真 SQLite`

**契约文档**：`asset-design §3.1 / §3.4`

**在本层用例中的角色**：`默认环境；协议、控制面、数据面密闭校验`


## 5. 测试分类体系

> **本节目的**：固定本阶段的测试分类体系与适用裁剪。
>
> **必须写清楚**：采用 STD 统一家族词表（normal/boundary/negative/concurrency/recovery/security/performance/endurance），逐类声明本阶段适用性与裁剪依据；不适用不等于没写 Case，须在 §7 给事实。
>
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：分类体系可裁剪可追溯，每个适用分类在 §6 清单中至少有 Case 或缺口。

#### 5.1.1 分类 · normal

**本阶段适用性**：适用

**裁剪依据**：§2.2.7 等价类划分；§6.1 的 `ST-APP-001..004`、`ST-DATA-001`、`ST-EXEC-001`、`ST-MX-001`、`ST-OPS-001` 承担主路径

#### 5.1.2 分类 · boundary

**本阶段适用性**：适用

**裁剪依据**：§2.2.1 边界值；§6.1 的 `ST-APP-005`（容量/参数边界）与 `ST-DATA-002`

#### 5.1.3 分类 · negative

**本阶段适用性**：适用

**裁剪依据**：§2.2.2 反例驱动；§6.1 的 `ST-APP-006`（非法输入）与 `ST-DATA-002`（缺失输入）

#### 5.1.4 分类 · concurrency

**本阶段适用性**：适用

**裁剪依据**：§2.2.3 顺序交错；§6.1 的 `ST-PROC-001`/`ST-PROC-002`（并发受理与 lease epoch）

#### 5.1.5 分类 · recovery

**本阶段适用性**：适用

**裁剪依据**：§2.2.4 资源归还；§6.1 的 `ST-REC-001`（恢复扫描与补写）

#### 5.1.6 分类 · security

**本阶段适用性**：适用

**裁剪依据**：§2.2.6 鉴权/注入/脱敏冒烟；§6.1 的 `ST-SEC-001`、`ST-DATA-005`

#### 5.1.7 分类 · performance

**本阶段适用性**：`Tailored-N/A`

**裁剪依据**：§2.3.7「性能预算」记为 optional，系统设计未声明微基线预算，无阈值可比对（裁决见 §7.1）

#### 5.1.8 分类 · endurance

**本阶段适用性**：`Tailored-N/A`

**裁剪依据**：长稳验证需连续运行时长与真实资源压测，超出本轮验证范围（裁决见 §7.1）

### 5.2 覆盖维度词表登记（分卷结构适用）

> **本节目的**：把本层实际覆盖维度词表登记一处，供分卷与 §6 总账按维度统计实现率。
>
> **完成条件**：词表与 §2.3 对象类型表、§6 登记三处一致；同一 Case 属多维度时按各维度分按时、只登记一次。

#### 5.2.1 维度 · 对象类型 × 维度格

**枚举来源（机器权威）**：§2.3 各对象类型的「必测维度（展开规则）」行。

**本轮分母**：下表「义务格」＝§2.3 展开规则要求的格数；「已登记格」＝§6.1 实际登记该格的 Case 数。

| 对象类型 | 义务格 | 已登记格 | 已登记的格 | 未登记的格 | §6.1 Case 数 |
|---|---|---|---|---|---|
| E2E 业务流 | 4 | 4 | 每主旅程、异常出口、幂等重放、跨旅程可见性 | — | 7 |
| 控件面（§6.1 网格） | 0 | 0 | — | — | 0（无 UI，§7.1.1 裁剪） |
| 数据面（§6.2 网格） | 4 | 3 | round-trip 逐值对账、搬运失败不改终态、投递幂等 | 白名单外拒绝 | 3 |
| 权限矩阵 | 3 | 1 | 401 路径 | 403 路径、token×端点抽样 | 1 |
| 真实通道 | 3 | 3 | 通道可达、通道失败 typed 化、半截数据不成终态 | — | 3 |
| 系统机制锚点 | 1 | 1 | 每机制端到端保证 | — | 1 |
| 性能预算 | 0 | 0 | — | — | 0（§7.1.3 裁剪） |
| 成本护栏 | 0 | 0 | — | — | 0（§7.1.2 裁剪） |
| 恢复/灾备 | 3 | 1 | 恢复扫描 | 补写、幂等重放 | 1 |
| 安全样本 | 3 | 1 | 路径逃逸 | 凭据脱敏、审计留痕 | 1 |
| 升级兼容 | 2 | 0 | — | 旧 schema 迁移、迁移后读回一致 | 0（§7.1.8 Gap） |
| absence 红线 | 2 | 1 | tombstone 410 且 `task_id` 永不复用 | 未声明路径 404 | 1 |
| 可观测性/诊断 | 3 | 1 | 诊断面可达且鉴权 | 审计事件落库、三出口内容 | 1 |
| 流式/SSE | 0 | 0 | — | — | 0（§7.1.9 裁剪） |
| 上游依赖失败 | 4 | 1 | 依赖不可达 | 认证失败、超时/限流、部分失败 | 1 |
| 准入/队列/限流 | 3 | 1 | 准入放行 | 队列满拒绝、依赖未就绪 | 1 |
| 并发编辑（乐观并发） | 0 | 0 | — | — | 0（§7.1.10 裁剪） |
| 分页/边界 | 0 | 0 | — | — | 0（§7.1.11 裁剪） |
| **合计** | **35** | **18** | — | **17** | **21** |

**维度覆盖实况**：义务 35 格，已登记 18 格（**51%**）。未登记的 17 格按 STD §6「未实现与 NOT_RUN 不删」
登记为待排期缺口，汇总为 `G-ST-DIM-1`（Owner＝测试工程，最晚 Gate＝系统层 Gate）。

**与 §6.1 的一致性**：§6.1 登记 21 条 Case，按族分布为 `APP` 6 / `DATA` 5 / `LLM` 2 / `PROC` 2 /
`SEC` 1 / `EXEC` 1 / `MX` 1 / `OBS` 1 / `OPS` 1 / `REC` 1 ＝ 21，与上表「§6.1 Case 数」列合计相等。
每条 Case 在 §2.3 中**只属一个对象类型**（面分卷唯一归属），按各维度分计时**只登记一次**。


## 6. 覆盖分母与 Case 清单

> **本节目的**：把 design.software-system 的适用来源 ID 转成 Case 清单——测试分母的唯一登记。
>
> **必须写清楚**：一个来源 ID 至少一条记录（可多 Case 分担，分别写责任摘要）；以设计文档（design §12/§14）的验证项 VRC 清单为分母逐项对账：每个 VRC 至少一个 Case——验证项是设计声明的必测点，本清单只引用其 ID 不复制定义、不做附录；Case ID 稳定且唯一（ST-⟨对象⟩-⟨NNN⟩）；责任摘要只写“要测什么、边界在哪”，不写输入与 Oracle；设计状态按状态语义；未实现与 NOT_RUN 不删；不适用转 §7。

> 来源 ID 与设计验证项（VRC）的边界：本登记处逐条记录 ID+责任摘要；判据/Oracle/Owner/契约权威归 design 与 tests.asset-design，不在此行复写；变更设计时同步 VRC 同步本清单。
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：每个适用来源 ID 有 Case 或缺口；每个 Case ID 可追到（或计划有）case-design 文档。

#### 6.1.1 Case · ST-APP-001

**来源 ID / 固定版本**：`system-design` §8.1 `POST /tasks`

**维度坐标（§2.3 行×格）**：对象类型 `E2E 业务流` 的维度格 `每主旅程×1`（该 Case 只登记本行 1 格）

**设计验证项 ID**：`VRC-ST-001`

**Case ID**：`ST-APP-001`

**分类**：`normal`

**优先级**：`P0`

**责任摘要（要测什么）**：提交受理返回 202 与 `TaskView`（`Queued`），不证明执行已开始

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-APP-001.md`

#### 6.1.2 Case · ST-APP-002

**来源 ID / 固定版本**：`system-design` §8.1 `GET /tasks/{task_id}`

**维度坐标（§2.3 行×格）**：对象类型 `E2E 业务流` 的维度格 `跨旅程状态可见性×1`（该 Case 只登记本行 1 格）

**设计验证项 ID**：`VRC-ST-002`

**Case ID**：`ST-APP-002`

**分类**：`normal`

**优先级**：`P0`

**责任摘要（要测什么）**：轮询返回权威状态与 `progress`，执行期间持续可答

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-APP-002.md`

#### 6.1.3 Case · ST-APP-003

**来源 ID / 固定版本**：`system-design` §8.1 `POST …:cancel`

**维度坐标（§2.3 行×格）**：对象类型 `E2E 业务流` 的维度格 `每主旅程异常出口×1`（该 Case 只登记本行 1 格）

**设计验证项 ID**：`VRC-ST-003`

**Case ID**：`ST-APP-003`

**分类**：`normal`

**优先级**：`P0`

**责任摘要（要测什么）**：取消受理返回 `CancelReceipt`；`StopRequested` 不等于已停

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-APP-003.md`

#### 6.1.4 Case · ST-APP-004

**来源 ID / 固定版本**：`system-design` §8.1 `GET …/result`

**维度坐标（§2.3 行×格）**：对象类型 `E2E 业务流` 的维度格 `每主旅程×1`（该 Case 只登记本行 1 格）

**设计验证项 ID**：`VRC-ST-004`

**Case ID**：`ST-APP-004`

**分类**：`normal`

**优先级**：`P0`

**责任摘要（要测什么）**：终态返回冻结 Result；非终态返回 `TaskNotTerminal`

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-APP-004.md`

#### 6.1.5 Case · ST-APP-005

**来源 ID / 固定版本**：需求 PK-15 / contract §1

**维度坐标（§2.3 行×格）**：对象类型 `E2E 业务流` 的维度格 `幂等重放×1`（该 Case 只登记本行 1 格）

**设计验证项 ID**：`VRC-ST-005`

**Case ID**：`ST-APP-005`

**分类**：`negative`

**优先级**：`P0`

**责任摘要（要测什么）**：同 `task_id` 幂等；异内容 `TaskConflict`；tombstone `Gone`

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-APP-005.md`

#### 6.1.6 Case · ST-APP-006

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `absence 红线` 的维度格 `tombstone 410 且 task_id 永不复用×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-19 / `system-design` §7.11

**设计验证项 ID**：`VRC-ST-006`

**Case ID**：`ST-APP-006`

**分类**：`negative`

**优先级**：`P1`

**责任摘要（要测什么）**：保留期后仅留 `{task_id, Gone}`，`task_id` 永不复用

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-APP-006.md`

#### 6.1.7 Case · ST-SEC-001

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `权限矩阵` 的维度格 `401 路径×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-18 / `system-design` §8.1

**设计验证项 ID**：`VRC-ST-007`

**Case ID**：`ST-SEC-001`

**分类**：`security`

**优先级**：`P0`

**责任摘要（要测什么）**：鉴权失败与内部错误收口，不外泄 fence 码

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-SEC-001.md`

#### 6.1.8 Case · ST-DATA-001

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `数据面（§6.2 网格）` 的维度格 `round-trip 逐值对账×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-21 / `system-design` §6.5

**设计验证项 ID**：`VRC-ST-008`

**Case ID**：`ST-DATA-001`

**分类**：`normal`

**优先级**：`P0`

**责任摘要（要测什么）**：输入预备 `pending→ready` 后才竞争 slot

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-DATA-001.md`

#### 6.1.9 Case · ST-DATA-002

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `数据面（§6.2 网格）` 的维度格 `搬运失败不改终态×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-21 / `CON-XFER-001`

**设计验证项 ID**：`VRC-ST-009`

**Case ID**：`ST-DATA-002`

**分类**：`negative`

**优先级**：`P0`

**责任摘要（要测什么）**：拉取失败 / `sha256` 不符 → 零调用 `Failed(InputFetchFailed)`，从不领 slot

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-DATA-002.md`

#### 6.1.10 Case · ST-DATA-003

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `数据面（§6.2 网格）` 的维度格 `投递幂等×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-21 / `CON-XFER-002`

**设计验证项 ID**：`VRC-ST-010`

**Case ID**：`ST-DATA-003`

**分类**：`data-plane`

**优先级**：`P0`

**责任摘要（要测什么）**：产出投递到 `artifact_target`，`outputs` 含 `path`/`sha256`/size

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-DATA-003.md`

#### 6.1.11 Case · ST-DATA-004

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `真实通道` 的维度格 `通道失败 typed 化×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-21 / `CON-XFER-003`

**设计验证项 ID**：`VRC-ST-011`

**Case ID**：`ST-DATA-004`

**分类**：`data-plane`

**优先级**：`P0`

**责任摘要（要测什么）**：投递失败不改终态，`artifact_delivery=failed` 可见且幂等

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-DATA-004.md`

#### 6.1.12 Case · ST-DATA-005

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `安全样本` 的维度格 `路径逃逸×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-21 / `system-design` §13.1

**设计验证项 ID**：`VRC-ST-012`

**Case ID**：`ST-DATA-005`

**分类**：`security`

**优先级**：`P0`

**责任摘要（要测什么）**：白名单外、路径逃逸、`known_hosts` 缺失均拒绝

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-DATA-005.md`

#### 6.1.13 Case · ST-PROC-001

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `准入/队列/限流` 的维度格 `准入放行×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-22 / `system-design` §5.1

**设计验证项 ID**：`VRC-ST-013`

**Case ID**：`ST-PROC-001`

**分类**：`concurrency`

**优先级**：`P0`

**责任摘要（要测什么）**：P1 阻塞 / 崩溃时 P0 仍应答轮询与取消

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-PROC-001.md`

#### 6.1.14 Case · ST-PROC-002

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `真实通道` 的维度格 `半截数据不得形成终态×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-22 / `system-design` §8.2

**设计验证项 ID**：`VRC-ST-014`

**Case ID**：`ST-PROC-002`

**分类**：`concurrency`

**优先级**：`P0`

**责任摘要（要测什么）**：取消经 P0→P1 `abort` 命令生效

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-PROC-002.md`

#### 6.1.15 Case · ST-EXEC-001

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `系统机制锚点` 的维度格 `每机制端到端保证×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-16 / MECH-RUN

**设计验证项 ID**：`VRC-ST-015`

**Case ID**：`ST-EXEC-001`

**分类**：`normal`

**优先级**：`P0`

**责任摘要（要测什么）**：端到端：提交→执行→产出→终态 Result

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-EXEC-001.md`

#### 6.1.16 Case · ST-REC-001

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `恢复/灾备` 的维度格 `恢复扫描×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-12 / MECH-RECOVERY

**设计验证项 ID**：`VRC-ST-016`

**Case ID**：`ST-REC-001`

**分类**：`recovery`

**优先级**：`P1`

**责任摘要（要测什么）**：崩溃后不重跑 Pi，Result generation 冻结

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-REC-001.md`

#### 6.1.17 Case · ST-LLM-001

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `真实通道` 的维度格 `通道可达×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-09 / MECH-USAGE

**设计验证项 ID**：`VRC-ST-017`

**Case ID**：`ST-LLM-001`

**分类**：`integration-llm`

**优先级**：`P1`

**责任摘要（要测什么）**：与 LLMTier 的请求 / 响应契约与 usage

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-LLM-001.md`

#### 6.1.18 Case · ST-LLM-002

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `E2E 业务流` 的维度格 `每主旅程×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-03 / MECH-RUN

**设计验证项 ID**：`VRC-ST-018`

**Case ID**：`ST-LLM-002`

**分类**：`integration-llm`

**优先级**：`P1`

**责任摘要（要测什么）**：真实模型端到端：工具写文件→产出收集→`Completed`

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-LLM-002.md`

#### 6.1.19 Case · ST-MX-001

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `上游依赖失败` 的维度格 `依赖不可达×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-08 / MECH-MATRIX

**设计验证项 ID**：`VRC-ST-019`

**Case ID**：`ST-MX-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：讨论事件进入 session 并可回发；membership 丢失→`DiscussionAccessLost`

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-MX-001.md`

#### 6.1.20 Case · ST-OBS-001

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `可观测性/诊断（optional：无运维/诊断面时写 N/A）` 的维度格 `诊断面可达且鉴权×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：需求 PK-11 / MECH-STARTUP

**设计验证项 ID**：`VRC-ST-020`

**Case ID**：`ST-OBS-001`

**分类**：`normal`

**优先级**：`P2`

**责任摘要（要测什么）**：结构化事件、指标与审计可被诊断端点读取

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-OBS-001.md`

#### 6.1.21 Case · ST-OPS-001

**来源 ID / 固定版本**：

**维度坐标（§2.3 行×格）**：对象类型 `E2E 业务流` 的维度格 `每主旅程×1`（该 Case 只登记本行 1 格）

**来源 ID / 固定版本**：`CAP-PURGE` / `system-design` §8.1

**设计验证项 ID**：`VRC-ST-021`

**Case ID**：`ST-OPS-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：运维 purge 清大对象、保留 tombstone、写审计

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`system-design` §12.5；集合总账 `docs/70_verification/system/cases/ST-OPS-001.md`


### 6.1 暴露面与交互面清单（有交互面的产品必填）

> **本节目的**：让控件、命令、端点参数成为一等分母——没有登记就谈不上覆盖。
>
> **必须写清楚**：从机器权威源枚举（CLI help/参数注册表、端点注册表/openapi、UI 控件注册表 selector→handler→端点→权限），逐面登记动作、权限与期望可观察结果；每面必须指向 §6 清单的 Case ID 或具名缺口（缺口按 §7 登记 Gap/Tailored-N/A 裁决），完成条件为 100% 有 Case 或缺口；禁止凭记忆挑选。
>
> **抽象示例**：usage 面板刷新按钮 → 点击触发 GET /v1/usage → 面板更新。
>
> **完成条件**：暴露面全集与 §6 Case 清单对账零差集（该对账是 system-test-plan §3 执行前检的机器闸门）。

每个暴露面一条记录：

#### 6.1.1 暴露面 · Piko HTTP 操作面（Piko 无 UI）

**动作与权限**：Slinky principal 经 `POST /tasks` 提交（`ST-APP-001`）；经 `GET /tasks/{task_id}` 轮询（`ST-APP-002`）；经 `POST /tasks/{task_id}:cancel` 取消（`ST-APP-003`）；经 `GET /tasks/{task_id}/result` 取结果（`ST-APP-004`）；operator 经 `Operator Purge` 清理（`ST-OPS-001`）

**期望可观察结果**：202 + `TaskView{Queued}`；`TaskView{state,generation,progress,artifact_delivery}`；`CancelReceipt{outcome}`；`AgentResult` 或 409 `TaskNotTerminal`；`PurgeReceipt` 且 tombstone 保留

**Case / 缺口 · 状态**：`ST-APP-001..004`、`ST-OPS-001`；登记/覆盖/已设计


### 6.2 展示数据项分母

> **本节目的**：让系统呈现的每个数据项进入分母——"每个数据项都测了"必须可核查，不能人工估算。
>
> **必须写清楚**：从设计侧数据项清单（`design.definition` §3.N，经子系统/模块逐级上卷）机器引用生成，不凭记忆补；按**数据项 × 行类别 × 呈现变体**逐格登记（行类别取自 design §3.N 类别矩阵；无类别分化的单值项按一格），每格记展示位置、来源契约字段、断言方式（自动断言/截图复核）；每格指向 §6 的 Case ID 或具名缺口（按 §7 裁决），完成条件为 100% 格-或-缺口——Case 需求量由格数直接算出，不得人工估算。
>
> **抽象示例**：模型列表"状态"列 ← Deployment.state，空态显示 unknown，刷新时点=操作成功后 ≤1s。
>
> **完成条件**：数据项全集与 §6 Case 清单对账零差集；来源字段不可解析的条目按 Critical 回流设计。

每格（数据项×行类别×呈现变体）一条记录：

#### 6.2.1 数据格 · 对外响应数据项（数据项 × 行类别 × 呈现变体）

**展示位置与来源契约字段**：HTTP 响应体 ← schema `$defs`：`TaskView.state`、`TaskView.generation`、`TaskView.progress`、`TaskView.input_staging`、`TaskView.artifact_delivery`、`TaskView.result_available`、`AgentResult.state`、`AgentResult.outputs[]`、`AgentResult.stats`、`AgentResult.usage`、`AgentResult.failure`、`AgentResult.known_actions[]`

**断言方式 · Case / 缺口**：全部自动断言（JSON 字段级）；`ST-APP-001/002/004`、`ST-DATA-001..004`、`ST-EXEC-001`、`ST-LLM-001`


### 6.3 功能→入口分母（系统功能·E2E）

> **本节目的**：任何系统功能只要对外暴露入口，其 E2E Case 必须把全部实际入口走一遍。
>
> **必须写清楚**：从设计侧功能→入口映射（`design.software-system` §3.6.2→§8.4）枚举，逐功能登记「功能 × 实际入口」，作为 §2.3.1 E2E 业务流的检查项；每格指向 Case ID 或缺口；只测一个入口、或只测内部实现即缺格。
>
> **完成条件**：`Σ(系统功能 × 该功能实际入口)` 每格有 Case 或缺口；入口映射缺失按设计缺口记 Critical。

Piko 的系统功能来自 `system-design` §3.6 的 CAP 表（6 项）与 §3.6.2 的用户任务表（5 项）。
逐功能 × 实际入口登记：

#### 6.3.1 功能入口格 · CAP-SUBMIT（派一个新 Run）

**功能 ID · 固定版本**：`system-design` §3.6 `CAP-SUBMIT` / §3.6.2「派一个新 Run」

**入口**：`POST /tasks`（§8.1，OpenAPI operationId `createTask`）

**Case / 缺口 · 状态**：`ST-APP-001`；登记/覆盖/已设计

#### 6.3.2 功能入口格 · CAP-STATUS（查一个 Run 的当前状态）

**功能 ID · 固定版本**：`system-design` §3.6 `CAP-STATUS` / §3.6.2「查一个 Run 的当前状态」

**入口**：`GET /tasks/{task_id}`（§8.1，operationId `getTask`）

**Case / 缺口 · 状态**：`ST-APP-002`；登记/覆盖/已设计

#### 6.3.3 功能入口格 · CAP-CANCEL（取消一个 Run）

**功能 ID · 固定版本**：`system-design` §3.6 `CAP-CANCEL` / §3.6.2「取消一个 Run」

**入口**：`POST /tasks/{task_id}:cancel`（§8.1，operationId `cancelTask`）

**Case / 缺口 · 状态**：`ST-APP-003`；登记/覆盖/已设计

#### 6.3.4 功能入口格 · CAP-RESULT（读取 Run 的稳定结果）

**功能 ID · 固定版本**：`system-design` §3.6 `CAP-RESULT` / §3.6.2「读取 Run 的稳定结果」

**入口**：`GET /tasks/{task_id}/result`（§8.1，operationId `getTaskResult`）

**Case / 缺口 · 状态**：`ST-APP-004`；登记/覆盖/已设计

#### 6.3.5 功能入口格 · CAP-DIAG（读取实例诊断快照）

**功能 ID · 固定版本**：`system-design` §3.6 `CAP-DIAG` / §3.6.2「读取实例诊断快照」

**入口**：`GET /diagnostics`（§8.1 Operator Diagnostics；实现见 `src/server.ts`，不在 OpenAPI 契约内）

**Case / 缺口 · 状态**：`ST-OBS-001`；登记/覆盖/已设计

#### 6.3.6 功能入口格 · CAP-PURGE（运维清理）

**功能 ID · 固定版本**：`system-design` §3.6 `CAP-PURGE`

**入口**：Operator Purge（§8.1；入口由 ops 文档定义，当前实现为 `TaskStore.purge`，见 `src/store.ts`）

**Case / 缺口 · 状态**：`ST-OPS-001`；登记/覆盖/已设计

**功能→入口闭合说明**：Piko 的每个系统功能**只有一个**对外入口（Piko 无 CLI、无 UI、无第二个 protocol 入口），
因此「全部实际入口」＝单项，6 项功能 × 1 入口 ＝ 6 格，逐格有 Case，**无功能只测一个入口而被漏掉**。
若日后 Piko 增加第二个入口（如 CLI），本表必须补行。

**与 §6.1 暴露面的关系**：§6.1 登记的是「面」（端点+参数），本表登记的是「功能 × 该功能的入口」。
`CAP-DIAG` 的 `GET /diagnostics` 与 `CAP-PURGE` 的 Operator Purge 在 §6.1 暴露面清单中只登记了
`ST-OBS-001`/`ST-OPS-001`，两处指向同一 Case，不重复计数。

### 6.4 写读一致性分母（跨子系统/系统级）

> **本节目的**：把跨子系统/系统级的 A 写→B 读做成可数分母——不跨模块的写读归 MT，子系统内跨模块归 IT。
>
> **必须写清楚**：从 design 状态写读传播登记（系统机制效果链）枚举「写入口 × 读回入口」，按范围只登记跨子系统/系统级对；每对指向 Case ID 或缺口，断言取同运行跨观察点逐值对账（§2.3.5 真实通道）。
>
> **完成条件**：`Σ(跨子系统/系统级写 × 读回入口)` 每对有 Case 或缺口；模块内或子系统内写读登记在本层即错层记问题。

Piko 无 subsystem（`system-design` §4：0 个 subsystem），系统直接含 11 个模块。按 STD 的分载规则，
**跨模块**的写读归 `IT`（本项目无 subsystem 黑盒层，跨模块白盒集成由 `tests/integration-*` 承担），
本层只登记**系统级**的写读对——即经公开 HTTP 入口写入、经另一个公开入口读回的状态。

#### 6.4.1 写读对 · `POST /tasks` → `GET /tasks/{task_id}`

**传播范围**：跨子系统/系统级（本层）

**权威 · 固定版本**：`system-design` §8.1 `createTask` / `getTask`（`TaskView` 由 `tasks`/`runs` 表派生）

**Case / 缺口 · 状态**：`ST-APP-001` / `ST-APP-002`；登记/覆盖/已设计

#### 6.4.2 写读对 · `POST /tasks` → `GET /tasks/{task_id}/result`

**传播范围**：跨子系统/系统级（本层）

**权威 · 固定版本**：`system-design` §8.1 `createTask` / `getTaskResult`；Result generation 由 M003 冻结

**Case / 缺口 · 状态**：`ST-APP-001` / `ST-APP-004`；登记/覆盖/已设计

#### 6.4.3 写读对 · `POST /tasks/{task_id}:cancel` → `GET /tasks/{task_id}`

**传播范围**：跨子系统/系统级（本层）

**权威 · 固定版本**：`system-design` §8.1 `cancelTask` / `getTask`（`cancel_requested` 与 `state` 落 `runs` 表）

**Case / 缺口 · 状态**：`ST-APP-003` / `ST-APP-002`；登记/覆盖/已设计

#### 6.4.4 写读对 · `POST /tasks` → `GET /diagnostics`

**传播范围**：跨子系统/系统级（本层）

**权威 · 固定版本**：`system-design` §8.1 `createTask` / Operator Diagnostics（队列深度与 state counts 由 `runs` 表派生）

**Case / 缺口 · 状态**：`ST-APP-001` / `ST-OBS-001`；登记/覆盖/已设计

**不在本层的写读对**：M001→M003 的 `runs`/`results` 落库一致性、M010 transfer 的产出投递→结果回收，
属**跨模块**传播，按 STD 归 `tests.integration-test-scheme`（本项目无 subsystem 层，转 IT 层）。

### 6.5 机器枚举补登记（一格一 Case）

> **本节目的**：§6.1–§6.4 之外，对**机器可枚举**的补充面逐条补登记，防止"没登记＝没有缺口"。
>
> **必须写清楚**：从机器权威源（错误目录 `ERR-*`、端点函数清单、参数注册表、CLI help、schema 字段）枚举出补充格，一格一条记录，指向 Case ID 或具名缺口。
>
> **完成条件**：枚举源与 §6 清单对账零差集；每格有 Case 或缺口。

Piko 的机器权威源是 `interfaces/error-codes/error-blocker-catalog-v0.3.json` 的
`operation_status_codes`（operation × HTTP 状态 → 错误码）与 `errors`（11 个 typed 错误码）。
逐条枚举：

#### 6.5.1 补登记 · `createTask` 的 7 个 operation×状态×错误码格

**来源（机器权威）**：错误目录 `createTask`（`interfaces/error-codes/error-blocker-catalog-v0.3.json`）

**格 / 条目**：400 `InvalidRequest`；401 `Unauthorized`；403 `ScopeDenied`；409 `TaskConflict`；409 `InvalidDiscussionContext`；410 `Gone`；429 `QueueFull`；503 `DependencyUnavailable`（共 8 个 operation×状态格）

**Case / 缺口 · 状态**：`ST-APP-005`（409 `TaskConflict`、410 `Gone`）、`ST-APP-006`（410 tombstone）、`ST-SEC-001`（401 收口）；`400 InvalidRequest` / `403 ScopeDenied` / `409 InvalidDiscussionContext` / `429 QueueFull` / `503 DependencyUnavailable` 五格未登记 → `G-ST-DIM-1`

#### 6.5.2 补登记 · `getTask` / `cancelTask` 的 4 个错误码格

**来源（机器权威）**：错误目录 `getTask`、`cancelTask`

**格 / 条目**：401 `Unauthorized`；403 `ScopeDenied`；404 `NotFound`；410 `Gone`（两 operation 同集，共 4 格）

**Case / 缺口 · 状态**：`ST-SEC-001`（401 收口）、`ST-APP-006`（410）；403 与 404 两格未登记 → `G-ST-DIM-1`

#### 6.5.3 补登记 · `getTaskResult` 的 5 个错误码格

**来源（机器权威）**：错误目录 `getTaskResult`

**格 / 条目**：401 `Unauthorized`；403 `ScopeDenied`；404 `NotFound`；409 `TaskNotTerminal`；410 `Gone`；500 `ResultUnavailable`（共 6 格）

**Case / 缺口 · 状态**：`ST-APP-004`（409 `TaskNotTerminal`）、`ST-SEC-001`（401 收口）；403 / 404 / 410 / 500 四格未登记 → `G-ST-DIM-1`

**枚举源对账**：错误目录的 11 个 typed 错误码中，`InvalidRequest`、`ScopeDenied`、`NotFound`、
`InvalidDiscussionContext`、`QueueFull`、`ResultUnavailable`、`DependencyUnavailable` 尚未有本层 Case
逐码承载；`Unauthorized`、`Gone`、`TaskConflict`、`TaskNotTerminal` 已由上列 Case 承担。
**逐码缺口**并入 `G-ST-DIM-1`，与 §5.2 的 17 个未登记维度格同批排期——不因"同一批 Case 顺带覆盖"
就当作已登记。

**错误码格的分层**：参数类非法断言（400 `InvalidRequest`）按 STD §4 分层归 `MT`/`UT`，
本层只做系统级冒烟与端到端收口；上表逐码登记是为了**不漏**，不是要求 ST 层逐码复制全矩阵。

## 7. 不适用与缺口裁决

> **本节目的**：区分“不适用”与“尚未设计”。
>
> **必须写清楚**：Tailored-N/A 必须引用设计章节事实；Gap 须有 Owner 与恢复条件；两者都不从分母静默消失。
>
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：每条裁决有事实或 Owner；无“顺手 N/A”。

#### 7.1 裁决 · 不适用与缺口（登记矩阵）

#### 7.1.1 裁决 · 控件面

**裁决（Tailored-N/A 或 Gap）**：Tailored-N/A —— Piko 为无 UI 服务（`system-design` §3.6、§8.4）；公开面仅 HTTP 四项 operation ＋ operator 两项维护入口

**Owner / 恢复条件**：—（若引入 UI 需重开 §6.1 暴露面清单并补 §6.2 呈现矩阵）

#### 7.1.2 裁决 · 成本护栏（Cost）

**裁决（Tailored-N/A 或 Gap）**：Tailored-N/A —— contract §3 明确无 Cost，无外部计费系统

**Owner / 恢复条件**：—

#### 7.1.3 裁决 · 性能预算

**裁决（Tailored-N/A 或 Gap）**：Tailored-N/A —— `system-design` §11.1 未声明系统性能预算

**Owner / 恢复条件**：—

#### 7.1.4 裁决 · 长稳 endurance

**裁决（Tailored-N/A 或 Gap）**：Tailored-N/A —— `system-design` 未声明 endurance 目标

**Owner / 恢复条件**：—

#### 7.1.5 裁决 · `ST-LLM-002` 真模型端到端

**裁决（Tailored-N/A 或 Gap）**：Gap —— 本机 LLMTier 可达但无自动化入口

**Owner / 恢复条件**：测试工程 / 补 opt-in live 入口

#### 7.1.6 裁决 · `ST-MX-001` Matrix 讨论

**裁决（Tailored-N/A 或 Gap）**：Gap —— 需本地 Synapse 与房间准备脚本

**Owner / 恢复条件**：测试工程 / 复用 `scenario-env.sh`

#### 7.1.7 裁决 · `ST-OBS-001` 观测与审计

**裁决（Tailored-N/A 或 Gap）**：Gap —— 诊断端点尚无稳定可测出口

**Owner / 恢复条件**：Owner M009

#### 7.1.8 裁决 · 升级兼容

**裁决（Tailored-N/A 或 Gap）**：Gap —— 存量 Task Store 的 schema 升级路径未定案

**Owner / 恢复条件**：Owner M003 / 设计评审

#### 7.1.9 裁决 · 流式/SSE

**裁决（Tailored-N/A 或 Gap）**：Tailored-N/A —— Piko 对外四项 operation 均为请求-响应，不暴露 SSE（`system-design` §8.1）；内部 LLMTier SSE 通道的事件序在「真实通道」型 Case 断言（`ST-LLM-001`）

**Owner / 恢复条件**：—

#### 7.1.10 裁决 · 并发编辑（乐观并发）

**裁决（Tailored-N/A 或 Gap）**：Tailored-N/A —— Piko 的并发语义由 lease epoch fencing 承担（`system-design` §5.1），无资源编辑冲突模型；并发语义归「系统机制锚点」与 `ST-PROC-001/002`，不重复立型

**Owner / 恢复条件**：—

#### 7.1.11 裁决 · 分页/边界

**裁决（Tailored-N/A 或 Gap）**：Tailored-N/A —— Piko 的四项 HTTP operation 均无分页参数（contract §1）；参数边界归 UT/MT 层

**Owner / 恢复条件**：—

#### 7.1.12 裁决 · 维度格未登记（`G-ST-DIM-1`）

**裁决（Tailored-N/A 或 Gap）**：Gap

**依据 · Owner · 恢复条件**：§2.3 各对象类型的展开规则共定义 **35 个义务维度格**，§6.1 实际只登记 **18 格**（覆盖率 51%），未登记 **17 格**（逐格列于 §5.2.1）。另 §6.5 的机器枚举补登记另有 **7 个错误码格**未逐码承载（`InvalidRequest`、`ScopeDenied`、`NotFound`、`InvalidDiscussionContext`、`QueueFull`、`ResultUnavailable`、`DependencyUnavailable`）。Owner＝测试工程；恢复条件＝按 §6「一格一 Case」逐格补登记（补 17 格即维度覆盖达 100%），错误码格按 §6.5 的分层口径补 MT/UT 侧承载并在本层登记冒烟锚，同步 §5.2 的分母

#### 7.1.13 裁决 · 逐 Case 文档

**裁决（Tailored-N/A 或 Gap）**：已关闭 —— 21 份 `tests.system-case` 文档齐备（`docs/70_verification/system/cases/`），与 §6.1 的 21 条登记行一一对应

**Owner / 恢复条件**：—

#### 7.1.14 裁决 · 环境契约条款不全（`G-ST-ENV-1`）

**裁决（Tailored-N/A 或 Gap）**：Gap

**依据 · Owner · 恢复条件**：§4.1 只登记了 `ENV-LOOPBACK` 一个环境类型并引用 asset-design 的契约 ID，但未逐环境类登记「就绪判据可机器执行（含最小真实冒烟，列表可见≠可用）」「类独立判定（A 挂不连 B 算挂）」「降级走 BLOCKED/SKIP 不静默换环境」「复位/写后恢复义务」四条条款；受控时钟环境类型亦未登记。Owner＝测试工程；恢复条件＝按 STD `review.system-test-review-checklist` §2 的环境契约条款逐条补入 §4

#### 7.1.15 裁决 · 登记状态（已实现/待实现）缺位（`G-ST-IMPL-1`）

**裁决（Tailored-N/A 或 Gap）**：Gap

**依据 · Owner · 恢复条件**：§6.1 的每条登记行只带「设计状态」，未带 STD §6 要求的二值**登记状态**（`已实现`＝脚本＋用例文档齐备／`待实现`＝分母占位）；§5.2.1 因此也没有「已实现/待实现」的实现率列。Owner＝测试工程；恢复条件＝逐行补登记状态并出实现率表，实现率数字进 Run 报告覆盖复算

#### 7.1.16 裁决 · 脚本与登记未四方对账（`G-EXEC-ST-1`）

**裁决（Tailored-N/A 或 Gap）**：Gap

**依据 · Owner · 恢复条件**：§6.1 登记 21 条 Case、用例集 21 份文档齐备，但只有 **7 条**的 Case ID 出现在 `tests/` / `src/` / `scripts/` 的脚本中（实测全量扫描）——其余 14 条的「脚本」列指向共享测试文件而非该 Case 的专属入口，即**占位 Case 被登记为 `Implemented`**。Owner＝测试工程；恢复条件＝为每条 Case 建立可定位到 Case ID 的脚本入口（或把该 Case 的登记状态改为 `待实现`），并使「登记数＝脚本数」成立

#### 7.1.17 裁决 · 评审决定未产出（`G-ST-DEC-1`）

**裁决（Tailored-N/A 或 Gap）**：Gap

**依据 · Owner · 恢复条件**：本方案尚无 `tests.system-test-review` 决定的 Review Decision 文档，Verdict、未关闭 Critical 计数与放行范围三者尚不存在，放行范围也未落到家族/Case 粒度。Owner＝测试工程；恢复条件＝按 STD `review.system-test-review-checklist` §6–§7 产出 Issue Log 与 Review Decision，放行范围落到家族/Case 粒度


## 8. 文档联动与清单变更规则

> **本节目的**：固定方案—用例—计划的联动规则，防三处漂移。
>
> **必须写清楚**：新 Case 先入本清单再建 case-design 文档（文档 ID＝Case ID）；清单变更须同步计划构成表；写明方案冻结/版本规则。
>
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：清单与 case-design 文档一一对应；计划只引用不复制。

- **方案冻结与变更规则**：Case 清单随 `system-design` 版本冻结；设计新增/删除保证时先改 §6 清单再改 case 文档；已执行 Case 编号不复用。


- **与 case-design / 计划的同步规则**：`设计状态=Designed` 的 Case 必须有同名 `tests.system-case` 文档（Document ID = Case ID）；`Gap` 可暂无文档；`tests.system-test-plan` §9 只引用 Case ID，不复制判据。


> **交付自查**：每个适用来源 ID 是否都有 Case 或具名缺口；清单里的每个 Case ID 是否都有（或计划有）对应 case-design 文档；方案里是否混入了输入构造或 Oracle 细节？

## 附录 A. 本层设计验证项 VRC 汇集（对照用）

> **本节目的**：把设计文档声明的本层验证项 VRC 汇集于此，供逐项对照 §6 清单的覆盖。
>
> **必须写清楚**：VRC 清单以设计文档（design §12/§14）为唯一权威，本附录只登记 ID 与要验证什么，不复制判据/Oracle 定义；设计变更时本附录同步；每个 VRC 必须在 §6 清单有至少一个 Case，否则登记缺口。
>
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：本附录 VRC 集合与设计文档一致；每个 VRC 在 §6 清单有 Case 或缺口。

#### A.1 VRC · 本层设计验证项汇集

#### A.1.1 VRC · `VRC-ST-001..004`

**要验证什么（名称/责任）**：四项操作对外行为

**设计来源**：`system-design` §8.1

**§6 Case 覆盖**：`ST-APP-001..004`

#### A.1.2 VRC · `VRC-ST-005/006`

**要验证什么（名称/责任）**：身份幂等与 tombstone 保留

**设计来源**：需求 PK-15/PK-19、contract §1

**§6 Case 覆盖**：`ST-APP-005/006`

#### A.1.3 VRC · `VRC-ST-007`

**要验证什么（名称/责任）**：鉴权与错误收口

**设计来源**：需求 PK-18

**§6 Case 覆盖**：`ST-SEC-001`

#### A.1.4 VRC · `VRC-ST-008..012`

**要验证什么（名称/责任）**：数据面搬运（准备/失败/投递/解耦/边界）

**设计来源**：需求 PK-21、`CON-XFER-001..003`

**§6 Case 覆盖**：`ST-DATA-001..005`

#### A.1.5 VRC · `VRC-ST-013/014`

**要验证什么（名称/责任）**：控制面与执行面隔离

**设计来源**：需求 PK-22、`system-design` §5.1/§8.2

**§6 Case 覆盖**：`ST-PROC-001/002`

#### A.1.6 VRC · `VRC-ST-015..018`

**要验证什么（名称/责任）**：执行闭环、恢复、模型契约、真实模型

**设计来源**：需求 PK-16/PK-12/PK-09/PK-03

**§6 Case 覆盖**：`ST-EXEC-001`、`ST-REC-001`、`ST-LLM-001/002`

#### A.1.7 VRC · `VRC-ST-019..021`

**要验证什么（名称/责任）**：讨论链路、观测、运维清理

**设计来源**：需求 PK-08/PK-11、`CAP-PURGE`

**§6 Case 覆盖**：`ST-MX-001`、`ST-OBS-001`、`ST-OPS-001`

