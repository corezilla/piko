<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko system-test-scheme

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `system-test-scheme` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode, corezilla |
| Created Date | `2026-10-03` |
| Last Modified Date | `2026-10-03` |
| Template ID | `tests.system-test-scheme` |
| Template Version | `0.6.1` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/system/system-test-scheme.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

<span style="color:#1f6feb"><em>**编写建议**：本模板是系统测试方案，与 design.software-system（系统设计阶段）一一对应。方案只登记测试分类与 Case 清单（每 Case 一行责任摘要），不写 Case 细节；逐 Case 展开一 Case 一文档（tests.system-case）。</em></span>

> **格式说明**：蓝色斜体为编写建议（指导如何填写，生成实例后保留）；灰色文字为虚构教学示例（以 `STD_TEMPLATE_EXAMPLE` 标记包裹，`new-design` 生成实例时自动剥离，不得当作项目事实或运行证据）；`<!-- TODO -->` 为待填槽位。颜色在 GitHub 等严格渲染器中降级为斜体/普通字，语义不变。

> 本方案绑定软件系统：父设计 Document ID 经 `--parent-document-id` 写入 metadata；系统设计 ID/版本在 §1 固定。

### 模板定位：方案、用例与计划的边界

<span style="color:#1f6feb"><em>**编写建议**：本方案对应系统设计阶段（design.software-system；总体设计的软件分支同用本模板）。分母来源是系统设计的端到端流程（§7）、对外接口（§8）、系统约束与预算，以及机制的端到端保证（design.system-mechanism §15 承接进入本分母——机制不单独立测试文档）。子系统层归 tests.subsystem-test-scheme；验收活动不在本家族，按项目 tailoring 承接。</em></span>

- **权威分工**：系统层测试的 Case 清单（ID、分类、优先级、责任摘要、设计状态）以本方案为唯一登记处；单 Case 展开归 `tests.system-case`（一 Case 一文档）；活动组织归 `tests.system-test-plan`。
- **只有摘要**：本方案每条 Case 只写责任摘要（要测什么），不写输入构造、Oracle 或步骤。
- **下层 PASS 不关闭本层**；本层 PASS 不关闭上层组合目标。

### 状态语义：用例状态

<span style="color:#1f6feb"><em>**编写建议**：本方案只持有 用例状态（Designed / Gap / Tailored-N/A）；实现状态（Planned/Implemented）在对应 case-design 文档，执行状态与 Verdict 只在 Run 报告。混层即违例。</em></span>

> 本文档对设计验证项（VRC/V-xxx）的引用规则：只引用 ID 与状态，不复制定义/判据；判据与契约权威归 design 与 tests.asset-design，本文档若细化执行断言需在变更时回溯设计修订并记录。

| 状态 | 取值 | 唯一权威记录处 | 禁止 |
|---|---|---|---|
| 用例状态 | `Designed` / `Gap`（具名缺口）/ `Tailored-N/A` | 本方案 §3 清单 | 未设计写成已设计；N/A 无设计事实依据 |

<span style="color:#1f6feb"><em>**完成条件**：任一 Case 在本方案中只报设计状态；实现与执行状态可沿 Case ID 追到 case-design 文档与 Run 报告。</em></span>

## 1. 目标、范围与被测对象

<span style="color:#1f6feb"><em>**本节目的**：固定整软件系统组装层的对象与边界。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：被测系统与设计基线；真实子系统；外部依赖真实或边界替身及证明边界；不证明的真实环境与验收目标。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 EX-APP 方案覆盖启动/配置/停止流程与机制端到端。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：读者能说清系统层测什么、验收承接什么。</em></span>

- 被测对象、设计基线与父对象：Piko Agent Runtime（`SW-P`），设计基线 `system-design` v0.12.0-draft.1（`design.software-system` 2.1.3），父对象无（纯软件顶层）。
- 本阶段测试边界（真实组成 / 边界替身）：真实组成 = P0 控制进程、P1 执行进程、SQLite Task Store、Pi AgentHarness、数据面 `scp`；边界替身 = LLMTier（`tests/common/mock-llmtier.ts`，真协议实例由 live Case 使用真 LLMTier）、Matrix homeserver（live Case 用本地 Synapse）。
- 不证明的组合保证及承接入口：不证明模块内部单点逻辑（归 `tests.module-test-scheme`）与函数级算法（归 `tests.unit-test-scheme`）；不证明多实例/跨部署的数据面可用性（`system-design` §5.3 `TOP-3` 未实现）。

