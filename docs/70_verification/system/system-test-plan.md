<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko system-test-plan

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `system-test-plan` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode, corezilla |
| Created Date | `2026-10-10` |
| Last Modified Date | `2026-10-10` |
| Template ID | `tests.system-test-plan` |
| Template Version | `0.10.11` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/system/system-test-plan.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

> **编写建议**：本模板是系统层测试的**可执行作业指令**，与 design.software-system（系统设计阶段）一一对应：执行者（含 Agent）按本计划从执行前检（§3）经逐 Case 作业（§9）到报告产出（§7）从头做到尾。计划只做索引与流程，不复制 Case、不预填执行结果。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。

> 本计划绑定软件系统

> 本文档对设计验证项（VRC/V-xxx）的引用规则：只引用 ID 与状态，不复制定义/判据；ENV 实例编号归 tests.asset-design，本计划编排 ENV 编号与 Case 分配时若变更设计须回溯修订并记录。：父设计 Document ID 经 `--parent-document-id` 写入 metadata；系统设计基线在 §2 固定。

### 模板定位：方案、用例、计划与报告的边界

> **编写建议**：本计划对应系统设计阶段。构成＝系统方案×1（tests.system-test-scheme）＋Case 文档×N＋子系统计划×N 引用＋验收交接（tailoring 承接）；执行产出为 tests.system-test-report；子系统层组织归 tests.subsystem-test-plan。

- **权威分工**：Case 清单归 `tests.system-test-scheme`；单 Case 展开归 `tests.system-case`（一 Case 一文档）；本计划是**可执行作业指令**——执行者（含 Agent）按它从执行前检做到报告产出；执行结果与 Verdict 权威在 `tests.system-test-report` 与 Run 证据。
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

> **本节目的**：固定系统层测试活动的范围与构成清单。
>
> **必须写清楚**：验证对象与不证明什么；构成＝系统方案×1＋Case 文档×N＋子系统计划引用＋验收交接。
>
> **抽象示例**：虚构 EX-APP：方案 TSS-APP v1.0 ＋ Case 文档 ST-APP-001…005 ＋ 子系统计划 STP-DIR。
>
> **完成条件**：读者（含 Agent）能说清验证对象、构成清单和排除项；每个构成项指向方案、Case 文档或具名缺口。

#### 1.1 构成项 · 系统方案 ×1

**文档 / 入口（Document ID 或缺口）**：`system-test-scheme` v0.1.0-draft.1（`docs/70_verification/system/system-test-scheme.md`），绑定父设计 `system-design` v0.12.0-draft.1；方案 §6 登记 21 条 `ST-*` Case（`ST-APP-001..006`、`ST-SEC-001`、`ST-DATA-001..005`、`ST-PROC-001/002`、`ST-EXEC-001`、`ST-REC-001`、`ST-LLM-001/002`、`ST-MX-001`、`ST-OBS-001`、`ST-OPS-001`）。

**覆盖责任摘要**：系统层 Case 清单与设计状态（`Designed` / `Gap`）的唯一登记处；本计划只引用方案版本与 Case ID，不复制清单与 Case 细节。已核对的方案事实：21 条中 18 条 `Designed`、3 条 `Gap`（`ST-LLM-002` / `ST-MX-001` / `ST-OBS-001`），三条 Gap 均在方案 §7 有具名 Owner。

**条目状态**：`Planned` —— 方案已生成并固定版本，待评审；本计划按该版本编排执行队列。

#### 1.2 构成项 · Case 文档 ×N（按方案清单）

**文档 / 入口（Document ID 或缺口）**：逐 Case 的 `tests.system-case` 文档尚未撰写——`docs/70_verification/system/` 下当前只有方案与本计划；具名缺口 `G-CASE-002`（方案 §7.1.5 裁决，Owner＝测试工程）。

**覆盖责任摘要**：本轮以模块级 Case 粒度组织执行：§9.4 中每条 `ST-*` Case 各占一条作业行，直接引用方案 §6 的责任摘要与 §2.1 的判定规则作为执行判据；逐 Case 文档补齐后按同一 Case ID 追溯，已产生的 Run 不改判。

**条目状态**：`Blocked` —— 阻塞范围限于"逐 Case 文档级作业指令缺失"，不阻断以模块级粒度编排本轮执行；关闭条件与最晚 Gate 见 §10.1。

#### 1.3 构成项 · 测试资产 ×N（tests.asset-design，需开发时为工作项）

**文档 / 入口（Document ID 或缺口）**：`asset-design` v0.1.0-draft.1（`docs/70_verification/assets/asset-design.md`）；本层消费的资产 ID：`FAKE-LLM`、`FAKE-CLOCK`、`FAKE-MATRIX`、`FAKE-SCP`。

**覆盖责任摘要**：替身与外部环境契约的唯一 authority（方案 §3.1、§4.1 分别引用 `asset-design §3.1` 与 `§3.4`）；§9 Step 0 只接受 `Verified` 资产进入 Case 执行。已核对事实：`FAKE-LLM` 有实现（`tests/common/mock-llmtier.ts`）、`FAKE-SCP` 有实现（`scripts/datanode-env.sh`），`FAKE-CLOCK` 与 `FAKE-MATRIX` 尚无独立实现。

**条目状态**：`Blocked` —— `asset-design` §1–§7 仍为骨架，消费方索引、行为契约、自检 Run 与"开发状态/验证状态"两层均未登记；测试工程补齐后 Step 0 方可放行（见 §10.1 的 `G-ASSET-001`）。

#### 1.4 构成项 · 相邻层交接出口

**文档 / 入口（Document ID 或缺口）**：`module-test-plan` 与 `module-test-scheme`（下层组织与 Case 登记）、`unit-test-plan`（最下层）；上层验收交接按项目 tailoring 承接，不在本模板家族内。

