<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko module-test-scheme

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `module-test-scheme` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode, corezilla |
| Created Date | `2026-10-10` |
| Last Modified Date | `2026-10-10` |
| Template ID | `tests.module-test-scheme` |
| Template Version | `0.7.10` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/module/module-test-scheme.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

> **编写建议**：本模板**绑定单个模块**（模块对象 ID：⟨绑定后填写⟩）——模块层方案与用例集均一模块一份，多模块项目逐模块实例化到 `docs/70_verification/module/ 下 `⟨模块短名⟩-module-test-scheme.md``，对应模块用例集（tests.module-case）引用本方案。模块测试方案，与 design.definition（模块设计阶段）一一对应。方案只登记测试分类与 Case 清单（每 Case 一行责任摘要），不写 Case 细节；逐 Case 展开一 Case 一文档（tests.module-case）。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。

> 本方案绑定单一软件模块
> 本文档对设计验证项（VRC/V-xxx）的引用规则：只引用 ID 与状态，不复制定义/判据/Owner；判据与契约权威归 design 与 tests.asset-design，本文档若细化执行断言需在变更时回溯设计修订并记录。
：模块对象 ID 经 `--design-object-id` 写入 metadata；模块设计 ID/版本在 §1 固定。

### 模板定位：方案、用例与计划的边界

> **编写建议**：本方案对应模块设计阶段。分母来源是模块设计的对外接口（§9）、内部流程（§6/§7）、规则与状态转换，以及组装后才成立的保证；单元层归 tests.unit-test-scheme，子系统层归 tests.subsystem-test-scheme。

- **权威分工**：模块层测试的 Case 清单（ID、分类、优先级、责任摘要、设计状态）以本方案为唯一登记处；单 Case 展开归 `tests.module-case`（一 Case 一文档）；活动组织归 `tests.module-test-plan`。
- **只有摘要**：本方案每条 Case 只写责任摘要（要测什么），不写输入构造、Oracle 或步骤。
- **下层 PASS 不关闭本层**；本层 PASS 不关闭上层组合目标。

### 状态语义：用例状态

> **编写建议**：本方案只持有 用例状态（Designed / Gap / Tailored-N/A）；实现状态（Planned/Implemented）在对应 case-design 文档，执行状态与 Verdict 只在 Run 报告。混层即违例。

- **用例状态**：`Designed` / `Gap`（具名缺口） / `Tailored-N/A`——唯一权威：本方案 §6 登记；禁止：未设计写成已设计、N/A 无设计事实依据。

> **完成条件**：任一 Case 在本方案中只报设计状态；实现与执行状态可沿 Case ID 追到 case-design 文档与 Run 报告。

- **被测对象 / 设计基线 / 父对象**：Piko 11 个直属模块（M000-M010，`design.definition`）；基线 `system-design` v0.12.0-draft.1；父对象 `system-design`。

- **本阶段测试边界**：每个模块的公开入口 + 其模块内真实单元；边界依赖（LLMTier、Matrix、scp 对端、时钟）用替身。

- **不证明的组合保证**：不证明跨模块端到端流程（归 `tests.system-test-scheme`）；不证明函数级算法内部（归 `tests.unit-test-scheme`）。


## 2. 测试方法与测试设计技术

> **本节目的**：固定模块层"怎么测"的方法论——单元层测试设计技术比较单一（mock 为主），上游测试常**多方法共存**，需逐一描述与边界。
>
> **必须写清楚**：测试设计技术（按 Case 家族用哪些——等价类划分/边界值/状态转换/决策表/错误猜测/属性测试/变异测试等，写明对哪些 family 用哪种及不用哪种）；入场标准（设计文档到位、方案清单冻结、Case 实现就绪、替身 Verified、环境齐）；离场标准（分母每条来源有 Case 或缺口、Verdict 齐全、缺口有主、设计变更触发重跑）；自动化策略（哪些进 CI、单 Case 选择入口、断点/重跑规则、flaky 不掩盖根因）。
>
> **抽象示例**：见本节 example 围栏示例）。
>
> **完成条件**：每个 Case 家族能指出所用方法与环境类型（§6 Case 行经 Case ID 关联到本表/§3/§4）；入场/离场可判定；环境类型与 asset-design 契约对应；无未声明的环境依赖。

### 2.1 家族方法登记

