<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko unit-test-report

> **本文件遵守 STD（工程文档标准），STD 为最高优先级；修改本文件之前必须先读 STD 入口。**
> STD 入口：[项目采用说明与标准导航](../../../README.md#std-entry)。入口的**编写索引**已列出本类文档的全部硬性义务：不必通读规范，但**每一条都必须遵守**。

| 文档字段 | 值 |
|---|---|
| Document ID | `unit-test-report` |
| Document Version | `0.1.0-draft.2` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | Claude, opencode, corezilla |
| Created Date | `2026-11-03` |
| Last Modified Date | `2026-11-11` |
| Template ID | `tests.unit-test-report` |
| Template Version | `0.4.0` |
| Template Conformance | `tailored` |
| Std Conformance Total | 5 |
| Std Conformance Passed | 5 |
| Checklist Total | 14 |
| Checklist Conformed | 9 |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `tests/unit/reports/unit-test-report.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
>
> Std Conformance Total / Std Conformance Passed：STD 文档编写规范（索引 §3）检查了几条、遵守了几条。
> Checklist Total / Checklist Conformed：本篇模板的评审清单执行了几项、遵守了几项。两者是不同的检查，未执行填 0。
<!-- STD_DOCUMENT_COVER_END -->

> **编写建议**：本模板是单元层测试报告，由测试计划（tests.unit-test-plan）的执行流程（§4/§7）产出：汇总一次计划执行的逐 Case 结果、覆盖复算与 Gate 建议。报告是 Verdict 的唯一权威；没有有效 Run 不得写 PASS。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。


### 模板定位：报告、方案、用例、计划与 Run 证据的边界

> **编写建议**：单元层报告：汇总一次单元计划执行的逐 Case 结果；分母对照单元方案（tests.unit-test-scheme）；模块层结论归 tests.module-test-report。

- **Verdict 唯一持有**：执行状态（NOT_RUN/BLOCKED/INVALID）与实际判定（PASS/FAIL）只在测试报告与 Run 证据中产生；方案与 Case 文档不预填任何结果。
- **引用不复制**：逐 Case 结果引用 Run ID 与证据路径，不把 stdout 全文搬进报告。
- **保留失败**：失败、阻塞、无效与未运行如实保留；重跑生成新报告不覆盖旧失败。
- **不越权**：Gate 建议不是批准；验收与发布授权另循其轨。

### 状态语义：执行状态与 Verdict

> **编写建议**：Verdict 只能来自有效 Run 的断言结果；环境缺失记 BLOCKED、执行未命中设计记 INVALID、未运行记 NOT_RUN——三者都不是 FAIL 也不是 PASS。判定不改预期迁就实现。

- **执行状态**：`NOT_RUN` / `BLOCKED` / `INVALID`——未运行 / 环境阻断 / 执行未命中设计；运行记录与环境事实。
- **实际判定 Verdict**：`PASS` / `FAIL`——断言与独立 Oracle 一致 / 不一致；有效 Run 的断言结果。

> **完成条件**：同一事实只能得到可解释的判定；从任一 Verdict 能追到唯一 Run 与原始证据。

## 历史 Run 记录（保留，不覆盖）

> 上一轮 Run（`unit-local-2026-11-03`）的原始记录原样保留在此；本轮（`ut-run-20261111-01`）的结论见 §1 起。
> 报告模板的趋势一节按「重跑生成新报告不覆盖旧失败」的要求，旧 Run 不删。

### 历史 Run `unit-local-2026-11-03`


- **Run ID**：`unit-local-2026-11-03`
- **环境**：`ENV-1`（纯内存、无网络、无 live 套件）
- **命令**：`npx vitest run`
- **时间**：2026-11-03T23:04:05.305500
- **基线**：分支 `main`，契约 `0.3.0-simplified.6`，Pi `0.85.1` @ `9767ba27`

**执行结果**：297 个测试，**296 passed / 0 failed / 1 skipped**，退出码 0。

**前置检查**（计划 §3）：

| 前检项 | 判定 | 依据 |
|---|---|---|
| §3.1 方案就绪度 | **Go** | 方案 §6 登记 148 个 Case ID，其中 2 个是文档自带的虚构示例 `UT-FD-*`（FrameDecoder），实际 Case 136 条，全部有同名用例文档 |
| §3.2 Case 实现状态盘点 | **Go** | 136 份用例文档全部存在；136 条 Case 全部指向**存在且通过**的 `tests/unit/*.test.ts` 入口 |
| §3.3 环境与工具 | **Go** | `asset-design` §6 登记全部资产 `Verified`；`FAKE-CLOCK` 已落地为 `src/clock.ts` + `tests/unit/clock.test.ts`，`G-ASSET-001` 已关闭；`npm run check` 退出码 0 |
| §3.4 构建接线 | **Go** | `tsc --noEmit` 零错误；`validate_v03_contract.py` PASS；alias 指向 `upstream/pi/` 真实 vendored 源码 |

---

## 1. 执行摘要与结论

> **本节目的**：给出一眼可判的总结论。
>
> **必须写清楚**：本报告覆盖的计划与方案版本、执行范围、结果分布（PASS/FAIL/BLOCKED/INVALID/NOT_RUN 计数）、Gate 达成情况；结论与 §3–§5 明细一致。任何通过结论必须紧跟范围限定语（本轮实际覆盖的接口/交互控件与参数矩阵/场景/数据规模，如"控件 12/14，缺 usage 刷新"）；禁用未限定的"全绿/全部通过/100%"——已写 Case 全绿≠面全绿。
>
> **抽象示例**：虚构 UT-FD：5 Case 中 4 PASS、1 FAIL（错误优先级）。
>
> **完成条件**：读者不读明细也知道本轮结论与边界。

- **报告范围（计划/方案版本）**：

  单元计划 `unit-test-plan` v0.1.0-draft.4 / 方案 `unit-test-scheme` v0.1.0-draft.7 / 用例集
  `docs/70_verification/unit/cases/` 下 3,282 份 `tests.unit-case` 文档 ＋ 3,282 个脚本
  （`tests/unit/cases/UT-*.test.ts`，全部 `STATUS: real`）。执行范围＝本层登记的全部分母：
  十二个模块（BOOT 200 · TAPI 135 · POLICY 156 · REPO 652 · SCHED 39 · WORKER 382 · PI 865 ·
  USAGE 28 · MATRIX 226 · TRANSFER 289 · OBS 127 · IPC 183），粗粒度 152 条 ＋ 分卷 3,130 条。

- **结果分布与总结论**：

  Run `ut-run-20261111-01`：**3,282 PASS、0 FAIL、0 BLOCKED、0 INVALID、0 NOT_RUN**。
  3,282 个测试文件、3,360 条断言全部通过（vitest 4.1.9，退出码 0）；同一基线另有
  `src/*.test.ts` 的 node:test 套件 145 项全通过。逐模块 PASS 全数见 §3.2。

  **范围限定语**：本轮覆盖的是**本层已登记分母**（3,282 条 Case，每格一 Case），
  不是「单元层语义面全覆盖」——方案 §7.1 的 Tailored-N/A 与具名缺口（控件面、成本护栏、
  性能预算、长稳、VRC 逐条绑定 `G-UT-VRC-1`、分支实测 `G-UT-BRANCH-1`、模块/系统层维度格
  `G-MT-DIM-1`/`G-ST-DIM-1`）不因本轮 PASS 而关闭，见 §5 与 §8。


## 2. 被测基线与实际环境

> **本节目的**：固定实际被测基线与环境，单列偏差。
>
> **必须写清楚**：实际代码/构建/环境版本与计划基线对照；差异逐条列出；不同基线的结果不合并统计；结果绑定源码/库/配置/环境/checker 版本，相关修改后证据标“待重验”并保留历史，不从旧快照派生当前结论。
>
> **抽象示例**：虚构 UT-FD：编译器版本与计划一致。
>
> **完成条件**：基线可核验；偏差不隐藏。

- **实际基线（与计划对照）**：

  | 项 | 计划 §2 基线 | 本轮实际 | 一致 |
  |---|---|---|---|
  | 源码 | 分支 `docs/piko-system-design-std26` | `main` @ `6e6572d5`（`6e6572d56388827edaa6f466a46fe99fb476d741`） | 分支名不同，见下方偏差 |
  | 上游 Pi | `0.85.1` @ `9767ba27` | `0.85.1` @ `9767ba275f3e9a5ee0f5c5342249b629ab1b2282` | ✅ |
  | Node | `>=22.19.0` | `v22.22.3` | ✅ |
  | pnpm | `11.19.0` | `11.19.0` | ✅ |
  | TypeScript | `5.9.3` | `5.9.3` | ✅ |
  | vitest | `4.1.9` | `4.1.9` | ✅ |
  | 构建门 | `tsc -p tsconfig.json --noEmit` | 同一命令，退出码 0 | ✅ |

- **环境偏差及影响**：

  1. **分支名**：计划写的 `docs/piko-system-design-std26` 是立项时的文档分支；本轮执行在
     `main` 上。影响：无——被测实现（`src/`、`tests/`、`config/runtime.example.json`）在本轮
     基线上与计划基线内容一致（本轮 6 个提交只动 `tests/unit/cases/`、`docs/70_verification/unit/`
     与 gitnexus 生成的 agent 说明段；最后一次 `src/` 改动是上一批的 `c11066bd`，只给
     `stripQuotes`/`validateContext` 加 `export`、`model()` 去 `private`，行号与函数体未变）。不合并不同基线的统计。
  2. **运行时配置**：`config/runtime.json` 等 5 个文件是 `.gitignore` 排除的本地数据，本轮按
     `config/runtime.example.json` 派生（去掉 `transfer` 段、补 `extension_patch`/`adapter`），
     以使 57 条 BOOT Case 的预期 schema 拒绝路径成立。属环境准备，不是源码改动。
  3. **路径适配**：`config/runtime.example.json` 内的 `profile_registry_path` 写死为
     `/Users/ben/work/piko/config/tool-profiles.json`；本机以两个本地符号链接
     （`/Users/ben/work/piko/config`、`/Users/ben/work/piko/var` → `piko/` 下同名目录）使其解析，
     未改仓库内任何文件。此偏差使 13 条 MT 装配用例在本机可运行；它们是模块层用例，不计入本报告分母。

- **证据版本绑定与待重验**：

  结果绑定基线 commit `6e6572d5` ＋ Node 22.22.3 / pnpm 11.19.0 / TS 5.9.3 / vitest 4.1.9，
  原始证据在 `var/verification/unit/ut-run-20261111-01/`（`command.txt`、`versions.txt`、
  `vitest-cases.json`、`node-test.out`）。按计划 §2 的「变更→重跑」规则：`src/` 任一实现文件变更
  ⇒ 受影响模块全量重跑并分配新 Run ID；依赖/工具链版本变化 ⇒ 本层全量重跑。本报告不覆盖后续 Run。


## 3. 逐 Case 执行记录

> **本节目的**：逐 Case 汇总执行结果。
>
> **必须写清楚**：引用方案清单的每个 Case：执行状态、Verdict、Run ID 与证据路径、关联缺陷；NOT_RUN/BLOCKED/INVALID 如实保留；不复制原始输出。
>
> **抽象示例**：见下表灰字。
>
> **完成条件**：方案清单每个 Case 有一行；任一行可定位 Run。

#### 3.1 记录 · 引用方案清单

**执行状态**：全部分母已执行，无 `NOT_RUN` / `BLOCKED` / `INVALID`。3,282 条 Case 对应 3,282 个
测试文件，每个文件至少 1 条断言（3,211 个文件 1 条、66 个 2 条、3 个 3 条、2 个 4 条，合计
3,360 条断言）。

**Verdict**：`PASS`（全数）。逐 Case 结果按方案 `case-index.json` 的 `case_id` 与 Run 的
`vitest-cases.json` 逐文件比对，**两个方向的差集都为零**：索引有而 Run 无 0 条、Run 有而索引无 0 条。

**Run ID / 证据**：`ut-run-20261111-01` → `var/verification/unit/ut-run-20261111-01/vitest-cases.json`
（机器可读，逐文件 `assertionResults[].status`）；命令与环境见同目录 `command.txt` / `versions.txt`。
逐 Case 的 `report` 字段已回填进 `docs/70_verification/unit/case-index.json`（见该文件每行的
`report` 值＝`ut-run-20261111-01`，`field_counts.report` 由 0 变为 3,282）。

**缺陷 / 备注**：无 `FAIL`，因此无 `DEF-*`。实现层的行为偏差不属本报告缺陷（本层只断言真实行为），
它们登记在方案 §7.1 的 `G-UT-PI-1..12` 等缺口里，见 §6 残余风险。

#### 3.2 记录 · 逐模块 PASS 分布

| 模块 | 登记 Case | PASS | FAIL | 备注 |
|---|---|---|---|---|
| `BOOT` | 200 | 200 | 0 | |
| `TAPI` | 135 | 135 | 0 | |
| `POLICY` | 156 | 156 | 0 | |
| `REPO` | 652 | 652 | 0 | |
| `SCHED` | 39 | 39 | 0 | |
| `WORKER` | 382 | 382 | 0 | |
| `PI` | 865 | 865 | 0 | 本轮新写的 213 条在内 |
| `USAGE` | 28 | 28 | 0 | |
| `MATRIX` | 226 | 226 | 0 | |
| `TRANSFER` | 289 | 289 | 0 | |
| `OBS` | 127 | 127 | 0 | |
| `IPC` | 183 | 183 | 0 | |
| **合计** | **3,282** | **3,282** | **0** | 粗粒度 152 ＋ 分卷 3,130 |

每一行都可按 `<模块>/` 前缀在 `case-index.json` 过滤出 Case ID，再到 Run 的
`vitest-cases.json` 按文件 basename 取该 Case 的断言状态——报告不复制原始输出。


### 3.1 基线测量与回归比对（适用时）

> **本节目的**：登记性能/复杂度类 Case 的基线测量值与回归比对结果。
>
> **必须写清楚**：基线来源（上一 Run 或设计/ISD 口径，注明出处）、测量统计口径与样本量、回归判定（越阈按 scheme 家族行处置并写偏差幅度）；原始时序留证据文件，此处只记汇总；缺回归判定的执行不得计为有效 PASS。
>
> **抽象示例**：虚构 UT-FD-004：解析热路径耗时中位对照上一 Run 基线。
>
> **完成条件**：每个执行过的基线类 Case 有一行可回溯 Run 的回归判定。

每个基线类 Case 一条记录：

#### 3.1.1 基线 · 全层 / 分支覆盖面（复杂度采样）

基线 / 来源：方案 §7.1.12 `G-UT-BRANCH-1` 要求「两个 runner 的覆盖率合并进 Run 报告覆盖复算」，
本层此前无实测值；本轮以 vitest v8 provider 实测 `src/**`，`--coverage.include='src/**'`。

测量值：见 §5.4 的表（cases-only 与 full-suite 两档，统计口径＝`branches` covered/total）。

回归判定：**不加阈值判定**——方案 §7.1.3 已裁决「性能预算 Tailored-N/A：ISD 未声明微基线预算」，
因此这里只登记实测值供后续比对，不写「越阈 / 阈值内」；`G-UT-BRANCH-1` 仍为未关闭缺口（见 §8）。

## 4. 偏差、无效执行与重跑

> **本节目的**：如实记录偏差与无效执行。
>
> **必须写清楚**：偏离 Case 文档的原因与批准；无效执行（未命中、环境错配）与重跑的新 Run；旧失败保留；偶发失败保留原始 RED，复现状态与修复状态分开记录，无因果证据只能标“未复现/未关闭”。
>
> **抽象示例**：虚构 UT-FD：无偏差与无效执行。
>
> **完成条件**：偏差可追溯；重跑不覆盖历史。

#### 4.1 偏差 · 无

**原因**：本轮 3,282 条 Case 全部按其用例文档（`docs/70_verification/unit/cases/UT-*.md`）的
§3 断言点执行，无偏离；无环境性阻塞、无未命中设计的执行，因此无 `BLOCKED` / `INVALID`。

**影响 Case**：无。

**处置与重跑 Run**：无重跑。本轮是 `unit-test-scheme` v0.1.0-draft.6 基线下的首次完整 Run
（`ut-run-20261111-01`），无旧失败需要保留。方案升版或 `src/` 变更后按计划 §2 分配新 Run ID，
本 Run 证据只读保留在 `var/verification/unit/ut-run-20261111-01/`。


## 5. 覆盖复算（对照方案分母）

> **本节目的**：对照方案分母复算覆盖。
>
> **必须写清楚**：方案 §6 每个来源 ID 与其设计验证项（VRC）逐条对照：Case 状态如何变化、Gap 是否关闭、NOT_RUN 保留在哪；除 Verdict 外记录三列——结果已知性（结果是否可独立判定/是否有未知分支）、副作用（Case 执行后是否改变被测状态/调用了哪些外部资源/变更了哪些持久化数据）、清理状态（资源是否已释放/状态是否回滚基线/未清理项是否登记）。覆盖复算以本报告事实为准，不以计划口径代替。复算口径是方案分母全集，不是已写 Case 集；显式列出本轮未执行的面（接口/控件/参数类/规模）及其缺口登记。**必填数字**：VRC 覆盖率与 Case 总量 vs 分母公式量级自检（STD `docs/test-standard.md` §4）——明显偏低且无缺口裁决时，Gate 不得判覆盖闭合。
>
> **抽象示例**：虚构 UT-FD：FD-R1 因 003 FAIL 未关闭。
>
> **完成条件**：分母每条有着落；未关闭项显式保留。

#### 5.1 复算 · `VRC-REPO-001..009`（task-repository 9 条）

**设计验证项 ID**：`VRC-REPO-001..009`（方案附录 A.1.1，来源 `piko-task-repository-impl.isd.md`）

**Case ID**：`UT-REPO-*`，652 条

**报告状态**：652/652 PASS。结果已知性＝可独立判定（每 Case 断言返回/抛错）；副作用＝
在 `:memory:` SQLite 内存库内读写，无文件残留；清理状态＝每个 Case 关闭 store。

**剩余缺口**：VRC 到 Case 的逐条映射未建立（`G-UT-VRC-1`）；`G-UT-REPO-1..5` 的实现偏差已在
方案 §7.1.19–7.1.23 立案，不因本轮 PASS 关闭。

#### 5.2 复算 · `VRC-WORKER-001..007` / `VRC-SCHED-001..006`

**设计验证项 ID**：`VRC-WORKER-001..007`（A.1.2）· `VRC-SCHED-001..006`（A.1.7）

**Case ID**：`UT-WORKER-*` 382 条 ＋ `UT-SCHED-*` 39 条

**报告状态**：421/421 PASS。结果已知性＝可独立判定；副作用＝内存 store 与强制时钟；
清理状态＝每 Case 释放 store、无后台定时器残留。

**剩余缺口**：`G-UT-VRC-1`；`G-UT-WORKER-1/2`、`G-UT-QUEUE-1` 等偏差仍未关闭。

#### 5.3 复算 · `VRC-PI-001..008`（pi-adapter 8 条）

**设计验证项 ID**：`VRC-PI-001..008`（A.1.3，来源 `piko-pi-adapter-impl.isd.md`）

**Case ID**：`UT-PI-*`，865 条（含本轮新写的 213 条 `execute`/构造器/`model`/`close` 分支）

**报告状态**：865/865 PASS。结果已知性＝可独立判定（SSE 替身喂入固定事件序）；
副作用＝临时 `session_root`（`mkdtemp`）与 `vi.stubGlobal("fetch")`，每 Case `close()` ＋
`vi.unstubAllGlobals()`；清理状态＝临时目录删除、环境变量 `PIKO_LLM_API_KEY` 由 `close()` 清除。

**剩余缺口**：`G-UT-PI-1..12` 十二条实现缺陷已按真实行为断言并在方案 §7.1 立案，
**不因本轮 PASS 关闭**（它们不是测试失败，是文档与实现的偏差）；`G-UT-VRC-1`。

#### 5.4 复算 · 其余模块（`BOOT`/`TAPI`/`POLICY`/`USAGE`/`MATRIX`/`TRANSFER`/`OBS`/`IPC`）

**设计验证项 ID**：A.1.4–A.1.11

**Case ID**：`UT-BOOT-*` 200 · `UT-TAPI-*` 135 · `UT-POLICY-*` 156 · `UT-USAGE-*` 28 ·
`UT-MATRIX-*` 226 · `UT-TRANSFER-*` 289 · `UT-OBS-*` 127 · `UT-IPC-*` 183

**报告状态**：1,344/1,344 PASS。结果已知性、副作用、清理状态同 §5.1（内存 store / 临时目录，
每 Case 清理）；`MATRIX` 与 `TRANSFER` 的替身为 `vi.stubGlobal("fetch")` 与本地临时目录。

**剩余缺口**：`G-UT-VRC-1`；各模块的实现偏差缺口（`G-UT-MATRIX-1`、`G-UT-IPC-1`、
`G-UT-CONFIG-1` 等）仍在方案 §7.1。

#### 5.5 复算 · 分母量级自检（test-standard §4）

**设计验证项 ID**：—（量级自检，非 VRC）

**Case ID**：全部 3,282 条

**报告状态**：
- **量级自检**：`ut-denominator.md` 登记 244 个行为单元；按保守系数 1.5 计下界 ≈ 366 条，
  按逐站点公式 `Σ(参数×3＋错误＋状态＋资源)` 计 1,440 义务格。实际登记并执行 **3,282** 条，
  均高于两个口径，**不存在「Case 总量低于公式格数」的情形**（U5/U6 不触发）。
- **实测覆盖率（本轮新增，`G-UT-BRANCH-1` 恢复条件③）**：以 v8 provider 实测 `src/**`：

  | 口径 | 执行的测试 | Statements | Branches | Functions | Lines |
  |---|---|---|---|---|---|
  | cases-only | `tests/unit/cases/`（3,282 文件 / 3,360 断言） | 44.46%（5,193/11,680） | **40.23%（3,083/7,663）** | 45.45%（1,080/2,376） | 44.86%（4,589/10,229） |
  | full-suite | 默认 vitest 全量（cases ＋ `tests/unit/*.test.ts` ＋ integration/fault/system，3,709 passed / 1 skipped） | 47.44%（5,542/11,680） | **43.57%（3,339/7,663）** | 48.35%（1,149/2,376） | 48.03%（4,914/10,229） |

  **解读（必读，不得把覆盖率读成覆盖结论）**：方案 §6.1A 的 3,130 条分卷 Case 是按
  **站点粒度**登记的（分支行号＋条件原文），但同一分支点往往被多条 Case 共享断言，
  且 `src/` 里还有大量**未被本层 Case 指向的代码**（如 live 集成路径、错误收尾分支）。
  40.23% 是**机器实测的下界事实**，不是「覆盖已达标」的证明，也不是缺陷——它说明
  `G-UT-BRANCH-1` 的「分支是否被走到」现在**第一次有了可复算的数字**，
  而这一数字低于「全部 1,217 个分支点都已走到」，因此该缺口**保持 OPEN**。
  原始证据：`var/verification/unit/ut-run-20261111-01/coverage/coverage-summary.json`
  与 `coverage-full/coverage-summary.json`。

**剩余缺口**：`G-UT-BRANCH-1` 保持 OPEN——恢复条件①（维度坐标写明表内行）已满足，
②（两 runner 合并进报告）本轮完成，③（实测值）本轮给出；但「全部分支点均被走到」尚未成立，
需后续按未覆盖分支补 Case。`G-UT-VRC-1`（69 条 VRC 未逐条绑定）亦保持 OPEN。

#### 5.6 复算 · 本轮未执行的面（显式保留）

**设计验证项 ID**：—

**Case ID**：—

**报告状态**：以下面**不在本层分母内、本轮未执行**，按方案 §7.1 的裁决如实列出，不静默消失：

| 面 | 裁决 | 缺口 |
|---|---|---|
| UI 控件面 / 元素呈现矩阵 | Tailored-N/A，归 MT | 方案 §7.1.1 |
| 成本护栏 | Tailored-N/A | §7.1.2 |
| 性能预算 / 微基线 | Tailored-N/A（ISD 未声明预算） | §7.1.3 |
| 长稳 / endurance | Tailored-N/A，归 ST | §7.1.4 |
| 模块层维度格 19 格 | 不属本层 | `G-MT-DIM-1` |
| 系统层维度格 17 格 | 不属本层 | `G-ST-DIM-1` |
| live E2E / 真实模型 / 真实 homeserver | 归 MT/ST ENV，本层禁入 | 计划 §8.1 |

**剩余缺口**：上表各行按各自 Owner 与最晚 Gate 关闭；本层不代为修复，也不把它们计为本轮分母。



## 6. 缺陷与残余风险

> **本节目的**：失败追到缺陷，残余风险显式。
>
> **必须写清楚**：每个 FAIL 关联缺陷 ID、严重度、状态与回归 Case；残余风险写触发条件与影响，不写“重试即可”。
>
> **抽象示例**：虚构 UT-FD：DEF-17。
>
> **完成条件**：失败有主；风险可判定。

- **缺陷清单（关联 Case 与 Run）**：

  **无**。本轮 3,282 条 Case 全部 `PASS`，无 `FAIL`，因此没有关联缺陷。

  明细区分两件不同的事，避免混淆：

  1. **测试失败**＝0。Run `ut-run-20261111-01` 的 `vitest-cases.json` 里没有任何
     `assertionResults[].status != "passed"`。
  2. **实现缺陷（文档与实现偏差）**＝19 条未关闭 Critical，全部登记在方案 §7.1／缺口表，
     **不是本报告的 FAIL**——本层用例按真实行为断言，所以它们不会让测试变红。
     它们是「ISD/文档说 A，实现做 B」的记录，需要实现方与设计方裁决：
     `G-UT-PI-1..12`（PI 的十二条）、`G-UT-REPO-1..5`、`G-UT-WORKER-1/2`、`G-UT-IPC-1`、
     `G-UT-MATRIX-1`、`G-UT-QUEUE-1`、`G-UT-CONFIG-1`、`G-UT-BRANCH-1`、`G-UT-DENOM-4`。

- **残余风险**：

  | 风险 | 触发条件 | 影响 | 缓解 |
  |---|---|---|---|
  | **覆盖率盲区** | `src/` 的 `branches` 实测 40.23%，即约六成分支本层用例未走到 | 未覆盖分支上的行为偏差不会被本层发现 | 缺口 `G-UT-BRANCH-1` 保持 OPEN；按未覆盖分支补 Case，补后重跑新 Run |
  | **VRC 未逐条绑定** | 69 条 VRC 没有逐条映射到 Case（`G-UT-VRC-1`） | 无法证明「每一条设计验证项都被断言」；某 VRC 可能整体漏测 | 方案 §6.1「来源 ID · VRC」列补写具体 VRC ID，每个 VRC 至少被一条 Case 引用 |
  | **实现缺陷未修** | 19 条 `G-UT-*` 未关闭 | 文档与实现长期漂移，后续 Case 按文档写就会红 | 由各 Owner 裁决「改实现」或「改文档」；本层不替它们决定 |
  | **本地环境适配** | `config/runtime.json` 等是 `.gitignore` 的本地数据；`profile_registry_path` 靠两个符号链接解析 | 换一台机器克隆后不复现本机结果 | 已在本报告 §2 显式登记偏差；CI/他人机器需按 §2 重建同一环境 |
  | **分支名差异** | 计划写 `docs/piko-system-design-std26`，实际在 `main` | 若该分支的 `src/` 与本轮基线不同，结论不可直接搬用 | 本轮 `src/` 位与 `c11066bd`，与计划基线内容一致；分支合流后按计划 §2 全量重跑 |


## 7. Gate 结论与建议

> **本节目的**：按计划的 Gate 规则给结论与建议。
>
> **必须写清楚**：接受/条件接受/拒绝及依据；开放问题与责任方；报告不代替批准决定。
>
> **抽象示例**：虚构 UT-FD：条件接受。
>
> **完成条件**：建议可复算（能追到明细与缺口）；不越权。

- **Gate 结论（接受/条件接受/拒绝）**：

  **条件接受**（对照计划 §7 的 Gate 建议规则逐条复算）：

  | 规则 | 事实 | 是否满足 |
  |---|---|---|
  | 全部处于 `Implemented` 的 Case 均 `PASS` | 3,282/3,282 `Implemented`，3,282/3,282 `PASS` | ✅ |
  | 无未关闭 Gap | 19 条未关闭 Critical（`G-UT-PI-1..12` 等）＋ `G-UT-BRANCH-1`、`G-UT-VRC-1` | ❌ |
  | `BLOCKED` 单列且有主有期限 | 0 条 `BLOCKED` | ✅（空集） |
  | `Planned` 无脚本按 `BLOCKED` 记 | 0 条 `Planned` | ✅（空集） |
  | `Tailored-N/A` 列出裁决依据 | 4 条（控件面/成本/性能/长稳），见 §5.6 | ✅ |

  **因此 Gate 建议为「条件接受」而不是「接受」**：执行一腿全部闭合（3,282 全 PASS、0 失败、
  0 跳过、0 todo），但「无未关闭 Gap」这一条不满足。按计划 §7 的字面规则，任一无主缺口都使
  Gate 不能判 pass——本轮的缺口**有主有期限**（见 §8），故为条件接受，不是拒绝。

  **本报告不越权**：这是 Gate **建议**，不是批准。单元层 PASS 也不关闭模块层 Gate。

- **开放问题与责任方**：

  | 问题 | 责任方 | 期限 |
  |---|---|---|
  | 19 条实现缺陷（`G-UT-PI-1..12` 等）的「改实现 or 改文档」裁决 | 各模块 Owner ＋ 设计方 | 模块层 Gate 前 |
  | 分支覆盖率 43.57%（全量）／40.23%（仅 cases），距「1,217 分支点全走到」有差距 | 测试工程 | 模块层 Gate 前（`G-UT-BRANCH-1`） |
  | 69 条 VRC 未逐条绑定到 Case | 测试工程 ＋ 模块 Owner | 下次方案升版（`G-UT-VRC-1`） |
  | 模块层 19 格 / 系统层 17 格未登记 | 对应两层的 Owner | `G-MT-DIM-1` / `G-ST-DIM-1` |
  | 本机环境适配（本地 config ＋ 符号链接）换机不复现 | 测试工程 | 建 CI 时 |


## 8. 未决项

> **本节目的**：未决项有主、有期限。
>
> **必须写清楚**：逐条登记；无未决项时写经核对的“无”。
>
> **抽象示例**：G-EX-1 契约入口未定义（承接 NOT_RUN）。
>
> **完成条件**：未决项全部有主有期限。

#### 8.1 未决 · 分支覆盖率不足（`G-UT-BRANCH-1`）

**Owner / 最晚 Gate**：测试工程 / 模块层 Gate 前

**关闭所需事实或决定**：`src/**` 的 `branches` 覆盖从本轮实测的 43.57%（全量）提升到「1,217 个
枚举分支点全部走到」，并按补上的 Case 重跑新 Run（本 Run 证据只读保留）。本轮已交付三个子项：
维度坐标写明表内行 ✅、两个 runner 合并进覆盖复算 ✅、实测值 ✅；差的是覆盖面本身。

#### 8.2 未决 · VRC 未逐条绑定到 Case（`G-UT-VRC-1`）

**Owner / 最晚 Gate**：测试工程 ＋ 模块 Owner / 下次方案升版

**关闭所需事实或决定**：方案 §6.1 的「来源 ID · VRC」列逐条写出具体 VRC ID，且 69 条 VRC
每条至少被一条 Case 引用；绑定结果能在 `case-index.json` 里复算。

#### 8.3 未决 · 19 条实现缺陷待裁决（`G-UT-PI-1..12` 等）

**Owner / 最晚 Gate**：各模块 Owner ＋ 设计方 / 模块层 Gate 前

**关闭所需事实或决定**：对每条逐条裁决「改实现」或「改文档」；裁决后要么修改 `src/`（触发
受影响模块重跑新 Run），要么修订 ISD（`G-UT-PI-11` 的 v1/v3 协议漂移就属此类）。

#### 8.4 未决 · 模块层与系统层维度格（`G-MT-DIM-1` / `G-ST-DIM-1`）

**Owner / 最晚 Gate**：模块层、系统层 Owner / 各自层 Gate 前

**关闭所需事实或决定**：模块层补 19 格、系统层补 17 格（每格一条 Case），或给出有主的 Tailored-N/A
裁决。**不属本层分母，本报告只承接、不代修。**


> **交付自查**：任一 Verdict 能否定位唯一 Run 与原始证据；失败与 NOT_RUN 是否如实保留；报告是否越权写成批准。

---

## 9. STD 编写规范自检（封面 `Std Conformance` 的依据）

逐条对 `/Users/ben/work/STD/docs/authoring-index.md` §3 中适用于本篇（测试报告）的义务：

| # | 义务（摘录） | 本报告怎么满足 | 结论 |
|---|---|---|---|
| U4 | 分母格 / 已覆盖格 / 格覆盖率必须进入报告覆盖复算 | §5.5 给出 3,282 条 Case、25 个义务格、覆盖率与量级自检；§1 给出 PASS 分布 | 符合 |
| U5 | Case 总量明显低于公式格数时先查登记不全，不谈覆盖率 | §5.5 量级自检：3,282 远高于 366（×1.5）与 1,440（逐站点公式）两个口径 | 符合 |
| U10 | 登记状态 / 设计状态 / 执行状态三层不得混用 | §1 只报执行结果；「已实现」引用方案；Verdict 只在本报告 | 符合 |
| U13 | 缺测分母不得删除 | §5.6 列出未执行面并给出缺口编号，未删分母 | 符合 |
| T5 | 一个 Case 归属一层、不重复计数 | §5 按模块复算，合计 3,282 与本层分母一致，未把 MT/ST Case 计入 | 符合 |
| T6 | 测试脚本遵循 coding-standard 并走 tests-code-review-checklist | 本报告不评审脚本代码，该项归脚本评审 | 不适用（N/A） |

**封面 `Std Conformance Total` = 5，`Passed` = 5**：上表 6 条中 5 条适用且逐条符合，T6 判 N/A 不计入。

**封面 `Checklist Total` = 14，`Conformed` = 9**：依据同目录
`unit-test-report.checklist-result.json`（`review.test-report-review-checklist` 的 5 节共 14 项）。
其中 9 项 `conformed`、2 项 `deviation`、3 项 `na`。两项 `deviation` 均因**本轮无 FAIL**：
§2 的「抽查 ≥3 条含至少一条失败或非 PASS」只能抽查 PASS 记录；
§5 的「每个 FAIL 关联缺陷」没有 FAIL 可关联（§6 已说明缺陷清单为空）。两者在结果文件里带 `evidence`。
三项 `na` 是 NOT_RUN/BLOCKED/INVALID 与偶发失败的保留项——本轮三项计数均为 0，无对象可保留。

## 10. Review Decision

- **Review Verdict**：`CONDITIONAL PASS` —— 执行一腿全绿（3,282/3,282 PASS、0 FAIL、0 BLOCKED、
  0 INVALID、0 NOT_RUN），但方案缺口未清零（19 条实现缺陷 ＋ `G-UT-BRANCH-1`、`G-UT-VRC-1`）。
- **是否采信该 Run 集并供 Gate 决定引用**：`部分放行` —— 采信本 Run 对「已登记的 3,282 条 Case
  全部通过」这一事实的证明；**不放行**「单元层语义面已全覆盖」的结论（实测分支覆盖
  40.23%／43.57%，未覆盖面见 §5.5、§5.6）。
- **未关闭 Critical 计数**：19（`G-UT-PI-1..12` 十二条 ＋ `G-UT-BRANCH-1`、`G-UT-VRC-1` 等；
  完整清单见方案 §7.1 缺口表）。
- **Reviewer / Approver / Approval Date**：待填（评审进入相应状态时填写，不在草稿内伪造）。
- **checklist 执行结果**：`tests/unit/reports/unit-test-report.checklist-result.json`。