**覆盖责任摘要**：Piko 未实例化独立子系统层测试家族——11 个直属模块（M000–M010）直接挂系统层，故本层的下层交接出口是模块层计划；模块层 PASS 不关闭本层组合目标，本层 PASS 不关闭上层组合目标。

**条目状态**：`Planned` —— 交接口径固定为 ID 引用（`ST-*` 只被模块层引用，模块层 PASS 不得上浮关闭本层 Case）。


## 2. 被测基线与变更重跑范围

> **本节目的**：固定系统层基线与变更→重跑映射。
>
> **必须写清楚**：设计文档与源码、依赖、构建环境版本；哪些变化触发哪些 Case 重跑；重跑生成新 Run 与新报告，不覆盖旧失败。
>
> **抽象示例**：虚构 EX-APP：基线 EX-APP/v1；流程语义变化→方案重裁＋全部 Case 重跑，子系统内部变化→本层回归。
>
> **完成条件**：基线可核验；任一类变更能映射到明确重跑范围。

- **设计 / 源码 / 依赖基线**：设计基线 `system-design` v0.12.0-draft.1 ＋ 机器契约 `0.3.0-simplified.6`（`piko-agent-runtime-contract-v0.3`，schema 与向量在 `interfaces/`）；源码基线分支 `docs/piko-system-design-std26`；被测 Pi 上游 `0.85.1` @ commit `9767ba27`（vendored 源码 `upstream/pi/`）。构建与执行环境：Node `>=22.19.0`、pnpm `11.19.0`；`npm run build` = `tsc -p tsconfig.json --noEmit`（TypeScript 5.9.3）；`npm test` = `vitest run`（vitest 4.1.9，include `tests/unit/**`、`tests/integration/**`、`tests/fault/**`，live 套件经 `vitest.live.config.ts` 串行）；`npm run check` = tsc ＋ vitest ＋ `python3 tests/contract/validate_v03_contract.py`。真实可执行入口为 `tests/integration/*.test.ts`（http-api、llmtier-contract、matrix-acceptance、pi-adapter、scenario-e2e、transfer-scp、transfer-scp-live、worker-partial-output）与 `tests/unit/*.test.ts`。

- **变更 → 重跑范围规则**：
  - 契约 `0.3.0-simplified.6` 或 `interfaces/schemas/` 任一字段变更 → 基线重裁，`ST-APP-001..006` 与 `ST-OPS-001` 全量重跑，并重跑 `python3 tests/contract/validate_v03_contract.py`。
  - 数据面变更（transfer 拉取 / 投递 / `sha256` 校验 / 白名单与 `known_hosts` 强制）→ `ST-DATA-001..005` 全量重跑；ENV-2 就位时附 `PIKO_SCP_REMOTE="$DN_TARGET" npm run test:xfer`。
  - Pi 上游 commit 偏离 `9767ba27` → `ST-EXEC-001`、`ST-REC-001`、`ST-LLM-001/002` 重跑，且须新建系统设计修订，不在旧基线上判读。
  - 替身契约变更（`FAKE-LLM` / `FAKE-CLOCK` / `FAKE-MATRIX` / `FAKE-SCP`）→ 先更新 `asset-design`，再重跑引用该资产的 Case。
  - 依赖或工具链版本变化（Node / pnpm / TypeScript / vitest）→ 本层全量重跑。
  - 任一重跑生成新 Run ID 与新 `system-test-report` 实例，不覆盖旧失败证据（见 §6）。


## 3. 执行前检（Go / No-Go）

> **本节目的**：开始执行前逐项 Go/No-Go，全部通过才进入 §4 环境实例分配，再进入 §9 执行流程。
>
> **必须写清楚**：方案就绪度（清单无未登记缺口且版本固定）；暴露面对账（机器）：从权威源枚举暴露面（CLI help/参数注册表、端点注册表、UI 控件注册表），与方案 §6.1 暴露面清单和 Case 集合做差集，差集>0 记 No-Go 并登记缺口与 Owner；产品无公开交互面且方案 §6.1 已按 §7 裁决 Tailored-N/A 时，本项记"不适用"并引用该裁决行；Case 实现状态盘点（未 Implemented 的 Case 明确处理）；环境与工具（构建可用、依赖齐、权限具备）；构建接线（干净全量交付构建通过、消费者链接实际交付库、导出/注册项同步）；代码 review 通过（tests.code-review-checklist 全部必查项通过；Critical 未清零不得进入测试）；测试资产/数据版本对齐（与设计 §13 可冻结资产清单对账）。任一不满足记 Blocked 并登记缺口，不静默降级执行。
>
> **抽象示例**：虚构 ST-APP：预生产环境排期确认、存储测试实例就位。
>
> **完成条件**：每一前检项有可判定事实；No-Go 有出口（Blocked＋缺口）。

> ENV 状态统一字段：§3「环境与工具」前检与 §9 Step 0/1 共享同一个"ENV 状态"变量——§3 判定 Go/No-Go 后 ENV 状态置为 Ready/Blocked；§9 Step 0/1 按 §4 分配构建 ENV 实例、跑 assets 自检与环境检查；§7 报告产出读取此 ENV 状态字段；不要在 §3 与 §9 重复定义同义词。

#### 3.1 前检项 · 方案就绪度

**判定事实**：`system-test-scheme` v0.1.0-draft.1 §6 逐条登记 21 条 `ST-*` Case 的设计状态（18 条 `Designed`、3 条 `Gap`），§7 为 3 条 Gap 登记了 Owner 与恢复条件，§6.1 暴露面清单与 §6.2 数据格均已指向 Case ID；来源为 `system-design` v0.12.0-draft.1 的 §6.5 / §7 / §8.1 / §8.2 / §13.1 与 VRC-ST-001..021。

**通过条件**：方案版本已固定且与 §2 基线一致；21 条 Case 全部有设计状态；每条 `Gap` 在方案 §7 有具名 Owner 与恢复条件；暴露面与数据格对账差集为 0。