## 1.5 测试方法与测试设计技术

<span style="color:#1f6feb"><em>**本节目相**：固定系统层"怎么测"的方法论——单元层测试设计技术比较单一（mock 为主），上游测试常**多方法共存**，需逐一描述与边界。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：测试设计技术（按 Case 家族用哪些——等价类划分/边界值/状态转换/决策表/错误猜测/属性测试/变异测试等，写明对哪些 family 用哪种及不用哪种）；入场标准（设计文档到位、方案清单冻结、Case 实现就绪、替身 Verified、环境齐）；离场标准（分母每条来源有 Case 或缺口、Verdict 齐全、缺口有主、设计变更触发重跑）；自动化策略（哪些进 CI、单 Case 选择入口、断点/重跑规则、flaky 不掩盖根因）。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：见下方灰字——系统层方法（含注入/边界/调用序等具体细节）。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：每个 §3 Case 行能指出所用方法与环境类型；入场/离场可判定；环境类型与 asset-design 契约对应；无未声明的环境依赖。</em></span>

| Case 家族 | 测试设计技术 | 环境类型引用 | 自动化与判定规则 |
|---|---|---|---|
| normal | 等价类划分 + 状态转换（四项操作状态流） | `ENV-LOOPBACK` | `tests/integration/http-api.test.ts`；按响应状态码与 `TaskView`/`AgentResult` 字段判定 |
| boundary | 边界值抽样（队列容量=1、输入大小上限、零产出） | `ENV-LOOPBACK` | 队列容量见 `tests/unit/server.test.ts`；输入上限见 `tests/integration/transfer-scp.test.ts` |
| negative | 反例驱动（越权路径、白名单外目标、逃逸路径、鉴权失败） | `ENV-LOOPBACK` | `tests/unit/server.test.ts`、`tests/integration/transfer-scp.test.ts`；断言 error catalog 内的码 |
| concurrency | 状态机驱动 + 固定交错（取消 vs 执行、staging vs 取消） | `ENV-LOOPBACK` | `tests/unit/p-input.test.ts`；轮询 `cancel_requested` 与 `AbortSignal` 收口 |
| recovery | 进程 kill + 事实重放（崩溃后不重跑 Pi） | `ENV-TWO-PROCESS` | `tests/unit/worker-runtime.test.ts`；断言 `Result` generation 冻结 |
| data-plane | 端到端真实传输 + 独立 Oracle（`sha256`/字节比对） | `ENV-LOOPBACK` / `ENV-REMOTE-SCP` | `tests/integration/transfer-scp.test.ts`（密闭）、`transfer-scp-live.test.ts`（opt-in 真对端） |
| security | 鉴权冒烟 + 凭据/host key 强制 | `ENV-LOOPBACK` | `tests/unit/server.test.ts`；`known_hosts` 缺失即 fail closed |
| integration-llm | 协议契约 + 事件子集覆盖（mock 与真 LLMTier 各一轮） | `ENV-LOOPBACK` / `ENV-LIVE-LLM` | `tests/integration/llmtier-contract.test.ts`；真端点为 opt-in live |

### 测试设计技术选型表（按 Case 家族）
<span style="color:#1f6feb"><em>**本节目的**：固定本层"怎么测"——按 Case 家族显式选用的设计技术与反模式；技术选择归本表不在灰例中重复。</em></span>

