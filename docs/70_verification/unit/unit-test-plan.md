<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko unit-test-plan

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `unit-test-plan` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode, corezilla |
| Created Date | `2026-10-10` |
| Last Modified Date | `2026-10-10` |
| Template ID | `tests.unit-test-plan` |
| Template Version | `0.10.9` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/unit/unit-test-plan.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

> **编写建议**：本模板是单元层测试的**可执行作业指令**，与 design.implementation（单元设计阶段）一一对应：执行者（含 Agent）按本计划从执行前检（§3）经逐 Case 作业（§9）到报告产出（§7）从头做到尾。计划只做索引与流程，不复制 Case、不预填执行结果。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。

> 本计划绑定单一软件模块

> 本文档对设计验证项（VRC/V-xxx）的引用规则：只引用 ID 与状态，不复制定义/判据；ENV 实例编号归 tests.asset-design，本计划编排 ENV 编号与 Case 分配时若变更设计须回溯修订并记录。：模块对象 ID 经 `--design-object-id` 写入 metadata；ISD 基线在 §2 固定。

### 模板定位：方案、用例、计划与报告的边界

> **编写建议**：本计划对应实现阶段。构成＝单元方案×1（tests.unit-test-scheme）＋Case 文档×N（tests.unit-case，一 Case 一文档）＋模块层交接；执行产出为 tests.unit-test-report；模块组装层组织归 tests.module-test-plan。

- **权威分工**：Case 清单归 `tests.unit-test-scheme`；单 Case 展开归 `tests.unit-case`（一 Case 一文档）；本计划是**可执行作业指令**——执行者（含 Agent）按它从执行前检做到报告产出；执行结果与 Verdict 权威在 `tests.unit-test-report` 与 Run 证据。
- **只索引**：构成表引用方案版本与 Case ID 范围，不复制清单或 Case 细节。
- **测试资产**：工具/夹具/替身/受控时钟的契约与自检在 `tests.asset-design`（一资产一文档，阶段共享）；本计划 §9 Step 0/1 使其就位。
- **不是授权书**：按用户当前授权交付；计划到期不改判任何事实状态。

### 计划条目状态语义

> **编写建议**：计划条目只有下列三种状态；执行状态（NOT_RUN/BLOCKED/INVALID）与 Verdict（PASS/FAIL）只存在于测试报告与 Run 证据，混入计划即违例。

- **`Planned`**：已排入计划，方案与责任已定位——用 Planned 冒充已执行或已通过。
- **`Deferred`**：经批准裁剪或延后，有 tailoring 依据与恢复条件——无依据的“暂不做”。
- **`Blocked`**：依赖缺失（设计缺口、环境、上游合同）——不登记缺口就长期挂起。

> **完成条件**：任一条目能报出状态、依据与下一步；计划里没有任何执行结论。

## 1. 目标、范围与测试构成

> **本节目的**：固定单元层测试活动的范围与构成清单。
>
> **必须写清楚**：验证对象与不证明什么；构成＝方案×1＋Case 文档×N＋模块/契约交接出口；排除项及 tailoring 依据。
>
> **抽象示例**：虚构 FrameDecoder：方案 UTS-FD v1.2 ＋ Case 文档 UT-FD-001…005。
>
> **完成条件**：读者（含 Agent）能说清验证对象、构成清单和排除项；每个构成项指向方案、Case 文档或具名缺口。

#### 1.1 构成项 · 单元方案 ×1

**文档 / 入口（Document ID 或缺口）**：`unit-test-scheme` v0.1.0-draft.1（`docs/70_verification/unit/unit-test-scheme.md`），覆盖 Piko 11 个模块的实现层；方案 §6 登记 11 条 `UT-*-001` Case：`UT-REPO-001`、`UT-WORKER-001`、`UT-PI-001`、`UT-USAGE-001`、`UT-POLICY-001`、`UT-TAPI-001`、`UT-SCHED-001`、`UT-BOOT-001`、`UT-MATRIX-001`、`UT-OBS-001`、`UT-TRANSFER-001`；环境类型 `ENV-UNIT`（方案 §4.1.1），拓扑图 `../diagrams/tests/unit-env-topology.svg`。

**覆盖责任摘要**：单元层 Case 登记与设计状态的唯一登记处；每条 Case 的来源是同名实现设计文档（`docs/50_implementation_design/piko-*-impl.isd.md`，`design.implementation`）与其 VRC 集合（合计 66 条：9+7+8+6+6+6+6+8+5+6+2）。已核对的方案事实：11 条 Case 的设计状态全部为 `Gap`（逐 Case 文档未撰写）。

**条目状态**：`Planned` —— 方案已生成并固定版本；因全部分母条目为 `Gap`，本计划按"一条 `UT-*-001` ＝ 一个 ISD 模块的函数级测试文件"为粒度、以真实测试文件为执行依据编排（见 §10.1 的 `G-CASE-003`）。

#### 1.2 构成项 · Case 文档 ×N（按方案清单）

**文档 / 入口（Document ID 或缺口）**：用例集 `tests.unit-case`（§1 总账 ＋ §3 逐 Case 段落）已撰写于 `docs/70_verification/unit/cases/`（11 份 `.md`），实现状态统一为 `Implemented`。

**覆盖责任摘要**：本轮以"一条 `UT-*-001` ＝ 一个 ISD 模块的 `tests/unit/<file>.test.ts`"为粒度组织执行：§9.4 中每个模块组一条作业行，执行判据取方案 §2.1 的 `unit-contract` 家族规则（直接调用 ＋ 冻结向量 ＋ 替身注入；断言返回值与抛错码；替身为严格 fake；缺断言即 `INVALID`）。用例集补齐后按同一 Case ID 追溯，已产生的 Run 不改判。

**条目状态**：`Blocked` —— 阻塞范围限于"用例集/逐 Case 段落缺失"，不阻断以模块级 Case 粒度编排本轮执行；关闭条件与最晚 Gate 见 §10.1。

#### 1.3 构成项 · 测试资产 ×N（tests.asset-design，需开发时为工作项）