**不满足时**：记 `Blocked`，把新增缺口按 `G-*` 编号登记到 §10.1 并通知测试工程；不得静默裁剪 Case 或把 `Gap` 当作不测。

#### 3.2 前检项 · Case 实现状态盘点

**判定事实**：`tests.system-case` 文档不存在（缺口 `G-CASE-002`）；可执行实现位于 `tests/integration/*.test.ts`（8 个文件，其中 `scenario-e2e.test.ts`、`matrix-acceptance.test.ts` 由 `vitest.config.ts` 排除、走 `vitest.live.config.ts`）与 `tests/unit/*.test.ts`；方案 §2.1 把 `tests/integration/http-api.test.ts` 指定为 `normal` 家族的自动化入口。

**通过条件**：本轮要执行的每条 Case 都能指向一个可执行入口（文件路径 ＋ 命令／vitest 选择器），且该入口在 Run 记录中出现；指不到入口的 Case 记 `NOT_RUN` 并登记原因，不得从清单消失。

**不满足时**：该 Case 记 `Blocked` 并关联 `G-CASE-002`（Owner 测试工程）；本轮改以模块级 Case 粒度继续，拆分义务写入 §10.1，不在无入口的情况下声称已覆盖。

#### 3.3 前检项 · 环境与工具（引用 tests.asset-design 的 Verified 状态）

**判定事实**：环境入口为 `scripts/datanode-env.sh up|check|down`（ENV-2，产物 `var/datanode/env`）与 `scripts/scenario-env.sh`（ENV-3，产物 `~/piko-matrix-homeserver/room-scenario.json`）＋ `scripts/scenario-seeds.sh`；数据面 opt-in 入口 `PIKO_SCP_REMOTE=<host> npm run test:xfer`，`PIKO_SCP_REMOTE` 未设置时 `tests/integration/transfer-scp-live.test.ts` 整文件 skip。`asset-design` §6 目前未登记任何资产的两层状态与自检 Run。

**通过条件**：本轮消费的每个资产在 `asset-design` §6 为 `Implemented` ＋ `Verified` 且有自检 Run 引用；`npm run check` 退出码为 0；ENV-2/ENV-3 在被分配 Case 执行前各自完成 `check` 判定。

**不满足时**：ENV 状态置 `Blocked`，§9 Step 0 停止，不进入 Case 执行；缺口登记为 `G-ASSET-001`（Owner 测试工程）。禁止把"套件被 skip"当作环境就绪。

#### 3.4 前检项 · 构建接线（全量交付构建 / 消费者链接实际库）

**判定事实**：交付构建门为 `npm run build`（`tsc -p tsconfig.json --noEmit`）；消费者链接由 `vitest.config.ts` 的 `resolve.alias` 完成（`@earendil-works/pi-*`、`@earendil-works/chord`、`typebox*` 全部指向 `upstream/pi/` 实际 vendored 源码）；契约一致性由 `tests/contract/validate_v03_contract.py` 校验，`npm run check` 把三者串联。

**通过条件**：干净工作区下 `npm run check` 退出码为 0，且 `validate_v03_contract.py` 无 error、返回码为 0；alias 指向的路径在基线 commit 上确实存在。

**不满足时**：记 `Blocked` 并登记构建缺口；不得跳过 tsc 或跳过契约校验降级执行，也不得改 alias 指向替身实现来"通过"链接检查。


## 4. 环境实例分配（plan 编排）

> **本节目的**：把方案 §4 的环境类型落实为具体的**实例编号**，并分配给具体 Case——同一类型可多套（如多 docker 用于并行），编号与分配是 plan 的责任，Case 只引用编号。
>
> **必须写清楚**：列出本计划分配的全部 ENV 实例（编号 + 类型 + 具体配置/位置 + Owner + 分配给哪些 Case + 准备时限 + 状态）；ENV 实例类型与方案 §4 类型一致；准备失败标 Blocked 并登记缺口，不静默换其他实例。
>
> **抽象示例**：见本节 example 围栏示例）。
>
> **完成条件**：方案 §6 Case 清单中的每个 Case 在本登记有 ENV 实例；类型一致；准备未完成标 Blocked 并登记缺口，不静默换实例。

#### 4.1 ENV · ENV-1 / ENV-2 / ENV-3

**环境类型**：`ENV-LOOPBACK`（方案 §4.1：真 Piko 组件 ＋ 本机 fake LLMTier ＋ 真 SQLite）

**具体配置/位置**：仓库工作区根目录；真 Piko 组件经 `src/**` 运行，SQLite 用 `node:sqlite`（`DatabaseSync`），LLMTier 用 `FAKE-LLM`（`tests/common/mock-llmtier.ts`）；入口 `npm test`（vitest 4.1.9，`vitest.config.ts`）

**Owner**：测试工程

**分配给哪些 Case**：`ST-APP-001`、`ST-APP-002`、`ST-APP-003`、`ST-APP-004`、`ST-APP-005`、`ST-APP-006`、`ST-SEC-001`、`ST-LLM-001`、`ST-PROC-001`、`ST-PROC-002`、`ST-EXEC-001`、`ST-REC-001`、`ST-OBS-001`、`ST-OPS-001`

**准备时限**：§9 阶段门 1 进入前

**状态**：`Ready`（计划期判定：仅依赖本机工具链，无外部系统；正式状态以 §3 前检与 §9 Step 1 的记录为准）

---

**环境类型**：`ENV-LOOPBACK` ＋ 数据面外部 scp 对端（替身/真实对端由 `PIKO_SCP_REMOTE` 决定）

**具体配置/位置**：`scripts/datanode-env.sh up` 在 `var/datanode/` 下起一次性 sshd（临时端口、一次性 ed25519 密钥、pinned `known_hosts`、隔离 HOME），导出 `var/datanode/env`（`DN_TARGET` / `DN_KNOWN_HOSTS` / `DN_KEY` …）；`check` 校验可达与 pinned 主机密钥；入口 `PIKO_SCP_REMOTE="$DN_TARGET" npm run test:xfer`。全程不触碰真实 `~/.ssh`

