<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko module-test-plan

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `module-test-plan` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode, corezilla |
| Created Date | `2026-10-10` |
| Last Modified Date | `2026-10-10` |
| Template ID | `tests.module-test-plan` |
| Template Version | `0.10.9` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/module/module-test-plan.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

> **编写建议**：本模板是模块层测试的**可执行作业指令**，与 design.definition（模块设计阶段）一一对应：执行者（含 Agent）按本计划从执行前检（§3）经逐 Case 作业（§9）到报告产出（§7）从头做到尾。计划只做索引与流程，不复制 Case、不预填执行结果。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。

> 本计划绑定单一软件模块

> 本文档对设计验证项（VRC/V-xxx）的引用规则：只引用 ID 与状态，不复制定义/判据；ENV 实例编号归 tests.asset-design，本计划编排 ENV 编号与 Case 分配时若变更设计须回溯修订并记录。：模块对象 ID 经 `--design-object-id` 写入 metadata；模块设计基线在 §2 固定。

### 模板定位：方案、用例、计划与报告的边界

> **编写建议**：本计划对应模块设计阶段。构成＝模块方案×1（tests.module-test-scheme）＋Case 文档×N（tests.module-case）＋单元计划引用与子系统交接；执行产出为 tests.module-test-report；单元层组织归 tests.unit-test-plan。

- **权威分工**：Case 清单归 `tests.module-test-scheme`；单 Case 展开归 `tests.module-case`（一 Case 一文档）；本计划是**可执行作业指令**——执行者（含 Agent）按它从执行前检做到报告产出；执行结果与 Verdict 权威在 `tests.module-test-report` 与 Run 证据。
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

> **本节目的**：固定模块层测试活动的范围与构成清单。
>
> **必须写清楚**：验证对象与不证明什么；构成＝模块方案×1＋Case 文档×N＋单元计划/子系统交接；排除项及 tailoring 依据。
>
> **抽象示例**：虚构 M101：方案 MTS-EXM v1.0 ＋ Case 文档 MT-EXM-001…003。
>
> **完成条件**：读者（含 Agent）能说清验证对象、构成清单和排除项；每个构成项指向方案、Case 文档或具名缺口。

#### 1.1 构成项 · 模块方案 ×1

**文档 / 入口（Document ID 或缺口）**：`module-test-scheme` v0.1.0-draft.1（`docs/70_verification/module/module-test-scheme.md`），覆盖 Piko 11 个直属模块（M000–M010）；方案 §6 登记 11 条 `MT-*-001` Case：`MT-BOOT-001`、`MT-TAPI-001`、`MT-POLICY-001`、`MT-REPO-001`、`MT-SCHED-001`、`MT-WORKER-001`、`MT-PI-001`、`MT-USAGE-001`、`MT-MATRIX-001`、`MT-OBS-001`、`MT-TRANSFER-001`；环境类型 `ENV-UNIT`（方案 §4.1）。

**覆盖责任摘要**：模块层 Case 清单与设计状态的唯一登记处；每条 Case 的来源是同名模块设计文档（`docs/40_module_design/piko-*-design.md`，`design.definition`）与其 VRC 集合。已核对的方案事实：11 条 Case 的设计状态全部为 `Gap`，原因统一为"逐 Case 文档未撰写"（方案 §7.1.5 裁决，Owner＝测试工程）。

**条目状态**：`Planned` —— 方案已生成并固定版本；因全部分母条目为 `Gap`，本计划按模块级 Case 粒度、以真实测试文件为执行依据编排（见 §10.1 的 `G-CASE-003`）。

#### 1.2 构成项 · Case 文档 ×N（按方案清单）

**文档 / 入口（Document ID 或缺口）**：逐 Case 的 `tests.module-case` 文档已撰写于 `docs/70_verification/module/cases/`（11 份 `.md`），实现状态统一为 `Implemented`（可执行入口见各文档 §1 总账）。

**覆盖责任摘要**：本轮以"一条 `MT-*-001` ＝ 一个模块公开入口契约"为粒度组织执行：§9.4 中每个模块组一条作业行，执行判据取方案 §2.1 的家族判定规则（断言模块公开行为、替身只挡边界依赖、缺断言即 `INVALID`）与 §6 的责任摘要；逐 Case 文档补齐后按同一 Case ID 追溯，已产生的 Run 不改判。

**条目状态**：`Blocked` —— 阻塞范围限于"逐 Case 文档级作业指令缺失"，不阻断以模块级粒度编排本轮执行；关闭条件与最晚 Gate 见 §10.1。

#### 1.3 构成项 · 测试资产 ×N（tests.asset-design，需开发时为工作项）

**文档 / 入口（Document ID 或缺口）**：`asset-design` v0.1.0-draft.1（`docs/70_verification/assets/asset-design.md`）；本层消费的资产 ID：`FAKE-LLM`、`FAKE-CLOCK`、`FAKE-MATRIX`、`FAKE-SCP`（方案 §3.1 登记替身形态为 `fake`，§4.1 的 `ENV-UNIT` 契约引用 `asset-design §3.1`）。

**覆盖责任摘要**：模块层边界依赖（LLMTier / Matrix / scp 对端 / 时钟）的契约 authority；本计划只用替身挡住边界，不 mock 模块自身公开接口，也不断言内部实现细节。已核对事实：`FAKE-LLM` 有实现（`tests/common/mock-llmtier.ts`）、`FAKE-SCP` 有实现（`scripts/datanode-env.sh`），`FAKE-CLOCK` 与 `FAKE-MATRIX` 尚无独立实现。

