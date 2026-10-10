<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko unit-test-report

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `unit-test-report` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode |
| Created Date | `2026-10-11` |
| Last Modified Date | `2026-10-11` |
| Template ID | `tests.unit-test-report` |
| Template Version | `0.3.13` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `tests/unit/reports/unit-test-report.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

> **编写建议**：本模板是单元层测试报告，由测试计划（tests.unit-test-plan）的执行流程（§4/§7）产出：汇总一次计划执行的逐 Case 结果、覆盖复算与 Gate 建议。报告是 Verdict 的唯一权威；没有有效 Run 不得写 PASS。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。

> 本报告绑定单一软件模块：模块对象 ID 经 `--design-object-id`、所属计划经 `--parent-document-id` 写入 metadata。

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

## 1. 执行摘要与结论

- **Run ID**：`run-20261011-01`（单元层；同 Run 含 integration 与契约校验产物）
- **结论**：单元层 `vitest` 全量 **104 例**（PASS 103、FAIL 0、跳过 1）；integration 子集 **36 例**（PASS 35、FAIL 0）；契约校验 **PASS**。
- **边界**：本 Run 只覆盖可自动化层；`ENV-REMOTE-SCP`、`ENV-LIVE-LLM`、`ENV-MATRIX` 的 Case 未在本 Run 执行（记 `NOT_RUN`，见 §3）。

## 2. 被测基线与实际环境

- **源码基线**：`docs/piko-system-design-std26`（未 push 本地提交集除外）；契约 `0.3.0-simplified.6`；Pi `9767ba27`。
- **运行环境**：Node 22.19 / pnpm 11.19 / TS 5.9.3 / vitest 4.1.9；OS macOS（darwin）。单元层 ENV：`ENV-UNIT`。
- **外部依赖**：本 Run 未接 LLMTier 真端点 / Matrix / 真 scp 对端（mock 与替身生效）。

## 3. 逐 Case 执行记录

> 证据：`tests/unit/reports/run-20261011-01/artifacts/`（`results.json` 单元、`integration.json` 集成、`contract.txt` 契约）。

| Case ID | 脚本 | Verdict |
|---|---|---|
| `ST-APP-001..004`、`ST-SEC-001` | `tests/integration/http-api.test.ts` | PASS（本 Run integration 子集含 http-api） |
| `ST-DATA-002`（输入失败零调用） | `tests/unit/p-input.test.ts` | PASS（本 Run 单元层含 p-input） |
| `ST-PROC-002`（abort 通道） | `tests/unit/p-input.test.ts` | PASS |
| `ST-DATA-005` 数据面边界 | `tests/integration/transfer-scp.test.ts` | PASS（本 Run integration 含 transfer-scp） |
| `ST-DATA-003` 投递→Result 引用 | `tests/unit/p-input.test.ts` | PASS |
| `ST-OPS-001` purge 保留 tombstone | `tests/unit/store.test.ts` | PASS（本 Run 含 store） |
| `ST-REC-001` 崩溃/Result 冻结 | `tests/unit/worker-runtime.test.ts` / `store.test.ts` | PASS |
| `ST-LLM-001` LLMTier 契约 | `tests/integration/llmtier-contract.test.ts` | PASS（mock） |
| `ST-DATA-005` 白名单/逃逸/known_hosts | `tests/integration/transfer-scp.test.ts` | PASS |
| `ST-MX-001` Matrix 讨论端到端 | — | NOT_RUN（无 homeserver） |
| `ST-OBS-001` 观测/审计端点 | — | NOT_RUN（无诊断端点） |
| `ST-EXEC-001` 真实模型端到端 | — | NOT_RUN（`ENV-LIVE-LLM` 不可用） |
| `ST-DATA-005` 真 scp 对端（opt-in） | — | NOT_RUN（`PIKO_SCP_REMOTE` 未设） |

## 4. 偏差、无效执行与重跑

- **INVALID**：无。全部执行均为确定性运行，无无效判定。
- **重跑**：无失败 Case，无需重跑；证据为单次 Run 的 `results.json` / `integration.json`。
- **偏差**：本 Run 未执行 `ENV-REMOTE-SCP` / `ENV-LIVE-LLM` / `ENV-MATRIX` 相关 Case（外部依赖不可用），按计划记 `NOT_RUN` 而非 `PASS`。

#### 4.1 偏差 · ⟨项⟩

**原因**：`偏离 Case 文档什么、为何，一句话`

**影响 Case**：`受影响 Case ID 列表`

**处置与重跑 Run**：`处置动作＋新 Run 号；不覆盖旧失败`


## 5. 覆盖复算（对照方案分母）

- **方案分母**：`unit-test-scheme` §6 登记 11 条 `UT-*-001`（覆盖 69 条实现层 VRC）。
- **本 Run 覆盖**：上述 Case 所在脚本全部执行且通过；逐 Case 的 VRC 覆盖明细见各 `UT-*-001` 文档 §1 总账。
- **覆盖率**：11/11 集合 Case 通过；VRC 级覆盖 = 各模块文档标注为 `Implemented` 的部分（未实现部分已登记 `G-CASE-003`）。

#### 5.1 复算 · ⟨方案来源 ID⟩

**设计验证项 ID**：`VRC ID`

**Case ID**：`覆盖本项的 Case ID（多个用/）`

**报告状态**：`一句结论＋逐 Case 分布`

**剩余缺口**：`Gap/DEF 号＋下一步；无则写"无"`


## 6. 缺陷与残余风险

- **本 Run 缺陷**：0 FAIL。
- **残余风险**：`ST-MX-001`、`ST-OBS-001`、`ST-EXEC-001` 及真 scp 端到端 Case 未覆盖（`NOT_RUN`）；观测与 Matrix 讨论端到端仍缺自动化入口（`G-MATRIX-001` / `G-OBS-001` / `G-ENV-001`）。

## 7. Gate 结论与建议

- **Gate 建议**：**建议通过（单元层）**。理由：本 Run 全部已执行 Case 为 PASS，无 FAIL，无未关闭的 Gate 级缺口。
- **附带条件**：未执行的外部依赖 Case 已按计划记 `NOT_RUN` 并登记 Owner / Gate，不掩盖；系统层与模块层 Gate 待各自首跑后单独出具报告。

## 8. 未决项

- `G-CASE-003`：部分模块 VRC 缺直接单测（各 `UT-*-001` §4 已列）。
- `G-MATRIX-001` / `G-OBS-001` / `G-ENV-001`：Matrix、观测、真模型端到端的自动化入口待建。

#### 8.1 未决 · ⟨条目；无未决项时写经核对的“无”⟩

**Owner / 最晚 Gate**：`责任角色＋日期或 Gate 点`

**关闭所需事实或决定**：`可核对的事实或一句决定内容`


> **交付自查**：任一 Verdict 能否定位唯一 Run 与原始证据；失败与 NOT_RUN 是否如实保留；报告是否越权写成批准。
