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


## 1. 目标、范围与被测对象

> **本节目的**：固定模块层测试的对象与边界。
>
> **必须写清楚**：被测模块、ISD 基线、被测接口集合；真实代码与替身边界；不证明的组装保证及承接入口。
>
> **完成条件**：读者能说清模块层测什么、不测什么。

本方案覆盖 Piko 全部 11 个模块 ＋ 共享 IPC 设施的**模块公开面**。模块层以灰盒方式验证「模块公开接口 ＋ 模块内真实单元 ＋ 边界替身」的组装行为；函数级算法内部由单元层承接，跨模块端到端由系统层承接。

### 1.1 绑定与对象登记

> **必须写清楚**：模块对象 ID 与 ISD 基线逐字段登记；接口集合与模块设计 §9 公开面对账；边界与不证明项各给承接入口。
>
> **完成条件**：四字段齐，接口集合与模块设计差集为零。

#### 1.1.1 登记 · 绑定与对象

**模块对象 ID 与 ISD 基线（ID/版本/commit）**：

- `BOOT`：M000 `bootstrap`；ISD `piko-bootstrap-impl.isd.md` v0.1.0-draft.1
- `IPC`：M000/M005 共享 IPC；ISD `piko-bootstrap-impl.isd.md` v0.1.0-draft.1
- `MATRIX`：M008 `matrix-runtime`；ISD `piko-matrix-adapter-impl.isd.md` v0.1.0-draft.1
- `OBS`：M009 `observability`；ISD `piko-observability-impl.isd.md` v0.1.0-draft.1
- `PI`：M006 `pi-adapter`；ISD `piko-pi-adapter-impl.isd.md` v0.1.0-draft.1
- `POLICY`：M002 `policy`；ISD `piko-policy-impl.isd.md` v0.1.0-draft.1
- `REPO`：M003 `task-repository`；ISD `piko-task-repository-impl.isd.md` v0.1.0-draft.1
- `SCHED`：M004 `scheduler`；ISD `piko-scheduler-impl.isd.md` v0.1.0-draft.1
- `TAPI`：M001 `task-api`；ISD `piko-task-api-impl.isd.md` v0.1.0-draft.1
- `TRANSFER`：M010 `transfer`；ISD `piko-transfer-impl.isd.md` v0.1.0-draft.1
- `USAGE`：M007 `usage`；ISD `piko-usage-impl.isd.md` v0.1.0-draft.1
- `WORKER`：M005 `worker`；ISD `piko-worker-impl.isd.md` v0.1.0-draft.1
- 共享：`src/ipc.ts` · `src/exec-process.ts` · `src/supervisor.ts`（P0/P1 通道与进程监督）

**被测接口集合（与模块设计 §9 公开面对账）**：逐模块列出模块层要打的公开面。

**模块 / 被测公开接口**：
- `BOOT`：装配/启动入口（runControlProcess、loadConfig、Secret 解析、Pi 校验）
- `IPC`：LocalChannel/ProcessChannel/FactHandler ＋ ExecutionProcessSupervisor
- `MATRIX`：MatrixRuntime（start、sync、processBatch、sendDiscussionReply、downloadMedia、auditMembership）
- `OBS`：Observability（emit、metric、audit、snapshot、redact）＋ /diagnostics
- `PI`：Pi 接入（execute、inspect、openOrCreateRunSession、requestAbort、usage 归一）
- `POLICY`：工作区解析与路径授权（resolveWorkspace、authorizePath、collectOutputs、sameTask）
- `REPO`：TaskStore 公开面（createOrGet、cancel、slot 三件套、结果两步提交、purge、matrix 账本）
- `SCHED`：slot 获取/续租/释放/恢复（Scheduler.acquire/renew/release/recover）
- `TAPI`：四个 HTTP 操作（POST /tasks、:cancel、GET /tasks/{id}、/result）＋ GET /diagnostics
- `TRANSFER`：Transfer（fetchInputs、deliverArtifacts、scpArgs、scpKeyPath、safeJoin、clearStaging）
- `USAGE`：usage 校验与聚合（validateUsage、emptyUsage、aggregateUsage）
- `WORKER`：执行编排（claimNext、stageInputs、execute、finish）与恢复（tool-recovery）

合计覆盖 **136 个实现层符号**（与单元层 §1.1 同一份清单，模块层按公开面取用）。

