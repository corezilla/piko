<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko system-test-report

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `system-test-report` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode |
| Created Date | `2026-10-11` |
| Last Modified Date | `2026-10-11` |
| Template ID | `tests.system-test-report` |
| Template Version | `0.3.12` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `tests/system/reports/system-test-report.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

> **编写建议**：本模板是系统层测试报告，由测试计划（tests.system-test-plan）的执行流程（§4/§7）产出：汇总一次计划执行的逐 Case 结果、覆盖复算与 Gate 建议。报告是 Verdict 的唯一权威；没有有效 Run 不得写 PASS。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。

> 本报告绑定软件系统：父设计经 `--parent-document-id` 写入 metadata。

### 模板定位：报告、方案、用例、计划与 Run 证据的边界

> **编写建议**：系统层报告：汇总一次系统计划执行；分母对照系统方案（tests.system-test-scheme）；验收结论另循验收活动，本报告不代替。

- **Verdict 唯一持有**：执行状态（NOT_RUN/BLOCKED/INVALID）与实际判定（PASS/FAIL）只在测试报告与 Run 证据中产生；方案与 Case 文档不预填任何结果。
- **引用不复制**：逐 Case 结果引用 Run ID 与证据路径，不把 stdout 全文搬进报告。
- **保留失败**：失败、阻塞、无效与未运行如实保留；重跑生成新报告不覆盖旧失败。
- **不越权**：Gate 建议不是批准；验收与发布授权另循其轨。

### 状态语义：执行状态与 Verdict

> **编写建议**：Verdict 只能来自有效 Run 的断言结果；环境缺失记 BLOCKED、执行未命中设计记 INVALID、未运行记 NOT_RUN——三者都不是 FAIL 也不是 PASS。判定不改预期迁就实现。

- **执行状态**：`NOT_RUN` / `BLOCKED` / `INVALID`——未运行 / 环境阻断 / 执行未命中设计；运行记录与环境事实。
- **实际判定 Verdict**：`PASS` / `FAIL`——断言与独立 Oracle 一致 / 不一致；有效 Run 的断言结果。

> **完成条件**：同一事实只能得到可解释的判定；从任一 Verdict 能追到唯一 Run 与原始证据。

## 1. 执行摘要与结论

- **Run ID**：`run-20261011-02`（系统层；黑盒）
- **结论**：系统层集成子集 **30 例**，PASS 30、FAIL 0；契约校验 **PASS**。
- **边界**：需真实外部依赖的 Case（真模型、真 Matrix、真 scp 远端）本 Run 未执行，记 `NOT_RUN`，见 §3。

## 2. 被测基线与实际环境

- **源码基线**：`main` @ `ef34847`；契约 `0.3.0-simplified.6`；STD `draft.120`。
- **运行环境**：Node 22.19 / TS 5.9.3 / vitest 4.1.9；OS macOS（darwin）。环境实例：`ENV-LOOPBACK`。
- **证据**：`tests/system/reports/run-20261011-02/artifacts/system.json` 与 `contract.txt`。
- **外部依赖**：LLMTier 以替身注入；Matrix 与真 scp 远端未接入。

## 3. 逐 Case 执行记录

> 证据：`tests/system/reports/run-20261011-02/artifacts/`。

| Case ID | 入口 | Verdict |
|---|---|---|
| `ST-APP-001..004`、`ST-SEC-001` | `tests/integration/http-api.test.ts` | PASS |
| `ST-LLM-001` | `tests/integration/llmtier-contract.test.ts`（替身注入） | PASS |
| `ST-DATA-002`、`ST-DATA-003`、`ST-PROC-002`、`ST-OPS-001` | `tests/integration/http-api.test.ts` + `tests/unit/p-input.test.ts` | PASS |
| `ST-DATA-005` | `tests/integration/transfer-scp.test.ts`（hermetic） | PASS |
| `ST-REC-001` | `tests/integration/worker-partial-output.test.ts` | PASS |
| `ST-APP-005`、`ST-APP-006` | `tests/unit/server.test.ts` · `tests/unit/store.test.ts` | PASS |
| `ST-DATA-001`、`ST-DATA-004` | `tests/unit/p-input.test.ts` | PASS |
| `ST-OBS-001` | `tests/unit/observability.test.ts` · `tests/unit/server.test.ts` | PASS |
| `ST-EXEC-001` | `tests/integration/exec-lifecycle-live.test.ts`（`ENV-LIVE-LLM`） | NOT_RUN（需真实 Piko + oMLX） |
| `ST-LLM-002` | `tests/integration/exec-lifecycle-live.test.ts`（`ENV-LIVE-LLM`） | NOT_RUN（同上） |
| `ST-MX-001` | `tests/integration/matrix-discussion-live.test.ts`（`ENV-MATRIX`） | NOT_RUN（需 Synapse） |
| `ST-DATA-005`（真 scp 远端段） | `tests/integration/transfer-scp-live.test.ts` | NOT_RUN（`PIKO_SCP_REMOTE` 未设） |

#### 3.1 记录 · 引用方案清单

**执行状态**：NOT_RUN/BLOCKED/INVALID＋原因

**Verdict**：`PASS/FAIL（独立判定，不猜）`

**Run ID / 证据**：`Run 号＋证据路径`

**缺陷 / 备注**：`DEF-xx 或"无"`


### 3.1 测量数据与预算判定（适用时）

> **本节目的**：登记负载/性能/并发类 Case 的汇总测量值与设计预算判定。
>
> **必须写清楚**：预算/基线值引用设计预算出处，不得用被测系统自证；测量值给统计口径（百分位/均值）与样本量；越界记 Blocked 并写明超标幅度；原始时序留证据文件，此处只记汇总。缺测量判定的执行不得判 PASS。
>
> **抽象示例**：虚构 ST-LOAD-003：p95 时延对照预算。
>
> **完成条件**：每个执行过的负载/性能类 Case 有一行判定，可回溯 Run 与证据文件。

每个测量类 Case 一条记录：

#### 3.1.1 测量 · ⟨Case ID⟩ / ⟨指标，如 p95 时延 / 吞吐 / 峰值内存⟩

预算 / 基线值：

（引用设计预算口径出处）

测量值：

（统计口径＋样本量）

判定：

（`PASS` / `越界 Blocked（写偏差幅度）`）

## 4. 偏差、无效执行与重跑

- **INVALID**：无。
- **重跑**：无失败 Case，无需重跑。
- **偏差**：需真实外部依赖的 4 条 Case 未执行（`ENV-LIVE-LLM` ×2、`ENV-MATRIX`、`PIKO_SCP_REMOTE`），按计划记 `NOT_RUN` 而非 `PASS`；其可执行入口已存在，仅环境未就绪。

#### 4.1 偏差 · ⟨项⟩

**原因**：`偏离 Case 文档什么、为何，一句话`

**影响 Case**：`受影响 Case ID 列表`

**处置与重跑 Run**：`处置动作＋新 Run 号；不覆盖旧失败`


## 5. 覆盖复算（对照方案分母）

- **方案分母**：`system-test-scheme` §6 登记 21 条系统层 Case 分母，逐 Case 文档 21 份已全部撰写。
- **本 Run 覆盖**：13 条在本 Run 执行并 PASS；4 条因外部依赖记 `NOT_RUN`；其余分母条目由模块层 Case 覆盖（口径见 `module-test-report` §5）。
- **诚实口径**：`NOT_RUN` 不计入覆盖，本报告不以替身结果冒充真机验证。

#### 5.1 复算 · ⟨方案来源 ID⟩

**设计验证项 ID**：`VRC ID`

**Case ID**：`覆盖本项的 Case ID（多个用/）`

**报告状态**：`一句结论＋逐 Case 分布`

**剩余缺口**：`Gap/DEF 号＋下一步；无则写"无"`


## 6. 缺陷与残余风险

- **本 Run 缺陷**：0 FAIL。
- **残余风险**：真模型、真 Matrix、真 scp 远端三条链路本轮未验证；相关代码已有自动化入口，但需对应环境方可给出 Verdict。

## 7. Gate 结论与建议

- **Gate 建议**：**有条件通过（系统层）**。本 Run 全部已执行 Case 为 PASS、契约校验 PASS、无 FAIL。
- **附带条件**：`ST-EXEC-001`、`ST-LLM-002`、`ST-MX-001` 与真 scp 远端段的 Verdict 须在具备 `ENV-LIVE-LLM` / `ENV-MATRIX` / `PIKO_SCP_REMOTE` 的实机轮次补齐；在此之前系统层 Gate 不应声明为完全关闭。

## 8. 未决项

- 实机轮次待办：`ENV-LIVE-LLM`、`ENV-MATRIX`、`PIKO_SCP_REMOTE` 三类环境的 Case 执行。
- `G-ENV-001` / `G-MATRIX-001` / `G-OBS-001` 已关闭（入口已建成），其 Verdict 仍依赖实机轮次。

#### 8.1 未决 · ⟨条目；无未决项时写经核对的“无”⟩

**Owner / 最晚 Gate**：`责任角色＋日期或 Gate 点`

**关闭所需事实或决定**：`可核对的事实或一句决定内容`


> **交付自查**：任一 Verdict 能否定位唯一 Run 与原始证据；失败与 NOT_RUN 是否如实保留；报告是否越权写成批准。