**条目状态**：`Blocked` —— `asset-design` §1–§7 仍为骨架，消费方索引、行为契约、自检 Run 与两层状态均未登记；测试工程补齐后 Step 0 方可放行（见 §10.1 的 `G-ASSET-001`）。

#### 1.4 构成项 · 相邻层交接出口

**文档 / 入口（Document ID 或缺口）**：`unit-test-plan` 与 `unit-test-scheme`（下层：函数/算法内部）；上层为 `system-test-scheme` 与 `system-test-plan`（跨模块端到端）。Piko 未实例化独立子系统层测试家族，故本层的下层交接出口是单元层、上层交接出口是系统层。

**覆盖责任摘要**：方案 §1 明确"不证明跨模块端到端流程（归 `tests.system-test-scheme`）"与"不证明函数级算法内部（归 `tests.unit-test-scheme`）"；单元层 PASS 不关闭本层模块契约，上层系统层 PASS 不关闭本层。

**条目状态**：`Planned` —— 交接口径固定为 ID 引用，三层各自独立出报告与 Gate。


## 2. 被测基线与变更重跑范围

> **本节目的**：固定模块层基线与变更→重跑映射。
>
> **必须写清楚**：设计文档与源码、依赖、构建环境版本；哪些变化触发哪些 Case 重跑；重跑生成新 Run 与新报告，不覆盖旧失败。
>
> **抽象示例**：虚构 M101：基线 EX-MODULE/v1；select_ids 签名变化→全部 Case 重跑，I3 实现变化→仅受影响 Case 复跑。
>
> **完成条件**：基线可核验；任一类变更能映射到明确重跑范围。

- **设计 / 源码 / 依赖基线**：设计基线＝11 个模块设计文档（`design.definition`，`docs/40_module_design/piko-{bootstrap,task-api,policy,task-repository,scheduler,worker,pi-adapter,usage,matrix-adapter,observability,transfer}-design.md`），上游父设计 `system-design` v0.12.0-draft.1，机器契约 `0.3.0-simplified.6`；源码基线分支 `docs/piko-system-design-std26`，被测 Pi 上游 `0.85.1` @ commit `9767ba27`。构建与执行环境：Node `>=22.19.0`、pnpm `11.19.0`；`npm run build` = `tsc -p tsconfig.json --noEmit`（TypeScript 5.9.3）；`npm test` = `vitest run`（vitest 4.1.9）；`npm run check` = tsc ＋ vitest ＋ `python3 tests/contract/validate_v03_contract.py`。模块层真实可执行入口为 `tests/unit/*.test.ts` 15 个文件 ＋ `tests/integration/transfer-scp.test.ts`（模块只在本机 `ENV-UNIT` 上跑，真实通道留给系统层）。

- **变更 → 重跑范围规则**：
  - 单个模块设计文档（`design.definition` §9 公开接口签名、§6/§7 内部流程或状态转换）变更 → 该模块对应 `MT-*-001` 全量重跑；若新增/删除 VRC，先改方案 §6 再改 Case 文档并同步本计划 §1.1 与 §4 分配。
  - 实现文档（`piko-*-impl.isd.md`）内部实现变更、公开入口未变 → 仅重跑该模块 Case；不得借单元层 PASS 上浮关闭模块层（方案 §"下层 PASS 不关闭本层"）。
  - 契约 `0.3.0-simplified.6` 或 `interfaces/schemas/` 变更 → 受影响模块 Case 重跑，并重跑 `python3 tests/contract/validate_v03_contract.py`。
  - 替身契约变更（`FAKE-LLM` / `FAKE-CLOCK` / `FAKE-MATRIX` / `FAKE-SCP`）→ 先更新 `asset-design`，再重跑引用该资产的全部模块 Case。
  - 依赖或工具链版本变化（Node / pnpm / TypeScript / vitest）→ 本层全量重跑。
  - 任一重跑生成新 Run ID 与新 `module-test-report` 实例，不覆盖旧失败证据（见 §6）。


## 3. 执行前检（Go / No-Go）

> **本节目的**：开始执行前逐项 Go/No-Go，全部通过才进入 §4 环境实例分配，再进入 §9 执行流程。
>
> **必须写清楚**：方案就绪度（清单无未登记缺口且版本固定）；Case 实现状态盘点（未 Implemented 的 Case 明确处理）；环境与工具（构建可用、依赖齐、权限具备）；构建接线（干净全量交付构建通过、消费者链接实际交付库、导出/注册项同步）；代码 review 通过（tests.code-review-checklist 全部必查项通过；Critical 未清零不得进入测试）；测试资产/数据版本对齐（与设计 §13 可冻结资产清单对账）。任一不满足记 Blocked 并登记缺口，不静默降级执行。
>
> **抽象示例**：虚构 MT-EXM：组装目标可链接、4 个 Case 全 Implemented 才 Go。
>
> **完成条件**：每一前检项有可判定事实；No-Go 有出口（Blocked＋缺口）。

> ENV 状态统一字段：§3「环境与工具」前检与 §9 Step 0/1 共享同一个"ENV 状态"变量——§3 判定 Go/No-Go 后 ENV 状态置为 Ready/Blocked；§9 Step 0/1 按 §4 分配构建 ENV 实例、跑 assets 自检与环境检查；§7 报告产出读取此 ENV 状态字段；不要在 §3 与 §9 重复定义同义词。