**文档 / 入口（Document ID 或缺口）**：`asset-design` v0.1.0-draft.1（`docs/70_verification/assets/asset-design.md`）；本层消费的资产 ID：`FAKE-LLM`、`FAKE-SCP`、`FAKE-CLOCK`（方案 §3.1.1 登记形态为 `fake`/`mock`，§4.1.1 的 `ENV-UNIT` 契约引用 `asset-design §3.1 / §3.5`）；共享夹具 `tests/common/fixtures.ts` 与 `tests/common/model-mapping.ts`。

**覆盖责任摘要**：单元层一切外部依赖（LLMTier / scp / 时钟）全部替身化，真实编译产物与冻结向量不替身（方案 §3.1 决策理由）；替身契约的唯一 authority 在 `asset-design`，本计划只引用资产 ID。已核对事实：`FAKE-LLM` 有实现（`tests/common/mock-llmtier.ts`）、`FAKE-SCP` 有实现（`scripts/datanode-env.sh`），`FAKE-CLOCK` 无独立实现。

**条目状态**：`Blocked` —— `asset-design` §1–§7 仍为骨架，消费方索引、行为契约、自检 Run 与两层状态均未登记，`FAKE-CLOCK` 连实现都没有；测试工程补齐后 Step 0 方可放行（见 §10.1 的 `G-ASSET-001`）。

#### 1.4 构成项 · 相邻层交接出口

**文档 / 入口（Document ID 或缺口）**：`module-test-plan` 与 `module-test-scheme`（上层：模块整体行为）；契约出口为 `interfaces/` 下的 schema 与 `tests/contract/validate_v03_contract.py`。本层无下层交接出口——单元层是最底层测试家族。

**覆盖责任摘要**：方案 §1 明确"不证明模块整体行为（归 `tests.module-test-scheme`）"与"不证明端到端（归 `tests.system-test-scheme`）"；模块层 PASS 不关闭本层函数级断言，本层 PASS 不关闭模块层组合目标。

**条目状态**：`Planned` —— 交接口径固定为 ID 引用（`UT-*` 只被模块层引用作下层证据，不反向关闭模块层 Case）。


## 2. 被测基线与变更重跑范围

> **本节目的**：固定单元层基线与变更→重跑映射。
>
> **必须写清楚**：设计文档与源码、依赖、构建环境版本；哪些变化触发哪些 Case 重跑；重跑生成新 Run 与新报告，不覆盖旧失败。
>
> **抽象示例**：虚构 FrameDecoder：基线 EX-ISD/v1 修订 2；decode_one 签名变化→方案重裁＋全部 Case 重跑。
>
> **完成条件**：基线可核验；任一类变更能映射到明确重跑范围。

- **设计 / 源码 / 依赖基线**：设计基线＝11 个实现设计文档（`design.implementation`，`docs/50_implementation_design/piko-*-impl.isd.md`），上游模块设计（`design.definition`）与 `system-design` v0.12.0-draft.1，机器契约 `0.3.0-simplified.6`；源码基线分支 `docs/piko-system-design-std26`，被测 Pi 上游 `0.85.1` @ commit `9767ba27`。构建与执行环境：Node `>=22.19.0`、pnpm `11.19.0`；`npm run build` = `tsc -p tsconfig.json --noEmit`（TypeScript 5.9.3）；`npm test` = `vitest run`（vitest 4.1.9，include `tests/unit/**`）；`npm run check` = tsc ＋ vitest ＋ `python3 tests/contract/validate_v03_contract.py`。单元层真实可执行入口为 `tests/unit/*.test.ts` 15 个文件，纯内存、可重复；拓扑见方案 §4.2 的 `../diagrams/tests/unit-env-topology.svg`。

- **变更 → 重跑范围规则**：
  - 单个 ISD（`piko-*-impl.isd.md`）内部函数签名、算法或错误码变更 → 该模块对应 `UT-*-001` 全量重跑；若新增/删除 VRC，先改方案 §6 再建用例集段落并同步本计划 §1.1 与 §4 分配。
  - ISD 内部重构、函数对外可见行为未变 → 仅重跑受影响模块的 `UT-*-001`；但同文件内的其他 Case 仍须同轮跑完（单文件即 ENV-1 隔离单元）。
  - 模块公开接口（`design.definition` §9）变更 → 该模块的 `UT-*-001` 与对应 `MT-*-001` 同时重跑，并重跑 `python3 tests/contract/validate_v03_contract.py`。
  - 替身或冻结向量变更（`FAKE-LLM` / `FAKE-SCP` / `FAKE-CLOCK` / `tests/common/` 夹具与种子 `scripts/scenario-seeds.sh`）→ 先更新 `asset-design`，再重跑引用它的全部 `UT-*-001`。
  - 依赖或工具链版本变化（Node / pnpm / TypeScript / vitest）→ 本层全量重跑。
  - 任一重跑生成新 Run ID 与新 `unit-test-report` 实例，不覆盖旧失败证据（见 §6）。


## 3. 执行前检（Go / No-Go）

> **本节目的**：开始执行前逐项 Go/No-Go，全部通过才进入 §4 环境实例分配，再进入 §9 执行流程。
>
> **必须写清楚**：方案就绪度（清单无未登记缺口且版本固定）；Case 实现状态盘点（未 Implemented 的 Case 明确处理）；环境与工具（构建可用、依赖齐、权限具备）；构建接线（干净全量交付构建通过、消费者链接实际交付库、导出/注册项同步）；代码 review 通过（tests.code-review-checklist 全部必查项通过；Critical 未清零不得进入测试）；测试资产/数据版本对齐（与设计 §13 可冻结资产清单对账）。任一不满足记 Blocked 并登记缺口，不静默降级执行。
>
> **抽象示例**：虚构 UT-FD：编译器可用、5 个 Case 全 Implemented 才 Go。
>
> **完成条件**：每一前检项有可判定事实；No-Go 有出口（Blocked＋缺口）。