| Case 家族 | 选用的设计技术 | 选用理由 | 不选用的反模式 |
|---|---|---|---|
| <!-- normal --> | <!-- 等价类划分 + 边界值抽样 --> | <!-- 覆盖合法输入空间，验证主路径 --> | <!-- 不用全部输入矩阵（规模爆炸） --> |
| <!-- boundary --> | <!-- 边界值（上下限/零/1/刚好满） --> | <!-- 边界是缺陷高发区，验证边界 + 边界附近 1 步 --> | <!-- 不用随机/模糊测试（不可复现） --> |
| <!-- negative --> | <!-- 错误猜测 + 反例驱动 --> | <!-- 异常路径以"设计已识别的反例"为准 --> | <!-- 不用模糊异常注入（无 oracle / 无归因） --> |
| <!-- concurrency --> | <!-- 线程对偶 / 顺序交错 --> | <!-- 状态机驱动，固定种子控制时序 --> | <!-- 不用随机并发（不可复现 + flaky） --> |
| <!-- recovery --> | <!-- kill/异常路径 + RAII 恢复 --> | <!-- 资源归还与回滚基线需在失败路径覆盖 --> | <!-- 不用"重试"模拟恢复（掩盖根因） --> |
| <!-- performance --> | <!-- 单 Case 基线采样 + 多次回归比对 --> | <!-- 上游已验证语义，非性能预算基线 --> | <!-- 不用负载/容量测试（本层不负责系统预算） --> |
| <!-- security --> | <!-- 鉴权/注入/脱敏冒烟 + 资产级契约 --> | <!-- 上游/集成层已覆盖，本层仅冒烟 --> | <!-- 不用模糊安全测试（不可复现 + 上游责任） --> |

## 1.6 替身使用策略与边界

<span style="color:#1f6feb"><em>**本节目相**：固定系统层替身的使用，让 §3 清单的替身选择可解释可复核。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：替身决策准则（按所有权/可控性/真实性分类——内部真实/边界 fake/真协议测试实例/容器等）；替身形态（mock/fake/stub/spy 的取舍与代价）；替身保真度——契约与自检归 `tests.asset-design`（一资产一文档），方案与 Case 只引用其 ID 不复制行为；交互断言 vs 返回值断言（优先返回值，必要时断言关键调用序，但不耦合内部实现）；反模式（不 mock 你不拥有的接口、不 mock 值对象/纯数据、不为凑覆盖率而 mock、不过度断言内部细节）；与 §1 边界、§3 Case 清单、`tests.system-case` §2 替身选择一致。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：见下方灰字——系统层替身矩阵。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：每个 §3 Case 行能指出替身类型与契约文档 ID；替身矩阵与 asset-design 一一对应；反模式逐项被排除并有理由。</em></span>

| 协作者类型 | 替身形态 | 替身契约文档（tests.asset-design） | 决策理由 |
|---|---|---|---|
| LLMTier | fake（真 OpenAI-compatible Responses 协议实例） | `asset-design` §3.1 | 必须验证真实请求/响应形状，故用真协议 fake 而非 stub；不 mock 传输层 |
| Matrix homeserver | 真实例（本地 Synapse） | `asset-design` §3.2 | 讨论 intake 依赖 homeserver 行为（membership/txn 幂等），无法用 stub 表达 |
| scp 对端 | 真 sshd 实例或真远端主机 | `asset-design` §3.3 | 传输正确性由 `sha256`/字节往返判定，替身无法证明 |
| 时钟 | 真实时钟 + 单调计时 | — | 本版无任务级 deadline，无需受控时钟 |
| 任务存储 | 真实 SQLite（内存库或文件库） | — | 事务与 fencing 语义是本层被测对象，不替换 |

## 1.7 测试环境类型（方案定义）

<span style="color:#1f6feb"><em>**本节目相**：固定本层"在哪类环境上跑"——列出环境**类型**（抽象类别）及其行为/真伪与契约文档（tests.asset-design 或产品规范）；同一类型可多套实例（多 docker 用于并行），具体**实例编号与分配**由 `tests.system-test-plan` §4 编排，Case 在 §2 通过「环境类型 + ENV 实例编号」引用，不在本文档重复描述环境本身。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：见下方灰字——系统层测试环境类型（含契约与用法具体细节）+ 环境拓扑（ENV 类型 → ENV 实例 → 被测对象）。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：每个 §3 Case 行能指出所用环境类型；类型与 asset-design 契约对应；无未声明的环境依赖。</em></span>