> **本节目的**：为每个适用家族登记具体技术、环境引用与判定规则——§6 Case 行的方法出处。
>
> **必须写清楚**：每家族一条记录，三字段齐；判定规则含失败处置；家族不适用不在此登记（转 §7）。
>
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：每个 §6 登记行的家族能命中本节一条记录。

#### 2.1.1 Family · module-contract（基础家族）

**测试设计技术**：`公开入口黑盒 + 边界替身（状态转换 + 错误路径驱动）`

**环境类型引用**：`ENV-UNIT`

**自动化与判定规则**：`tests/unit/*.test.ts` 按模块分文件；断言模块公开行为，替身只挡边界依赖；缺断言即 INVALID


### 2.2 测试设计技术选型记录（按 Case 家族）
> **本节目的**：固定本层"怎么测"——按 Case 家族显式选用的设计技术与反模式；技术选择归本表不在灰例中重复。
>
> **必须写清楚**：每个 Case 家族显式给出选用技术、选用理由与不选用的反模式；家族不适用走 §7 Tailored-N/A，不允许空行；技术替换须连同 §6 清单复核同步，不得只在表里改词。
>
> **抽象示例**：见下方占位表的既有示例结构。
>
> **完成条件**：七家族均有技术或 §7 裁决；每行"不选用反模式"非空。

#### 2.2.1 Family · boundary

**选用技术与理由**：边界值（容量=1、零产出、上限）；覆盖模块边界语义

**不选用反模式**：不用全输入矩阵


#### 2.2.2 Family · negative

**选用技术与理由**：反例驱动（越权路径、非法状态转移、fence 拒绝）；模块拒绝路径是主要风险

**不选用反模式**：不用模糊异常注入


#### 2.2.3 Family · concurrency

**选用技术与理由**：状态机驱动 + 固定交错（cancel vs 执行）；单实例单 slot 语义可复现

**不选用反模式**：不用随机并发


#### 2.2.4 Family · recovery

**选用技术与理由**：kill + 事实重放；资源归还与不重跑

**不选用反模式**：不用重试模拟恢复


#### 2.2.5 Family · performance

**选用技术与理由**：Tailored-N/A（见 §7）；模块层无性能预算分母

**不选用反模式**：不用负载测试


#### 2.2.6 Family · security

**选用技术与理由**：鉴权/路径/凭据强制冒烟；边界安全是模块主要风险

**不选用反模式**：不用模糊安全测试


#### 2.2.7 Family · normal

**选用技术与理由**：等价类 + 状态转换；主路径与状态机

**不选用反模式**：不用全输入矩阵


### 2.3 对象类型×必测维度展开表

> **本节目的**：让 MT 编写者按接口/行为类型展开全部必测格；参数类错误矩阵在本层全灭，不上浮到 ST。
>
> **必须写清楚**：本层公开接口与行为按类型对号入座；每行维度是全矩阵义务。真实内部单元＋边界替身构造。 删行必须给 tailoring 理由并登记缺口；新增对象类型按同格式补行。
>
> **抽象示例**：表内示例列。
>
> **完成条件**：每个公开接口至少命中一行且该行全格有 Case 或缺口。

#### 2.3.1 对象类型 · E2E 业务流

**本阶段适用性**：Tailored-N/A

**裁剪依据**：模块层不承担跨模块端到端

**覆盖 Case / 缺口**：—


#### 2.3.2 对象类型 · 控件面（§6.1 网格）

**本阶段适用性**：Tailored-N/A

**裁剪依据**：Piko 无 UI 控件面（`system-design` §3.6）

**覆盖 Case / 缺口**：—


#### 2.3.3 对象类型 · 数据面（§6.2 网格）

**本阶段适用性**：适用

**裁剪依据**：M010 `transfer` 的拉取/投递/校验/幂等

**覆盖 Case / 缺口**：MT-TRANSFER-001/002


#### 2.3.4 对象类型 · 权限矩阵

**本阶段适用性**：适用

**裁剪依据**：M002 `policy` 路径与授权判定

**覆盖 Case / 缺口**：MT-POLICY-001/002


#### 2.3.5 对象类型 · 真实通道

**本阶段适用性**：Tailored-N/A

**裁剪依据**：真实通道属系统层；模块层用替身

**覆盖 Case / 缺口**：—


#### 2.3.6 对象类型 · 系统机制锚点

**本阶段适用性**：适用

