<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko 场景端到端测试计划（设计/评审/编码/代码评审/测试执行/调试）

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-scenario-e2e-test-plan-v0.1` |
| Document Version | `0.1.0` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-21` |
| Last Modified Date | `2026-09-21` |
| Template ID | `assurance.test-plan` |
| Template Version | `0.1.1` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/plans/piko-scenario-e2e-test-plan-v0.1.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目标、范围与测试层级

- **层级**：integration / end-to-end（真实进程、真实 oMLX 模型、真实工具执行，经 HTTP API 驱动）。
- **目标**：验证 Piko 端到端可承载 Slinky 型真实任务场景：写设计文档、评审设计文档、编写代码（python/html/ts）、评审代码、执行测试、调试修复——覆盖多文件输入/输出与 bash 执行。
- **不证明**：模型生成内容的 subject-matter 质量（Oracle 只做客观判定：文件存在、语法可编译、pytest 实测通过、authority 哈希不变）；真实 LLMTier 依赖（operator 推迟的部署 Gate）；多实例/生产规模。

## 2. 被测基线、排除项与依赖

| 项 | 值 |
|---|---|
| Piko | branch `docs/piko-system-design-std26` @ `5b9b34d`（含 workspace-exec profile） |
| Pi AgentHarness | v0.85.1 / `9767ba27`（pinned + patched） |
| LLM | oMLX `Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed` @ `127.0.0.1:9000/v1/` |
| Piko API | `http://127.0.0.1:8787`（bearer，file-backed secrets） |
| 工具 profile | `workspace-exec`：read/write/edit + bash（effect=process, replay=never, executables 白名单 python3/pytest/node/npm/cat/ls/mkdir） |
| 排除 | LLMTier 真实依赖、Matrix intake（已由 20260919/0920 报告覆盖）、federation、多实例 |

依赖前置：Piko/oMLX 进程健康；`npm run check` 全绿；种子目录可写。

## 3. Test Strategy 与 Coverage Model

- 每场景一次真实 `POST /runs` 全链路：HTTP → Store → Worker（单执行槽）→ Pi AgentHarness → oMLX Responses → 工具循环（read/write/edit/bash）→ Result 发布。
- **客观 Oracle 原则**：只断言可机器复核的事实（产物存在、`py_compile`/`pytest` 实测、哈希不变、内容包含需求关键词），不评判文本主观质量。
- Coverage model = 6 场景 × 工具路径（read / write / edit / bash）× 多文件 × 多轮工具循环；budget 上限 `max_model_calls=24`、`max_tool_calls=24`、deadline 15min。

## 4. Test Item、Feature 与 Requirement Matrix

见测试规格 `piko-scenario-e2e-test-specification-v0.1` §3 Case Matrix（SC-01..SC-06）。运行时约束承接：PK-T03（身份幂等）、PK-T08（部分输出）、PK-T37（预算）、PK-T40（路径/配置拒绝）。

## 5. 环境、设备、拓扑、数据和工具

- 单机 loopback 拓扑（同 20260920 报告 §2）。
- 种子目录 `var/acc/scen/`（gitignore 范围内，执行前由 procedure 重建）：
  - `requirements-notes.md`（SC-01 输入）
  - `design-flawed.md`（SC-02 输入，植入矛盾：需求 token 有效期 30min vs 设计写 24h）
  - `code/calc.py`（SC-04 输入，植入 bug：偶数长度 median 取整错误）
  - `pkg/calc.py` + `pkg/test_calc.py`（SC-05 正确实现 + 3 个 pytest 用例；SC-06 换入 broken 版）
- 复核工具：本机 `python3 -m py_compile`、`pytest`、`node --check`、`shasum`。

## 6. Test Types 与 Case Families

- normal：SC-01/03/05。
- negative/seeded-defect：SC-02（文档缺陷评审）、SC-04（代码缺陷评审）、SC-06（故障调试修复）。
- concurrency / performance / endurance：**裁剪**——单执行槽为既定设计（PK-T15），性能指标无设计预算可对照，仅记录耗时作参考。

## 7. Entry、Exit、Pass、Fail、Blocked 和 Invalid Criteria

- **Entry**：三个服务健康探测通过；`npm run check` 绿；种子就绪；**Piko 进程启动时间晚于任何 profile/配置变更**（registry 仅在启动时加载——实验教训：旧进程会以旧 registry 应答 `UnknownToolProfile`）。
- **进程卫生（实验教训）**：重启必须确认 8787 端口归属新进程（`lsof` + 进程 start time），孤儿 tsx/node 进程会令新实例 EADDRINUSE 静默死亡；清理顺序 = `pkill -9 -f "tsx src/main.ts"` + `pkill -9 -f "node.*src/main.ts"` + 端口清零验证。
- **pytest 调用形态**：宿主机无 `pytest` CLI（PATH），bash 场景一律使用 `python3 -m pytest`（profile 白名单已含 python3）。
- **参考输入**：Slinky 侧任务场景定义 `corezilla/slinky` 的 `docs/60_interfaces/contracts/piko-test-task-scenarios.md`（PTS-01..PTS-10）；本计划 SC-01..SC-06 为其中 PTS-02/04/05/09 子集的本地可执行映射（详见规格 §2）。
- **Pass**：Run `Completed` 且该 Case 全部 Oracle 满足（见规格 §3/§8）。
- **Fail**：Run 非 Completed，或任一 Oracle 不满足。
- **Rerun**：每 Case 允许 1 次重跑（模型非确定性），两次均败判 FAIL；RERUN 记录在案。
- **Blocked**：环境/依赖不可用（如 oMLX 离线）。
- **Invalid**：种子/步骤未按规格执行（不计入分母，重置后重跑）。

## 8. 组织、职责、排期和资源

执行：opencode（驱动 HTTP + 本地复核）；审批：Piko Project Owner。单机单轮，预计 6×1–5 分钟 Run + 复核。

## 9. Defect、Deviation、Rerun 与 Regression

- 发现的 Piko 运行时缺陷：修复 + 回归用例入库（沿袭 20260920 报告惯例）。
- 模型质量偏差（内容差但不违反 Oracle）：记录为观察项，不判 FAIL。
- 通过后的 workspace-exec/契约回归由既有套件承担（本计划不新增重复断言）。

## 10. Evidence、Traceability、Reporting 与 Gate

- 每 Case 记录：`run_id`、state、summary、outputs、known_actions、usage、本地复核命令与输出。
- 证据写入 `tests/integration/reports/` 的场景执行报告（STD test-report）。
- Gate：全部 PASS 方可作为"场景端到端已验证"引用；FAIL/BLOCKED 保持 Gate 开放。

## 11. 风险、安全与清理恢复

- **bash 边界**：bash 以 Piko 进程权限在 workspace cwd 执行——开发机假设，生产部署需另行隔离（operator Gate，不在本计划）。
- 35B 模型非确定性：以客观 Oracle 兜底；允许 1 次 RERUN。
- 清理：产物集中 `var/acc/scen/`，执行后整目录删除即可复位；不触碰仓库其他路径。