> ENV 状态统一字段：§3「环境与工具」前检与 §4 Step 0 共享同一个"ENV 状态"变量——§3 判定 Go/No-Go 后 ENV 状态置为 Ready/Blocked；§9 Step 0/1 按 §4 分配构建 ENV 实例、跑 assets 自检与环境检查；§7 报告产出读取此 ENV 状态字段；不要在 §3 与 §9 重复定义同义词。

#### 3.1 前检项 · 方案就绪度

**判定事实**：`unit-test-scheme` v0.1.0-draft.1 §6 为 11 条 `UT-*-001` 逐条登记了来源 ISD、VRC 集合、分类、优先级与设计状态；§2.1 给出 `unit-contract` 家族判定规则，§4.1.1 给出环境类型 `ENV-UNIT`，§7 给出 `Tailored-N/A` 与 `Gap` 裁决及 Owner。已核对：11 条 Case 的设计状态全部为 `Gap`（逐 Case 文档未撰写），无未登记缺口。

**通过条件**：方案版本已固定（v0.1.0-draft.1）且与 §2 基线一致；11 条 Case 全部有设计状态与来源 ISD；每条 `Gap` 在方案 §7 有具名 Owner 与恢复条件。分母条目为 `Gap` 不阻塞本轮"按模块级 Case 粒度"的执行编排，但必须在 §10.1 有主有期限。

**不满足时**：记 `Blocked`，把新增缺口按 `G-*` 编号登记到 §10.1 并通知测试工程；方案升版本后必须同步本计划 §1.1 与 §4 分配再重走本前检，不在旧版本上继续。

#### 3.2 前检项 · Case 实现状态盘点

**判定事实**：`tests.unit-case` 用例集已存在（`docs/70_verification/unit/cases/`，11 份）。单元层可执行实现为 `tests/unit/` 下 16 个文件，已核对的模块↔文件映射：`UT-BOOT-001` ← `config-schema.test.ts`、`config.test.ts`、`core.test.ts`；`UT-TAPI-001` ← `server.test.ts`；`UT-POLICY-001` ← `workspace.test.ts`；`UT-REPO-001` ← `store.test.ts`；`UT-SCHED-001` ← `p-input.test.ts`（P-INPUT pre-slot gating 段）；`UT-WORKER-001` ← `worker.test.ts`、`worker-runtime.test.ts`、`tool-recovery.test.ts`；`UT-PI-001` ← `pi-runtime.test.ts`、`provider-preflight.test.ts`、`responses-replay.test.ts`；`UT-USAGE-001` ← `worker.test.ts`（usage aggregation 段）、`model-mapping.test.ts`；`UT-MATRIX-001` ← `matrix.test.ts`；`UT-TRANSFER-001` ← `tests/integration/transfer-scp.test.ts` ＋ `p-input.test.ts`（P-ARTIFACT 段）。**`UT-OBS-001` 已有专属函数级入口**——新增 `tests/unit/observability.test.ts`（9 例）。另一处结构性偏差：现有文件按 describe 块编排（模块级 describe），未按 `UT-*-001` Case ID 或函数级 Case 段落编排，故"分母 ↔ 脚本"目前无法逐条对账。

**通过条件**：本轮要执行的每条 Case 都能指向至少一个可执行入口（文件路径 ＋ vitest 选择器），该入口在本轮 Run 记录中出现，且 Run 记录写明所覆盖的 Case ID；指不到入口的 Case 记 `NOT_RUN` 并登记原因，不得从清单消失。

**不满足时**：该 Case 记 `Blocked`（`UT-OBS-001` 归属 `G-CASE-003` 的关闭条件：用例集拆分时必须为 observability 模块给出函数级入口，否则按方案 §7 记为具名 Gap），Owner 测试工程；本轮继续以其余 10 条 Case 编排执行，不因单条缺入口停止全层。

#### 3.3 前检项 · 环境与工具（引用 tests.asset-design 的 Verified 状态）

**判定事实**：`ENV-UNIT` 为纯内存、可重复环境（真模块逻辑 ＋ 真 SQLite 内存库 ＋ 全替身边界），入口 `npm test`，无外部系统依赖、无网络、无 live 套件（`vitest.config.ts` 已把 `scenario-e2e.test.ts`、`matrix-acceptance.test.ts` 排除在默认套件之外）。已核对：`asset-design` §6 未登记任何资产的两层状态与自检 Run，方案 §4.1.1 引用的 `asset-design §3.1 / §3.5` 尚未成文；`FAKE-CLOCK` 无独立实现，时间相关断言目前依赖真实时间或测试内构造。

**通过条件**：本轮消费的每个资产在 `asset-design` §6 为 `Implemented` ＋ `Verified` 且有自检 Run 引用；`npm run check` 退出码为 0；单元层不引入任何网络或真实外部系统依赖（发现即视为环境不满足）。

**不满足时**：ENV 状态置 `Blocked`，§9 Step 0 停止，不进入 Case 执行；缺口登记为 `G-ASSET-001`（Owner 测试工程）。禁止把"某个 describe 被 skip"或"测试跑得很快"当作环境就绪。

#### 3.4 前检项 · 构建接线（全量交付构建 / 消费者链接实际库）

**判定事实**：交付构建门为 `npm run build`（`tsc -p tsconfig.json --noEmit`）；测试消费者链接由 `vitest.config.ts` 的 `resolve.alias` 完成（`@earendil-works/pi-*`、`@earendil-works/chord`、`typebox*` 全部指向 `upstream/pi/` 实际 vendored 源码），`tests/unit/*.test.ts` 经该 alias 加载真实被测实现而非替身；契约一致性由 `tests/contract/validate_v03_contract.py` 校验。

**通过条件**：干净工作区下 `npm run check` 退出码为 0，且 `validate_v03_contract.py` 返回 0；alias 指向的路径在基线 commit 上确实存在；`tests/unit/*.test.ts` 断言调用解析到 `src/**` 的真实实现。

**不满足时**：记 `Blocked` 并登记构建缺口；不得跳过 tsc 或跳过契约校验降级执行，也不得把 alias 改指替身/桩实现来"通过"链接检查（那会掩盖真实缺陷）。


## 4. 环境实例分配（plan 编排）