**本阶段边界（真实组成／替身范围）**：模块实现全部为 `src/` 真实代码；替身仅限四处——受控时钟 `FAKE-CLK`、LLMTier 与 Matrix homeserver 边界、scp 远端、MCP 工具边界。替身清单与自检入口见 `docs/70_verification/assets/asset-design.md`。

**不证明的组合保证及承接入口**：

- 函数级算法内部的分支完备性 → 承接 `unit-test-scheme` 的同函数 Case
- 跨模块端到端业务流、真实协议互操作 → 承接 `system-test-scheme`
- 真实模型 / 真实 homeserver / 真实 scp 对端的结果 → 承接系统层实机 Case

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

#### 2.3.1 对象类型 · 写型端点/命令

**被测对象（模块/函数归属）**：`POST /tasks`、`POST /tasks/{id}:cancel`、M010 投递与 M008 回发

**必测维度（展开规则）**：每个写端点：合法请求×1 ＋ 未知字段/非法值×1 ＋ 重复提交幂等×1 ＋ 目标缺失×1

**判定要点**：写入要么全成功要么全回滚；重复写不产生第二份业务事实

**覆盖 Case / 缺口**：`MT-TAPI-00x`、`MT-TRANSFER-00x`、`MT-MATRIX-00x`

#### 2.3.2 对象类型 · 读型端点

**被测对象（模块/函数归属）**：`GET /tasks/{id}`、`GET /tasks/{id}/result`、`GET /diagnostics`

**必测维度（展开规则）**：存在×1 ＋ 不存在×1 ＋ 终态/非终态各×1 ＋ 鉴权缺失×1

**判定要点**：读取不得改变任何业务状态；非终态 Result 不得提前披露

**覆盖 Case / 缺口**：`MT-TAPI-00x`、`MT-OBS-00x`

#### 2.3.3 对象类型 · 流式/SSE

**被测对象（模块/函数归属）**：Tailored-N/A

**必测维度（展开规则）**：—

**判定要点**：Piko 的对外接口均为请求-响应，无 SSE/长连接读端点（`system-design` §3.6）

**覆盖 Case / 缺口**：—

#### 2.3.4 对象类型 · 外部依赖失败（边界替身）

**被测对象（模块/函数归属）**：LLMTier、Matrix homeserver、scp 远端、MCP 工具

**必测维度（展开规则）**：每依赖：不可达×1 ＋ 认证失败×1 ＋ 限流/超时×1 ＋ 部分失败×1

**判定要点**：外部失败必须 typed 化并只降级自身，绝不反向控制业务或伪造成功

**覆盖 Case / 缺口**：`MT-PI-00x`、`MT-MATRIX-00x`、`MT-TRANSFER-00x`、`MT-WORKER-00x`

#### 2.3.5 对象类型 · 准入/队列

**被测对象（模块/函数归属）**：M004 `scheduler` slot 准入与队列容量

**必测维度（展开规则）**：容量 N−1×1 ＋ N×1 ＋ N+1×1 ＋ 并发领取唯一性×1 ＋ 退避×1

**判定要点**：同一时刻至多一个任务持 slot；超容量显式拒绝而非排队丢失

**覆盖 Case / 缺口**：`MT-SCHED-00x`、`MT-TAPI-00x`

#### 2.3.6 对象类型 · 配置热变更

**被测对象（模块/函数归属）**：`transfer.port`、`observability.metrics_enabled`、`matrix.enabled`

**必测维度（展开规则）**：变更生效×1 ＋ 变更后旧状态不被破坏×1 ＋ 非法值×1

**判定要点**：热变更不得使已进入运行的任务状态回退或撕裂

**覆盖 Case / 缺口**：`MT-BOOT-00x`、`MT-TRANSFER-00x`、`MT-OBS-00x`

#### 2.3.7 对象类型 · 组装并发

**被测对象（模块/函数归属）**：P0/P1 组装、`claim`/`stagingClaim` 通道

**必测维度（展开规则）**：并发领取×1 ＋ 租约续期 CAS×1 ＋ epoch 推进后旧 epoch 写入被拒×1

**判定要点**：并发下唯一写者不被打破；陈旧租约的写入必须被 fence 拒绝

**覆盖 Case / 缺口**：`MT-SCHED-00x`、`MT-REPO-00x`

#### 2.3.8 对象类型 · 资源清理