**裁剪依据**：模块承担的机制保证（如 MECH-RUN/MECH-XFER）

**覆盖 Case / 缺口**：MT-WORKER-001、MT-REPO-001


#### 2.3.7 对象类型 · 性能预算

**本阶段适用性**：Tailored-N/A

**裁剪依据**：`system-design` §11.1 无系统预算

**覆盖 Case / 缺口**：—


#### 2.3.8 对象类型 · 成本护栏

**本阶段适用性**：Tailored-N/A

**裁剪依据**：contract §3 无 Cost

**覆盖 Case / 缺口**：—


#### 2.3.9 对象类型 · 恢复/灾备

**本阶段适用性**：适用

**裁剪依据**：M003/M005 恢复语义

**覆盖 Case / 缺口**：MT-REPO-004、MT-WORKER-002


## 3. 替身使用策略与边界

> **本节目的**：固定模块层替身的使用，让 §6 清单的替身选择可解释可复核。
>
> **必须写清楚**：替身决策准则（按所有权/可控性/真实性分类——内部真实/边界 fake/真协议测试实例/容器等）；替身形态（mock/fake/stub/spy 的取舍与代价）；替身保真度——契约与自检归 `tests.asset-design`（一资产一文档），方案与 Case 只引用其 ID 不复制行为；交互断言 vs 返回值断言（优先返回值，必要时断言关键调用序，但不耦合内部实现）；反模式（不 mock 你不拥有的接口、不 mock 值对象/纯数据、不为凑覆盖率而 mock、不过度断言内部细节）；与 §1 边界、§6 Case 清单、`tests.module-case` §2 替身选择一致。
>
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：替身矩阵与 asset-design 一一对应；§6 每个 Case 行经 Case ID 关联到本矩阵可查其替身类型与契约文档 ID；反模式逐项被排除并有理由。

#### 3.1 替身 · 边界依赖（LLMTier / Matrix / scp 对端 / 时钟）

**替身形态**：`fake`

**替身契约文档（tests.asset-design）**：`FAKE-LLM`、`FAKE-MATRIX`、`FAKE-SCP`

**决策理由**：`模块层验证模块公开行为，边界依赖用真协议 fake；真实通道属系统层`


## 4. 测试环境类型（方案定义）
> **必须写清楚**：每种环境类型给出用途、真实性边界（哪些依赖真实、哪些替身）、契约与版本引用（资产 ID）与并发/隔离约束；ENV 实例分配归计划 §4。

> **本节目的**：固定本层"在哪类环境上跑"——列出环境**类型**（抽象类别）及其行为/真伪与契约文档（tests.asset-design 或产品规范）；同一类型可多套实例（多 docker 用于并行），具体**实例编号与分配**由 `tests.module-test-plan` §4 编排，Case 在 §5 通过「环境类型 + ENV 实例编号」引用，不在本文档重复描述环境本身。
>
> **抽象示例**：见本节 example 围栏示例）+ 环境拓扑（ENV 类型 → ENV 实例 → 被测对象）。
>
> **完成条件**：§6 每个 Case 行经 Case ID 关联到本表可查其环境类型；类型与 asset-design 契约对应；无未声明的环境依赖。

#### 4.1 环境类型 · ENV-UNIT

**行为/真伪**：`真模块 + 真 SQLite（内存库）+ 边界 fake`,

**契约文档**：`asset-design §3.1`,

**在本层用例中的角色**：`模块层默认环境；单模块行为与拒绝路径`


## 5. 测试分类体系

> **本节目的**：固定本阶段的测试分类体系与适用裁剪。
>
> **必须写清楚**：采用 STD 统一家族词表（normal/boundary/negative/concurrency/recovery/security/performance/endurance），逐类声明本阶段适用性与裁剪依据；不适用不等于没写 Case，须在 §7 给事实。
>
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：分类体系可裁剪可追溯，每个适用分类在 §6 清单中至少有 Case 或缺口。

#### 5.1 分类 · normal / boundary / negative / concurrency / recovery / security / performance / endurance

**本阶段适用性**：适用

**裁剪依据**：normal/boundary/negative/concurrency/recovery/security 有对应 Case（见 §6）；performance/endurance 走 §7 Tailored-N/A


## 6. 覆盖分母与 Case 清单

