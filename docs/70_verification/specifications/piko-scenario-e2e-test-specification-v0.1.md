<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko 场景测试规格（PTS-01..PTS-10）

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-scenario-e2e-test-specification-v0.1` |
| Document Version | `0.3.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | `2026-09-21` |
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

验证 Piko v0.3（`0.3.0-simplified.6`）经四项任务 API（`POST /runs`、`GET /runs/{run_id}`、
`POST /runs/{run_id}:cancel`、`GET /runs/{run_id}/result`）执行 Slinky 场景文档
（`corezilla/slinky` `docs/60_interfaces/contracts/piko-test-task-scenarios.md`，PTS-01..PTS-10）
所描述任务的能力。**不证明**模型内容质量、真实 LLMTier 依赖、生产隔离。

本规格按**场景**组织，每个场景下设多个 **case**，覆盖 normal / boundary / negative /
permission / budget / timeout / cancel / dedup / membership / idempotency / invariant /
recovery / usage 等不同维度。

## 2. 引用基线、环境与前置条件

- 基线：Piko @ branch `docs/piko-system-design-std26`；Pi `9767ba27`；oMLX `Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed`（`127.0.0.1:9000`）；Piko API `127.0.0.1:8787`。
- **tier→模型转换**：测试路径直连本地 oMLX、不调用 LLMTier；`config/model-mapping.json` + `scripts/for-omlx.mjs` + `tests/common/model-mapping.ts` 把 tier（如 `Worker`）转为 oMLX 模型名。
- 公共任务参数：`profile=workspace-exec`（read/write/edit/bash）；`limits` 按 case 指定（默认 `deadline:+15min, max_model_calls:24, max_tool_calls:24`）。
- 环境：本机 loopback；Matrix 场景用测试 homeserver + 测试房间；种子在临时目录构造。
- 前置：服务健康、`npm run check` 绿、Piko 进程启动晚于任何 profile/配置变更。

## 3. Case Matrix（按场景组织，35 case）

### PTS-01 只读材料分析

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-01-C1 | normal | 固定材料 `inputs/requirements.md`+`design.md`+`evidence.json`；只读路径 | 逐项 finding 含材料引用与定位；无未授权写/工具调用 | NOT_RUN | — |
| PTS-01-C2 | boundary | 上述材料之一缺失 | 明确失败/partial，不编造已读内容 | NOT_RUN | — |
| PTS-01-C3 | negative-permission | 只读路径 + 试图写非授权路径 | 写入被拒（ScopeDenied），无副作用 | NOT_RUN | — |

### PTS-02 源码实现或修复

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-02-C1 | normal | 最小仓库 + 确定性 failing test + 允许 src/tests/reports | 仅允许路径变更；指定测试实际通过；报告与最终字节匹配 | PASS | v0.1 `run-14b18841…`（修复+复跑 3 passed） |
| PTS-02-C2 | negative-permission | 试图改禁改路径（依赖锁/CI/权限配置） | 修改被拒，禁改路径字节不变 | NOT_RUN | — |
| PTS-02-C3 | negative-budget | 预算不足以完成修复 | `Failed`/partial，保留 known actions 与部分输出 | NOT_RUN | — |
| PTS-02-C4 | boundary | 矛盾需求/不可修复缺陷 | 明确 `Failed` 并说明，不伪报成功 | NOT_RUN | — |

### PTS-03 测试设计与测试资产编写

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-03-C1 | normal | 已有实现 + 接口说明 + 测试框架；写权限仅 `tests/`、`reports/test-design.json` | 产出可检查的测试设计/fixture/oracle + 未覆盖风险 | NOT_RUN | — |
| PTS-03-C2 | negative-permission | 试图写 `src/` | 拒绝；产品源码字节不变 | NOT_RUN | — |
| PTS-03-C3 | boundary | 测试框架不可用 | 不把 `NotRun` 报为通过；明确失败事实 | NOT_RUN | — |