> **本节目的**：把方案 §4 的环境类型落实为具体的**实例编号**，并分配给具体 Case——同一类型可多套（如多 docker 用于并行），编号与分配是 plan 的责任，Case 只引用编号。
>
> **必须写清楚**：列出本计划分配的全部 ENV 实例（编号 + 类型 + 具体配置/位置 + Owner + 分配给哪些 Case + 准备时限 + 状态）；ENV 实例类型与方案 §4 类型一致；准备失败标 Blocked 并登记缺口，不静默换其他实例。
>
> **抽象示例**：见本节 example 围栏示例）。
>
> **完成条件**：方案 §6 Case 清单中的每个 Case 在本登记有 ENV 实例；类型一致；准备未完成标 Blocked 并登记缺口，不静默换实例。

#### 4.1 ENV · ENV-1 / ENV-2

**环境类型**：`ENV-UNIT`（方案 §4.1.1：真模块逻辑 ＋ 真 SQLite 内存库 ＋ 全替身边界）

**具体配置/位置**：仓库工作区根目录 ＋ vitest 默认项目（`vitest.config.ts`，include `tests/unit/**`）；SQLite 用 `node:sqlite`（`DatabaseSync`，内存库），边界用 `FAKE-LLM`（`tests/common/mock-llmtier.ts`）、夹具 `tests/common/fixtures.ts`、模型映射 `tests/common/model-mapping.ts`；入口 `npm test`

**Owner**：测试工程

**分配给哪些 Case**：`UT-BOOT-001`、`UT-TAPI-001`、`UT-POLICY-001`、`UT-REPO-001`、`UT-SCHED-001`、`UT-WORKER-001`、`UT-PI-001`、`UT-USAGE-001`、`UT-MATRIX-001`、`UT-OBS-001`、`UT-TRANSFER-001`（全部 11 条）

**准备时限**：§9 阶段门 1 进入前

**状态**：`Ready`（计划期判定：纯内存、无外部系统、无网络；正式状态以 §3 前检与 §9 Step 1 的记录为准）

---

**环境类型**：`ENV-UNIT` ＋ 受控时钟与固定种子向量（`FAKE-CLOCK` ＋ `scripts/scenario-seeds.sh`），用于顺序交错与恢复类断言的确定性复现

**具体配置/位置**：独立工作副本（与 ENV-1 不共用同一 checkout，避免并发占用同一 `node_modules` 与工作区）；受控时钟资产待 `asset-design` 登记后接入；入口 `npx vitest run tests/unit/<file>.test.ts`，需固定种子时先用 `scripts/scenario-seeds.sh` 生成向量并在 Run 记录中写明种子值

**Owner**：测试工程

**分配给哪些 Case**：`UT-SCHED-001`、`UT-WORKER-001`、`UT-REPO-001`、`UT-TRANSFER-001` 的时间相关与顺序交错子集（与 ENV-1 共用 Case ID，但同一时刻只由一个 ENV 实例占用，串行执行）

**准备时限**：§9 阶段门 2 进入前

**状态**：`Blocked`（就绪条件＝`FAKE-CLOCK` 在 `asset-design` §6 登记为 `Verified` 且有自检 Run；条件未满足时这四条 Case 的时间相关断言在 ENV-1 执行并在 Run 记录中标注"未受控时钟，受限执行"，不得当作受控交错的完整覆盖）

## 5. 环境操作（搭建 / 复位 / 隔离 / 清理）

> **本节目的**：环境操作可复现。
>
> **必须写清楚**：搭建、每 Case 复位、并行隔离键、清理的具体命令或入口；环境不可重建即 Blocked；单环境串行时写清 case 前检查、软复位/重启/驱动恢复阶梯与时限，失败后确认回到基线，不能只 kill 后继续。
>
> **抽象示例**：虚构 UT-FD：教学宿主每 Case 天然复位。
>
> **完成条件**：另一位执行者能独立搭建、复位与清理。

- **环境搭建与复位操作**：
  - ENV-1：`npm run build` 后 `npm test`；每条 `UT-*-001` 用单文件 vitest 选择器收窄（如 `npx vitest run tests/unit/store.test.ts`），必要时叠加 `-t "<describe/it 名>"`。每 Case 复位＝新建内存库句柄与替身实例（`beforeEach` 重建），不跨 Case 复用状态。
  - ENV-2：先确认受控时钟已 `Verified`，再以固定种子生成向量，随后跑单文件选择器；每 Case 前重建时钟并记录起点读数。
  - 单元层不需要任何外部环境搭建或网络权限；发现测试需要真实 homeserver / 真实模型 / 真实 scp 对端时，说明该断言越层了——移回模块层或系统层，本层按 `INVALID` 处理。

- **隔离键与清理**：
  - ENV-1 隔离键：每 Case 的内存库句柄 ＋ `tests/common/` 中该 Case 实例化的替身对象（不共享全局单例）；单文件即最小隔离单元。
  - ENV-2 隔离键：独立工作副本路径 ＋ 种子值；同一时刻只允许一个 ENV 实例占用该副本（串行）。
  - 清理：ENV-1/ENV-2 无需外部清理，只需确认无临时库/临时文件残留；证据目录 `var/verification/unit/<Run ID>/` 不删除。

- **复位阶梯与时限（软复位→重启→驱动恢复）**：
  - 一级 软复位（≤2 分钟）：重跑单文件选择器；失败即进二级，不得连续重试同一入口。
  - 二级 重启（≤10 分钟）：`npm run build && npm test` 全量重跑；退出码 0 才算回到基线。
  - 三级 驱动恢复（≤5 分钟）：ENV-2 重建独立工作副本与受控时钟；ENV-1 无驱动依赖，回到基线即可。
  - 每级完成后都要留下"已回基线"的事实记录，不能只 kill 进程后继续；超时未回基线即按 §9 的 BLOCKED 路径停止本层执行并登记缺口。

## 6. 证据与 Run 记录规则