**Owner**：测试工程

**分配给哪些 Case**：`ST-DATA-001`、`ST-DATA-002`、`ST-DATA-003`、`ST-DATA-004`、`ST-DATA-005`

**准备时限**：§9 阶段门 2 进入前

**状态**：`Blocked`（就绪条件＝外部 scp 对端可达 ＋ `scripts/datanode-env.sh check` 输出 `pinned host key: OK`；条件未满足时本组 Case 按 §9 的 BLOCKED 路径记录，不改跑无对端入口冒充覆盖）

---

**环境类型**：`ENV-LOOPBACK` ＋ Matrix 外部系统（`FAKE-MATRIX` 所指的真实本地 Synapse 场景房）

**具体配置/位置**：`scripts/scenario-env.sh` 以 `MATRIX_BASE` 建专用场景房（`@piko-bot` power_level 0，可被 admin 撤销 membership）并写 `~/piko-matrix-homeserver/room-scenario.json`；`scripts/scenario-seeds.sh` 铺种子；入口 `npm run test:scenario`（`vitest.live.config.ts` 串行）

**Owner**：测试工程

**分配给哪些 Case**：`ST-MX-001`、`ST-LLM-002`

**准备时限**：§9 阶段门 3 进入前

**状态**：`Blocked`（就绪条件＝本地 Synapse 可达且场景房建成；方案 §7 已将 `ST-MX-001` 记为 `Gap`（`G-MATRIX-001`）、`ST-LLM-002` 记为 `Gap`（`G-ENV-001`），条件满足前这两条 Case 记 BLOCKED）


## 5. 环境操作（搭建 / 复位 / 隔离 / 清理）

> **本节目的**：环境操作可复现。
>
> **必须写清楚**：搭建、每 Case 复位、并行隔离键、清理的具体命令或入口；环境不可重建即 Blocked；单环境串行时写清 case 前检查、软复位/重启/驱动恢复阶梯与时限，失败后确认回到基线，不能只 kill 后继续。
>
> **抽象示例**：虚构 ST-APP：每轮重建系统实例与存储测试实例。
>
> **完成条件**：另一位执行者能独立搭建、复位与清理。

- **环境搭建与复位操作**：
  - ENV-1：`npm run build` 后 `npm test`；每条 Case 用 vitest 单文件＋名称选择器收窄（如 `npx vitest run tests/integration/http-api.test.ts -t "<Case 名>"`）。每 Case 复位＝新建该 Case 的 SQLite 临时库/内存库并重建替身实例，不复用上一 Case 的库与单例。
  - ENV-2：`scripts/datanode-env.sh up` → `set -a; . var/datanode/env; set +a` → 每 Case 前 `scripts/datanode-env.sh check` → `PIKO_SCP_REMOTE="$DN_TARGET" npm run test:xfer`；每 Case 后清空 `var/datanode/remote-in`、`var/datanode/remote-out`、`var/datanode/staging` 后再进下一 Case。
  - ENV-3：`scripts/scenario-env.sh` 建房 ＋ `scripts/scenario-seeds.sh` 铺种子 → `npm run test:scenario`；每 Case 新建独立场景房，不复用已改过 membership 的房间。

- **隔离键与清理**：
  - ENV-1 隔离键：每 Case 的临时库文件/内存库句柄 ＋ `tests/common/` 中该 Case 实例化的替身对象（不共享全局单例）。
  - ENV-2 隔离键：`var/datanode/` 整目录（端口、密钥、pinned `known_hosts`、远端 in/out 目录、staging）；清理＝`scripts/datanode-env.sh down`（停 sshd ＋ 删目录）。
  - ENV-3 隔离键：场景房 `room_id`（`room-scenario.json`）＋ 三个测试身份；清理＝退房/删房并移除该 json。
  - 证据目录 `var/verification/system/<Run ID>/` 不随环境清理删除。

- **复位阶梯与时限（软复位→重启→驱动恢复）**：
  - 一级 软复位（≤2 分钟）：重跑单 Case 选择器；失败即进二级，不得连续重试同一入口。
  - 二级 重启（≤10 分钟）：`npm run build && npm test` 全量重跑；必须确认退出码 0 才算回到基线。
  - 三级 驱动恢复（≤5 分钟）：ENV-2 执行 `scripts/datanode-env.sh down && scripts/datanode-env.sh up` 并重跑 `check`；ENV-3 重建场景房。
  - 每级完成后都要留下"已回基线"的事实记录（`npm run check` 退出码 0 / `datanode-env.sh check` 打印 `pinned host key: OK`），不能只 kill 进程后继续；超时未回基线即按 §9 的 BLOCKED 路径停止本层执行并登记缺口。


## 6. 证据与 Run 记录规则

> **本节目的**：Run 证据规则固定。
>
> **必须写清楚**：Run ID 命名（对象-时间或序号）、每次 Run 保存的命令/版本/stdout/退出码/种子、保存位置与保留期、脱敏要求；重跑生成新 Run 不覆盖。
>
> **抽象示例**：虚构 ST-APP：run-⟨日期⟩-⟨序号⟩。
>
> **完成条件**：从报告任一 Verdict 能定位唯一 Run 与原始证据。

- **Run ID 规则与证据位置**：`st-run-<YYYYMMDD>-<NN>`（例：`st-run-20261010-01`）。一个 Run ＝ 一次 `npm test` / `npm run test:xfer` / `npm run test:scenario` 的全量或按 Case 选择器执行；原始证据落 `var/verification/system/<Run ID>/`（命令原文、stdout/stderr、退出码、环境版本），报告任一 Verdict 可反查到唯一 Run 与该目录。重跑生成新 Run ID 与新目录，旧失败证据只读保留、不得覆盖。