**被测对象（模块/函数归属）**：staging 目录、临时密钥文件、P1 子进程、Matrix 媒体

**必测维度（展开规则）**：正常释放×1 ＋ 异常中途释放×1 ＋ 重复清理幂等×1

**判定要点**：清理失败不得静默吞错；临时私钥必须落在 0600 文件且不进入 ~/.ssh

**覆盖 Case / 缺口**：`MT-TRANSFER-00x`、`MT-BOOT-00x`、`MT-MATRIX-00x`

#### 2.3.9 对象类型 · 热路径基线（optional：设计有预算口径时）

**被测对象（模块/函数归属）**：Tailored-N/A（无预算口径）

**必测维度（展开规则）**：—

**判定要点**：设计未声明热路径预算，按 STD §7 裁决不适用，不以覆盖率为由强造

**覆盖 Case / 缺口**：—

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

#### 6.1 Case · MT-BOOT-001

**责任摘要（要测什么／边界在哪）**：模块 `BOOT` 公开接口在 `配置热变更` 类型下的行为（配置校验与初态建立）；维度格 `变更生效`、`变更不破坏既有状态`、`非法值显式拒绝`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-bootstrap-design.md` · 该模块 VRC

**分类 · 优先级**：`配置热变更` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-BOOT-001.md`

#### 6.1 Case · MT-BOOT-002

**责任摘要（要测什么／边界在哪）**：模块 `BOOT` 公开接口在 `外部依赖失败（边界替身）` 类型下的行为（tool ref 未注册、Secret 解析失败、store 不可写、Pi 不匹配）；维度格 `不可达`、`认证失败`、`限流/超时`、`部分失败`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-bootstrap-design.md` · 该模块 VRC

**分类 · 优先级**：`外部依赖失败（边界替身）` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-BOOT-002.md`

#### 6.1 Case · MT-BOOT-003

**责任摘要（要测什么／边界在哪）**：模块 `BOOT` 公开接口在 `资源清理` 类型下的行为（启动失败时的资源回滚）；维度格 `正常释放`、`异常中途释放`、`重复清理幂等`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-bootstrap-design.md` · 该模块 VRC

**分类 · 优先级**：`资源清理` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-BOOT-003.md`

#### 6.1 Case · MT-IPC-001

**责任摘要（要测什么／边界在哪）**：模块 `IPC` 公开接口在 `组装并发` 类型下的行为（LocalChannel/ProcessChannel 的 fact/command 往返）；维度格 `并发对偶`、`租约续期 CAS`、`陈旧 epoch 被 fence`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-bootstrap-design.md` · 该模块 VRC

**分类 · 优先级**：`组装并发` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-IPC-001.md`

#### 6.1 Case · MT-IPC-002

**责任摘要（要测什么／边界在哪）**：模块 `IPC` 公开接口在 `外部依赖失败（边界替身）` 类型下的行为（传输失败不得当作已提交）；维度格 `不可达`、`认证失败`、`限流/超时`、`部分失败`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-bootstrap-design.md` · 该模块 VRC

**分类 · 优先级**：`外部依赖失败（边界替身）` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-IPC-002.md`

#### 6.1 Case · MT-IPC-003

**责任摘要（要测什么／边界在哪）**：模块 `IPC` 公开接口在 `资源清理` 类型下的行为（P1 子进程与 watchdog 释放）；维度格 `正常释放`、`异常中途释放`、`重复清理幂等`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-bootstrap-design.md` · 该模块 VRC

**分类 · 优先级**：`资源清理` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-IPC-003.md`

#### 6.1 Case · MT-IPC-004

**责任摘要（要测什么／边界在哪）**：模块 `IPC` 公开接口在 `配置热变更` 类型下的行为（P0 通道装配与重挂）；维度格 `变更生效`、`变更不破坏既有状态`、`非法值显式拒绝`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-bootstrap-design.md` · 该模块 VRC

**分类 · 优先级**：`配置热变更` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-IPC-004.md`

#### 6.1 Case · MT-MATRIX-001

**责任摘要（要测什么／边界在哪）**：模块 `MATRIX` 公开接口在 `写型端点/命令` 类型下的行为（sendDiscussionReply 幂等发送）；维度格 `合法请求`、`非法值/未知字段`、`重复提交幂等`、`目标缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-matrix-adapter-design.md` · 该模块 VRC