> **本节目的**：把 design.definition 的适用来源 ID 转成 Case 清单——测试分母的唯一登记。
>
> **必须写清楚**：一个来源 ID 至少一条记录（可多 Case 分担，分别写责任摘要）；以设计文档（design §12/§14）的验证项 VRC 清单为分母逐项对账：每个 VRC 至少一个 Case——验证项是设计声明的必测点，本清单只引用其 ID 不复制定义、不做附录；Case ID 稳定且唯一（MT-⟨对象⟩-⟨NNN⟩）；责任摘要只写“要测什么、边界在哪”，不写输入与 Oracle；设计状态按状态语义；未实现与 NOT_RUN 不删；不适用转 §7。

> 来源 ID 与设计验证项（VRC）的边界：本登记处记录 ID+责任摘要；判据/Oracle/Owner/契约权威归 design 与 tests.asset-design，不在此行复写；变更设计时同步 VRC 同步本清单。
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：每个适用来源 ID 有 Case 或缺口；全部 Case 段落与模块用例集 §1 总账表零差集；每个 Case ID 可追到（或计划有）case-design 文档。

#### 6.1 Case · 模块契约（登记矩阵）

#### 6.1.1 Case · MT-BOOT-001

**来源 ID / 固定版本**：`piko-bootstrap-design.md`（`design.definition`，M00p）

**设计验证项 ID**：`VRC-BOOT-001..008`（8 条，全部由本 Case 分担）

**Case ID**：`MT-BOOT-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：MM000 的公开入口在正常、边界、拒绝路径下的可观察行为；不重复测函数级算法

**设计状态**：`Gap（G-CASE-003：case 文档未逐条撰写）`

**上级组合验证入口**：`system-test-scheme`

#### 6.1.2 Case · MT-TAPI-001

**来源 ID / 固定版本**：`piko-task-api-design.md`（`design.definition`，M00i）

**设计验证项 ID**：`VRC-TAPI-001..006`（6 条，全部由本 Case 分担）

**Case ID**：`MT-TAPI-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：MM001 的公开入口在正常、边界、拒绝路径下的可观察行为；不重复测函数级算法

**设计状态**：`Gap（G-CASE-003：case 文档未逐条撰写）`

**上级组合验证入口**：`system-test-scheme`

#### 6.1.3 Case · MT-POLICY-001

**来源 ID / 固定版本**：`piko-policy-design.md`（`design.definition`，M00y）

**设计验证项 ID**：`VRC-POLICY-001..006`（6 条，全部由本 Case 分担）

**Case ID**：`MT-POLICY-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：MM002 的公开入口在正常、边界、拒绝路径下的可观察行为；不重复测函数级算法

**设计状态**：`Gap（G-CASE-003：case 文档未逐条撰写）`

**上级组合验证入口**：`system-test-scheme`

#### 6.1.4 Case · MT-REPO-001

**来源 ID / 固定版本**：`piko-task-repository-design.md`（`design.definition`，M00y）

**设计验证项 ID**：`VRC-REPO-001..008`（8 条，全部由本 Case 分担）

**Case ID**：`MT-REPO-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：MM003 的公开入口在正常、边界、拒绝路径下的可观察行为；不重复测函数级算法

**设计状态**：`Gap（G-CASE-003：case 文档未逐条撰写）`

**上级组合验证入口**：`system-test-scheme`

#### 6.1.5 Case · MT-SCHED-001

**来源 ID / 固定版本**：`piko-scheduler-design.md`（`design.definition`，M00r）

**设计验证项 ID**：`VRC-SCHED-001..006`（6 条，全部由本 Case 分担）

**Case ID**：`MT-SCHED-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：MM004 的公开入口在正常、边界、拒绝路径下的可观察行为；不重复测函数级算法

**设计状态**：`Gap（G-CASE-003：case 文档未逐条撰写）`

**上级组合验证入口**：`system-test-scheme`

#### 6.1.6 Case · MT-WORKER-001

**来源 ID / 固定版本**：`piko-worker-design.md`（`design.definition`，M00r）

**设计验证项 ID**：`VRC-WORKER-001..006`（6 条，全部由本 Case 分担）

**Case ID**：`MT-WORKER-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：MM005 的公开入口在正常、边界、拒绝路径下的可观察行为；不重复测函数级算法

**设计状态**：`Gap（G-CASE-003：case 文档未逐条撰写）`

**上级组合验证入口**：`system-test-scheme`

#### 6.1.7 Case · MT-PI-001