- **保存内容与脱敏要求**：每次 Run 保存执行命令原文、基线 commit、Node/pnpm/vitest/TypeScript 版本、被测 ENV 实例编号、完整 stdout 与 stderr、进程退出码；ENV-2 另存 sshd 端口与 `DN_*` 变量名（不存私钥内容），ENV-3 另存场景房 `room_id`。保留期：本层 Gate 关闭后 90 天。脱敏：Matrix token（`~/piko-secrets/matrix-piko-bot`）、`users.json` 中的 access token、scp 私钥与 `known_hosts` 指纹只记存在性与指纹、不落明文；stdout 中出现明文凭据即判定该 Run 证据 `INVALID`，另出脱敏副本并保留原文件为受限证据。


## 7. 报告产出与 Gate 规则

> **本节目的**：定义报告产出与 Gate 规则。
>
> **必须写清楚**：全部 Case 走完后（或按出口准则提前结束）生成 `tests.system-test-report` 实例；Gate 建议规则（覆盖闭合或缺口有主、失败分级）在此固定，报告只按规则给建议不越权批准。> 失败降级路径：plan 整体 BLOCKED（环境性）→ 该轮不生成 report 实例，只记缺口与原因；plan 部分 Case 失败 → 仍生成 report（含 FAIL/INVALID 完整记录），后续报告生成失败（new-design 等）→ 不掩盖 FAIL，复现状态与修复状态分开记录。
>
> **抽象示例**：虚构 ST-APP：全部走完后生成报告；Gate＝分母闭合且 G-EX-3 有主。
>
> **完成条件**：报告的生成时机、模板与 Gate 规则确定。

- **报告生成时机与模板**：全部 21 条 Case 走完（或按出口准则提前结束）后生成 `system-test-report` 实例（`docs/70_verification/reports/system-test-report.md`，模板 `tests.system-test-report`），按 §6 的 Run 记录汇总 Verdict。降级路径：plan 整体环境性 `BLOCKED` → 该轮不生成 report 实例，只在 §10.1 记缺口与原因；部分 Case 失败仍生成 report（含 `FAIL`/`INVALID` 完整记录）；报告生成工具本身失败时，复现状态与修复状态分开记录，不掩盖 `FAIL`。

- **Gate 建议规则**：Gate ＝ 全部处于 `Implemented` 的 Case 均 `PASS` 且无未关闭 Gap → 建议 pass；任一 Case `FAIL` → 建议 not pass；`BLOCKED` 单独列出——既不计入 pass 也不隐藏，且每条 `BLOCKED` 必须对应 §10.1 中有主有期限的缺口。`Gap` 设计状态（`ST-LLM-002` / `ST-MX-001` / `ST-OBS-001`）不参与 pass 判定，但其关闭进度须在报告单列。报告只按本规则给建议，不越权批准。


## 8. 责任、排期与风险

> **本节目的**：责任到人、风险有触发与缓解出口。
>
> **必须写清楚**：方案维护、Case 编写、执行、评审的责任人与时间窗；风险写触发条件、影响与缓解，不写“重试即可”。
>
> **抽象示例**：设计＝系统 Owner、执行＝QA 或 Agent、评审＝系统设计评审。
>
> **完成条件**：每个构成项有责任人与时间窗；关键风险有可判定触发。

#### 8.1 风险 · ENV-2 数据面外部对端不可得导致数据面 Case 假覆盖

**时间窗 / 最晚 Gate**：ENV-2 须在 §9 阶段门 2 进入前就位；最晚 Gate＝本轮 `system-test-report` 产出前。

**冲突或缓解出口**：触发条件＝`PIKO_SCP_REMOTE` 未设置——此时 `tests/integration/transfer-scp-live.test.ts` 因 `describe.skipIf(!READY)` 整文件 skip，`vitest` 仍返回成功退出码，`ST-DATA-001..005` 会被误读为已执行。缓解：Run 记录必须写明 skip 事实并把这 5 条 Case 记 `BLOCKED`（不得记 PASS）；若 Gate 前外部对端仍不可得，按 §10.1 登记缺口，并把数据面 Case 降级到 ENV-1 的 `tests/integration/transfer-scp.test.ts` 做部分覆盖，剩余缺口保留 Owner 测试工程直至对端就位。

---

**时间窗 / 最晚 Gate**：风险"逐 Case 文档缺失（`G-CASE-002`）"——§9 阶段门 1 之前；最晚 Gate＝本轮报告产出前。

**冲突或缓解出口**：21 条 Case 无 `tests.system-case` 作业指令，执行者须临场解释责任边界。缓解：执行判据只取方案 §6 责任摘要 ＋ §2.1 判定规则 ＋ §2.2 家族技术选型，计划不复制也不改写；Run 记录须标出所用入口文件与选择器，拆分完成后按同一 `ST-*` ID 同步 §9.4 与 §1.2 构成表。

---

**时间窗 / 最晚 Gate**：风险"`asset-design` 仍为骨架，资产无 `Verified` 状态"——§9 Step 0；最晚 Gate＝阶段门 1 进入前。

**冲突或缓解出口**：Step 0 无权威依据判定替身可用，`FAKE-CLOCK`/`FAKE-MATRIX` 甚至无独立实现。缓解：本轮把"资产就位"判据固化为两份可执行事实（替身自检 ＋ `npm run check` 退出码 0），并在 `asset-design` §6 登记前一律按 `Blocked` 处理；不得以产品 Case 的表现反推资产已 Verified。

---

**时间窗 / 最晚 Gate**：风险"live 套件与默认套件混录同一 Run"——§9 Step 2 排序时；最晚 Gate＝阶段门 3 进入前。

**冲突或缓解出口**：`vitest.config.ts` 已把 `scenario-e2e.test.ts`、`matrix-acceptance.test.ts` 排除在 `npm test` 之外；若把 `npm run test:live` 的输出并进同一 Run，环境差异与 flake 将无法归因。缓解：live 入口独立 Run ID 与独立证据目录，并在 Run 记录中标注 ENV 实例编号与是否串行执行。