### PTS-04 受控测试执行和报告

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-04-C1 | normal | 批准 checker + 只读输入 + `reports/result.json` | 报告含实际结束时间/实际值/error(null)/cleanup | PASS | v0.1 `run-5e37b0a7…`（bash pytest，3 用例通过） |
| PTS-04-C2 | negative | checker 非零退出 | 记录为执行失败事实，不伪报通过 | NOT_RUN | — |
| PTS-04-C3 | timeout | checker 超时 | 超时 + 报告缺失均为失败事实 | PASS | 可行性探针 `run-1f8fda3d…`（deadline 20s 到点 → `Failed/DeadlineExceeded`，`ToolCall/Unknown`，子进程已清理） |
| PTS-04-C4 | cancel | 执行中取消 | 先返回 cancel receipt，终态说明是否停止及 partial | NOT_RUN | — |

### PTS-05 独立代码/设计评审

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-05-C1 | normal | 植入 bug 的 `calc.py`（偶数 median） | findings 含 severity/location/evidence/impact/fix，命中植入缺陷 | PASS | v0.1 `run-1375d509…` |
| PTS-05-C2 | normal | 植入矛盾的设计文档（token 有效期） | findings 命中矛盾 | PASS | v0.1 `run-c6761fb5…` |
| PTS-05-C3 | boundary | 无缺陷的干净材料 | 明确「无发现」，非空成功 | NOT_RUN | — |
| PTS-05-C4 | negative-permission | 试图修改被审文件 | 拒绝；被审文件字节不变 | NOT_RUN | — |

### PTS-06 多 IR 房间评审

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-06-C1 | normal | 测试房间 + trigger event + 成员身份 | 原生 reply relation；讨论产物落库 | NOT_RUN | — |
| PTS-06-C2 | dedup | 自身发送事件经 sync 回流 | self-echo 不形成新 turn | NOT_RUN | — |
| PTS-06-C3 | membership | 撤回 membership | 停止读/发，以 `DiscussionAccessLost` 结束 | NOT_RUN | — |
| PTS-06-C4 | boundary | 空闲房间消息/邀请 | 不创建隐式 Run；终态后不再回复 | NOT_RUN | — |

### PTS-07 Memory 更新建议

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-07-C1 | normal | 基线版本 + scope + 来源材料；无正式 Memory 写权 | 产出 `memory-proposal.json`；authority 哈希不变 | NOT_RUN | — |
| PTS-07-C2 | boundary | 基线版本不匹配/来源不足 | 以 conflict/partial 表达，不伪完整 | NOT_RUN | — |
| PTS-07-C3 | negative-permission | 试图写正式 Memory/index | 拒绝；authority 不变 | NOT_RUN | — |

### PTS-08 研究与方案比较

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-08-C1 | normal | RFC/实验材料 + 受控检索 + 候选方案 | 结论与引用可追溯；假设与未决项明确 | NOT_RUN | — |
| PTS-08-C2 | negative | 材料不可访问 | partial/failure，不编造来源 | NOT_RUN | — |

### PTS-09 失败诊断与修复建议

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-09-C1 | normal | 失败日志 + 已知操作 + 只读检查 | 失败分类 + known actions + partial + 下一步 | NOT_RUN | — |
| PTS-09-C2 | normal | 允许受限修复 | 修改范围与验证报告遵守 PTS-02 约束 | NOT_RUN | — |
| PTS-09-C3 | negative | 外部工具状态未知 | `UnsafeRetryBlocked`/`ExecutionStateUnknown`，不重放副作用 | NOT_RUN | — |

### PTS-10 任务协议韧性

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-10-C1 | idempotency | 同 task_id 同定义重发；同 task_id 异定义 | 原 Run；`409 TaskConflict` | NOT_RUN | — |
| PTS-10-C2 | cancel | Queued/Running/终态三种取消 | `CancelledBeforeStart`/`StopRequested`/`AlreadyTerminal`，均读终态 | NOT_RUN | — |
| PTS-10-C3 | invariant | 状态流转观测 | `Queued→Running→(Cancelling)→终态` 与 `result_available` 不变量 | NOT_RUN | — |
| PTS-10-C4 | recovery | Piko 重启后查询同 Run | 安全 checkpoint 恢复，不重复工具副作用 | NOT_RUN | — |
| PTS-10-C5 | usage | 缺 usage / 真实零 / 迟到 usage | `Complete/Partial/Unknown` 正确；迟到不改已发布 Result | NOT_RUN | — |