#### 3.1 前检项 · 方案就绪度

**判定事实**：`module-test-scheme` v0.1.0-draft.1 §6 为 11 条 `MT-*-001` 逐条登记了来源 ID、VRC 集合、分类、优先级与设计状态；§2.1 给出 `module-contract` 家族的判定规则，§4.1 给出环境类型 `ENV-UNIT`，§7 给出 `Tailored-N/A` 与 `Gap` 裁决及 Owner。已核对：11 条 Case 的设计状态全部为 `Gap`（逐 Case 文档未撰写），无未登记缺口。

**通过条件**：方案版本已固定（v0.1.0-draft.1）且与 §2 基线一致；11 条 Case 全部有设计状态与来源 ID；每条 `Gap` 在方案 §7 有具名 Owner 与恢复条件。分母条目为 `Gap` 不阻塞本轮"按模块级粒度"的执行编排，但必须在 §10.1 有主有期限。

**不满足时**：记 `Blocked`，把新增缺口按 `G-*` 编号登记到 §10.1 并通知测试工程；方案升版本后必须同步本计划 §1.1 与 §4 分配再重走本前检，不在旧版本上继续。

#### 3.2 前检项 · Case 实现状态盘点

**判定事实**：`tests.module-case` 文档已存在（`docs/70_verification/module/cases/`，11 份）；已核对的模块↔测试文件映射：`MT-BOOT-001` ← `tests/unit/config-schema.test.ts`、`config.test.ts`、`core.test.ts`；`MT-TAPI-001` ← `tests/unit/server.test.ts`；`MT-POLICY-001` ← `tests/unit/workspace.test.ts`；`MT-REPO-001` ← `tests/unit/store.test.ts`；`MT-SCHED-001` ← `tests/unit/p-input.test.ts`（P-INPUT pre-slot gating 段）；`MT-WORKER-001` ← `tests/unit/worker.test.ts`、`worker-runtime.test.ts`、`tool-recovery.test.ts`；`MT-PI-001` ← `tests/unit/pi-runtime.test.ts`、`provider-preflight.test.ts`、`responses-replay.test.ts`；`MT-USAGE-001` ← `tests/unit/worker.test.ts`（usage aggregation 段）、`model-mapping.test.ts`；`MT-MATRIX-001` ← `tests/unit/matrix.test.ts`；`MT-TRANSFER-001` ← `tests/integration/transfer-scp.test.ts` ＋ `p-input.test.ts`（P-ARTIFACT 段）。**`MT-OBS-001` 已有专属可执行入口**——`tests/unit/observability.test.ts`（新增，含 envelope/指标语义/audit/脱敏/fail-open/有界快照），并在 `server.test.ts` 补 `GET /diagnostics` 端到端段。

**通过条件**：本轮要执行的每条 Case 都能指向至少一个可执行入口（文件路径 ＋ vitest 选择器），且该入口在本轮 Run 记录中出现；指不到入口的 Case 记 `NOT_RUN` 并登记原因，不得从清单消失。

**不满足时**：该 Case 记 `Blocked`，Owner 测试工程。`MT-OBS-001` 的"缺专属入口"已关闭——新增 `tests/unit/observability.test.ts`（9 例，覆盖 `VRC-OBS-001..004`）与 `tests/unit/server.test.ts` 的 `GET /diagnostics` 端到端段。

#### 3.3 前检项 · 环境与工具（引用 tests.asset-design 的 Verified 状态）

**判定事实**：`ENV-UNIT` 为纯内存环境（真模块逻辑 ＋ 真 SQLite 内存库 ＋ 边界替身），入口 `npm test`；Matrix 侧环境入口 `scripts/scenario-env.sh`（产物 `~/piko-matrix-homeserver/room-scenario.json`）与 `scripts/scenario-seeds.sh`。`asset-design` §6 目前未登记任何资产的两层状态与自检 Run，方案 §4.1 引用的 `asset-design §3.1` 尚未成文。

**通过条件**：本轮消费的每个资产在 `asset-design` §6 为 `Implemented` ＋ `Verified` 且有自检 Run 引用；`npm run check` 退出码为 0；ENV-2（Matrix）在其被分配 Case 执行前完成 `scripts/scenario-env.sh` 就绪判定。

**不满足时**：ENV 状态置 `Blocked`，§9 Step 0 停止，不进入 Case 执行；缺口登记为 `G-ASSET-001`（Owner 测试工程）。禁止把"用例文件存在"或"某个 suite 被 skip"当作环境就绪。

#### 3.4 前检项 · 构建接线（全量交付构建 / 消费者链接实际库）

**判定事实**：交付构建门为 `npm run build`（`tsc -p tsconfig.json --noEmit`）；测试消费者链接由 `vitest.config.ts` 的 `resolve.alias` 完成（`@earendil-works/pi-*`、`@earendil-works/chord`、`typebox*` 全部指向 `upstream/pi/` 实际 vendored 源码），模块测试经 `src/**` 加载真实模块实现；契约一致性由 `tests/contract/validate_v03_contract.py` 校验。

**通过条件**：干净工作区下 `npm run check` 退出码为 0，且 `validate_v03_contract.py` 返回 0；alias 指向的路径在基线 commit 上确实存在，`tests/unit/*.test.ts` 导入的模块符号确实解析到 `src/**` 而非替身。