**分类 · 优先级**：`写型端点/命令` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-MATRIX-001.md`

#### 6.1 Case · MT-MATRIX-002

**责任摘要（要测什么／边界在哪）**：模块 `MATRIX` 公开接口在 `读型端点` 类型下的行为（房间事件摄入与回读）；维度格 `存在`、`不存在`、`终态/非终态`、`鉴权缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-matrix-adapter-design.md` · 该模块 VRC

**分类 · 优先级**：`读型端点` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-MATRIX-002.md`

#### 6.1 Case · MT-MATRIX-003

**责任摘要（要测什么／边界在哪）**：模块 `MATRIX` 公开接口在 `外部依赖失败（边界替身）` 类型下的行为（成员丢失、媒体超限/MIME、同步错误隔离）；维度格 `不可达`、`认证失败`、`限流/超时`、`部分失败`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-matrix-adapter-design.md` · 该模块 VRC

**分类 · 优先级**：`外部依赖失败（边界替身）` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-MATRIX-003.md`

#### 6.1 Case · MT-MATRIX-004

**责任摘要（要测什么／边界在哪）**：模块 `MATRIX` 公开接口在 `组装并发` 类型下的行为（auditMembership 周期巡检）；维度格 `并发对偶`、`租约续期 CAS`、`陈旧 epoch 被 fence`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-matrix-adapter-design.md` · 该模块 VRC

**分类 · 优先级**：`组装并发` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-MATRIX-004.md`

#### 6.1 Case · MT-MATRIX-005

**责任摘要（要测什么／边界在哪）**：模块 `MATRIX` 公开接口在 `资源清理` 类型下的行为（临时附件清理）；维度格 `正常释放`、`异常中途释放`、`重复清理幂等`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-matrix-adapter-design.md` · 该模块 VRC

**分类 · 优先级**：`资源清理` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-MATRIX-005.md`

#### 6.1 Case · MT-OBS-001

**责任摘要（要测什么／边界在哪）**：模块 `OBS` 公开接口在 `写型端点/命令` 类型下的行为（emit/metric/audit 写入）；维度格 `合法请求`、`非法值/未知字段`、`重复提交幂等`、`目标缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-observability-design.md` · 该模块 VRC

**分类 · 优先级**：`写型端点/命令` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-OBS-001.md`

#### 6.1 Case · MT-OBS-002

**责任摘要（要测什么／边界在哪）**：模块 `OBS` 公开接口在 `读型端点` 类型下的行为（snapshot 与 /diagnostics）；维度格 `存在`、`不存在`、`终态/非终态`、`鉴权缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-observability-design.md` · 该模块 VRC

**分类 · 优先级**：`读型端点` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-OBS-002.md`

#### 6.1 Case · MT-OBS-003

**责任摘要（要测什么／边界在哪）**：模块 `OBS` 公开接口在 `外部依赖失败（边界替身）` 类型下的行为（sink 抛错 fail-open）；维度格 `不可达`、`认证失败`、`限流/超时`、`部分失败`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-observability-design.md` · 该模块 VRC

**分类 · 优先级**：`外部依赖失败（边界替身）` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-OBS-003.md`

#### 6.1 Case · MT-OBS-004

**责任摘要（要测什么／边界在哪）**：模块 `OBS` 公开接口在 `配置热变更` 类型下的行为（metrics_enabled 降级）；维度格 `变更生效`、`变更不破坏既有状态`、`非法值显式拒绝`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-observability-design.md` · 该模块 VRC

**分类 · 优先级**：`配置热变更` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-OBS-004.md`

#### 6.1 Case · MT-OBS-005

**责任摘要（要测什么／边界在哪）**：模块 `OBS` 公开接口在 `资源清理` 类型下的行为（快照有界）；维度格 `正常释放`、`异常中途释放`、`重复清理幂等`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-observability-design.md` · 该模块 VRC

**分类 · 优先级**：`资源清理` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-OBS-005.md`

#### 6.1 Case · MT-PI-001

**责任摘要（要测什么／边界在哪）**：模块 `PI` 公开接口在 `写型端点/命令` 类型下的行为（execute/accept/drive 的结局与身份）；维度格 `合法请求`、`非法值/未知字段`、`重复提交幂等`、`目标缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-pi-adapter-design.md` · 该模块 VRC