## 9. 执行流程（逐 Case 作业序列）

> **本节目的**：给执行者（含 Agent）一条从头到尾的作业序列。

> 失败处理与收口（在本流程图内统一）：FAIL → 保留首个失败现场 + 保留 Run 证据 + 禁止重跑覆盖原始失败 → 登记缺陷并关联 Case ID；BLOCKED → 标记环境性阻塞 + 整个 §9 执行流程停止 + 登记缺口 + 不静默换工具链；INVALID → 标记该 Case 注入未命中 + 复现状态与修复状态分开记录 → 不允许仅靠"重跑通过"掩盖；NOT_RUN → 标记未执行 + 登记原因（不在方案 §6 清单中静默消失）。
> **必须写清楚**：头尾工序固定——Step 0 资产就位（测试资产准备：按消费索引构建全部依赖资产并自检，不过即环境性 Blocked、不进 Case 执行）、Step 1 测试环境搭建与检查（按 §4 分配、§5 操作使 ENV 就绪）、收尾先清理回基线、再按 §7 的时机与 Gate 规则生成报告；中段由作者按方案清单优先级逐 Case 填充：定位 Case 文档→按其 §2–§7 前检与运行→判定分路（PASS/FAIL/BLOCKED/INVALID 各有明确出口与下一步）→记录 Run→继续，可按阶段门（最小真实链→规模控制面→完整业务→恢复/全量回归）拆分为多行；失败不阻断后续 Case，除非环境性阻塞。
>
> **抽象示例**：虚构 ST-APP：启动/停止组先行；机制端到端随后；验收场景不在本层执行。
>
> **完成条件**：执行者不需要临场发明流程；每个分路有确定下一步。

#### 9.1 Step · 0

**动作**：资产就位（测试资产准备）：按消费索引构建全部依赖测试资产并运行自检；自检不过＝环境性 Blocked，不进入 Case 执行

**输入 / 依据**：`asset-design` v0.1.0-draft.1 —— §1 消费方索引（本计划 §1.3）、§2 行为契约（`FAKE-LLM`/`FAKE-CLOCK`/`FAKE-MATRIX`/`FAKE-SCP`）、§5 自检用例、§6 两层状态；实现入口 `tests/common/mock-llmtier.ts`、`scripts/datanode-env.sh`

**产出**：`var/verification/system/assets-ready-<YYYYMMDD>.md` 就绪清单——逐资产记开发状态、验证状态与自检 Run 引用；清单中缺任一 `Verified` 即本 Step 判环境性 `Blocked`，不进入 §9.4 的 Case 执行

#### 9.2 Step · 1

**动作**：测试环境搭建与检查：按 §5 操作搭建/复位 §4 分配的 ENV 实例并确认就绪

**输入 / 依据**：本计划 §4（ENV-1 / ENV-2 / ENV-3 的类型与 Case 分配）＋ §5（`scripts/datanode-env.sh up|check|down`、`scripts/scenario-env.sh`、`scripts/scenario-seeds.sh` 的搭建与清理命令）

**产出**：ENV 状态判定记录——ENV-1 记 `Ready`（依据 `npm run build && npm test` 可运行）；ENV-2 记 `Ready`/`Blocked` 并附 `scripts/datanode-env.sh check` 输出或缺口编号；ENV-3 记 `Ready`/`Blocked` 并附场景房 `room_id` 或缺口编号。ENV 状态字段是本计划 §3、§7 共用的同一变量。

#### 9.3 Step · 2

**动作**：读取方案清单并按优先级排序

**输入 / 依据**：`system-test-scheme` v0.1.0-draft.1 §6（21 条 `ST-*`，含分类与优先级）与 §2.1 家族判定规则

**产出**：执行队列＝按 `P0 → P1 → P2` 排序的条目，每条＝Case ID ＋ 可执行入口（文件＋vitest 选择器）＋ ENV 实例编号 ＋ 对应 `VRC-ST-xxx`；`Gap` 状态的 Case 进队列但预置为 `BLOCKED` 占位，不删除。

#### 9.4 Step · 3

**动作**：Step 3 — 密闭控制面组（ENV-1）：逐 Case 定位 → 按方案 §2.1 的 `tests/integration/http-api.test.ts` 入口运行 → 记录 Run。覆盖 `ST-APP-001`、`ST-APP-002`、`ST-APP-003`、`ST-APP-004`、`ST-APP-005`、`ST-APP-006`、`ST-SEC-001`、`ST-OPS-001`（断言点：202 ＋ `TaskView`、`TaskNotTerminal`、`TaskConflict`/`Gone`、fence 码不外泄、`PurgeReceipt` 且 tombstone 保留）

**输入 / 依据**：`system-test-scheme` §6 Case 行 ＋ §2.1 判定规则；本计划 §4 ENV-1

**产出**：每条 Case 一个 Run 记录（`PASS`/`FAIL`/`BLOCKED`/`INVALID` 之一）＋ 对应 `var/verification/system/<Run ID>/` 证据目录

---

**动作**：Step 4 — 并发、端到端与恢复组（ENV-1）：覆盖 `ST-PROC-001`、`ST-PROC-002`、`ST-EXEC-001`、`ST-REC-001`、`ST-LLM-001`、`ST-OBS-001`，入口分别为 `tests/integration/pi-adapter.test.ts`、`worker-partial-output.test.ts`、`llmtier-contract.test.ts` 与 `tests/unit/` 中的 worker/store 相关文件；按方案 §2.2 的顺序交错法控制时序，不用无种子随机并发

**输入 / 依据**：`system-test-scheme` §6 对应 Case 行 ＋ §2.2 `concurrency`/`recovery` 家族选型；本计划 §4 ENV-1

**产出**：逐 Case Run 记录 ＋ `st-run-<日期>-<NN>` 证据目录

---