> **本节目的**：Run 证据规则固定。
>
> **必须写清楚**：Run ID 命名（对象-时间或序号）、每次 Run 保存的命令/版本/stdout/退出码/种子、保存位置与保留期、脱敏要求；重跑生成新 Run 不覆盖。
>
> **抽象示例**：虚构 UT-FD：run-⟨日期⟩-⟨序号⟩。
>
> **完成条件**：从报告任一 Verdict 能定位唯一 Run 与原始证据。

- **Run ID 规则与证据位置**：`ut-run-<YYYYMMDD>-<NN>`（例：`ut-run-20261010-01`）。一个 Run ＝ 一次 `npm test` 的全量或按测试文件选择器的执行；原始证据落 `var/verification/unit/<Run ID>/`（命令原文、stdout/stderr、退出码、环境版本、种子值），报告任一 Verdict 可反查到唯一 Run 与该目录。重跑生成新 Run ID 与新目录，旧失败证据只读保留、不得覆盖。

- **保存内容与脱敏要求**：每次 Run 保存执行命令原文、被测 `UT-*-001` 与来源 ISD、基线 commit、Node/pnpm/vitest/TypeScript 版本、被测 ENV 实例编号、完整 stdout 与 stderr、进程退出码；ENV-2 另存种子值与时钟起点读数。保留期：本层 Gate 关闭后 90 天。脱敏：夹具中的 token/密钥样例只记存在性与指纹、不落明文；stdout 出现明文凭据即判该 Run 证据 `INVALID`，另出脱敏副本并保留原文件为受限证据。

## 7. 报告产出与 Gate 规则

> **本节目的**：定义报告产出与 Gate 规则。
>
> **必须写清楚**：全部 Case 走完后（或按出口准则提前结束）生成 `tests.unit-test-report` 实例；Gate 建议规则（覆盖闭合或缺口有主、失败分级）在此固定，报告只按规则给建议不越权批准。> 失败降级路径：plan 整体 BLOCKED（环境性）→ 该轮不生成 report 实例，只记缺口与原因；plan 部分 Case 失败 → 仍生成 report（含 FAIL/INVALID 完整记录），后续报告生成失败（new-design 等）→ 不掩盖 FAIL，复现状态与修复状态分开记录。
>
> **抽象示例**：虚构 UT-FD：全部 Case 走完后生成报告；Gate＝分母闭合且 G-EX-1 有主。
>
> **完成条件**：报告的生成时机、模板与 Gate 规则确定。

- **报告生成时机与模板**：全部 11 条 Case 走完（或按出口准则提前结束）后生成 `unit-test-report` 实例（`docs/70_verification/reports/unit-test-report.md`，模板 `tests.unit-test-report`），按 §6 的 Run 记录汇总 Verdict。降级路径：plan 整体环境性 `BLOCKED` → 该轮不生成 report 实例，只在 §10.1 记缺口与原因；部分 Case 失败仍生成 report（含 `FAIL`/`INVALID` 完整记录）；报告生成工具本身失败时，复现状态与修复状态分开记录，不掩盖 `FAIL`。

- **Gate 建议规则**：Gate ＝ 全部处于 `Implemented` 的 Case 均 `PASS` 且无未关闭 Gap → 建议 pass；任一 Case `FAIL` → 建议 not pass；`BLOCKED` 单独列出——既不计入 pass 也不隐藏，且每条 `BLOCKED` 必须对应 §10.1 中有主有期限的缺口。方案 §6 中 11 条 `Gap` 状态的设计条目（逐 Case 文档未撰写）不参与 pass 判定，但其关闭进度须在报告单列。本层 PASS 不关闭模块层 Gate；报告只按本规则给建议，不越权批准。

## 8. 责任、排期与风险

> **本节目的**：责任到人、风险有触发与缓解出口。
>
> **必须写清楚**：方案维护、Case 编写、执行、评审的责任人与时间窗；风险写触发条件、影响与缓解，不写“重试即可”。
>
> **抽象示例**：设计＝模块 Owner、执行＝QA 或 Agent、评审＝模块设计评审。
>
> **完成条件**：每个构成项有责任人与时间窗；关键风险有可判定触发。

#### 8.1 风险 · 分母与脚本无法对账（11 条 UT Case 全为 Gap，且测试文件按 describe 块而非 Case ID 编排）

**时间窗 / 最晚 Gate**：§9 阶段门 1 之前须确认判据来源；最晚 Gate＝本轮 `unit-test-report` 产出前完成首轮 `G-CASE-003` 拆分。

**冲突或缓解出口**：触发条件＝方案 §6 的 11 条 Case 设计状态全为 `Gap`，且 `tests/unit/*.test.ts` 以模块级 describe 编排而非按 `UT-*-001` Case ID 或函数级段落编排——两个后果：一条 Case 的 VRC 区间（方案合计 66 条）无法逐条追到断言点；反之某个断言失败也无法反推是哪个 Case 的 VRC 被违反。缓解：Run 记录强制写明"本次入口文件 ＋ 覆盖的 `UT-*-001` ＋ VRC 区间"三元组，执行判据只取方案 §2.1 的 `unit-contract` 规则与 §2.2 家族选型；用例集按 §3 骨架落地后，按同一 Case ID 同步 §9.4 与 §1.2 构成表，并把现有 describe 块映射进用例集段落。

---

**时间窗 / 最晚 Gate**：风险"`FAKE-CLOCK` 无实现，时间相关断言不可复现"——§9 Step 0 与阶段门 2；最晚 Gate＝阶段门 2 进入前。

**冲突或缓解出口**：方案 §2.2 的 `concurrency` 家族选型是"顺序交错（状态机相邻转移）"、要求可确定性复现；但受控时钟尚无资产，若断言直接读真实时间，会在不同机器/不同负载下 flaky，且 flake 会被误读为产品缺陷。缓解：Step 0 把时钟就绪列为 ENV-2 的就绪条件；未就绪前这四条 Case 在 ENV-1 执行时必须在 Run 记录标注"未受控时钟，受限执行"，且不得据此关闭方案 §2.3 的"恢复/灾备"维度格子。

---

**时间窗 / 最晚 Gate**：风险"`UT-OBS-001`（MM009 observability）无函数级入口"——§9 阶段门 3 之前；最晚 Gate＝本轮报告产出前。