**分类 · 优先级**：`写型端点/命令` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-PI-001.md`

#### 6.1 Case · MT-PI-002

**责任摘要（要测什么／边界在哪）**：模块 `PI` 公开接口在 `外部依赖失败（边界替身）` 类型下的行为（provider 预检失败、inspect 三态、响应重放）；维度格 `不可达`、`认证失败`、`限流/超时`、`部分失败`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-pi-adapter-design.md` · 该模块 VRC

**分类 · 优先级**：`外部依赖失败（边界替身）` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-PI-002.md`

#### 6.1 Case · MT-PI-003

**责任摘要（要测什么／边界在哪）**：模块 `PI` 公开接口在 `资源清理` 类型下的行为（session 释放）；维度格 `正常释放`、`异常中途释放`、`重复清理幂等`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-pi-adapter-design.md` · 该模块 VRC

**分类 · 优先级**：`资源清理` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-PI-003.md`

#### 6.1 Case · MT-POLICY-001

**责任摘要（要测什么／边界在哪）**：模块 `POLICY` 公开接口在 `写型端点/命令` 类型下的行为（authorizePath 写入判定）；维度格 `合法请求`、`非法值/未知字段`、`重复提交幂等`、`目标缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-policy-design.md` · 该模块 VRC

**分类 · 优先级**：`写型端点/命令` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-POLICY-001.md`

#### 6.1 Case · MT-POLICY-002

**责任摘要（要测什么／边界在哪）**：模块 `POLICY` 公开接口在 `读型端点` 类型下的行为（resolveWorkspace、collectOutputs）；维度格 `存在`、`不存在`、`终态/非终态`、`鉴权缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-policy-design.md` · 该模块 VRC

**分类 · 优先级**：`读型端点` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-POLICY-002.md`

#### 6.1 Case · MT-POLICY-003

**责任摘要（要测什么／边界在哪）**：模块 `POLICY` 公开接口在 `外部依赖失败（边界替身）` 类型下的行为（未注册 ref、越权路径、路径穿越）；维度格 `不可达`、`认证失败`、`限流/超时`、`部分失败`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-policy-design.md` · 该模块 VRC

**分类 · 优先级**：`外部依赖失败（边界替身）` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-POLICY-003.md`

#### 6.1 Case · MT-REPO-001

**责任摘要（要测什么／边界在哪）**：模块 `REPO` 公开接口在 `写型端点/命令` 类型下的行为（createOrGet、cancel、finish/finishQueued、purge）；维度格 `合法请求`、`非法值/未知字段`、`重复提交幂等`、`目标缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-task-repository-design.md` · 该模块 VRC

**分类 · 优先级**：`写型端点/命令` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-REPO-001.md`

#### 6.1 Case · MT-REPO-002

**责任摘要（要测什么／边界在哪）**：模块 `REPO` 公开接口在 `读型端点` 类型下的行为（getRun、getTask、result）；维度格 `存在`、`不存在`、`终态/非终态`、`鉴权缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-task-repository-design.md` · 该模块 VRC

**分类 · 优先级**：`读型端点` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-REPO-002.md`

#### 6.1 Case · MT-REPO-003

**责任摘要（要测什么／边界在哪）**：模块 `REPO` 公开接口在 `组装并发` 类型下的行为（tryClaimSlot / renewSlot / releaseSlot 的 CAS 与 fence）；维度格 `并发对偶`、`租约续期 CAS`、`陈旧 epoch 被 fence`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-task-repository-design.md` · 该模块 VRC

**分类 · 优先级**：`组装并发` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-REPO-003.md`

#### 6.1 Case · MT-REPO-004

**责任摘要（要测什么／边界在哪）**：模块 `REPO` 公开接口在 `准入/队列` 类型下的行为（slot 单占与容量）；维度格 `容量 N−1`、`容量 N`、`容量 N+1`、`并发领取唯一性`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-task-repository-design.md` · 该模块 VRC

**分类 · 优先级**：`准入/队列` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-REPO-004.md`

#### 6.1 Case · MT-REPO-005

**责任摘要（要测什么／边界在哪）**：模块 `REPO` 公开接口在 `资源清理` 类型下的行为（purge 后大对象清除与 tombstone 保留）；维度格 `正常释放`、`异常中途释放`、`重复清理幂等`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-task-repository-design.md` · 该模块 VRC