| 环境类型 | 行为/真伪 | 契约文档 | 在本层用例中的角色 |
|---|---|---|---|
| `ENV-LOOPBACK` | 真 Piko 组件 + 本机 mock LLMTier/替身；真 SQLite | `asset-design` §3.1 | 默认环境；协议、控制面、数据面密闭校验 |
| `ENV-TWO-PROCESS` | 真 P0 + 真 P1（fork 子进程）+ 真实 IPC | `asset-design` §3.4 | 进程隔离、命令通道、心跳与重启 |
| `ENV-REMOTE-SCP` | 真 sshd 或指定远端主机（`PIKO_SCP_REMOTE`） | `asset-design` §3.3 | 数据面真实传输；不可用时 Case 记 `BLOCKED` |
| `ENV-LIVE-LLM` | 真 LLMTier（`127.0.0.1:8180`，模型 `Worker`） | `asset-design` §3.1 | 真实模型端到端；不可用时记 `BLOCKED` |

![system层测试环境拓扑](../diagrams/tests/system-env-topology.svg)

## 2. 测试分类体系

<span style="color:#1f6feb"><em>**本节目的**：固定本阶段的测试分类体系与适用裁剪。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：采用 STD 统一家族词表（normal/boundary/negative/concurrency/recovery/security/performance/endurance），逐类声明本阶段适用性与裁剪依据；不适用不等于没写 Case，须在 §4 给事实。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：见下方灰字分类示例。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：分类体系可裁剪可追溯，每个适用分类在 §3 清单中至少有 Case 或缺口。</em></span>

| 分类（STD 家族词表） | 本阶段适用性 | 裁剪依据 |
|---|---|---|
| normal | 适用 | 四项操作主路径与状态流 |
| boundary | 适用 | 队列容量、输入大小上限、零产出 |
| negative | 适用 | 越权、白名单外、路径逃逸、鉴权失败 |
| concurrency | 适用 | 取消与执行的交错；staging 与取消 |
| recovery | 适用 | 进程崩溃后的事实重放与 Result 冻结 |
| security | 适用 | 鉴权、凭据、host key 强制 |
| performance | 不适用 | 本层不声明系统预算；性能采样归运维与后续专项 |
| endurance | 不适用 | 无长稳运行要求（`system-design` 未声明 endurance 目标） |

## 3. 覆盖分母与 Case 清单

<span style="color:#1f6feb"><em>**本节目的**：把 design.software-system 的适用来源 ID 转成 Case 清单——测试分母的唯一登记。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：一个来源 ID 至少一条记录（可多 Case 分担，分别写责任摘要）；以设计文档（design §12/§14）的验证项 VRC 清单为分母逐项对账：每个 VRC 至少一个 Case——验证项是设计声明的必测点，本清单只引用其 ID 不复制定义、不做附录；Case ID 稳定且唯一（ST-<对象>-<NNN>）；责任摘要只写“要测什么、边界在哪”，不写输入与 Oracle；设计状态按状态语义；未实现与 NOT_RUN 不删；不适用转 §4。</em></span>

> 来源 ID 与设计验证项（VRC）的边界：本表登记 ID+责任摘要；判据/Oracle/Owner/契约权威归 design 与 tests.asset-design，不在此行复写；变更设计时同步 VRC 同步本清单。
<span style="color:#1f6feb"><em>**抽象示例**：见下表灰字。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：每个适用来源 ID 有 Case 或缺口；每个 Case ID 可追到（或计划有）case-design 文档。</em></span>

| 来源 ID / 固定版本 | 设计验证项 ID | Case ID | 分类 | 优先级 | 责任摘要（要测什么） | 设计状态 | 上级组合验证入口 |
|---|---|---|---|---|---|---|
| <!-- TODO --> | <!-- TODO --> | | | <!-- TODO --> | <!-- TODO --> | |

## 4. 不适用与缺口裁决

<span style="color:#1f6feb"><em>**本节目的**：区分“不适用”与“尚未设计”。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：Tailored-N/A 必须引用设计章节事实；Gap 须有 Owner 与恢复条件；两者都不从分母静默消失。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：见灰字。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：每条裁决有事实或 Owner；无“顺手 N/A”。</em></span>

