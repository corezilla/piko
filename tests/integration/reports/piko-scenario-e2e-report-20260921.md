<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko 场景端到端执行报告 — 2026-09-21 oMLX

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-scenario-e2e-report-20260921` |
| Document Version | `0.1.0` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-21` |
| Last Modified Date | `2026-09-21` |
| Template ID | `assurance.test-report` |
| Template Version | `0.1.1` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `tests/integration/reports/piko-scenario-e2e-report-20260921.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 执行摘要与结论

按 `piko-scenario-e2e-test-plan-v0.1` / `-specification-v0.1` 执行六个 Slinky 型端到端场景
（SC-01..SC-06），全部对本地 oMLX（`Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed`）真实运行，
经 Piko 四项任务 API 驱动，profile=`workspace-exec`（read/write/edit + bash）。

| 状态 | Count |
|---|---:|
| PASS | 6 |
| FAIL | 0 |
| BLOCKED / NOT_RUN | 0 |

**结论**：Piko 端到端可承载多文件读写的文档生成、文档评审、多语言代码生成、代码评审、
bash 执行测试、调试修复六类任务；多轮工具循环、bash 实际执行、输出产物回收（sha256）
全部符合预期。未发现 Piko 运行时缺陷。

## 2. 被测基线与实际环境

| 项 | 值 |
|---|---|
| Piko | branch `docs/piko-system-design-std26` @ `b374430` |
| Pi AgentHarness | v0.85.1 / `9767ba27`（pinned + patched） |
| LLM | oMLX `Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed` @ `127.0.0.1:9000/v1/` |
| Piko API | `127.0.0.1:8787`（bearer） |
| profile | `workspace-exec`（bash：effect=process、replay=never、executables=python3/pytest/node/npm/cat/ls/mkdir） |
| 种子目录 | `var/acc/scen/`（隔离，执行后清理） |
| 公共预算 | max_model_calls=24 / max_tool_calls=24 / deadline 15min |

## 3. 执行记录

| Case | Run ID | 耗时 | 结果 | 关键证据 |
|---|---|---|---|---|
| demo（入门实验） | `run-d1b6d8d4-f4a9-4e9e-98bf-32259ffd751b` | ~90s | PASS | write 建 `hello.py`（25B）→ bash `python3` 执行；3 ModelCall + 2 ToolCall；本地复跑输出 `hello-piko-demo` |
| SC-01 写设计文档 | `run-fc067216-b97d-4aae-b0bd-7274ffc97fa6` | 27s | PASS | 读 `requirements-notes.md` → 写 `design.md` 5641B；关键词 缓存×15 / 鉴权×8 / 审计×11；outputs sha256 记录 |
| SC-02 review 设计文档 | `run-c6761fb5-b73c-4ecf-93cb-245707f7863e` | 24s | PASS | 读植入矛盾文档 → `design-review.md` 4924B；命中植入缺陷「Token 有效期过长（高）」并另报审计完整性、缓存可观测性 |
| SC-03 编写代码 | `run-bbf6b476-39a1-456e-908a-62891bfdfb94` | 13s | PASS | 三文件 `src/fib.py`+`web/index.html`+`src/util.ts`；`py_compile` 过、`fib(10)=55`、`<!DOCTYPE html>`、`export function clamp` 全部本地复核通过 |
| SC-04 review 代码 | `run-1375d509-71c4-4304-bf25-57d0bdc4cd7b` | 15s | PASS | 读植入 bug 的 `calc.py` → `calc-review.md` 1772B；精准定位偶数长度 median 取整错误并给修复 |
| SC-05 执行测试 | `run-5e37b0a7-cb80-418b-b318-8ee4ea5b58a9` | 9s | PASS | bash 执行 `python3 -m pytest test_calc.py -v` → `test-report.md` 含命令原文 + 3 用例通过明细 |
| SC-06 调试修复 | `run-14b18841-112a-424b-8c88-b998b68bd4f5` | 18s | PASS | bash 观察失败 → read 定位 → edit 修复 → bash 复跑；5 ToolCall 全 Completed；**执行后本地复跑 pytest = 3 passed** |

## 4. 偏差、无效执行与重测

- **环境偏差（已排除）**：首次 `demo-bash-001/002` 因 Piko 进程早于 `workspace-exec` profile
  写入而启动，registry 仍为旧版 → `UnknownToolProfile`。重启（并清理孤儿进程、确认端口归属）
  后 `demo-bash-003` 通过。该教训已回写测试计划 §7（Entry criteria / 进程卫生）。
- **无 RERUN**：六个场景均一次通过；无 INVALID。

## 5. 缺陷、逃逸问题与风险

- **Piko 运行时缺陷：0**。
- **测试基建教训 3 条**（已写入测试计划，非 Piko 缺陷）：① profile/配置变更后必须重启 Piko；
  ② 重启须核对 8787 端口归属（孤儿进程致 EADDRINUSE 静默失败）；③ 宿主机无 pytest CLI，
  用 `python3 -m pytest`。
- 观察（非缺陷）：SC-02 的植入「30 分钟 vs 24 小时」对照中，需求侧数值未随任务下发，模型仅
  凭设计文本判定「有效期过长」——Oracle 按规格只要求命中 token/有效期概念，已满足；后续如需
  对照式评审，应在种子中同时提供需求原文。

## 6. 覆盖与 traceability

- 计划/规格：`piko-scenario-e2e-test-plan-v0.1`、`piko-scenario-e2e-test-specification-v0.1`（SC-01..SC-06）。
- Slinky 参考：`corezilla/slinky` `docs/60_interfaces/contracts/piko-test-task-scenarios.md`
  （SC-01↔PTS-08 子集、SC-02↔PTS-05、SC-03↔PTS-02 子集、SC-04↔PTS-05、SC-05↔PTS-04、SC-06↔PTS-02/09）。
- 承接运行时约束：PK-T03（身份幂等）、PK-T08（部分输出）、PK-T37（预算）、PK-T40（路径/配置拒绝）。

## 7. 测量结果、不确定度与限制

- 耗时：SC-01 27s / SC-02 24s / SC-03 13s / SC-04 15s / SC-05 9s / SC-06 18s（单执行槽串行）。
- 模型为 35B 本地量化模型，内容质量存在波动；Oracle 全部为客观判定（文件/编译/pytest/关键词），
  不评判主观质量。
- 限制：bash 以 Piko 进程权限在 workspace cwd 执行（开发机假设，生产隔离属 operator Gate）；
  未覆盖并发/性能（单执行槽为设计，PK-T15）。

## 8. Release/Review Gate 建议

- **本报告结论**：六类真实任务场景端到端 PASS，Piko 任务执行面（多文件读写、bash 执行、产物回收）
  具备可执行证据。
- 真实 LLMTier 兼容维持既有定位（独立部署 Gate，operator 方向决定），不在本报告范围。
- Runtime Activation：`false`（本报告不授权任何运行时变更）。