**分类 · 优先级**：`资源清理` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-REPO-005.md`

#### 6.1 Case · MT-REPO-006

**责任摘要（要测什么／边界在哪）**：模块 `REPO` 公开接口在 `外部依赖失败（边界替身）` 类型下的行为（SQLite 写失败/迁移失败）；维度格 `不可达`、`认证失败`、`限流/超时`、`部分失败`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-task-repository-design.md` · 该模块 VRC

**分类 · 优先级**：`外部依赖失败（边界替身）` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-REPO-006.md`

#### 6.1 Case · MT-SCHED-001

**责任摘要（要测什么／边界在哪）**：模块 `SCHED` 公开接口在 `组装并发` 类型下的行为（Scheduler.acquire/renew/release/recover）；维度格 `并发对偶`、`租约续期 CAS`、`陈旧 epoch 被 fence`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-scheduler-design.md` · 该模块 VRC

**分类 · 优先级**：`组装并发` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-SCHED-001.md`

#### 6.1 Case · MT-SCHED-002

**责任摘要（要测什么／边界在哪）**：模块 `SCHED` 公开接口在 `准入/队列` 类型下的行为（slot 获取与恢复门）；维度格 `容量 N−1`、`容量 N`、`容量 N+1`、`并发领取唯一性`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-scheduler-design.md` · 该模块 VRC

**分类 · 优先级**：`准入/队列` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-SCHED-002.md`

#### 6.1 Case · MT-SCHED-003

**责任摘要（要测什么／边界在哪）**：模块 `SCHED` 公开接口在 `外部依赖失败（边界替身）` 类型下的行为（recover 对已终态/缺失 Run 的处理）；维度格 `不可达`、`认证失败`、`限流/超时`、`部分失败`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-scheduler-design.md` · 该模块 VRC

**分类 · 优先级**：`外部依赖失败（边界替身）` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-SCHED-003.md`

#### 6.1 Case · MT-TAPI-001

**责任摘要（要测什么／边界在哪）**：模块 `TAPI` 公开接口在 `写型端点/命令` 类型下的行为（POST /tasks、POST /tasks/{id}:cancel）；维度格 `合法请求`、`非法值/未知字段`、`重复提交幂等`、`目标缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-task-api-design.md` · 该模块 VRC

**分类 · 优先级**：`写型端点/命令` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-TAPI-001.md`

#### 6.1 Case · MT-TAPI-002

**责任摘要（要测什么／边界在哪）**：模块 `TAPI` 公开接口在 `读型端点` 类型下的行为（GET /tasks/{id}、GET /tasks/{id}/result、GET /diagnostics）；维度格 `存在`、`不存在`、`终态/非终态`、`鉴权缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-task-api-design.md` · 该模块 VRC

**分类 · 优先级**：`读型端点` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-TAPI-002.md`

#### 6.1 Case · MT-TAPI-003

**责任摘要（要测什么／边界在哪）**：模块 `TAPI` 公开接口在 `准入/队列` 类型下的行为（受理容量与队列满）；维度格 `容量 N−1`、`容量 N`、`容量 N+1`、`并发领取唯一性`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-task-api-design.md` · 该模块 VRC

**分类 · 优先级**：`准入/队列` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-TAPI-003.md`

#### 6.1 Case · MT-TAPI-004

**责任摘要（要测什么／边界在哪）**：模块 `TAPI` 公开接口在 `外部依赖失败（边界替身）` 类型下的行为（鉴权/schema 校验/内部 fence 收口）；维度格 `不可达`、`认证失败`、`限流/超时`、`部分失败`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-task-api-design.md` · 该模块 VRC

**分类 · 优先级**：`外部依赖失败（边界替身）` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-TAPI-004.md`

#### 6.1 Case · MT-TRANSFER-001

**责任摘要（要测什么／边界在哪）**：模块 `TRANSFER` 公开接口在 `写型端点/命令` 类型下的行为（fetchInputs、deliverArtifacts）；维度格 `合法请求`、`非法值/未知字段`、`重复提交幂等`、`目标缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-transfer-design.md` · 该模块 VRC

**分类 · 优先级**：`写型端点/命令` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-TRANSFER-001.md`

#### 6.1 Case · MT-TRANSFER-002

**责任摘要（要测什么／边界在哪）**：模块 `TRANSFER` 公开接口在 `外部依赖失败（边界替身）` 类型下的行为（源不可达、sha256 不符、目标拒绝、部分失败）；维度格 `不可达`、`认证失败`、`限流/超时`、`部分失败`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-transfer-design.md` · 该模块 VRC

**分类 · 优先级**：`外部依赖失败（边界替身）` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-TRANSFER-002.md`