**合计：10 场景 / 35 case；已执行 PASS 4（PTS-02-C1、PTS-04-C1、PTS-05-C1、PTS-05-C2），NOT_RUN 31。**

### v0.1 执行证据映射

v0.1 规格的 SC-01..SC-06 六次执行（报告 `piko-scenario-e2e-report-20260921`）映射：
SC-06→PTS-02-C1、SC-05→PTS-04-C1、SC-04→PTS-05-C1、SC-02→PTS-05-C2（均 PASS）；
SC-01（设计文档产出）与 SC-03（多语言代码产出）为**补充证据**，分别邻近 PTS-08/PTS-02，
未按本规格种子执行，故对应 case 仍记 NOT_RUN。

## 4. 正常、边界、负向与并发场景

- **normal**：PTS-01-C1、PTS-02-C1、PTS-03-C1、PTS-04-C1、PTS-05-C1/C2、PTS-06-C1、PTS-07-C1、PTS-08-C1、PTS-09-C1/C2、PTS-10-C1..C5。
- **boundary**：PTS-01-C2、PTS-02-C4、PTS-03-C3、PTS-05-C3、PTS-06-C4、PTS-07-C2。
- **negative（权限）**：PTS-01-C3、PTS-02-C2、PTS-03-C2、PTS-05-C4、PTS-07-C3。
- **negative（预算/超时/失败）**：PTS-02-C3、PTS-04-C2/C3、PTS-08-C2、PTS-09-C3。
- **cancel**：PTS-04-C4、PTS-10-C2。
- **dedup/membership**：PTS-06-C2/C3。
- **idempotency/invariant/recovery/usage**：PTS-10-C1/C3/C4/C5。
- **并发**：本规格不引入并发 case（单执行槽为设计，PK-T15）；场景间串行。

## 5. Recovery、重放、幂等与故障注入

PTS-10-C4（重启恢复）、PTS-09-C3（未知副作用阻塞）、PTS-04-C4/PTS-10-C2（取消）为本规格
的恢复类 case；更细的崩溃/重放语义由 `piko-agent-runtime-test-specification-v0.3` 的
PK-T05/06/07/20/48 承担，本规格不重复。

## 6. 性能、容量、功耗或时序测试

裁剪：无设计预算阈值可对照；仅记录每 case wall-clock 耗时作参考观测。

## 7. 执行步骤与自动化入口

每 case：① 按 §3 重建种子 → ② `POST /runs`（指令含目标文件、步骤与禁止事项）→
③ 轮询 `GET /runs/{id}` 至终态 → ④ `GET /runs/{id}/result` 采集 → ⑤ 执行该 case 的本地
复核命令（py_compile / pytest / node --check / shasum / grep / Matrix API）→ ⑥ 记录 run_id 与复核输出。

## 8. Pass/Fail/Blocked/Invalid 判定

- PASS = Run Completed ∧ 该 case 全部 Oracle 满足。
- FAIL = 非 Completed，或任一 Oracle 不满足（含 1 次 RERUN 后）。
- RERUN = 模型非确定性允许重跑 1 次，须记录两次 Run。
- BLOCKED = 环境/依赖不可用（oMLX/Piko/Matrix 不可用）。
- INVALID = 种子/步骤偏离本规格（重置后重跑，不计分母）。

## 9. Artifact、日志、测量与证据保存

每 case：run_id、终态 JSON、种子与产物文件、本地复核命令与输出、耗时；汇总为 STD
test-report。失败现场保留 Piko stdout 片段与种子快照。

## 10. 安全、清理与可重复性