**不满足时`：记 `Blocked` 并登记构建缺口；不得跳过 tsc 或跳过契约校验降级执行，也不得把 alias 改指替身实现来"通过"链接检查。


## 4. 环境实例分配（plan 编排）

> **本节目的**：把方案 §4 的环境类型落实为具体的**实例编号**，并分配给具体 Case——同一类型可多套（如多 docker 用于并行），编号与分配是 plan 的责任，Case 只引用编号。
>
> **必须写清楚**：列出本计划分配的全部 ENV 实例（编号 + 类型 + 具体配置/位置 + Owner + 分配给哪些 Case + 准备时限 + 状态）；ENV 实例类型与方案 §4 类型一致；准备失败标 Blocked 并登记缺口，不静默换其他实例。
>
> **抽象示例**：见本节 example 围栏示例）。
>
> **完成条件**：方案 §6 Case 清单中的每个 Case 在本登记有 ENV 实例；类型一致；准备未完成标 Blocked 并登记缺口，不静默换实例。

#### 4.1 ENV · ENV-1 / ENV-2

**环境类型**：`ENV-UNIT`（方案 §4.1：真模块 ＋ 真 SQLite 内存库 ＋ 边界 fake）

**具体配置/位置**：仓库工作区根目录；真模块经 `src/**` 加载，SQLite 用 `node:sqlite`（`DatabaseSync`，内存库），边界用 `FAKE-LLM`（`tests/common/mock-llmtier.ts`）与共享夹具 `tests/common/fixtures.ts`；入口 `npm test`（vitest 4.1.9）

**Owner**：测试工程

**分配给哪些 Case**：`MT-BOOT-001`、`MT-TAPI-001`、`MT-POLICY-001`、`MT-REPO-001`、`MT-SCHED-001`、`MT-WORKER-001`、`MT-PI-001`、`MT-USAGE-001`、`MT-OBS-001`、`MT-TRANSFER-001`

**准备时限**：§9 阶段门 1 进入前

**状态**：`Ready`（计划期判定：纯内存、无外部系统依赖；正式状态以 §3 前检与 §9 Step 1 的记录为准）

---

**环境类型**：`ENV-UNIT` ＋ Matrix 外部系统（替身 ID `FAKE-MATRIX` 所指的真实本地 Synapse 场景房）

**具体配置/位置**：`scripts/scenario-env.sh` 以 `MATRIX_BASE` 建专用场景房（`@piko-bot` power_level 0，可被 admin 撤销 membership）并写 `~/piko-matrix-homeserver/room-scenario.json`；`scripts/scenario-seeds.sh` 铺种子；入口 `npx vitest run tests/unit/matrix.test.ts`（默认套件内串行）

**Owner**：测试工程

**分配给哪些 Case**：`MT-MATRIX-001`

**准备时限**：§9 阶段门 3 进入前

**状态**：`Blocked`（就绪条件＝本地 Synapse 可达且场景房建成；条件未满足时 `MT-MATRIX-001` 按 §9 的 BLOCKED 路径记录，并引用方案 §7 对 Matrix 链路的 Gap 裁决）

## 5. 环境操作（搭建 / 复位 / 隔离 / 清理）

> **本节目的**：环境操作可复现。
>
> **必须写清楚**：搭建、每 Case 复位、并行隔离键、清理的具体命令或入口；环境不可重建即 Blocked；单环境串行时写清 case 前检查、软复位/重启/驱动恢复阶梯与时限，失败后确认回到基线，不能只 kill 后继续。
>
> **抽象示例**：虚构 MT-EXM：每 Case 新建输入数组天然复位。
>
> **完成条件**：另一位执行者能独立搭建、复位与清理。

- **环境搭建与复位操作**：
  - ENV-1：`npm run build` 后 `npm test`；每条 `MT-*-001` 用单文件 vitest 选择器收窄（如 `npx vitest run tests/unit/store.test.ts`），必要时再叠加 `-t "<describe 名>"`。每 Case 复位＝新建该 Case 的内存库/临时库句柄并重建替身实例，不复用上一 Case 的库与单例。
  - ENV-2：`scripts/scenario-env.sh` 建房 → `scripts/scenario-seeds.sh` 铺种子 → `npx vitest run tests/unit/matrix.test.ts`；每 Case 新建独立场景房，不复用已改过 membership 的房间。
  - `MT-TRANSFER-001` 在 ENV-1 上先用 `tests/integration/transfer-scp.test.ts`（无外部对端的部分覆盖）；需要真实 scp 对端时属系统层 ENV-2，本层不代跑。

- **隔离键与清理**：
  - ENV-1 隔离键：每 Case 的内存库/临时库句柄 ＋ `tests/common/` 中该 Case 实例化的替身对象（不共享全局单例）。
  - ENV-2 隔离键：场景房 `room_id`（`room-scenario.json`）＋ 三个测试身份（`ben`、`second-user`、`piko-bot`）。
  - 清理：ENV-1 删除本轮临时库与工作区产物；ENV-2 退房/删房并移除该 json；Matrix token 只从 `~/piko-secrets/matrix-piko-bot` 读取、不复制进证据目录。
  - 证据目录 `var/verification/module/<Run ID>/` 不随环境清理删除。

- **复位阶梯与时限（软复位→重启→驱动恢复）**：
  - 一级 软复位（≤2 分钟）：重跑单文件选择器；失败即进二级，不得连续重试同一入口。
  - 二级 重启（≤10 分钟）：`npm run build && npm test` 全量重跑；退出码 0 才算回到基线。
  - 三级 驱动恢复（≤5 分钟）：ENV-2 重建场景房并重跑 `scripts/scenario-env.sh`。
  - 每级完成后都要留下"已回基线"的事实记录，不能只 kill 进程后继续；超时未回基线即按 §9 的 BLOCKED 路径停止本层执行并登记缺口。

## 6. 证据与 Run 记录规则

> **本节目的**：Run 证据规则固定。
>
> **必须写清楚**：Run ID 命名（对象-时间或序号）、每次 Run 保存的命令/版本/stdout/退出码/种子、保存位置与保留期、脱敏要求；重跑生成新 Run 不覆盖。
>
> **抽象示例**：虚构 MT-EXM：run-⟨日期⟩-⟨序号⟩。
>
> **完成条件**：从报告任一 Verdict 能定位唯一 Run 与原始证据。

- **Run ID 规则与证据位置**：`mt-run-<YYYYMMDD>-<NN>`（例：`mt-run-20261010-01`）。一个 Run ＝ 一次 `npm test` 的全量或按模块文件选择器的执行；原始证据落 `var/verification/module/<Run ID>/`（命令原文、stdout/stderr、退出码、环境版本），报告任一 Verdict 可反查到唯一 Run 与该目录。重跑生成新 Run ID 与新目录，旧失败证据只读保留、不得覆盖。

- **保存内容与脱敏要求**：每次 Run 保存执行命令原文、被测模块 ID（`M000`–`M010`）与对应 `MT-*-001`、基线 commit、Node/pnpm/vitest/TypeScript 版本、被测 ENV 实例编号、完整 stdout 与 stderr、进程退出码；ENV-2 另存场景房 `room_id` 与房间准备命令。保留期：本层 Gate 关闭后 90 天。脱敏：Matrix access token（`~/piko-secrets/matrix-piko-bot`、`users.json`）与任何凭据只记存在性与指纹、不落明文；stdout 出现明文凭据即判该 Run 证据 `INVALID`，另出脱敏副本并保留原文件为受限证据。

## 7. 报告产出与 Gate 规则

> **本节目的**：定义报告产出与 Gate 规则。
>
> **必须写清楚**：全部 Case 走完后（或按出口准则提前结束）生成 `tests.module-test-report` 实例；Gate 建议规则（覆盖闭合或缺口有主、失败分级）在此固定，报告只按规则给建议不越权批准。> 失败降级路径：plan 整体 BLOCKED（环境性）→ 该轮不生成 report 实例，只记缺口与原因；plan 部分 Case 失败 → 仍生成 report（含 FAIL/INVALID 完整记录），后续报告生成失败（new-design 等）→ 不掩盖 FAIL，复现状态与修复状态分开记录。
>
> **抽象示例**：虚构 MT-EXM：全部走完后生成报告；Gate＝分母闭合且 G-EX-1 有主。
>
> **完成条件**：报告的生成时机、模板与 Gate 规则确定。

- **报告生成时机与模板**：全部 11 条 Case 走完（或按出口准则提前结束）后生成 `module-test-report` 实例（`docs/70_verification/reports/module-test-report.md`，模板 `tests.module-test-report`），按 §6 的 Run 记录汇总 Verdict。降级路径：plan 整体环境性 `BLOCKED` → 该轮不生成 report 实例，只在 §10.1 记缺口与原因；部分 Case 失败仍生成 report（含 `FAIL`/`INVALID` 完整记录）；报告生成工具本身失败时，复现状态与修复状态分开记录，不掩盖 `FAIL`。

- **Gate 建议规则**：Gate ＝ 全部处于 `Implemented` 的 Case 均 `PASS` 且无未关闭 Gap → 建议 pass；任一 Case `FAIL` → 建议 not pass；`BLOCKED` 单独列出——既不计入 pass 也不隐藏，且每条 `BLOCKED` 必须对应 §10.1 中有主有期限的缺口。方案 §6 中 11 条 `Gap` 状态的设计条目（逐 Case 文档缺失）不参与 pass 判定，但其关闭进度须在报告单列。报告只按本规则给建议，不越权批准。

## 8. 责任、排期与风险

> **本节目的**：责任到人、风险有触发与缓解出口。
>
> **必须写清楚**：方案维护、Case 编写、执行、评审的责任人与时间窗；风险写触发条件、影响与缓解，不写“重试即可”。
>
> **抽象示例**：设计＝模块 Owner、执行＝QA 或 Agent、评审＝模块设计评审。
>
> **完成条件**：每个构成项有责任人与时间窗；关键风险有可判定触发。

#### 8.1 风险 · 11 条 MT Case 全为 Gap，执行判据无 Oracle 权威

**时间窗 / 最晚 Gate**：§9 阶段门 1 之前须确认判据来源；最晚 Gate＝本轮 `module-test-report` 产出前完成首轮 `G-CASE-003` 拆分。

**冲突或缓解出口**：触发条件＝方案 §6 的 11 条 Case 设计状态全为 `Gap`，本层没有任何 `Designed` 条目——执行者面对"模块公开入口"这一责任摘要时缺少统一的 Oracle 与断言点来源，容易各写各的判据、导致 Run 之间不可比。缓解：执行判据只取方案 §2.1 的 `module-contract` 家族规则（公开入口黑盒 ＋ 边界替身 ＋ 状态转换/错误路径驱动 ＋ 缺断言即 `INVALID`）与 §2.2 的家族选型（boundary/negative/concurrency/recovery/security 各有技术），Run 记录必须逐条写明所用测试文件与断言点；拆分完成后按同一 `MT-*-001` ID 同步 §9.4 与 §1.2 构成表。

---

**时间窗 / 最晚 Gate**：风险"`MT-OBS-001`（MM009 observability）无可执行入口"——§9 阶段门 3 之前；最晚 Gate＝本轮报告产出前。

**冲突或缓解出口**：`tests/unit/` 没有 observability 专属测试文件，若用 `server.test.ts` 的 error containment 段冒充观测覆盖，会把"错误收口"误报为"结构化事件/指标/审计可诊断"。缓解：`MT-OBS-001` 记 `NOT_RUN` 并在 Run 记录中写明"无专属入口"；该缺口并入 `G-CASE-003` 的关闭条件——拆分时必须为 observability 模块给出可执行入口，或按方案 §7 记为具名 Gap。

---

**时间窗 / 最晚 Gate**：风险"`asset-design` 仍为骨架，替身无 `Verified` 状态"——§9 Step 0；最晚 Gate＝阶段门 1 进入前。

**冲突或缓解出口**：`FAKE-CLOCK` 与 `FAKE-MATRIX` 无独立实现，"边界已挡住"无法证明，`MT-SCHED-001`/`MT-MATRIX-001` 的时间与 membership 判据可能建立在真实外部系统上。缓解：Step 0 把就绪判据固化为两份可执行事实（替身自检 ＋ `npm run check` 退出码 0），在 `asset-design` §6 登记前一律按 `Blocked` 处理；不得以产品 Case 的表现反推资产已 `Verified`。

---

**时间窗 / 最晚 Gate**：风险"方案缺口编号与本计划不一致"——本计划编写时；最晚 Gate＝§9 阶段门 1 之前。

**冲突或缓解出口**：`module-test-scheme` §6 与 §7.1.5 曾写作 `G-CASE-002`，与系统层方案同号；编号已统一为 `G-CASE-003`，跨层引用不再歧义。

## 9. 执行流程（逐 Case 作业序列）

> **本节目的**：给执行者（含 Agent）一条从头到尾的作业序列。

> 失败处理与收口（在本流程图内统一）：FAIL → 保留首个失败现场 + 保留 Run 证据 + 禁止重跑覆盖原始失败 → 登记缺陷并关联 Case ID；BLOCKED → 标记环境性阻塞 + 整个 §9 执行流程停止 + 登记缺口 + 不静默换工具链；INVALID → 标记该 Case 注入未命中 + 复现状态与修复状态分开记录 → 不允许仅靠"重跑通过"掩盖；NOT_RUN → 标记未执行 + 登记原因（不在方案 §6 清单中静默消失）。
> **必须写清楚**：头尾工序固定——Step 0 资产就位（测试资产准备：按消费索引构建全部依赖资产并自检，不过即环境性 Blocked、不进 Case 执行）、Step 1 测试环境搭建与检查（按 §4 分配、§5 操作使 ENV 就绪）、收尾先清理回基线、再按 §7 的时机与 Gate 规则生成报告；中段由作者按方案清单优先级逐 Case 填充：定位 Case 文档→按其 §2–§7 前检与运行→判定分路（PASS/FAIL/BLOCKED/INVALID 各有明确出口与下一步）→记录 Run→继续，可按阶段门（最小真实链→规模控制面→完整业务→恢复/全量回归）拆分为多行；失败不阻断后续 Case，除非环境性阻塞。
>
> **抽象示例**：虚构 MT-EXM：P0 的 002 先行；失败不阻断容量上限组。
>
> **完成条件**：执行者不需要临场发明流程；每个分路有确定下一步。

#### 9.1 Step · 0

**动作**：资产就位（测试资产准备）：按消费索引构建全部依赖测试资产并运行自检；自检不过＝环境性 Blocked，不进入 Case 执行

**输入 / 依据**：`asset-design` v0.1.0-draft.1 —— §1 消费方索引（本计划 §1.3）、§2 行为契约（`FAKE-LLM`/`FAKE-CLOCK`/`FAKE-MATRIX`/`FAKE-SCP`）、§5 自检用例、§6 两层状态；实现入口 `tests/common/mock-llmtier.ts`、`tests/common/fixtures.ts`、`scripts/datanode-env.sh`

**产出**：`var/verification/module/assets-ready-<YYYYMMDD>.md` 就绪清单——逐资产记开发状态、验证状态与自检 Run 引用；清单中缺任一 `Verified` 即本 Step 判环境性 `Blocked`，不进入 §9.4 的 Case 执行

#### 9.2 Step · 1

**动作**：测试环境搭建与检查：按 §5 操作搭建/复位 §4 分配的 ENV 实例并确认就绪

**输入 / 依据**：本计划 §4（ENV-1 / ENV-2 的类型与 Case 分配）＋ §5（`scripts/scenario-env.sh`、`scripts/scenario-seeds.sh` 的搭建与清理命令）

**产出**：ENV 状态判定记录——ENV-1 记 `Ready`（依据 `npm run build && npm test` 可运行）；ENV-2 记 `Ready`/`Blocked` 并附场景房 `room_id` 或缺口编号。ENV 状态字段是本计划 §3、§7 共用的同一变量。

#### 9.3 Step · 2

**动作**：读取方案清单并按优先级排序

**输入 / 依据**：`module-test-scheme` v0.1.0-draft.1 §6（11 条 `MT-*-001`，含分类、优先级与设计状态）与 §2.1 家族判定规则

**产出**：执行队列＝按模块依赖顺序（M000 bootstrap → M001 task-api → M002 policy → M003 repository → M004/M005 → M006/M007 → M008/M009/M010）排序的条目，每条＝`MT-*-001` ＋ 可执行入口（文件＋vitest 选择器）＋ ENV 实例编号 ＋ 对应 VRC 区间；`Gap` 状态的 Case 进队列但预置为 `BLOCKED` 占位，不删除。

#### 9.4 Step · 3

**动作**：Step 3 — 引导与控制面组（ENV-1）：逐 Case 定位 → 按方案 §2.1 的公开入口黑盒规则运行 → 记录 Run。覆盖 `MT-BOOT-001`（`tests/unit/config-schema.test.ts`、`config.test.ts`、`core.test.ts`）、`MT-TAPI-001`（`server.test.ts`）、`MT-POLICY-001`（`workspace.test.ts`）、`MT-REPO-001`（`store.test.ts`）；断言点＝正常路径返回、边界语义、拒绝路径抛错码三类各至少一处。

**输入 / 依据**：`module-test-scheme` §6 对应 Case 行 ＋ §2.1 `module-contract` 判定规则；本计划 §4 ENV-1 与 §3.2 的入口映射

**产出**：每条 Case 一个 Run 记录（`PASS`/`FAIL`/`BLOCKED`/`INVALID`/`NOT_RUN` 之一）＋ 对应 `var/verification/module/<Run ID>/` 证据目录

---

**动作**：Step 4 — 执行与适配组（ENV-1）：覆盖 `MT-SCHED-001`（`p-input.test.ts` 的 P-INPUT pre-slot gating 段）、`MT-WORKER-001`（`worker.test.ts`、`worker-runtime.test.ts`、`tool-recovery.test.ts`）、`MT-PI-001`（`pi-runtime.test.ts`、`provider-preflight.test.ts`、`responses-replay.test.ts`）、`MT-USAGE-001`（`worker.test.ts` 的 usage aggregation 段、`model-mapping.test.ts`）。按方案 §2.2 用"状态机驱动 + 固定交错"验证 cancel 与执行的单 slot 语义，不用无种子随机并发。

**输入 / 依据**：`module-test-scheme` §6 对应 Case 行 ＋ §2.2 `concurrency`/`recovery` 家族选型；本计划 §4 ENV-1

**产出**：逐 Case Run 记录 ＋ `mt-run-<日期>-<NN>` 证据目录

---

**动作**：Step 5 — 数据面与观测组（ENV-1）：覆盖 `MT-TRANSFER-001`（`tests/integration/transfer-scp.test.ts` ＋ `p-input.test.ts` 的 P-ARTIFACT 段：输入校验、`sha256` 校验、投递幂等）；`MT-OBS-001` 无专属入口时记 `NOT_RUN` 并引用 §8.1 的风险条目，不得用 `server.test.ts` 的 error containment 段冒充观测覆盖。

**输入 / 依据**：`module-test-scheme` §6 对应 Case 行 ＋ §2.3"数据面/恢复"适用性登记；本计划 §3.2

**产出**：逐 Case Run 记录或 `NOT_RUN` 记录（含"无专属入口"的事实说明）

---

**动作**：Step 6 — 边界替身组（ENV-2）：`scripts/scenario-env.sh` ＋ `scripts/scenario-seeds.sh` → `npx vitest run tests/unit/matrix.test.ts`，覆盖 `MT-MATRIX-001`（Matrix 稳定发送与 discussion prompt 投影）；ENV-2 未 `Ready` 时记 `BLOCKED`，禁止改连生产 homeserver。

**输入 / 依据**：`module-test-scheme` §3.1 替身登记 ＋ §7 Matrix 链路裁决；本计划 §4 ENV-2 与 §5

**产出**：Run 记录或 `BLOCKED` 记录 ＋ ENV-2 就绪事实（场景房 `room_id` 或缺口编号）

---

**动作**：Step 7 — 逐 Case 判定分路（贯穿 Step 3–6）：`PASS` → 记 Run 并继续；`FAIL` → 保留首个失败现场与 Run 证据、登记缺陷并关联 Case ID、禁止重跑覆盖；`INVALID` → 记录替身/断言未命中事实、复现状态与修复状态分开；`BLOCKED` → 标记环境性阻塞并停止后续 Case；`NOT_RUN` → 记原因，不从方案 §6 清单中消失。

**输入 / 依据**：本计划 §7 的 Gate 规则与 §6 的 Run 规则

**产出**：完整的 Run 集合，供 §9.5 清理与 §9.6 报告生成引用

#### 9.5 Step · N+1

**动作**：环境清理与基线恢复：按 §5 执行清理；保留全部 Run 证据，不覆盖旧失败

**输入 / 依据**：本计划 §5（场景房删除、`var/` 下本轮环境产物清理）

**产出**：ENV-1/ENV-2 回到基线的事实记录（`npm run check` 退出码 0、场景房已删、临时库已清理）＋ `var/verification/module/<Run ID>/` 证据落位确认；旧失败 Run 目录保持只读不删

#### 9.6 Step · N+2

**动作**：生成测试报告：按 §7 的时机与 Gate 规则汇总本轮全部 Run 结果

**输入 / 依据**：本计划 §7（生成时机、模板与 Gate 规则）＋ §6 的全部 Run 记录

**产出**：`module-test-report` 实例（`docs/70_verification/reports/module-test-report.md`）——逐 Case Verdict、`BLOCKED`/`NOT_RUN` 单列、Gate 建议结论；报告只给建议，不越权批准

#### 9.7 阶段门 · 1 最小真实链

**目的**：验最小真实链在单模块边界内成立——启动与配置解析（M000）→ 任务受理（M001）→ 授权判定（M002）→ 状态持久化（M003）四个模块各自能在真模块 ＋ 内存 SQLite 上被独立调用并返回可断言结果，不依赖任何外部系统。

**进入条件**：Step 0 资产就位清单齐、Step 1 记 ENV-1 ＝ `Ready`；`MT-BOOT-001`、`MT-TAPI-001`、`MT-POLICY-001`、`MT-REPO-001` 四条各已有一条 Run 记录（`PASS`/`FAIL`/`BLOCKED`/`INVALID`/`NOT_RUN` 之一，不允许缺记录）。

#### 9.8 阶段门 · 2 规模控制面

**目的**：验执行侧的规模与隔离语义——单实例单 slot 的准入与占用（M004）、终态与部分产出（M005）、cancel 与执行的固定交错可确定性复现，且 `tests/unit/p-input.test.ts` 中"P0 abort 命令到达 P1 而不只落库标志"的跨模块协作断言可在本层归位。

**进入条件**：`MT-SCHED-001`、`MT-WORKER-001` 均有 Run 记录或 `BLOCKED` 记录；ENV-1 保持 `Ready` 且上一阶段的临时库已清理（保证单 slot 语义不被上一 Case 的残留占用污染）。

#### 9.9 阶段门 · 3 完整业务

**目的**：验适配与边界依赖下的模块公开行为——Pi 适配的 provider preflight 与 Responses 历史重放（M006）、usage 聚合与模型映射（M007）、Matrix 稳定发送（M008）、transfer 的输入校验/`sha256`/投递幂等（M010）；观测模块（M009）在本阶段门只做缺口确认，不以替代断言充数。

**进入条件**：`MT-PI-001`、`MT-USAGE-001`、`MT-TRANSFER-001` 有 Run 记录或 `BLOCKED`/`NOT_RUN` 记录；`MT-MATRIX-001` 已给出 ENV-2 就绪事实（场景房 `room_id` 或 `scripts/scenario-env.sh` 的失败输出）或已按 §10.1 登记缺口；`MT-OBS-001` 已按 §8.1 记 `NOT_RUN` 并写明无专属入口。

#### 9.10 阶段门 · 4 恢复 / 全量回归

**目的**：验恢复路径与环境复位——工具写入失败后的工作区回收（`tool-recovery.test.ts`）与 worker 终态语义不靠"重试"掩盖；Matrix 场景房清理后不留残留；干净工作区下全层回归回到基线。

**进入条件**：Step 4–6 的 Run 记录齐备或已记 `BLOCKED`/`NOT_RUN` 及原因；§5 清理已完成（场景房已删、临时库已清理）；`npm run check` 在清理后退出码为 0，作为"已回基线"的判定事实。


- **失败（FAIL）处理路径**：保留首个失败现场（进程状态、日志、`var/verification/module/<Run ID>/` 原始输出）→ 在报告中登记缺陷并关联 Case ID、模块 ID（`M000`–`M010`）与 VRC 区间 → 禁止用重跑覆盖原始失败：修复后重跑必须分配新 Run ID，新旧 Run 并存并在报告中注明"修复后重跑" → 继续执行后续 Case（普通失败不阻断）；环境性阻塞按下一条处理。

- **阻塞/无效（BLOCKED/INVALID）处理路径**：`BLOCKED` → 标记为环境性阻塞 → 停止整个 §9 执行流程 → 在 §10.1 登记缺口编号与 Owner → 不静默换工具链、不静默换 ENV 实例、不改连非预期 homeserver 充当等价覆盖。`INVALID` → 标记该 Case 的替身或断言未命中（如 `FAKE-LLM` 断言未触发、模块被 skip）→ 复现状态与修复状态分开记录，不允许仅靠"重跑通过"掩盖。`NOT_RUN` → 标记未执行并写明原因（如 `MT-OBS-001` 无专属入口），不得从方案 §6 清单中静默消失。

## 10. 未决项

> **本节目的**：未决项有主、有期限、有关闭条件。
>
> **必须写清楚**：逐条登记；无未决项时写经核对的“无”。
>
> **抽象示例**：G-EX-1 宿主并发准入未定义。
>
> **完成条件**：未决项全部有主有期限。

#### 10.1 未决 · 无（本层全部关闭）

**已关闭项**：

- `G-CASE-003`（模块用例集未撰写）：**已关闭**。`docs/70_verification/module/cases/` 下 11 份 `tests.module-case` 文档全部撰写完成，方案 §6 的 11 条 Case 状态已由 `Gap` 转为 `Implemented`。
- `G-CASE-002`（编号与系统层同号歧义）：**已关闭**。全库统一为 `G-CASE-003`，跨层引用不再歧义。
- `G-ASSET-001`、`G-MATRIX-001`、`G-SCHEMA-001`：**已关闭**，关闭方式见 `asset-design` 与 `notes/interface-derivation.md` §11。
- `MT-OBS-001` 缺专属入口：**已关闭**。新增 `tests/unit/observability.test.ts`（9 例，覆盖 `VRC-OBS-001..004`）并在 `tests/unit/server.test.ts` 补 `GET /diagnostics` 端到端段。

**当前状态**：本计划无未决项；执行结果与 Verdict 见 `module-test-report`。

