<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko module-test-report

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `module-test-report` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode |
| Created Date | `2026-10-11` |
| Last Modified Date | `2026-10-11` |
| Template ID | `tests.module-test-report` |
| Template Version | `0.3.13` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `tests/module/reports/module-test-report.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

> **编写建议**：本模板是模块层测试报告，由测试计划（tests.module-test-plan）的执行流程（§4/§7）产出：汇总一次计划执行的逐 Case 结果、覆盖复算与 Gate 建议。报告是 Verdict 的唯一权威；没有有效 Run 不得写 PASS。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。

> 本报告绑定单一软件模块：模块对象 ID 经 `--design-object-id`、所属计划经 `--parent-document-id` 写入 metadata。

### 模板定位：报告、方案、用例、计划与 Run 证据的边界

> **编写建议**：模块层报告：汇总一次模块计划执行；分母对照模块方案（tests.module-test-scheme）；子系统层结论归 tests.subsystem-test-report。

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

- **Run ID**：`run-20261011-02`（模块层；灰盒组装层）
- **结论**：`vitest run tests/unit` 全量 **81 例**，PASS 81、FAIL 0、跳过 0。
- **边界**：本层按模块级 Case 粒度编排；纯黑盒系统层用例不在本报告范围（见 `system-test-report`）。

## 2. 被测基线与实际环境

- **源码基线**：`main` @ `ef34847`；契约 `0.3.0-simplified.6`；STD `draft.120`。
- **运行环境**：Node 22.19 / TS 5.9.3 / vitest 4.1.9；OS macOS（darwin）。环境实例：`ENV-UNIT`。
- **证据**：`tests/module/reports/run-20261011-02/artifacts/module.json`（机器可读执行结果）。
- **外部依赖**：本 Run 未依赖 LLMTier 真端点、Matrix 或真 scp 对端（替身与 hermetic 环境生效）。

## 3. 逐 Case 执行记录

> 证据：`tests/module/reports/run-20261011-02/artifacts/module.json`。

| Case ID | 组装路径（可执行入口） | Verdict |
|---|---|---|
| `MT-BOOT-001` | `tests/unit/config-schema.test.ts` · `config.test.ts` · `core.test.ts` | PASS |
| `MT-TAPI-001` | `tests/unit/server.test.ts` | PASS |
| `MT-POLICY-001` | `tests/unit/workspace.test.ts` | PASS |
| `MT-REPO-001` | `tests/unit/store.test.ts` | PASS |
| `MT-SCHED-001` | `tests/unit/p-input.test.ts` | PASS |
| `MT-WORKER-001` | `tests/unit/worker.test.ts` · `worker-runtime.test.ts` · `tool-recovery.test.ts` | PASS |
| `MT-PI-001` | `tests/unit/pi-runtime.test.ts` · `provider-preflight.test.ts` · `responses-replay.test.ts` | PASS |
| `MT-USAGE-001` | `tests/unit/worker.test.ts` · `tests/unit/model-mapping.test.ts` | PASS |
| `MT-MATRIX-001` | `tests/unit/matrix.test.ts` | PASS |
| `MT-TRANSFER-001` | `tests/integration/transfer-scp.test.ts` · `tests/unit/p-input.test.ts` | PASS |
| `MT-OBS-001` | `tests/unit/observability.test.ts` · `tests/unit/server.test.ts`（`GET /diagnostics` 段） | PASS |

#### 3.1 记录 · 引用方案清单

**执行状态**：NOT_RUN/BLOCKED/INVALID＋原因

**Verdict**：`PASS/FAIL（独立判定，不猜）`

**Run ID / 证据**：`Run 号＋证据路径`

**副作用 / 清理**：`运行后清理动作与泄漏检查一句话`

**缺陷 / 备注**：`DEF-xx 或"无"`


### 3.1 基线测量与回归比对（适用时）

> **本节目的**：登记性能/复杂度类 Case 的基线测量值与回归比对结果。
>
> **必须写清楚**：基线来源（上一 Run 或设计/ISD 口径，注明出处）、测量统计口径与样本量、回归判定（越阈按 scheme 家族行处置并写偏差幅度）；原始时序留证据文件，此处只记汇总；缺回归判定的执行不得计为有效 PASS。
>
> **抽象示例**：虚构 MT-EXM-003：批处理热路径耗时中位对照上一 Run 基线。
>
> **完成条件**：每个执行过的基线类 Case 有一行可回溯 Run 的回归判定。

每个基线类 Case 一条记录：

#### 3.1.1 基线 · ⟨Case ID⟩ / ⟨指标：耗时中位/峰值内存/复杂度采样⟩

基线 / 来源：

（上一 Run ID 或设计口径出处）

测量值：

（统计口径＋样本量）

回归判定：

（`阈值内` / `越阈 Blocked（写偏差）`）

## 4. 偏差、无效执行与重跑

- **INVALID**：无。全部执行为确定性运行。
- **重跑**：无失败 Case，无需重跑。
- **偏差**：`MT-TRANSFER-001` 的真 scp 远端段（`transfer-scp-live.test.ts`）未在本 Run 执行——`PIKO_SCP_REMOTE` 未设置，按计划记 `NOT_RUN`；hermetic 段已执行并通过。

#### 4.1 偏差 · ⟨项⟩

**原因**：`偏离 Case 文档什么、为何，一句话`

**影响 Case**：`受影响 Case ID 列表`

**处置与重跑 Run**：`处置动作＋新 Run 号；不覆盖旧失败`


## 5. 覆盖复算（对照方案分母）

- **方案分母**：`module-test-scheme` §6 登记 11 条 `MT-*-001`。
- **本 Run 覆盖**：11/11 全部执行且通过；逐 Case 的接口映射见各 `MT-*-001` 文档 §1 总账。
- **口径说明**：本层覆盖以模块公开接口与组装路径为界；模块内私有函数的细粒度归 `unit-test-report`。

#### 5.1 复算 · ⟨方案来源 ID⟩

**设计验证项 ID**：`VRC ID`

**Case ID**：`覆盖本项的 Case ID（多个用/）`

**报告状态**：`一句结论＋逐 Case 分布`

**剩余缺口**：`Gap/DEF 号＋下一步；无则写"无"`


## 6. 缺陷与残余风险

- **本 Run 缺陷**：0 FAIL。
- **残余风险**：真 scp 远端段与真模型/真 Matrix 场景未在本层执行（属系统层与环境依赖范围）。

## 7. Gate 结论与建议

- **Gate 建议**：**建议通过（模块层）**。11/11 分母 Case 全部执行且 PASS，无 FAIL、无未关闭的模块层缺口。
- **附带条件**：真 scp 远端段记 `NOT_RUN` 并保留在系统层/实机 Gate，不以本报告掩盖。

## 8. 未决项

- `G-CASE-003`（模块层缺脚本部分）已关闭：`MT-OBS-001` 已获专属入口 `tests/unit/observability.test.ts`。
- 编号一致性已处理：`G-CASE-002` / `G-CASE-003` 全库统一为 `G-CASE-003`。

#### 8.1 未决 · ⟨条目；无未决项时写经核对的“无”⟩

**Owner / 最晚 Gate**：`责任角色＋日期或 Gate 点`

**关闭所需事实或决定**：`可核对的事实或一句决定内容`


> **交付自查**：任一 Verdict 能否定位唯一 Run 与原始证据；失败与 NOT_RUN 是否如实保留；报告是否越权写成批准。
