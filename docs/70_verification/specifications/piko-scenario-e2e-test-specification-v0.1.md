<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko 场景端到端测试规格（SC-01..SC-06）

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-scenario-e2e-test-specification-v0.1` |
| Document Version | `0.1.0` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-21` |
| Last Modified Date | `2026-09-21` |
| Template ID | `assurance.test-specification` |
| Template Version | `0.2.1` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/specifications/piko-scenario-e2e-test-specification-v0.1.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目标、范围与被测对象

验证 Piko v0.3（`0.3.0-simplified.6`，profile `workspace-exec`）端到端执行六类真实任务场景的能力：多文件读写的设计文档流、代码生成与代码评审、bash 执行测试、调试修复。**不证明**模型内容质量、真实 LLMTier 依赖、生产隔离。

## 2. 引用基线、环境与前置条件

- 基线：Piko @ `5b9b34d`；Pi `9767ba27`；oMLX Qwen3.6-35B（`127.0.0.1:9000`）；Piko API `127.0.0.1:8787`。
- 环境：本机 loopback（详见测试计划 §2/§5）；种子目录 `var/acc/scen/`。
- 前置：服务健康；`npm run check` 绿；种子由执行步骤重建。
- 公共任务参数：`profile=workspace-exec`；`limits={deadline:+15min, max_model_calls:24, max_tool_calls:24}`；`workspace_ref="piko"`；路径均相对 `var/acc/scen/`。

## 3. Case Matrix

| Case ID | Requirement/成员 | 场景/输入 | 独立 Oracle | 环境 | 状态 | Run/证据 |
|---|---|---|---|---|---|---|
| SC-01 | 写设计文档 | 输入 `requirements-notes.md`（≥3 条带关键词需求）→ 产出 `design.md` | Completed；`design.md` 存在且 ≥2KB；逐条包含每个需求关键词；`known_actions` 含 read+write；outputs 含该文件 | oMLX live | NOT_RUN | — |
| SC-02 | review 设计文档 | 输入 `design-flawed.md`（矛盾：需求 token 30min vs 设计 24h）→ 产出 `design-review.md` | Completed；findings 文件存在；内容提及 token/有效期矛盾概念；read 被调用 | oMLX live | NOT_RUN | — |
| SC-03 | 编写代码（python/html/ts） | 产出 `src/fib.py`、`web/index.html`、`src/util.ts` | 三文件存在；`python3 -m py_compile fib.py` 通过；html 含 `<!DOCTYPE html>`；util.ts 含 `export` | oMLX live | NOT_RUN | — |
| SC-04 | review 代码 | 输入 `code/calc.py`（植入 bug：偶数长度 median 整除错误）→ 产出 `code/calc-review.md` | findings 文件存在；内容提及 median/偶数/整除 概念 | oMLX live | NOT_RUN | — |
| SC-05 | 执行测试 | 输入 `pkg/calc.py`（正确）+ `pkg/test_calc.py`（3 用例）→ bash 运行 pytest → 产出 `pkg/test-report.md` | Completed；known_actions 含 bash；report 或 summary 含 `3 passed` | oMLX live | NOT_RUN | — |
| SC-06 | debug 修复 | 输入 `pkg/calc.py` broken 版（同 SC-04 bug）+ 失败测试 → 修复并复跑 | Completed；`pkg/calc.py` 被修改（edit 观测）；**执行后本地复跑 `pytest` = 3 passed** | oMLX live | NOT_RUN | — |

## 4. 正常、边界、负向与并发场景

- SC-02/04/06 为 seeded-defect 负向输入：Oracle 是"评审/修复行为发生且客观可证"，不是"模型必然发现全部问题"；SC-06 以最终 `pytest` 实测为准。
- 输出 budget：24 model/24 tool calls 内未完成 → FAIL（预算 CAS 即设计行为，PK-T37）。
- 并发：不适用（单执行槽设计，PK-T15）；场景间串行执行。

## 5. Recovery、重放、幂等与故障注入

本规格不重复注入：崩溃/重放/幂等由 PK-T05/06/07/20（09-18 live）与 PK-T48（mock 截断）覆盖。SC-06 的"从失败到修复"经由正常 edit 工具路径，非故障注入。

## 6. 性能、容量、功耗或时序测试

裁剪：无设计预算阈值可对照。仅记录每 Case wall-clock 耗时作参考观测。

## 7. 执行步骤与自动化入口

每 Case：
1. 重建种子（规格 §3 的输入内容）。
2. `POST /runs`（指令见执行报告，含明确的目标文件路径与步骤要求）。
3. 轮询 `GET /runs/{id}` 至终态（≤15min）。
4. `GET /runs/{id}/result` 采集 state/summary/outputs/known_actions/usage。
5. 执行本 Case 的本地复核命令（py_compile / pytest / node --check / shasum / grep）。
6. 记录 `run_id` + 复核输出到执行报告。

## 8. Pass/Fail/Blocked/Invalid 判定

- PASS = Run Completed ∧ 全部 Oracle 满足。
- FAIL = 非 Completed，或任一 Oracle 不满足（含两次 RERUN 后）。
- RERUN = 模型非确定性导致的失败允许重跑 1 次，须记录两次 Run。
- BLOCKED = oMLX/Piko 不可用或种子无法建立。
- INVALID = 种子/步骤偏离本规格（重置后重跑，不计分母）。

## 9. Artifact、日志、测量与证据保存

- 每 Case：run_id、终态 JSON、`var/acc/scen/` 产物文件、本地复核命令原文与输出、wall-clock 耗时。
- 汇总为 `tests/integration/reports/` 下 STD test-report；引用 run_id 而非复述结果。
- 失败现场：保留 Piko stdout 片段与种子快照。

## 10. 安全、清理与可重复性

- 所有产物隔离在 `var/acc/scen/`；结束后整目录删除即复位。
- bash 工具以 Piko 进程权限在 workspace cwd 执行——开发机假设；executables 白名单（python3/pytest/node/npm/cat/ls/mkdir）由 profile 声明，生产隔离属 operator Gate。
- 种子文件均为本计划定义的确定内容，可重复重建。