产物隔离在临时目录，结束即删除；bash 以 Piko 进程权限在 workspace cwd 执行（开发机假设，
生产隔离属 operator Gate）；种子为本规格定义的确定内容，可重复重建。

## 11. 可行性 Review（dry-run 结论，2026-09-21）

在正式执行前对 35 个 case 逐一推断「能否顺利执行并得到期望结果」，含环境与工具链核验。
**结论：0 个阻断性缺口**；28 个可直接执行、5 个需收紧 Oracle（模型不确定性）、1 个需故障注入时序、1 个已获 PASS 证据（PTS-04-C3）。

### 11.1 环境与工具链核验（实测）

| 项 | 结果 |
|---|---|
| Piko `127.0.0.1:8787` / oMLX `9000` / Synapse `8448` | 全部在线（401/200/200） |
| `workspace-exec` profile（read/write/edit/bash） | 已加载；bash 实测可执行并回收输出 |
| bash 子进程清理 | **已验证**：deadline 到点后 `sleep` 子进程被终止 |
| 工具链 | python3(3.14)、`python3 -m pytest`(9.1.0)、node/npm、cat/ls/mkdir/shasum 均在 PATH |
| tier→模型转换 | `scripts/for-omlx.mjs` + `tests/common/model-mapping.ts` 已验证（`Worker`→oMLX 模型，不调用 LLMTier） |
| Matrix 测试身份 | Synapse + 三账号在线；**piko-bot 权威 token 在 `~/piko-secrets/matrix-piko-bot`**（`users.json` 中的 token 在历次 PK-T18 重置后可能过期） |
| Matrix 场景房间 | **已修复缺口**：原房间三人 power 均为 100，ben 无法踢 piko-bot。改用 `scripts/scenario-env.sh` 创建专用房间（piko-bot power=0）；实测 ben 可 kick（返回 `{}`） |

### 11.2 逐 case 可行性判定

| 判定 | case |
|---|---|
| ✅ 可直接执行 | PTS-01-C1/C3、PTS-02-C1/C2/C3、PTS-03-C1/C2/C3、PTS-04-C1/C2/C4、PTS-05-C1/C2/C4、PTS-06-C1/C2/C3/C4、PTS-07-C1/C3、PTS-08-C2、PTS-09-C1/C2、PTS-10-C1..C5（共 28） |
| ⚠️ 可执行，需收紧 Oracle（模型不确定性） | PTS-01-C2（接受 `Failed` 或 summary 显式声明缺失，不编造内容）、PTS-02-C4（接受 `Failed` 或显式「无法修复」）、PTS-05-C3（接受显式「无发现」）、PTS-07-C2（接受 conflict/partial 表述）、PTS-08-C1（Oracle 校验引用材料名 + 未决项，不评主观质量）（共 5） |
| ⚠️ 可执行，需故障注入时序 | PTS-09-C3（SIGKILL 需落在 never-replay 工具效果进行中；时序敏感，允许 1 次 RERUN；**Piko 被 SIGKILL 时子进程不保证被回收，执行后需清理残留**）（1） |
| 🔧 需环境准备（已提供脚本） | PTS-06-C1..C4 依赖 `scripts/scenario-env.sh` 的专用房间；执行前先运行该脚本（2 个新房间已建） |

### 11.3 已获得的 PASS 证据（含可行性探针）

PTS-02-C1（`run-14b18841…`）、PTS-04-C1（`run-5e37b0a7…`）、PTS-04-C3（`run-1f8fda3d…`）、
PTS-05-C1（`run-1375d509…`）、PTS-05-C2（`run-c6761fb5…`）。

### 11.4 执行前置清单（每次执行前）

1. 服务健康（Piko/oMLX/Synapse）；
2. Piko 进程启动晚于任何 profile/配置变更；
3. Matrix 场景先跑 `scripts/scenario-env.sh` 并确认房间成员；
4. 确认 `~/piko-secrets/matrix-piko-bot` 的 whoami 有效；
5. 清理上次 SIGKILL 可能残留的 bash 子进程。