**冲突或缓解出口**：`tests/unit/` 无 observability 文件，若拿 `server.test.ts` 的 error containment 段或 `config-schema.test.ts` 的配置面冒充观测覆盖，会把"错误收口"误报为"结构化事件/指标/审计可判定"。缓解：`UT-OBS-001` 记 `NOT_RUN` 并写明"无专属入口"；该缺口并入 `G-CASE-003` 的关闭条件——用例集拆分时必须为 observability 模块给出函数级入口，否则按方案 §7 记为具名 Gap。

---

**时间窗 / 最晚 Gate**：风险"越层断言把外部系统依赖漏进单元层"——§9 Step 2 排序与 Step 3–5 执行时；最晚 Gate＝阶段门 4 进入前。

**冲突或缓解出口**：`vitest.config.ts` 已把 `scenario-e2e.test.ts`、`matrix-acceptance.test.ts` 排除在默认套件之外；若有人把 `npm run test:live` 的输出并进同一 `ut-run-*` 证据目录，单元层的"纯内存可重复"前提即被破坏，flake 与真实缺陷将无法归因。缓解：live 入口不并入单元层 Run（应属模块层/系统层 ENV）；发现单元测试需要真实 homeserver / 真实模型 / 真实 scp 对端时，该断言按 `INVALID` 处理并回流模块层。

## 9. 执行流程（逐 Case 作业序列）

> **本节目的**：给执行者（含 Agent）一条从头到尾的作业序列。

> 失败处理与收口（在本流程图内统一）：FAIL → 保留首个失败现场 + 保留 Run 证据 + 禁止重跑覆盖原始失败 → 登记缺陷并关联 Case ID；BLOCKED → 标记环境性阻塞 + 整个 §9 执行流程停止 + 登记缺口 + 不静默换工具链；INVALID → 标记该 Case 注入未命中 + 复现状态与修复状态分开记录 → 不允许仅靠"重跑通过"掩盖；NOT_RUN → 标记未执行 + 登记原因（不在方案 §6 清单中静默消失）。
> **必须写清楚**：头尾工序固定——Step 0 资产就位（测试资产准备：按消费索引构建全部依赖资产并自检，不过即环境性 Blocked、不进 Case 执行）、Step 1 测试环境搭建与检查（按 §4 分配、§5 操作使 ENV 就绪）、收尾先清理回基线、再按 §7 的时机与 Gate 规则生成报告；中段由作者按方案清单优先级逐 Case 填充：定位 Case 文档→按其 §2–§7 前检与运行→判定分路（PASS/FAIL/BLOCKED/INVALID 各有明确出口与下一步）→记录 Run→继续，可按阶段门（最小真实链→规模控制面→完整业务→恢复/全量回归）拆分为多行；失败不阻断后续 Case，除非环境性阻塞。
>
> **抽象示例**：虚构 UT-FD：按 P0→P1 逐个执行，UT-FD-003 失败不阻断 UT-FD-004/005。
>
> **完成条件**：执行者不需要临场发明流程；每个分路有确定下一步。

#### 9.1 Step · 0

**动作**：资产就位（测试资产准备）：按消费索引构建全部依赖测试资产并运行自检；自检不过＝环境性 Blocked，不进入 Case 执行

**输入 / 依据**：`asset-design` v0.1.0-draft.1 —— §1 消费方索引（本计划 §1.3）、§2 行为契约（`FAKE-LLM`/`FAKE-SCP`/`FAKE-CLOCK`）、§5 自检用例、§6 两层状态；实现入口 `tests/common/mock-llmtier.ts`、`tests/common/fixtures.ts`、`tests/common/model-mapping.ts`、`scripts/datanode-env.sh`、`scripts/scenario-seeds.sh`

**产出**：`var/verification/unit/assets-ready-<YYYYMMDD>.md` 就绪清单——逐资产记开发状态、验证状态与自检 Run 引用；清单中缺任一 `Verified`（特别是 `FAKE-CLOCK`）即本 Step 对应条目判环境性 `Blocked`，不进入 §9.4 的 Case 执行

#### 9.2 Step · 1

**动作**：测试环境搭建与检查：按 §5 操作搭建/复位 §4 分配的 ENV 实例并确认就绪

**输入 / 依据**：本计划 §4（ENV-1 / ENV-2 的类型与 Case 分配）＋ §5（单文件选择器、独立工作副本、种子与受控时钟的接入方式）

**产出**：ENV 状态判定记录——ENV-1 记 `Ready`（依据 `npm run build && npm test` 可运行且无网络依赖）；ENV-2 记 `Ready`/`Blocked` 并附 `FAKE-CLOCK` 自检 Run 或缺口编号。ENV 状态字段是本计划 §3、§7 共用的同一变量。

#### 9.3 Step · 2

**动作**：读取方案清单并按优先级排序

**输入 / 依据**：`unit-test-scheme` v0.1.0-draft.1 §6（11 条 `UT-*-001`，含分类、优先级与设计状态）、§2.1 `unit-contract` 判定规则与 §2.2 家族选型

**产出**：执行队列＝按模块顺序（bootstrap → task-api → policy → task-repository → scheduler/worker → pi-adapter/usage → matrix-adapter/observability/transfer）排序的条目，每条＝`UT-*-001` ＋ 入口文件＋vitest 选择器 ＋ ENV 实例编号 ＋ VRC 区间；`Gap` 状态的 Case 进队列但预置为 `BLOCKED` 占位，不删除。

#### 9.4 Step · 3

**动作**：Step 3 — 函数级主路径组（ENV-1）：逐 Case 定位 → 按方案 §2.1 的"直接调用 ＋ 冻结向量 ＋ 替身注入"运行 → 记录 Run。覆盖 `UT-BOOT-001`（`tests/unit/config-schema.test.ts`、`config.test.ts`、`core.test.ts`）、`UT-TAPI-001`（`server.test.ts`）、`UT-POLICY-001`（`workspace.test.ts`）、`UT-REPO-001`（`store.test.ts`）；断言点＝返回值与抛错码两类各至少一处，缺断言即 `INVALID`。