| 来源 ID / 事实依据 | 裁决（Tailored-N/A 或 Gap） | Owner / 恢复条件 |
|---|---|---|
| `ST-LLM-002` 真实模型端到端 | Gap | 测试工程：需可达真 LLMTier 端点与凭据；本机 `127.0.0.1:8180` 可用，已手工验证一次，尚无自动化入口 |
| `ST-MX-001` Matrix 讨论链路 | Gap | 测试工程：需本地 Synapse 与房间脚本；`MECH-MATRIX` 逻辑已有单测，端到端未固化 |
| `ST-OBS-001` 观测与审计 | Gap | Owner M009：诊断端点尚未实现可测出口 |
| 性能/长稳类目 | Tailored-N/A | `system-design` §11 未声明系统预算与 endurance 目标，无分母来源 |
| 多实例（`TOP-3`）数据面 | Tailored-N/A | `system-design` §5.3 `TOP-3` 为 Planned，未实现，不构成分母 |

## 5. 文档联动与清单变更规则

<span style="color:#1f6feb"><em>**本节目的**：固定方案—用例—计划的联动规则，防三处漂移。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：新 Case 先入本清单再建 case-design 文档（文档 ID＝Case ID）；清单变更须同步计划构成表；写明方案冻结/版本规则。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：见灰字。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：清单与 case-design 文档一一对应；计划只引用不复制。</em></span>

- 方案冻结与变更规则：Case 清单随 `system-design` 版本冻结；设计新增/删除保证时，先改 §3 清单再改 case 文档；已执行 Case 的编号不复用。
- 与 case-design / 计划的同步规则：`设计状态=Designed` 的 Case 必须有同名 `tests.system-case` 文档（Document ID = Case ID）；`Gap` 允许暂无文档；`tests.system-test-plan` §4 只引用 Case ID，不复制判据。

<!-- 交付自查：每个适用来源 ID 是否都有 Case 或具名缺口；清单里的每个 Case ID 是否都有（或计划有）对应 case-design 文档；方案里是否混入了输入构造或 Oracle 细节？ -->

## 附录 A. 本层设计验证项 VRC 汇集（对照用）

<span style="color:#1f6feb"><em>**本节目的**：把设计文档声明的本层验证项 VRC 汇集于此，供逐项对照 §3 清单的覆盖。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：VRC 清单以设计文档（design §12/§14）为唯一权威，本附录只登记 ID 与要验证什么，不复制判据/Oracle 定义；设计变更时本附录同步；每个 VRC 必须在 §3 清单有至少一个 Case，否则登记缺口。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：见下方灰字。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：本附录 VRC 集合与设计文档一致；每个 VRC 在 §3 清单有 Case 或缺口。</em></span>

| 设计验证项 ID | 要验证什么（名称/责任） | 设计来源 | §3 Case 覆盖 |
|---|---|---|---|
| `VRC-ST-001..004` | 四项操作（提交/查询/取消/结果）的对外行为 | `system-design` §8.1 | `ST-APP-001..004` |
| `VRC-ST-005..006` | 身份幂等与 tombstone 保留 | 需求 PK-15/PK-19、contract §1 | `ST-APP-005/006` |
| `VRC-ST-007` | 鉴权与错误收口 | 需求 PK-18 | `ST-SEC-001` |
| `VRC-ST-008..012` | 数据面搬运（准备/失败/投递/解耦/边界） | 需求 PK-21、`CON-XFER-001..003` | `ST-DATA-001..005` |
| `VRC-ST-013/014` | 控制面与执行面隔离 | 需求 PK-22、`system-design` §5.1/§8.2 | `ST-PROC-001/002` |
| `VRC-ST-015..018` | 执行闭环、恢复、模型契约、真实模型 | 需求 PK-16/PK-12/PK-09/PK-03 | `ST-EXEC-001`、`ST-REC-001`、`ST-LLM-001/002` |
| `VRC-ST-019..021` | 讨论链路、观测、运维清理 | 需求 PK-08/PK-11、`CAP-PURGE` | `ST-MX-001`、`ST-OBS-001`、`ST-OPS-001` |