**动作**：Step 5 — 数据面组（ENV-2）：先 `scripts/datanode-env.sh up` 与 `check`，再 `PIKO_SCP_REMOTE="$DN_TARGET" npm run test:xfer`，覆盖 `ST-DATA-001..005`；ENV-2 未 `Ready` 时整组记 `BLOCKED` 并引用 §10.1 缺口，禁止改跑无对端入口后声称覆盖

**输入 / 依据**：`system-test-scheme` §6 Case 行 ＋ §4.1 `ENV-LOOPBACK` 真实性边界；本计划 §4 ENV-2 与 §5 复位阶梯

**产出**：逐 Case Run 记录；若走 skip 路径，须在记录中显式写出"套件被 `describe.skipIf` 跳过"并把 Verdict 记为 `BLOCKED`

---

**动作**：Step 6 — 外部系统组（ENV-3）：`scripts/scenario-env.sh` ＋ `scripts/scenario-seeds.sh` → `npm run test:scenario`，覆盖 `ST-MX-001`（membership 撤销 → `DiscussionAccessLost`）；`ST-LLM-002` 走 opt-in 真实模型入口，缺口未关闭前记 `BLOCKED`（`G-MATRIX-001` / `G-ENV-001`）

**输入 / 依据**：`system-test-scheme` §6 Case 行 ＋ §7 缺口裁决；本计划 §4 ENV-3

**产出**：逐 Case Run 记录或 `BLOCKED` 记录 ＋ ENV-3 就绪事实

---

**动作**：Step 7 — 逐 Case 判定分路（贯穿 Step 3–6）：`PASS` → 记 Run 并继续；`FAIL` → 保留首个失败现场与 Run 证据、登记缺陷并关联 Case ID、禁止重跑覆盖；`INVALID` → 记录注入/替身未命中事实、复现状态与修复状态分开；`BLOCKED` → 标记环境性阻塞并停止后续 Case；`NOT_RUN` → 记原因，不从方案 §6 清单中消失

**输入 / 依据**：本计划 §7 的 Gate 规则与 §6 的 Run 规则

**产出**：完整的 Run 集合，供 §9.5 清理与 §9.6 报告生成引用

#### 9.5 Step · N+1

**动作**：环境清理与基线恢复：按 §5 执行清理；保留全部 Run 证据，不覆盖旧失败

**输入 / 依据**：本计划 §5（`scripts/datanode-env.sh down`、场景房删除、`var/` 下本轮环境产物）

**产出**：ENV-1/2/3 回到基线的事实记录（`npm run check` 退出码 0、`datanode-env.sh check` 输出、场景房已删）＋ `var/verification/system/<Run ID>/` 证据落位确认；旧失败 Run 目录保持只读不删

#### 9.6 Step · N+2

**动作**：生成测试报告：按 §7 的时机与 Gate 规则汇总本轮全部 Run 结果

**输入 / 依据**：本计划 §7（生成时机、模板与 Gate 规则）＋ §6 的全部 Run 记录

**产出**：`system-test-report` 实例（`docs/70_verification/reports/system-test-report.md`）——逐 Case Verdict、`BLOCKED` 单列、Gate 建议结论；报告只给建议，不越权批准

#### 9.7 阶段门 · 1 最小真实链

**目的**：验真实 Piko 组件 ＋ `FAKE-LLM` 下最小控制面组合成立——提交受理 → 轮询 → 取结果 → 取消 四项操作形成一条可复现的密闭链，且鉴权失败与内部错误在对外响应上收口。

**进入条件**：Step 0 资产就位清单齐、Step 1 记 ENV-1 ＝ `Ready`；`ST-APP-001`、`ST-APP-002`、`ST-APP-004`、`ST-APP-005`、`ST-SEC-001` 五条各已有一条 Run 记录（`PASS`/`FAIL`/`BLOCKED`/`INVALID` 之一，不允许缺记录）。

#### 9.8 阶段门 · 2 规模控制面

**目的**：验规模与隔离面——控制面（P0）与执行面（P1）互不拖累、数据面搬运（准备/拉取/投递/`sha256` 校验/幂等）在多任务与顺序交错下语义不变。

**进入条件**：`ST-PROC-001`、`ST-PROC-002`、`ST-EXEC-001` 与 `ST-DATA-001..005` 均有 Run 记录或 `BLOCKED` 记录；ENV-2 已给出 `scripts/datanode-env.sh check` 的 `pinned host key: OK` 输出，或已按 §8.1 登记 `Blocked` 缺口并写明降级覆盖入口。

#### 9.9 阶段门 · 3 完整业务

**目的**：验完整业务闭环与运维面——提交→执行→产出→终态 `Result` 全链成立，恢复后不重跑 Pi 且 Result generation 冻结，运维 purge 保留 tombstone 并写审计，观测出口可被诊断读取。

**进入条件**：`ST-EXEC-001`、`ST-REC-001`、`ST-OPS-001`、`ST-OBS-001` 均有 Run 记录或 `BLOCKED` 记录；ENV-3 已给出场景房 `room_id` 与 `npm run test:scenario` 的入口事实，或已按 §10.1 登记 `G-MATRIX-001`。

#### 9.10 阶段门 · 4 恢复 / 全量回归

**目的**：验恢复路径与环境复位——外部系统路径（`ST-MX-001`、`ST-LLM-002`）执行或明确记 `BLOCKED` 后，环境无残留、不污染后续轮次，且干净工作区下全量回归回到基线。

**进入条件**：`ST-MX-001`、`ST-LLM-002` 均有 Run 记录或 `BLOCKED` 记录；§5 清理已完成（ENV-2 已 `down`、ENV-3 场景房已删）；`npm run check` 在清理后退出码为 0，作为"已回基线"的判定事实。


- **失败（FAIL）处理路径**：保留首个失败现场（进程状态、日志、`var/verification/system/<Run ID>/` 原始输出）→ 在报告中登记缺陷并关联 Case ID 与 `VRC-ST-xxx` → 禁止用重跑覆盖原始失败：修复后重跑必须分配新 Run ID，新旧 Run 并存并在报告中注明"修复后重跑" → 继续执行后续 Case（普通失败不阻断）；环境性阻塞按下一条处理。