#### 6.1 Case · MT-TRANSFER-003

**责任摘要（要测什么／边界在哪）**：模块 `TRANSFER` 公开接口在 `配置热变更` 类型下的行为（transfer.port 生效）；维度格 `变更生效`、`变更不破坏既有状态`、`非法值显式拒绝`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-transfer-design.md` · 该模块 VRC

**分类 · 优先级**：`配置热变更` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-TRANSFER-003.md`

#### 6.1 Case · MT-TRANSFER-004

**责任摘要（要测什么／边界在哪）**：模块 `TRANSFER` 公开接口在 `资源清理` 类型下的行为（临时私钥与 staging 清理）；维度格 `正常释放`、`异常中途释放`、`重复清理幂等`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-transfer-design.md` · 该模块 VRC

**分类 · 优先级**：`资源清理` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-TRANSFER-004.md`

#### 6.1 Case · MT-TRANSFER-005

**责任摘要（要测什么／边界在哪）**：模块 `TRANSFER` 公开接口在 `准入/队列` 类型下的行为（max_input_bytes 上限）；维度格 `容量 N−1`、`容量 N`、`容量 N+1`、`并发领取唯一性`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-transfer-design.md` · 该模块 VRC

**分类 · 优先级**：`准入/队列` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-TRANSFER-005.md`

#### 6.1 Case · MT-USAGE-001

**责任摘要（要测什么／边界在哪）**：模块 `USAGE` 公开接口在 `写型端点/命令` 类型下的行为（usage 校验后发布）；维度格 `合法请求`、`非法值/未知字段`、`重复提交幂等`、`目标缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-usage-design.md` · 该模块 VRC

**分类 · 优先级**：`写型端点/命令` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-USAGE-001.md`

#### 6.1 Case · MT-USAGE-002

**责任摘要（要测什么／边界在哪）**：模块 `USAGE` 公开接口在 `外部依赖失败（边界替身）` 类型下的行为（validator fail closed、迟到 usage 不改 Result）；维度格 `不可达`、`认证失败`、`限流/超时`、`部分失败`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-usage-design.md` · 该模块 VRC

**分类 · 优先级**：`外部依赖失败（边界替身）` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-USAGE-002.md`

#### 6.1 Case · MT-WORKER-001

**责任摘要（要测什么／边界在哪）**：模块 `WORKER` 公开接口在 `写型端点/命令` 类型下的行为（执行编排与两步发布）；维度格 `合法请求`、`非法值/未知字段`、`重复提交幂等`、`目标缺失`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-worker-design.md` · 该模块 VRC

**分类 · 优先级**：`写型端点/命令` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-WORKER-001.md`

#### 6.1 Case · MT-WORKER-002

**责任摘要（要测什么／边界在哪）**：模块 `WORKER` 公开接口在 `外部依赖失败（边界替身）` 类型下的行为（工具失败恢复、LeaseLost、模型不可达）；维度格 `不可达`、`认证失败`、`限流/超时`、`部分失败`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-worker-design.md` · 该模块 VRC

**分类 · 优先级**：`外部依赖失败（边界替身）` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-WORKER-002.md`

#### 6.1 Case · MT-WORKER-003

**责任摘要（要测什么／边界在哪）**：模块 `WORKER` 公开接口在 `资源清理` 类型下的行为（异常中途释放 workspace/句柄）；维度格 `正常释放`、`异常中途释放`、`重复清理幂等`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-worker-design.md` · 该模块 VRC

**分类 · 优先级**：`资源清理` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-WORKER-003.md`

#### 6.1 Case · MT-WORKER-004

**责任摘要（要测什么／边界在哪）**：模块 `WORKER` 公开接口在 `组装并发` 类型下的行为（claimNext 与 P0 的 claim 通道）；维度格 `并发对偶`、`租约续期 CAS`、`陈旧 epoch 被 fence`

**来源 ID / 固定版本 · VRC**：`docs/40_module_design/piko-worker-design.md` · 该模块 VRC

**分类 · 优先级**：`组装并发` · P1

**设计状态**：`Designed`

**上级组合验证入口 · 集合总账**：`docs/70_verification/module/cases/MT-WORKER-004.md`


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