**来源 ID / 固定版本**：`piko-pi-adapter-design.md`（`design.definition`，M00r）

**设计验证项 ID**：`VRC-PI-001..008`（8 条，全部由本 Case 分担）

**Case ID**：`MT-PI-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：MM006 的公开入口在正常、边界、拒绝路径下的可观察行为；不重复测函数级算法

**设计状态**：`Gap（G-CASE-003：case 文档未逐条撰写）`

**上级组合验证入口**：`system-test-scheme`

#### 6.1.8 Case · MT-USAGE-001

**来源 ID / 固定版本**：`piko-usage-design.md`（`design.definition`，M00e）

**设计验证项 ID**：`VRC-USAGE-001..006`（6 条，全部由本 Case 分担）

**Case ID**：`MT-USAGE-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：MM007 的公开入口在正常、边界、拒绝路径下的可观察行为；不重复测函数级算法

**设计状态**：`Gap（G-CASE-003：case 文档未逐条撰写）`

**上级组合验证入口**：`system-test-scheme`

#### 6.1.9 Case · MT-MATRIX-001

**来源 ID / 固定版本**：`piko-matrix-adapter-design.md`（`design.definition`，M00r）

**设计验证项 ID**：`VRC-MATRIX-001..005`（5 条，全部由本 Case 分担）

**Case ID**：`MT-MATRIX-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：MM008 的公开入口在正常、边界、拒绝路径下的可观察行为；不重复测函数级算法

**设计状态**：`Gap（G-CASE-003：case 文档未逐条撰写）`

**上级组合验证入口**：`system-test-scheme`

#### 6.1.10 Case · MT-OBS-001

**来源 ID / 固定版本**：`piko-observability-design.md`（`design.definition`，M00y）

**设计验证项 ID**：`VRC-OBS-001..006`（6 条，全部由本 Case 分担）

**Case ID**：`MT-OBS-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：MM009 的公开入口在正常、边界、拒绝路径下的可观察行为；不重复测函数级算法

**设计状态**：`Gap（G-CASE-003：case 文档未逐条撰写）`

**上级组合验证入口**：`system-test-scheme`

#### 6.1.11 Case · MT-TRANSFER-001

**来源 ID / 固定版本**：`piko-transfer-design.md`（`design.definition`，M00r）

**设计验证项 ID**：`VRC-TRANSFER-001..002`（2 条，全部由本 Case 分担）

**Case ID**：`MT-TRANSFER-001`

**分类**：`normal`

**优先级**：`P1`

**责任摘要（要测什么）**：MM010 的公开入口在正常、边界、拒绝路径下的可观察行为；不重复测函数级算法

**设计状态**：`Gap（G-CASE-003：case 文档未逐条撰写）`

**上级组合验证入口**：`system-test-scheme`


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

**裁决（Tailored-N/A 或 Gap）**：Tailored-N/A —— Piko 无 UI 控件面

**Owner / 恢复条件**：—

#### 7.1.2 裁决 · 成本护栏

**裁决（Tailored-N/A 或 Gap）**：Tailored-N/A —— contract §3 无 Cost

**Owner / 恢复条件**：—

#### 7.1.3 裁决 · 性能预算

**裁决（Tailored-N/A 或 Gap）**：Tailored-N/A —— `system-design` §11.1 无系统预算

**Owner / 恢复条件**：—

#### 7.1.4 裁决 · 长稳 endurance

**裁决（Tailored-N/A 或 Gap）**：Tailored-N/A —— 无 endurance 目标

**Owner / 恢复条件**：—

#### 7.1.5 裁决 · 逐 Case 文档

**裁决（Tailored-N/A 或 Gap）**：Gap —— `MT-*-001` 的 case 文档尚未逐条撰写

**Owner / 恢复条件**：测试工程 / 按 scheme §6 拆分

#### 7.1.6 裁决 · 升级兼容

**裁决（Tailored-N/A 或 Gap）**：Gap —— 存量 schema 升级路径未定案

**Owner / 恢复条件**：Owner M003


## 8. 文档联动与清单变更规则

> **本节目的**：固定方案—用例—计划的联动规则，防三处漂移。
>
> **必须写清楚**：新 Case 先入本清单再建 case-design 文档（文档 ID＝Case ID）；清单变更须同步计划构成表；写明方案冻结/版本规则。
>
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：清单与 case-design 文档一一对应；计划只引用不复制。

