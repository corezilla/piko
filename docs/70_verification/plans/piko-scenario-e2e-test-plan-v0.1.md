<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko 场景测试计划（PTS-01..PTS-10）

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-scenario-e2e-test-plan-v0.1` |
| Document Version | `0.3.0` |
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

- **层级**：integration / end-to-end（真实进程、真实本地 oMLX、真实工具执行，经四项任务 API 驱动）。
- **组织方式**：以 **场景（scenario）** 为顶层，每个场景下设多个 **case**，覆盖不同维度
  （normal / boundary / negative-permission / negative-budget / timeout / cancel / dedup /
  membership / idempotency / invariant / recovery / usage）。
- **场景来源**：Slinky 场景文档 `corezilla/slinky` `docs/60_interfaces/contracts/piko-test-task-scenarios.md`（PTS-01..PTS-10）。
- **目标**：验证 Piko 可承载这些场景所描述的真实任务，并验证权限/预算/取消/恢复等边界行为。
- **不证明**：模型内容质量（Oracle 只做客观判定）、真实 LLMTier 依赖（operator 推迟的部署 Gate）、多实例/生产规模。

## 2. 被测基线、排除项与依赖

| 项 | 值 |
|---|---|
| Piko | branch `docs/piko-system-design-std26`（含 `workspace-exec` profile 与 tier→模型转换） |
| Pi AgentHarness | v0.85.1 / `9767ba27`（pinned + patched） |
| LLM | oMLX `Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed` @ `127.0.0.1:9000/v1/` |
| Piko API | `127.0.0.1:8787`（bearer） |
| 工具 profile | `workspace-exec`（read/write/edit/bash；bash effect=process、replay=never、executables 白名单） |
| tier→模型转换 | `config/model-mapping.json` + `scripts/for-omlx.mjs` + `tests/common/model-mapping.ts`（tier 如 `Worker` → oMLX 模型名；不调用 LLMTier） |
| 排除 | LLMTier 真实依赖、federation、多实例、生产隔离 |

**Entry criteria**：服务健康探测通过；`npm run check` 绿；Piko 进程启动晚于任何 profile/配置变更
（registry 启动时加载）；重启须核对 8787 端口归属（孤儿进程致 EADDRINUSE 静默失败）；pytest 用 `python3 -m pytest`。

**Matrix 场景环境准备（PTS-06）**：运行 `scripts/scenario-env.sh` 创建专用场景房间
（piko-bot `power_level=0`，使 admin 可撤销其 membership）；piko-bot 的权威 token 取自
`~/piko-secrets/matrix-piko-bot`（`users.json` 中的 token 在历次 PK-T18 重置后可能过期）。

**可行性 review 结论（详见规格 §11）**：35 case 全部可执行，0 阻断；28 个直接执行、5 个需收紧
Oracle（模型不确定性）、1 个需故障注入时序（PTS-09-C3）、4 个依赖场景房间脚本。bash 子进程
在 deadline/取消时经实测会被回收；Piko 被 SIGKILL 时子进程不保证回收，需执行后清理。

**执行期已实测的两个陷阱（须遵守）**：① 含工具的 profile 配 `max_tool_calls=0` 会导致
`BudgetExceeded`——讨论/纯文本 case 用 `max_tool_calls≥2` 或声明「不使用工具」；
② 讨论多轮需紧跟发送（首轮过快会先关 intake，followup 不入 turn），C1 的 Oracle 定为
「≥1 turn Consumed」；③ 权限拒绝 case 的终态是 `Failed/ToolFailure`，Oracle 不得要求 `Completed`。

## 3. Test Strategy 与 Coverage Model

- 每个 case 一次真实 `POST /runs` 全链路：HTTP → Store → Worker（单执行槽）→ Pi AgentHarness →
  oMLX Responses → 工具循环（read/write/edit/bash）→ Result 发布。
- **客观 Oracle 原则**：只断言可机器复核的事实（文件存在与字节、`py_compile`/`pytest` 实测、
  哈希不变、内容含关键词、HTTP 状态与错误码），不评判文本主观质量。
- **覆盖模型** = 10 场景 × 多维度 case（见规格 §3，共 35 case）：正常路径、权限拒绝、预算/超时、
  取消、去重、成员资格、幂等、状态不变量、恢复、usage 语义。

## 4. Test Item、Feature 与 Requirement Matrix（按场景）

| 场景 | case 数 | 维度覆盖 | case 前缀 |
|---|---:|---|---|
| PTS-01 只读材料分析 | 3 | normal / boundary / negative-permission | PTS-01-C1..C3 |
| PTS-02 源码实现或修复 | 4 | normal / negative-permission / negative-budget / boundary | PTS-02-C1..C4 |
| PTS-03 测试设计与测试资产编写 | 3 | normal / negative-permission / boundary | PTS-03-C1..C3 |
| PTS-04 受控测试执行和报告 | 4 | normal / negative / timeout / cancel | PTS-04-C1..C4 |
| PTS-05 独立代码/设计评审 | 4 | normal(code) / normal(design) / boundary / negative-permission | PTS-05-C1..C4 |
| PTS-06 多 IR 房间评审 | 4 | normal / dedup / membership / boundary | PTS-06-C1..C4 |
| PTS-07 Memory 更新建议 | 3 | normal / boundary / negative-permission | PTS-07-C1..C3 |
| PTS-08 研究与方案比较 | 2 | normal / negative | PTS-08-C1..C2 |
| PTS-09 失败诊断与修复建议 | 3 | normal(diagnose) / normal(fix) / negative | PTS-09-C1..C3 |
| PTS-10 任务协议韧性 | 5 | idempotency / cancel / invariant / recovery / usage | PTS-10-C1..C5 |
| **合计** | **35** | | |

详细 case 定义（输入/种子/独立 Oracle）见 `piko-scenario-e2e-test-specification-v0.1` §3。

## 5. 环境、设备、拓扑、数据和工具

- 单机 loopback 拓扑；种子按场景在临时目录构造（只读材料、最小仓库、失败测试、植入缺陷材料、
  Matrix 房间等）。
- 复核工具：`python3 -m py_compile`、`pytest`、`node --check`、`shasum`、`grep`、Matrix Client-Server API。
- 公共预算：`max_model_calls`/`max_tool_calls` 按 case 指定（默认 24/24），deadline 15min。

## 6. Test Types 与 Case Families（按场景）

- **normal**：PTS-01-C1、PTS-02-C1、PTS-03-C1、PTS-04-C1、PTS-05-C1/C2、PTS-06-C1、PTS-07-C1、PTS-08-C1、PTS-09-C1/C2、PTS-10-C1..C5。
- **boundary**：PTS-01-C2、PTS-02-C4、PTS-03-C3、PTS-05-C3、PTS-06-C4、PTS-07-C2。
- **negative-permission**：PTS-01-C3、PTS-02-C2、PTS-03-C2、PTS-05-C4、PTS-07-C3。
- **negative（预算/超时/失败/材料缺失）**：PTS-02-C3、PTS-04-C2/C3、PTS-08-C2、PTS-09-C3。
- **cancel**：PTS-04-C4、PTS-10-C2。
- **dedup / membership**：PTS-06-C2/C3。
- **idempotency / invariant / recovery / usage**：PTS-10-C1/C3/C4/C5。
- concurrency/performance/endurance：裁剪——单执行槽为既定设计（PK-T15），无预算阈值可对照。

## 7. Entry、Exit、Pass、Fail、Blocked 和 Invalid Criteria

- **Entry**：§2 Entry criteria 满足。
- **Pass**：case 对应 Run `Completed` 且该 case 全部 Oracle 满足。
- **Fail**：Run 非 Completed，或任一 Oracle 不满足。
- **Rerun**：每 case 允许 1 次重跑（模型非确定性）；两次均败判 FAIL，RERUN 记录在案。
- **Blocked**：环境/依赖不可用。
- **Invalid**：种子/步骤未按规格执行（重置后重跑，不计分母）。

## 8. 组织、职责、排期和资源

执行：opencode（HTTP 驱动 + 本地复核）；审批：Piko Project Owner。按场景串行执行（单执行槽）。

## 9. Defect、Deviation、Rerun 与 Regression

- Piko 运行时缺陷：修复 + 回归用例入库。
- 模型质量偏差（内容差但不违反 Oracle）：记录为观察项，不判 FAIL。
- v0.1 已执行 6 次（SC-01..SC-06），其中 4 次按语义映射为本规格 case 的 PASS 证据（见规格 §3 映射表）。

## 10. Evidence、Traceability、Reporting 与 Gate

- 每 case 记录：run_id、state、summary、outputs、known_actions、usage、本地复核命令与输出。
- 证据写入 `tests/integration/reports/` 的场景测试报告（STD test-report）。
- Gate：全部 case PASS 方可作为「场景测试已验证」引用；FAIL/BLOCKED 保持 Gate 开放。

## 11. 风险、安全与清理恢复

- **bash 边界**：bash 以 Piko 进程权限在 workspace cwd 执行——开发机假设，生产部署需另行隔离（operator Gate）。
- 模型非确定性：以客观 Oracle 兜底；允许 1 次 RERUN。
- 清理：产物隔离在临时目录，执行后删除即复位；不触碰仓库其他路径。
