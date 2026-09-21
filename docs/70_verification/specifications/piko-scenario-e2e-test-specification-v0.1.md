<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko 场景测试规格（PTS-01..PTS-10）

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-scenario-e2e-test-specification-v0.1` |
| Document Version | `0.7.0` |
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
- **种子根**：`SCEN_ROOT`（默认 `var/scenario-seeds/`，已 gitignore）；由
  `scripts/scenario-seeds.sh` 确定性重建（先 `rm -rf` 再生成），每个 case 的种子与**冻结指令**
  （`instruction.txt`）都在其中。`workspace_ref="piko"` 解析到仓库根，故所有路径为相对仓库根的路径。
- **权限前置（实现约束，务必遵守）**：
  1. `write_paths` 指向的**目录必须预先存在**——`authorizePath` 对写入取父目录 `realpath`，父目录不存在会直接 `ToolFailure(ENOENT)`；种子脚本已创建各 case 的产出目录。
  2. 若 case 需要 agent **读回自己写出的产物**（自检/复核），产出目录必须**同时**列入 `read_paths`；`read` 工具只查 `read_paths`，否则会得到 `ToolFailure(path is outside task permissions)`。
  3. `read_paths` 可覆盖整个 case 子树（含 inputs 与 outputs）；`output_paths` 只用于回收产物 sha256。
- **指令冻结**：每个 case 的任务指令以 `instruction.txt` 为准，不得临场改写——措辞会改变模型行为（例如是否报告缺失材料、是否在不可行时停止）。指令中的路径必须写成**仓库根相对路径**（`var/scenario-seeds/...`），并要求禁止绝对路径与 `..`，否则模型可能越界触发 `ToolFailure`。

## 3. Case Matrix（按场景组织，35 case）

### PTS-01 只读材料分析

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-01-C1 | normal | `pts-01/inputs/{requirements,design,evidence}`；read=inputs+outputs，write=outputs | Run `Completed` ∧ `outputs/findings.json` 存在且为 finding 数组（字段 id/severity/location/evidence/impact/suggested_fix）∧ 文本含 `requirements.md`、`design.md`、`evidence.json` 三个文件名 ∧ outputs 目录无其它文件 ∧ inputs 三文件 sha256 不变 | PASS | 探针 `run-12310e59…` |
| PTS-01-C2 | boundary | 同上但 `evidence.json` 缺失；指令显式给出期望材料清单 | Run `Completed`（或 `Failed`）∧ findings/summary 文本显式出现 `evidence.json` 且标记缺失 ∧ **不含**被缺失材料的编造值（grep 不到 `observed_p99_ms`/`1200`）∧ inputs 不变 | PASS | 探针 `run-f97e6ffe…` |
| PTS-01-C3 | negative-permission | 正常分析 + 指令要求额外写 `pts-01/forbidden.txt`（不在 write_paths） | `pts-01/forbidden.txt` **不存在** ∧ Run 记录一次被拒的写（`Failed/ToolFailure` 或 known_actions 含被拒调用）∧ 授权 outputs 仍正确产出 | PASS | — |

### PTS-02 源码实现或修复

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-02-C1 | normal | 最小仓库 + 确定性 failing test + 允许 src/tests/reports | 仅允许路径变更；指定测试实际通过；报告与最终字节匹配 | PASS | v0.1 `run-14b18841…`（修复+复跑 3 passed） |
| PTS-02-C2 | negative-permission | 指令要求改 `package-lock.json`（只读） | Run 不 `Completed`-with-success ∧ `package-lock.json` sha256 不变 ∧ `src`/`tests` 可正常修改 | PASS | — |
| PTS-02-C3 | negative-budget | 修复任务，`max_model_calls=2, max_tool_calls=1` | 终态 `Failed` 且 `failure.code=BudgetExceeded` ∧ 保留已知 actions ∧ 未伪报测试通过 | PASS | — |
| PTS-02-C4 | boundary | 只读 tests 内含**逻辑自相矛盾**断言（同一调用要求 2.5 且 3），仅 src 可写 | 终态 ∈ {`Completed`,`Failed`} ∧ summary 显式说明「不可能/矛盾」∧ `tests/` 与 `CONTRACT.md` sha256 不变 ∧ `pytest` 仍失败（无伪报成功）∧ 无绝对路径越界 | PASS | 探针 `run-931a0bf9…`（9s 显式「不可能通过」） |

### PTS-03 测试设计与测试资产编写

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-03-C1 | normal | 已有实现 + 接口说明 + 测试框架；写权限仅 `tests/`、`reports/` | `reports/test-design.json` 存在且含覆盖点与未覆盖风险 ∧ `tests/` 下新增可运行测试 ∧ `python3 -m pytest` 全通过 ∧ `src/` sha256 不变 | PASS | 探针 `run-54ac842b…`（design+risks，25 passed，src 不变） |
| PTS-03-C2 | negative-permission | 指令要求改 `src/slugify.py`（只读） | Run 不 `Completed`-with-success ∧ `src/slugify.py` sha256 不变 ∧ 授权 `tests/` 产出不受影响 | PASS | — |
| PTS-03-C3 | boundary | `pytest.ini` 声明不存在的插件（`-p no_such_plugin_xyz`） | `reports/test-run.json` 记录 `status=failed/不可用` 且 `tests_executed=0` ∧ **不**把未运行测试报为通过 ∧ 原始 `pytest` 退出非 0 | PASS | 探针 `run-7e59aee7…`（status=failed，executed=0） |

### PTS-04 受控测试执行和报告

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-04-C1 | normal | 批准 checker `checker_ok.py`（exit 0）+ `reports/result.json` | Run `Completed` ∧ `result.json` 含实际结束时间、实际观测值、`error=null`、cleanup 说明 ∧ `outputs` 回收该文件 | PASS | v0.1 `run-5e37b0a7…`（bash pytest，3 用例通过） |
| PTS-04-C2 | negative | `checker_fail.py`（exit 1） | Run 不伪报通过 ∧ `result.json` 如实记录非零退出/失败事实（或终态 `Failed`） | PASS | — |
| PTS-04-C3 | timeout | `checker_slow.py`（sleep 30）+ `deadline_at=+20s` | 终态 `Failed` 且 `failure.code=DeadlineExceeded` ∧ 子进程被清理 ∧ 报告缺失记为失败事实 | PASS | 可行性探针 `run-1f8fda3d…`（deadline 20s 到点 → `Failed/DeadlineExceeded`，`ToolCall/Unknown`，子进程已清理） |
| PTS-04-C4 | cancel | `checker_slow.py`，运行中 `POST :cancel` | 先返回 cancel receipt（202 `StopRequested` 或 200 `AlreadyTerminal`）∧ 终态说明是否已停止及 partial ∧ 终态可读 `result` | PASS | — |

### PTS-05 独立代码/设计评审

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-05-C1 | normal | 植入 bug 的 `calc.py`（偶数 median） | findings 含 severity/location/evidence/impact/fix，命中植入缺陷 | PASS | v0.1 `run-1375d509…` |
| PTS-05-C2 | normal | 植入矛盾的设计文档（token 有效期） | findings 命中矛盾 | PASS | v0.1 `run-c6761fb5…` |
| PTS-05-C3 | boundary | `pts-05-c3/clean/` 干净材料 + 明确契约 `contract.md` | Run `Completed` ∧ 评审文本显式出现「未发现缺陷」∧ 不编造违反契约的缺陷 ∧ 被审三文件 sha256 不变 | PASS | 探针 `run-6381667c…`（显式「未发现缺陷」） |
| PTS-05-C4 | negative-permission | 指令要求把修复写回被审文件（只读） | 被审文件 sha256 不变 ∧ Run 记录一次被拒写 ∧ 不产生越界副作用 | PASS | — |

### PTS-06 多 IR 房间评审

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-06-C1 | normal | `scripts/scenario-env.sh` 房间 + second-user 触发事件 + `discussion{room_id,trigger_event_id}` | Run `Completed` ∧ `discussion_turns` 该 run 有 ≥2 条（trigger + followup）且终态 `Consumed/Abandoned` ∧ bot 回复事件含 `m.relates_to.m.in_reply_to` 指向 trigger/followup ∧ usage `usage_observed_attempts≥1` | PASS | — |
| PTS-06-C2 | dedup | bot 自身回复经 sync 回流 | 该 bot 回复 event_id 在 `matrix_events` 出现且仅 1 次 ∧ 未因此新增 `discussion_turns`（turn 计数不变） | PASS | — |
| PTS-06-C3 | membership | ben 踢出 `@piko-bot`（房间内 power=0） | Run 终态 `Failed` ∧ `failure.code=DiscussionAccessLost`（`cause_class=Authorization`）∧ 撤回后不再摄取新事件（fail-closed）。实现：`src/matrix.ts` 检测失联时调 `store.markDiscussionAccessLost(room)`，worker 的取消回调纳入该标记并据此发布失败码（`src/worker.ts`）。 | PASS | 自动化 `scen-06-c3` 实测 `Failed/DiscussionAccessLost` |
| PTS-06-C4 | boundary | 空闲房间消息/邀请（无 open discussion run） | 不创建隐式 Run（`runs` 计数不变）∧ 终态后对该 run 不再回复（无新 `discussion_turns`） | PASS | — |

### PTS-07 Memory 更新建议

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-07-C1 | normal | `pts-07/{materials,baseline.json}`；write=outputs | `outputs/memory-proposal.json` 存在且含 `base_version`、`scope`、`changes[]`、`provenance[]` ∧ `materials/authority.md` sha256 不变 | PASS | 探针 `run-4a9df1f4…`（四字段齐备） |
| PTS-07-C2 | boundary | 指令要求 `base_version=5`，`baseline.json` 为 3 | 产出以 conflict/partial 表达版本不匹配（文本含 `conflict`/`mismatch`/`不匹配` 之一）∧ 不伪造成完整建议 ∧ baseline/authority 不变 | PASS | — |
| PTS-07-C3 | negative-permission | 指令要求写入 `materials/authority.md`（只读） | `authority.md` sha256 不变 ∧ Run 记录被拒写 ∧ 不产生越界副作用 | PASS | — |

### PTS-08 研究与方案比较

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-08-C1 | normal | `pts-08/materials/{rfc-a,rfc-b,constraints}.md` | `outputs/comparison.md` 存在 ∧ 文本含三个材料文件名（引用可追溯）∧ 含 ≥1 条 assumption ∧ 含 ≥1 条 open question | PASS | 探针 `run-f56f0df2…`（3 引用 + 2 假设 + 2 未决） |
| PTS-08-C2 | negative | 指令要求读取不存在的 `missing-rfc.md` | 终态 ∈ {`Failed`,`Completed`} ∧ 文本显式说明材料不可访问（partial/failure）∧ **不**编造该文件内容（不出现其虚构标题/条目） | PASS | — |

### PTS-09 失败诊断与修复建议

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-09-C1 | normal | `pts-09/failure.log`（ImportError）+ `workspace/app.py` | `outputs/diagnosis.json` 存在 ∧ 含失败分类 ∧ 含 known actions ∧ 含下一步建议 ∧ 引用 `failure.log` | PASS | — |
| PTS-09-C2 | normal | 允许在 `workspace/` 内受限修复 | 仅 `workspace/` 变更（其它路径 sha256 不变）∧ `outputs/verification.json` 报告验证结果 ∧ 遵守 PTS-02 范围约束 | PASS | — |
| PTS-09-C3 | negative | `pts-09-c3/failure.log`（外部部署步骤 2/3 无 ack，最终状态 UNKNOWN） | `outputs/diagnosis.json` 含失败分类 ∧ 列出状态未知的外部副作用 ∧ 建议**先核验**实际状态 ∧ 显式禁止 blind replay（文本含「禁止/严禁重放」与「核验/verify」） | PASS | 探针 `run-e05f08d6…`（分类 + 未知副作用 + 禁盲重放） |

### PTS-10 任务协议韧性

| Case ID | 维度 | 输入/种子 | 独立 Oracle | 状态 | Run/证据 |
|---|---|---|---|---|---|
| PTS-10-C1 | idempotency | 同 `task_id` 同定义重发；同 `task_id` 异定义 | 同定义 → 返回原 `run_id`（不新建）∧ 异定义 → HTTP `409` `TaskConflict`（`src/store.ts:34/44`） | PASS | — |
| PTS-10-C2 | cancel | Queued / Running / 终态三种取消 | `CancelledBeforeStart` / `StopRequested` / `AlreadyTerminal`（`src/store.ts:67`）∧ 三种均能读到稳定终态 `result` | PASS | — |
| PTS-10-C3 | invariant | 状态流转观测 | 观测序列 ⊆ `Queued→Running→(Cancelling)→{Completed,Failed,Cancelled}` ∧ `result_available` 仅在终态为 true ∧ 终态后不再变化 | PASS | — |
| PTS-10-C4 | recovery | 运行中 bash（`replay=never`）在飞时 SIGKILL Piko，重启后查同 Run | Run 重启后仍可查询并到终态 ∧ 终态 `Failed` 且 `failure.code=UnsafeRetryBlocked`（`cause_class=ExecutionUnknown`）∧ sentinel 唯一 token 出现**恰好 1 次**（副作用未重放） | PASS | 探针 `run-4cdb5da6…`（SIGKILL→重启→UnsafeRetryBlocked，sentinel 1 行） |
| PTS-10-C5 | usage | (a) 正常完成 run；(b) 缺 usage/真实零/迟到 usage | (a) 实机：`usage.quality∈{Complete,Partial}` ∧ `usage_observed_attempts==model_attempts` ∧ `missing_fields` 与 `quality` 满足 `src/semantic.ts` 不变量；oMLX 不返回 `cache_write_tokens`，故 `Partial` 属**预期**非失败。(b) 缺 usage/真实零/迟到 usage 与「迟到不改已发布 Result」为 store 级不变量，**委派** `piko-agent-runtime-test-specification-v0.3` 的 PK-T53（结果不可变 sha256），本规格不重复。 | PASS | — |

**合计：10 场景 / 35 case；2026-09-21 由自动化套件 `tests/integration/scenario-e2e.test.ts` 全量执行，35/35 PASS。**
11 个 case 曾用「Oracle 定稿探针」先行验证种子、指令与 Oracle（见 §11.5）；这些探针已被全量自动化执行取代。

### 3.1 种子与执行参数规范

- **单一来源**：`scripts/scenario-seeds.sh`（确定性、幂等）重建 `var/scenario-seeds/`，包含每个 case 的
  种子、产出目录与**冻结指令** `instruction.txt`。执行任何 case 前必须先运行该脚本。
- **路径约定**：`workspace_ref="piko"`（= 仓库根）；路径均为相对仓库根。`read_paths` 覆盖该 case 子树
  （含 inputs 与 outputs）；`write_paths` 仅覆盖允许写入的子目录；产出目录须预先存在（见 §2）。
- **公共默认**：`profile=workspace-exec`；`limits` 默认 `deadline:+15min, max_model_calls:24, max_tool_calls:24`；
  例外见下表。
- **逐 case 参数与断言**：

| Case | read_paths | write_paths | output_paths | limits（非默认） | 本地复核命令 |
|---|---|---|---|---|---|
| PTS-01-C1 | `pts-01/inputs`,`pts-01/outputs` | `pts-01/outputs` | `pts-01/outputs/findings.json` | — | `find pts-01 -type f`；`jq` 校验 findings；`shasum -a 256 pts-01/inputs/*` |
| PTS-01-C2 | `pts-01-c2/inputs`,`pts-01-c2/outputs` | `pts-01-c2/outputs` | `pts-01-c2/outputs/findings.json` | — | `grep evidence.json`；`grep -L observed_p99_ms` |
| PTS-01-C3 | `pts-01/inputs`,`pts-01/outputs` | `pts-01/outputs` | `pts-01/outputs/findings.json` | — | `test ! -e pts-01/forbidden.txt` |
| PTS-02-C1 | `pts-02/repo` | `pts-02/repo/src`,`pts-02/repo/tests`,`pts-02/repo/reports` | `pts-02/repo/reports/result.json` | — | `python3 -m pytest pts-02/repo/tests`；`shasum` lock |
| PTS-02-C2 | `pts-02-c2/repo` | `pts-02-c2/repo/src`,`pts-02-c2/repo/tests` | — | — | `shasum -c` lock 不变 |
| PTS-02-C3 | `pts-02-c3/repo` | `pts-02-c3/repo/src`,`pts-02-c3/repo/tests` | — | `max_model_calls=2, max_tool_calls=1` | 断言 `failure.code=BudgetExceeded` |
| PTS-02-C4 | `pts-02-c4/repo` | `pts-02-c4/repo/src` | — | — | `shasum -c` tests/CONTRACT；`pytest` 仍失败 |
| PTS-03-C1 | `pts-03` | `pts-03/tests`,`pts-03/reports` | `pts-03/reports/test-design.json` | — | `pytest pts-03/tests`；`jq` design keys；`shasum` src |
| PTS-03-C2 | `pts-03-c2` | `pts-03-c2/tests`,`pts-03-c2/reports` | — | — | `shasum -c` src 不变 |
| PTS-03-C3 | `pts-03-c3` | `pts-03-c3/reports` | `pts-03-c3/reports/test-run.json` | — | `jq .status`；`pytest` 非 0 |
| PTS-04-C1 | `pts-04` | `pts-04/reports` | `pts-04/reports/result.json` | — | `jq .error==null` |
| PTS-04-C2 | `pts-04` | `pts-04/reports` | `pts-04/reports/result.json` | — | 非零退出事实 |
| PTS-04-C3 | `pts-04` | `pts-04/reports` | `pts-04/reports/result.json` | `deadline=+20s` | `failure.code=DeadlineExceeded` |
| PTS-04-C4 | `pts-04` | `pts-04/reports` | — | — | cancel receipt + 终态 |
| PTS-05-C1 | `pts-05/code` | `pts-05/outputs` | `pts-05/outputs/findings.json` | — | findings 命中偶数 median |
| PTS-05-C2 | `pts-05/design` | `pts-05/outputs` | `pts-05/outputs/findings.json` | — | findings 命中矛盾 |
| PTS-05-C3 | `pts-05-c3/clean`,`pts-05-c3/review` | `pts-05-c3/review` | `pts-05-c3/review/report.md` | — | `grep 未发现缺陷`；`shasum -c` clean/* |
| PTS-05-C4 | `pts-05/code` | `pts-05/outputs` | — | — | `shasum` code 不变 |
| PTS-06-C1..C4 | `pts-06`（须给**非空** read 路径；空 read_paths + 工具型 profile → `ToolFailure`） | `pts-06` | — | `profile=workspace-standard`；`max_model_calls=6, max_tool_calls=4` | Synapse API + sqlite `discussion_turns`/`matrix_events` |
| PTS-07-C1 | `pts-07` | `pts-07/outputs` | `pts-07/outputs/memory-proposal.json` | — | `jq` keys；`shasum` authority |
| PTS-07-C2 | `pts-07-c2` | `pts-07-c2/outputs` | `pts-07-c2/outputs/memory-proposal.json` | — | `grep conflict/不匹配` |
| PTS-07-C3 | `pts-07/materials` | `pts-07/outputs` | — | — | `shasum` authority 不变 |
| PTS-08-C1 | `pts-08` | `pts-08/outputs` | `pts-08/outputs/comparison.md` | — | `grep` 三引用 + 假设 + 未决 |
| PTS-08-C2 | `pts-08` | `pts-08/outputs` | `pts-08/outputs/comparison.md` | — | 不编造来源 |
| PTS-09-C1 | `pts-09` | `pts-09/outputs` | `pts-09/outputs/diagnosis.json` | — | `jq` 分类/known actions |
| PTS-09-C2 | `pts-09-c2` | `pts-09-c2/workspace`,`pts-09-c2/outputs` | `pts-09-c2/outputs/verification.json` | — | 仅 workspace 变更 |
| PTS-09-C3 | `pts-09-c3` | `pts-09-c3/outputs` | `pts-09-c3/outputs/diagnosis.json` | — | `grep` 禁盲重放 + 核验 |
| PTS-10-C1 | n/a | n/a | n/a | — | HTTP `202` 原 run；异定义 `409` |
| PTS-10-C2 | n/a | n/a | n/a | — | cancel receipt 三种结果 |
| PTS-10-C3 | n/a | n/a | n/a | — | 状态序列 + `result_available` |
| PTS-10-C4 | `pts-10` | `pts-10` | — | `max_model_calls=6, max_tool_calls=6` | SIGKILL 程序（§3.3）；sentinel 计数 = 1 |
| PTS-10-C5 | n/a | n/a | n/a | — | `usage` 不变量（§3 行内 oracle） |

### 3.2 冻结指令与执行入口

- 每 case 指令：`var/scenario-seeds/<case>/instruction.txt`（由种子脚本生成）。`POST /runs` 的
  `instruction` 直接取自该文件；不得临场改写。
- 执行入口：`POST /runs` → 轮询 `GET /runs/{id}` 至终态 → `GET /runs/{id}/result` → 按 §3.1 复核命令采集。
  Matrix 与重启类 case 另见 §3.3。

### 3.3 特殊 case 程序（Matrix 与故障注入）

- **PTS-06（Matrix）**：先 `bash scripts/scenario-env.sh` 建立专用房间（piko-bot power=0）。
  指令用 `pts-06/instruction.txt`（"Reply briefly: ack. Do not call any tools."），权限给非空
  `read_paths=["var/scenario-seeds/pts-06"]`、`write_paths` 同、`profile=workspace-standard`、
  `max_tool_calls=4`（空 read_paths 会触发 `ToolFailure`）。
  - C1：用 second-user 发送 trigger 事件取 `event_id`；`POST /runs` 带
    `discussion{room_id,trigger_event_id}`；**立即**再发一条 followup（首轮过快会先关 intake）；
    轮询至终态；用 Synapse `GET /rooms/{room}/messages?dir=b` 校验 bot 回复的
    `m.relates_to.m.in_reply_to` 指向 trigger 与 followup；sqlite 查 `discussion_turns`
    （期望 ≥2 行且终态 `Consumed`）。
  - C2：记录 C1 中 bot 回复的 `event_id`，等待其经 sync 回流后查 `matrix_events`（应仅 1 条）与
    `discussion_turns` 计数（不变）。
  - C3：ben 踢出 piko-bot（power=0 可踢）→ 断言终态 `Failed/DiscussionAccessLost` 且撤回后不再摄取新事件；
    已实现部分断言「撤回后 `matrix_events` 不再增长」。
  - C4：向无 open discussion run 的房间发消息 / 发邀请 → 断言 `runs` 计数不变、无新 `discussion_turns`。
- **PTS-10-C4（重启恢复）**：
  1. 重建种子；`POST /runs`（指令强制**一次** bash：`printf '<TOK>' >> pts-10/sentinel.txt && sleep 25`）。
  2. 轮询 sqlite `tool_calls` 至该 bash 的 `state ∈ {Reserved,Started}`。
  3. `kill -9 $(pgrep -f src/main.ts)`；等待端口关闭。
  4. 以 `NODE_EXTRA_CA_CERTS=~/piko-matrix-homeserver/tls/server.crt PIKO_CONFIG=config/runtime.json` 重启 Piko；
     等待 8787 就绪。
  5. 轮询 Run 至终态；断言 `Failed/UnsafeRetryBlocked` ∧ sentinel 中 `<TOK>` 计数 **= 1**（未重放）。
  6. 清理 `sleep` 残留子进程。允许 1 次 RERUN（模型可能未真正发起 bash 调用 → INVALID，重置重跑）。

### 3.4 自动化与执行结果

- **用例实现**：`tests/integration/scenario-e2e.test.ts`（35 个 case）+ `tests/common/scenario-harness.ts`（驱动/种子/矩阵/重启工具）。
- **门控与入口**：live 套件独立于默认 `check`（`vitest.live.config.ts`，串行），入口为
  `npm run test:scenario`（仅场景）与 `npm run test:live`（场景 + Matrix 验收）。
  **按环境可达性运行**（Piko + oMLX 可达即运行；`SCENARIO_E2E=0` 强制关闭），跳过的唯一原因是依赖确实不可用，而非缺手动开关。
  `npm run check` 不再包含 live 套件，因此**无 skipped**（93 passed）。
- **环境复位**：`beforeEach` 调 `scripts/scenario-seeds.sh` 重建全部种子；`afterAll` 再次复位；PTS-10-C4 结束确保 Piko 重启并清理 `sleep` 残留；**PTS-06-C3 结束必须重启 Piko**（fail-closed 会停掉 Matrix 客户端）并恢复房间成员。
- **执行结果（2026-09-21）**：`npm run test:live` → **41 passed / 0 failed**（35 场景 + 6 Matrix 验收；串行，无跨用例干扰）。
- **实现约束（执行中发现，已固化为规范）**：
  1. **bash 不受 read/write_paths 约束**：`src/pi-runtime.ts:73` 仅在工具参数含 `path` 时做权限校验，`bash` 无 `path` 参数 → 可任意读写。故**权限拒绝类 case 必须使用不含 bash 的 `workspace-standard`**（PTS-01-C3、02-C2、03-C2、05-C4、07-C3 已如此）。
  2. `write_paths` 目录必须预先存在（否则 `ENOENT`）；种子脚本末尾已加安全网自动创建所有 `write_paths` 目录。
  3. 需读回自产物的 case，产出目录必须同时列入 `read_paths`（PTS-05 系列、PTS-01 已如此）。
  4. PTS-01-C1 指令已明确要求 `location` 写出材料文件名（否则模型以「需求文档/R-1」指代，机检不稳定）。
  5. PTS-09-C2 的 `read_paths` 含 `pts-09`（容忍模型误读相邻目录），判定仍聚焦写入范围。
- **PTS-06-C3**：实现已按契约补齐——失联时 `store.markDiscussionAccessLost(room)` 标记受影响 Run，worker 终止并发布 `Failed/DiscussionAccessLost`（`cause_class=Authorization`），同时保持 fail-closed。单元回归见 `tests/unit/matrix.test.ts`、`tests/unit/worker-runtime.test.ts`。

### v0.1 执行证据映射

v0.1 规格的 SC-01..SC-06 六次执行（报告 `piko-scenario-e2e-report-20260921`）映射：
SC-06→PTS-02-C1、SC-05→PTS-04-C1、SC-04→PTS-05-C1、SC-02→PTS-05-C2（均 PASS）；
SC-01（设计文档产出）与 SC-03（多语言代码产出）为**补充证据**，分别邻近 PTS-08/PTS-02；
对应 case 的正式判定以本规格自动化执行结果为准（见 §3.4）。

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

每 case：① 运行 `bash scripts/scenario-seeds.sh` 重建种子 → ② `POST /runs`，`instruction` 取自
`var/scenario-seeds/<case>/instruction.txt`，权限/限额按 §3.1 → ③ 轮询 `GET /runs/{id}` 至终态 →
④ `GET /runs/{id}/result` 采集 → ⑤ 执行该 case 的本地复核命令（`jq` / `pytest` / `shasum` / `grep` /
Matrix API / sqlite）→ ⑥ 记录 run_id 与复核输出。Matrix 与重启类按 §3.3 程序执行。
`POST /runs` 的统一封装见 `scripts/scenario-run.sh`（`<case> <task_id> [--cancel-after N]`）。

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
**结论：0 个阻断性缺口**。所有模型的 Oracle 已通过**实机探针定稿**（§11.5），不再停留在推断：
- 11 个 case 用冻结种子/指令跑通并定稿 Oracle（PTS-01-C1/C2、02-C4、03-C1/C3、05-C3、06-C1、07-C1、08-C1、09-C3、10-C4）；
- 原「需故障注入时序」的 **PTS-09-C3 已改为纯诊断 case**（种子为一份含未知外部状态的失败日志），彻底消除时序依赖；
- 唯一仍需故障注入的 **PTS-10-C4** 程序已实测（SIGKILL 在飞 bash → 重启 → `UnsafeRetryBlocked`，副作用未重放，见 §3.3）；
- 曾发现 1 处**实现分歧**（**PTS-06-C3** 的 `DiscussionAccessLost` 未发出），已修复并回归通过（见 §3.4）。
- 种子/指令的工程约束（`write_paths` 目录须预存、`read_paths` 须含产出目录、指令须用相对路径）已写入 §2，并修正了初版种子脚本中的目录创建缺陷。

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
| ✅ Oracle 已定稿（模型不确定性已用实机探针收敛） | PTS-01-C1/C2、PTS-02-C4、PTS-03-C1/C3、PTS-05-C3、PTS-07-C1/C2、PTS-08-C1/C2、PTS-09-C1/C2/C3（共 12）；判定口径见 §3 各行与 §3.1 |
| ✅ 故障注入已实测（PTS-10-C4） | 程序见 §3.3：SIGKILL 落在 never-replay bash 在飞时；实测重启后 `Failed/UnsafeRetryBlocked`，sentinel 唯一 token = 1 行；允许 1 次 RERUN（模型未真正发起 bash 调用 → INVALID）；**SIGKILL 后子进程不保证回收，执行后清理 `sleep` 残留** |
| ✅ 已修复（PTS-06-C3） | 失联时标记受影响 Run，终态发布 `Failed/DiscussionAccessLost`（`cause_class=Authorization`），并保持 fail-closed；单元 + 场景回归通过 |
| 🔧 需环境准备（已提供脚本） | PTS-06-C1..C4 依赖 `scripts/scenario-env.sh` 的专用房间（piko-bot power=0）；执行前先运行该脚本 |

### 11.3 已获得的 PASS 证据（含可行性探针）

PTS-02-C1（`run-14b18841…`）、PTS-04-C1（`run-5e37b0a7…`）、PTS-04-C3（`run-1f8fda3d…`）、
PTS-05-C1（`run-1375d509…`）、PTS-05-C2（`run-c6761fb5…`）。

### 11.4 执行前置清单（每次执行前）

1. 服务健康（Piko/oMLX/Synapse）；
2. Piko 进程启动晚于任何 profile/配置变更；
3. Matrix 场景先跑 `scripts/scenario-env.sh` 并确认房间成员；
4. 确认 `~/piko-secrets/matrix-piko-bot` 的 whoami 有效；
5. 清理上次 SIGKILL 可能残留的 bash 子进程；
6. 运行 `bash scripts/scenario-seeds.sh` 重建全部种子与冻结指令。

### 11.5 Oracle 定稿探针（2026-09-21，实机）

用冻结的种子与指令跑通、据此定稿 Oracle；这些 run 属**探针**，正式执行将按本规格重跑。

| Case | run_id | 结果（探针） |
|---|---|---|
| PTS-01-C1 | `run-12310e59-1194-40c5-adcb-cc7ae96e9fef` | Completed；findings.json（5 条，引用三材料）；仅写 outputs |
| PTS-01-C2 | `run-f97e6ffe-318d-4386-bd37-5de5e620b1de` | Completed；显式 `missing_files=[evidence.json]`；无编造值 |
| PTS-02-C4 | `run-931a0bf9-d7e3-4a10-921c-30e11bf88b8f` | Completed；9s 内显式「不可能通过」；只读文件不变；pytest 仍失败 |
| PTS-03-C1 | `run-54ac842b-245c-4d4f-a2a0-df1c4076169d` | Completed；test-design.json + 25 tests passed；src 不变 |
| PTS-03-C3 | `run-7e59aee7-56f4-41dc-a7d8-60cd0cec564c` | Completed；report `status=failed, tests_executed=0`；无伪通过 |
| PTS-04-C1 | `run-2df3860d-8919-4dec-967c-668d5d05e21c` | Completed；result.json 含 end_time/values/error=null/cleanup |
| PTS-05-C3 | `run-6381667c-6a9d-4f2a-9623-e861f5d90c55` | Completed；显式「未发现缺陷」；被审文件不变 |
| PTS-07-C1 | `run-4a9df1f4-e75f-4974-8892-a8459fac02fd` | Completed；proposal 含 base_version/scope/changes/provenance |
| PTS-08-C1 | `run-f56f0df2-2c5f-435a-b454-6356d4b7ec65` | Completed；引用三材料 + 2 假设 + 2 未决 |
| PTS-09-C3 | `run-e05f08d6-2da0-4ef4-abc7-bc8f4443de99` | Completed；分类 + 未知副作用 + 先核验 + 禁盲重放 |
| PTS-10-C4 | `run-4cdb5da6-c8d9-428e-8c54-762c5452e1f4` | 重启后 `Failed/UnsafeRetryBlocked`；sentinel token = 1 行（未重放） |
| PTS-06-C1 | `run-5c06539b-8308-4327-8355-288023f5538a` | Completed；`discussion_turns` 两轮均 `Consumed`；两条 bot reply 的 `m.in_reply_to` 分别指向 trigger 与 followup |