- **方案冻结与变更规则**：Case 清单随模块设计版本冻结；模块新增/删除 VRC 时先改 §6 再改 case 文档；编号不复用。


- **与 case-design / 计划的同步规则**：`设计状态=Designed` 的 Case 必须有同名 `tests.module-case` 文档（Document ID = Case ID）；`Gap` 可暂无；`tests.module-test-plan` 只引用 Case ID。


> **交付自查**：每个适用来源 ID 是否都有 Case 或具名缺口；清单里的每个 Case ID 是否都有（或计划有）对应 case-design 文档；方案里是否混入了输入构造或 Oracle 细节？

## 附录 A. 本层设计验证项 VRC 汇集（对照用）

> **本节目的**：把设计文档声明的本层验证项 VRC 汇集于此，供逐项对照 §6 清单的覆盖。
>
> **必须写清楚**：VRC 清单以设计文档（design §12/§14）为唯一权威，本附录只登记 ID 与要验证什么，不复制判据/Oracle 定义；设计变更时本附录同步；每个 VRC 必须在 §6 清单有至少一个 Case，否则登记缺口。
>
> **抽象示例**：见本节 example 围栏示例。
>
> **完成条件**：本附录 VRC 集合与设计文档一致；每个 VRC 在 §6 清单有 Case 或缺口。

#### A.1 VRC · 模块层设计验证项汇集

#### A.1.1 VRC · `VRC-BOOT-001..008`

**要验证什么（名称/责任）**：Mbootstrap 的模块契约（8 条 VRC）

**设计来源**：`piko-bootstrap-design.md`

**§6 Case 覆盖**：`MT-BOOT-001`

#### A.1.2 VRC · `VRC-TAPI-001..006`

**要验证什么（名称/责任）**：Mtask-api 的模块契约（6 条 VRC）

**设计来源**：`piko-task-api-design.md`

**§6 Case 覆盖**：`MT-TAPI-001`

#### A.1.3 VRC · `VRC-POLICY-001..006`

**要验证什么（名称/责任）**：Mpolicy 的模块契约（6 条 VRC）

**设计来源**：`piko-policy-design.md`

**§6 Case 覆盖**：`MT-POLICY-001`

#### A.1.4 VRC · `VRC-REPO-001..008`

**要验证什么（名称/责任）**：Mtask-repository 的模块契约（8 条 VRC）

**设计来源**：`piko-task-repository-design.md`

**§6 Case 覆盖**：`MT-REPO-001`

#### A.1.5 VRC · `VRC-SCHED-001..006`

**要验证什么（名称/责任）**：Mscheduler 的模块契约（6 条 VRC）

**设计来源**：`piko-scheduler-design.md`

**§6 Case 覆盖**：`MT-SCHED-001`

#### A.1.6 VRC · `VRC-WORKER-001..006`

**要验证什么（名称/责任）**：Mworker 的模块契约（6 条 VRC）

**设计来源**：`piko-worker-design.md`

**§6 Case 覆盖**：`MT-WORKER-001`

#### A.1.7 VRC · `VRC-PI-001..008`

**要验证什么（名称/责任）**：Mpi-adapter 的模块契约（8 条 VRC）

**设计来源**：`piko-pi-adapter-design.md`

**§6 Case 覆盖**：`MT-PI-001`

#### A.1.8 VRC · `VRC-USAGE-001..006`

**要验证什么（名称/责任）**：Musage 的模块契约（6 条 VRC）

**设计来源**：`piko-usage-design.md`

**§6 Case 覆盖**：`MT-USAGE-001`

#### A.1.9 VRC · `VRC-MATRIX-001..005`

**要验证什么（名称/责任）**：Mmatrix-adapter 的模块契约（5 条 VRC）

**设计来源**：`piko-matrix-adapter-design.md`

**§6 Case 覆盖**：`MT-MATRIX-001`

#### A.1.10 VRC · `VRC-OBS-001..006`

**要验证什么（名称/责任）**：Mobservability 的模块契约（6 条 VRC）

**设计来源**：`piko-observability-design.md`

**§6 Case 覆盖**：`MT-OBS-001`

#### A.1.11 VRC · `VRC-TRANSFER-001..002`

**要验证什么（名称/责任）**：Mtransfer 的模块契约（2 条 VRC）

**设计来源**：`piko-transfer-design.md`

**§6 Case 覆盖**：`MT-TRANSFER-001`