- **阻塞/无效（BLOCKED/INVALID）处理路径**：`BLOCKED` → 标记为环境性阻塞 → 停止整个 §9 执行流程 → 在 §10.1 登记缺口编号与 Owner → 不静默换工具链、不静默换 ENV 实例、不用"改跑邻近脚本"充当等价覆盖。`INVALID` → 标记该 Case 的替身/注入未命中（如 `FAKE-LLM` 断言未触发、ENV-2 因 `skipIf` 未真正执行）→ 复现状态与修复状态分开记录，不允许仅靠"重跑通过"掩盖。`NOT_RUN` → 标记未执行并写明原因，不得从方案 §6 清单中静默消失。

## 10. 未决项

> **本节目的**：未决项有主、有期限、有关闭条件。
>
> **必须写清楚**：逐条登记；无未决项时写经核对的“无”。
>
> **抽象示例**：G-EX-3 真实生产环境不可得。
>
> **完成条件**：未决项全部有主有期限。

#### 10.1 未决 · G-CASE-002 / G-ASSET-001 / G-ENV-001 / G-MATRIX-001 / G-OBS-001

**Owner / 最晚 Gate**：`G-CASE-002`（逐 Case `tests.system-case` 文档未撰写）——测试工程；最晚 Gate＝§9 阶段门 1 之前完成首轮拆分，报告产出前完成全部 21 条。

**关闭所需事实或决定**：`docs/70_verification/system/` 下出现与方案 §6 一一对应的 `tests.system-case` 文档（Document ID ＝ Case ID），每条含 §2 黑盒三清单（布景入口、观察点、禁读内部状态自查）与替身选择。关闭前本计划按模块级 Case 粒度编排（§9.4），拆分完成后须同步 §1.2 构成表与 §9.4 的作业行。

---

**Owner / 最晚 Gate**：`G-ASSET-001`（`asset-design` 仍为骨架：消费方索引、行为契约、自检 Run、`Implemented`/`Verified` 两层状态均未登记）——测试工程；最晚 Gate＝§9 Step 0。

**关闭所需事实或决定**：`asset-design` §1 登记本计划与三份 scheme 为消费方，§2 写明 `FAKE-LLM`/`FAKE-CLOCK`/`FAKE-MATRIX`/`FAKE-SCP` 的模拟与不证明边界，§5 有可执行自检入口，§6 登记两层状态与自检 Run 引用。在此之前 Step 0 按本计划 §3.3 的可执行判据处理，缺 `Verified` 即 `Blocked`。

---

**Owner / 最晚 Gate**：`G-ENV-001`（`ST-LLM-002` 真模型端到端无自动化入口）——测试工程；最晚 Gate＝§9 阶段门 4 之前。

**关闭所需事实或决定**：补一条 opt-in 的真实模型执行入口（与 `PIKO_SCP_REMOTE` 同构的环境变量门控，未设置时显式 `skip` 并在 Run 记录中体现），使"工具写文件 → 产出收集 → `Completed`"可被自动化执行并留下 Run 证据。

---

**Owner / 最晚 Gate**：`G-MATRIX-001`（`ST-MX-001` Matrix 讨论链路缺本地 Synapse 与房间准备脚本）——测试工程；最晚 Gate＝§9 阶段门 3 之前。

**关闭所需事实或决定**：`scripts/scenario-env.sh` 可在无人值守的机器上重复执行（`MATRIX_BASE` 可配、token 来源可解析），`tests/integration/matrix-acceptance.test.ts` 纳入受控 Run；讨论事件进入 session 并可回发、membership 丢失返回 `DiscussionAccessLost` 两条判据各有断言点。

---

**Owner / 最晚 Gate**：`G-OBS-001`（`ST-OBS-001` 观测与审计无稳定可测出口）——Owner M009；最晚 Gate＝§9 阶段门 3 之前。

**关闭所需事实或决定**：诊断端点（结构化事件、指标、审计）给出稳定契约与只读访问方式，使外部可观察点可被 Case 断言；在此之前 `ST-OBS-001` 记 `BLOCKED`，不用内部状态读取替代对外出口。

---

**Owner / 最晚 Gate**：无其他未决项（已核对方案 §7 的全部裁决：`Tailored-N/A` 四项——控件面、成本护栏、性能预算、长稳 endurance——已引用设计事实，无需再登记）。

**关闭所需事实或决定**：不适用（裁决已闭合）；若引入 UI、外部计费系统、系统性能预算或 endurance 目标，须先改 `system-design` 再重开方案 §7。

- **方法回流候选（执行中沉淀、可回流 STD 指南/模板的新方法或教训）**：
  - "套件被 `describe.skipIf` / 环境变量门控跳过"必须与"执行成功"区分：本计划 §3.2/§8.1/§9.4 要求 Run 记录显式写出 skip 事实并把 Verdict 记为 `BLOCKED`。建议回流 `tests.system-test-plan` 模板 §6（Run 规则）与 `tests.system-test-scheme`（§2.1 判定规则）作为通用条款。
  - "执行状态（`PASS`/`FAIL`/`BLOCKED`/`INVALID`/`NOT_RUN`）与计划条目状态（`Planned`/`Deferred`/`Blocked`）同名字段易混"：建议计划模板把两者命名为不同标识符，避免执行者把 `Blocked` 计划条目读成执行 Verdict。
  - "无独立 Case 文档时以方案 §6 责任摘要 ＋ §2.1 判定规则作为执行判据"的做法可回流为缺口期的临时执行规则（并要求 Run 记录标注所用入口），但必须在 §10 登记拆分义务与最晚 Gate，不得作为长期形态。

> **交付自查**：执行者能否只凭本计划从 Go/No-Go 走到报告产出；计划里是否出现任何执行结论或 Verdict；到期条目是否被偷偷改判？