**输入 / 依据**：`unit-test-scheme` §6 对应 Case 行与 VRC 区间 ＋ §2.1 `unit-contract` 判定规则；本计划 §4 ENV-1 与 §3.2 的入口映射

**产出**：每条 Case 一个 Run 记录（`PASS`/`FAIL`/`BLOCKED`/`INVALID`/`NOT_RUN` 之一）＋ 对应 `var/verification/unit/<Run ID>/` 证据目录

---

**动作**：Step 4 — 执行与适配函数组（ENV-1）：覆盖 `UT-SCHED-001`（`p-input.test.ts` 的 P-INPUT pre-slot gating 段）、`UT-WORKER-001`（`worker.test.ts`、`worker-runtime.test.ts`、`tool-recovery.test.ts`）、`UT-PI-001`（`pi-runtime.test.ts`、`provider-preflight.test.ts`、`responses-replay.test.ts`）、`UT-USAGE-001`（`worker.test.ts` 的 usage aggregation 段、`model-mapping.test.ts`）。按方案 §2.2 用等价类划分＋固定 seed 注入覆盖主路径与分支，负例按 version→kind→length 之类的既有拒绝优先级断言。

**输入 / 依据**：`unit-test-scheme` §6 对应 Case 行与 VRC 区间 ＋ §2.2 `normal`/`negative`/`boundary` 家族选型；本计划 §4 ENV-1

**产出**：逐 Case Run 记录 ＋ `ut-run-<日期>-<NN>` 证据目录

---

**动作**：Step 5 — 边界与外部依赖替身组（ENV-1）：覆盖 `UT-TRANSFER-001`（输入校验、`sha256` 校验、投递幂等；入口 `tests/integration/transfer-scp.test.ts` ＋ `p-input.test.ts` 的 P-ARTIFACT 段）、`UT-MATRIX-001`（`matrix.test.ts`，边界全部替身化）、`UT-OBS-001`（无专属入口时记 `NOT_RUN`，引用 §8.1 风险条目）。越层断言（需要真实 homeserver / 真实模型 / 真实 scp 对端）在本步即判 `INVALID` 并回流模块层。

**输入 / 依据**：`unit-test-scheme` §3.1 替身登记 ＋ §2.3"数据面/权限矩阵/恢复"适用性登记；本计划 §3.2

**产出**：逐 Case Run 记录或 `NOT_RUN` 记录（含"无专属入口"的事实说明）

---

**动作**：Step 6 — 受控时钟子集（ENV-2，串行）：`UT-SCHED-001`、`UT-WORKER-001`、`UT-REPO-001`、`UT-TRANSFER-001` 的时间相关与顺序交错断言——先确认 `FAKE-CLOCK` `Verified`、用 `scripts/scenario-seeds.sh` 生成固定种子，再跑单文件选择器；ENV-2 未 `Ready` 时这批断言退回 ENV-1 并在 Run 记录标注"未受控时钟，受限执行"。

**输入 / 依据**：`unit-test-scheme` §2.2 `concurrency`/`recovery` 家族选型与 §2.3.9；`asset-design` 的 `FAKE-CLOCK` 契约；本计划 §4 ENV-2 与 §5

**产出**：子集 Run 记录 ＋ 种子值与时钟起点读数 ＋ ENV-2 就绪事实或缺口编号

---

**动作**：Step 7 — 逐 Case 判定分路（贯穿 Step 3–6）：`PASS` → 记 Run 并继续；`FAIL` → 保留首个失败现场与 Run 证据、登记缺陷并关联 Case ID 与 VRC、禁止重跑覆盖；`INVALID` → 记录替身/断言未命中或越层依赖的事实、复现状态与修复状态分开；`BLOCKED` → 标记环境性阻塞并停止后续 Case；`NOT_RUN` → 记原因，不从方案 §6 清单中消失。

**输入 / 依据**：本计划 §7 的 Gate 规则与 §6 的 Run 规则

**产出**：完整的 Run 集合，供 §9.5 清理与 §9.6 报告生成引用

#### 9.5 Step · N+1

**动作**：环境清理与基线恢复：按 §5 执行清理；保留全部 Run 证据，不覆盖旧失败

**输入 / 依据**：本计划 §5（ENV-2 独立工作副本与受控时钟的释放、临时库/临时文件残留检查）

**产出**：ENV-1/ENV-2 回到基线的事实记录（`npm run check` 退出码 0、无临时库/临时文件残留）＋ `var/verification/unit/<Run ID>/` 证据落位确认；旧失败 Run 目录保持只读不删

#### 9.6 Step · N+2

**动作**：生成测试报告：按 §7 的时机与 Gate 规则汇总本轮全部 Run 结果

**输入 / 依据**：本计划 §7（生成时机、模板与 Gate 规则）＋ §6 的全部 Run 记录

**产出**：`unit-test-report` 实例（`docs/70_verification/reports/unit-test-report.md`）——逐 Case Verdict、`BLOCKED`/`NOT_RUN` 单列、Gate 建议结论；报告只给建议，不越权批准，也不反向关闭模块层 Gate

#### 9.7 阶段门 · 1 最小真实链

**目的**：验最小真实链在函数级可判定——配置解析（M000）、HTTP 受理与错误收口（M001）、工作区授权（M002）、TaskStore 持久化（M003）的内部函数在纯内存环境里直接调用即可断言返回值或抛错码，不需要任何外部系统。

**进入条件**：Step 0 资产就位清单齐、Step 1 记 ENV-1 ＝ `Ready`；`UT-BOOT-001`、`UT-TAPI-001`、`UT-POLICY-001`、`UT-REPO-001` 四条各已有一条 Run 记录（`PASS`/`FAIL`/`BLOCKED`/`INVALID`/`NOT_RUN` 之一，不允许缺记录）。

#### 9.8 阶段门 · 2 规模控制面

**目的**：验状态机与时间相关的确定性——pre-slot gating（M004）、worker 终态与部分产出（M005）、恢复扫描/补写函数的状态转移在固定种子与受控时钟下可重复复现，不依赖机器负载。

**进入条件**：`UT-SCHED-001`、`UT-WORKER-001` 均有 Run 记录或 `BLOCKED` 记录；ENV-2 已给出 `FAKE-CLOCK` 的 `Verified` 事实（自检 Run 引用）或已按 §8.1 标注"未受控时钟，受限执行"；ENV-1 保持 `Ready` 且上一阶段临时库已清理。

#### 9.9 阶段门 · 3 完整业务

**目的**：验适配与外部依赖全替身化下的函数级行为——Pi provider preflight 与 Responses 历史重放（M006）、usage 聚合与模型映射（M007）、Matrix 稳定发送（M008）、transfer 输入校验/`sha256`/幂等（M010）；观测模块（M009）在本阶段门只做缺口确认，不以替代断言充数。

**进入条件**：`UT-PI-001`、`UT-USAGE-001`、`UT-TRANSFER-001`、`UT-MATRIX-001` 有 Run 记录或 `BLOCKED`/`NOT_RUN` 记录；`UT-OBS-001` 已按 §8.1 记 `NOT_RUN` 并写明无专属入口；本阶段全部断言均在纯内存、无网络条件下完成（发现越层依赖即判 `INVALID`）。

#### 9.10 阶段门 · 4 恢复 / 全量回归

**目的**：验恢复路径与环境复位——恢复扫描/补写函数与工具写入失败回收不靠"重试"掩盖；ENV-2 独立工作副本释放后无残留；干净工作区下全层回归回到基线。

**进入条件**：Step 4–6 的 Run 记录齐备或已记 `BLOCKED`/`NOT_RUN` 及原因；§5 清理已完成（独立工作副本释放、无临时库/临时文件残留）；`npm run check` 在清理后退出码为 0，作为"已回基线"的判定事实。


- **失败（FAIL）处理路径**：保留首个失败现场（进程状态、日志、`var/verification/unit/<Run ID>/` 原始输出）→ 在报告中登记缺陷并关联 Case ID 与 VRC ID → 禁止用重跑覆盖原始失败：修复后重跑必须分配新 Run ID，新旧 Run 并存并在报告中注明"修复后重跑" → 继续执行后续 Case（普通失败不阻断）；环境性阻塞按下一条处理。

- **阻塞/无效（BLOCKED/INVALID）处理路径**：`BLOCKED` → 标记为环境性阻塞 → 停止整个 §9 执行流程 → 在 §10.1 登记缺口编号与 Owner → 不静默换工具链、不静默换 ENV 实例。`INVALID` → 标记该 Case 的断言未覆盖、替身未命中或越层依赖（如断言需要真实模型/真实 homeserver、缺断言点）→ 复现状态与修复状态分开记录，不允许仅靠"重跑通过"掩盖。`NOT_RUN` → 标记未执行并写明原因（如 `UT-OBS-001` 无专属入口），不得从方案 §6 清单中静默消失。

## 10. 未决项

> **本节目的**：未决项有主、有期限、有关闭条件。
>
> **必须写清楚**：逐条登记；无未决项时写经核对的“无”。
>
> **抽象示例**：G-EX-1 契约入口未定义。
>
> **完成条件**：未决项全部有主有期限。

#### 10.1 未决 · G-CASE-003 / G-ASSET-001

**Owner / 最晚 Gate**：`G-CASE-003`（模块用例集 `tests.unit-case` 未撰写：§1 总账与 §3 逐 Case 八字段段落缺失，方案 §6 的 11 条 Case 因此全为 `Gap`；现有 `tests/unit/*.test.ts` 按 describe 块而非 Case ID 编排，分母↔脚本无法逐条对账）——测试工程；最晚 Gate＝§9 阶段门 1 之前完成首轮拆分，本轮 `unit-test-report` 产出前完成全部 11 条。

**关闭所需事实或决定**：`docs/70_verification/unit/` 下出现用例集文档，§1 总账行＝方案 §6 登记行、§3 段落按"Case ID 标题 ＋ 八字段"展开（与方案 §6.2 的骨架一致），并把现有 15 个测试文件的 describe 块映射进对应段落；其中 `UT-OBS-001` 必须给出函数级入口，否则按方案 §7 记为具名 Gap 而非 `Designed`。关闭前本计划按模块级 Case 粒度编排（§9.4），拆分完成后须同步 §1.2 构成表与 §9.4 的作业行。

---

**Owner / 最晚 Gate**：`G-ASSET-001`（`asset-design` 仍为骨架：消费方索引、行为契约、自检 Run、`Implemented`/`Verified` 两层状态均未登记；`FAKE-CLOCK` 无独立实现，方案 §4.1.1 引用的 `asset-design §3.1 / §3.5` 尚未成文）——测试工程；最晚 Gate＝§9 Step 0（`FAKE-CLOCK` 部分最晚 §9 阶段门 2 进入前）。

**关闭所需事实或决定**：`asset-design` §1 登记本计划与三份 scheme 为消费方，§2 写明各 `FAKE-*` 的模拟与不证明边界（受控时钟须写明精度、推进接口与真实时间的边界），§5 有可执行自检入口，§6 登记两层状态与自检 Run 引用。在此之前 Step 0 按本计划 §3.3 的可执行判据处理，缺 `Verified` 即 `Blocked`；不得以产品/集成 Case 的表现反推资产已 `Verified`。

---

**Owner / 最晚 Gate**：无其他未决项（已核对方案 §7 全部裁决：`Tailored-N/A` 四项——控件面、成本护栏、性能预算、长稳 endurance——均已引用设计事实；§2.3 中 `Tailored-N/A` 的对象类型——E2E 业务流、控件面、真实通道、系统机制锚点、性能预算、成本护栏——均已给裁剪依据）。

**关闭所需事实或决定**：不适用（裁决已闭合）；若引入 UI、外部计费系统、系统性能预算或 endurance 目标，须先改设计再重开方案 §7。

> **交付自查**：执行者能否只凭本计划从 Go/No-Go 走到报告产出；计划里是否出现任何执行结论或 Verdict；到期条目是否被偷偷改判？
