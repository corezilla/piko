<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko ↔ LLMTier 联调方案（联合调试规格）

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-llmtier-joint-test-specification-v0.1` |
| Document Version | `0.1.0-draft.3` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-22` |
| Last Modified Date | `2026-09-22` |
| Template ID | `assurance.test-specification` |
| Template Version | `0.2.1` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/specifications/piko-llmtier-joint-test-specification-v0.1.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目标、范围与被测对象

验证 Piko 与**真实 LLMTier 服务**在 Data Plane 契约（`llmtier-piko-data-plane-control`
v0.3.2-draft.3 + LLMTier V0.3 OpenAPI）下的端到端行为：请求/SSE wire 形状、模型解析、
usage 采集与对账、错误映射、故障恢复，以及 Piko 任务语义（工具环/deadline/budget/cancel）
在真实模型依赖下的保持。**不证明**：m5air 生产部署、production TLS/auth 激活、embeddings、
Slinky capacity、模型输出质量。

被测对象为双服务联合链路；Piko 侧既有 PK-T41..T54（mock，wire 基线 **candidate.7**）是本规格
的契约对照基线。联调通过不改变 `overall.runtime_activation=false`。

## 2. 引用基线、环境与前置条件

### 2.1 拓扑与实例

```text
调用方 ──POST /runs(bearer piko-api-bearer)──▶ Piko joint 127.0.0.1:8788
    Piko joint ──/v1/responses(SSE,model="Worker",Bearer data-token)──▶ LLMTier joint
    Piko joint ──GET /v1/models（启动 preflight）──▶ LLMTier joint
    Piko joint ──GET /tier/v1/usage（用量对账）──▶ LLMTier joint
LLMTier joint 0.0.0.0:8180（loopback 与 192.168.1.8 均可达）──OMLX_API_KEY──▶ oMLX 127.0.0.1:9000
```

| 项 | 值 |
|---|---|
| Piko joint | `127.0.0.1:8788`，`PIKO_CONFIG=config/runtime.llmtier.json`（gitignored），独立 `var/piko-llmtier-joint.sqlite` / `pi-sessions-llmtier-joint` / `staging-llmtier-joint`，`matrix.enabled=false` |
| LLMTier joint | `0.3.0-dev`，`PYTHONPATH=src python3 -m llmtier_v03 --host 0.0.0.0 --port 8180 --database state/llmtier-piko-joint.sqlite3 --settings config/settings.json`，库已 bootstrap（6 个 service level + `deployment_omlx_qwen36`） |
| 模型后端 | oMLX `Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed` @ `127.0.0.1:9000/v1` |
| 隔离红线 | 不触碰 8787（生产 Piko）、18999（他人 llmtier_v03）、m5air 8181 |

### 2.1.1 联调运行的环境变量契约（防串实例）

所有针对 joint 实例的驱动（含 scenario 套件）必须显式携带：

```bash
export PIKO_URL=http://127.0.0.1:8788                       # 目标实例（harness 按 URL 端口定位 kill/restart）
export PIKO_SQLITE_PATH=/Users/ben/work/piko/var/piko-llmtier-joint.sqlite   # sqlite 断言面
export PIKO_RUNTIME_CONFIG=/Users/ben/work/piko/config/runtime.llmtier.json  # 重启所用配置
export SCENARIO_MATRIX=0                                     # joint 实例 matrix 关闭，排除 PTS-06×4
```

缺 `PIKO_SQLITE_PATH` 会把 sqlite 断言打到生产库；缺 `SCENARIO_MATRIX=0` 会执行 PTS-06 而 joint
实例 Matrix 未启用 → 必然失败。**串行要求**：联调执行期间不得并行运行 `npm run test:live`
（其目标是 8787 生产实例，且共享 oMLX）。

### 2.2 Secret 与授权决定

- `~/piko-secrets/llmtier-joint-admin-token`（admin API）、`~/piko-secrets/llmtier-joint-data-token`
  （Data Plane Bearer，Piko `api_key_secret_ref` 指向它）、oMLX key 经 `OMLX_API_KEY=$(cat
  ~/piko-secrets/piko-llm-key)` 注入 LLMTier。全部 0600，不入库不入日志。
- **Owner 决定（2026-09-21）**：模型 endpoint 允许明文 `http://`（trusted-LAN）。Piko schema
  `llmtier.base_url` 已放宽为 `^https?://`（`interfaces/schemas/piko-runtime-config-v0.3.schema.json`），
  负面样例改 `ftp://`；`config/runtime.llmtier.json` 因此直用 LAN IP `http://192.168.1.8:8180/v1/`
  （符合 LLMTier 测试规范 TS-003 的 LAN 要求）。

### 2.3 环境就绪证据（已完成，2026-09-21）

| # | 检查 | 实测 |
|---|---|---|
| V1 | `GET /healthz` | 200 `{"status":"ok","version":"0.3.0-dev"}` |
| V2 | `POST /tier/admin/v1/probes`（deployment_omlx_qwen36） | `{"status":"healthy"}` |
| V3 | `GET /v1/models`（data token） | OpenAI 形状，`data[].id` 含 `Worker` 等 6 个 service level |
| V4 | 真实 `POST /v1/responses`（`stream:true,store:false`） | 10 个 SSE 事件至 `response.completed`；usage `input 18/output 1/total 19`、`cached_tokens=0`、`reasoning_tokens=1` |
| V5 | `GET /tier/v1/usage?from&to` | 记录含 `request_id/record_version=2/is_final/measurement_status=measured`；`cache_write_tokens=null` |
| V6 | Piko joint 启动 preflight | `/v1/models` 含 `Worker`，启动成功 |
| V7 | Piko→LLMTier→oMLX 端到端 run | `Completed`，`usage.quality=Partial`（缺 `cache_write_tokens`，契约允许）、`usage_observed_attempts=1` |
| V8 | LAN 可达 | `http://192.168.1.8:8180/healthz` 200 |
| V9 | Piko 回归 | `npm run check` 93 passed / 0 skipped |

### 2.4 前置条件（每次执行前）

1. 两个联调实例存活（8180、8788），oMLX 健康（9000）；
2. LLMTier `readyz` 中 `Worker` 为 `available`（全局 `degraded` 系 `Embedding-v1` 占位所致，不作门禁）；
3. `npm run check` 绿；
4. 不携带无关环境变量启动（避免误连生产配置）。

## 3. Case Matrix

| Case | 层 | 维度 | 输入/操作 | 独立 Oracle | 状态 | 对照 |
|---|---|---|---|---|---|---|
| JT-01 | L1 | normal/wire | `POST /runs`（8788）纯文本指令，`max_model_calls=2,max_tool_calls=0` | Run `Completed`；LLMTier 账本新增 `model=Worker,measurement_status=measured` 记录且 tokens>0 | PASS | `run-47311c90…`；账本 846/2/848 |
| JT-02 | L1 | wire/tool-loop | 允许 `read` 的最小任务，指令要求读 `var/scenario-seeds/pts-01/inputs/requirements.md` 后作答 | `Completed`；LLMTier 收到 ≥2 次请求（第二轮含工具结果历史）且均接受 | PASS | `run-cdfe7fa5…`；attempts=2，账本 2 条 |
| JT-03 | L1 | wire/reasoning | 触发推理输出的任务（与 JT-01 同指令即可，模型带 reasoning） | SSE/结果正常；下一轮历史含 opaque reasoning item 时仍被接受（以 JT-02 第二轮成功佐证） | PASS | `run-d6b07de8…`；reasoning_tokens=2 |
| JT-04 | L2 | models/preflight | 启动 joint Piko（正常配置） | preflight 通过；`GET /v1/models` 的 `data[].id` 精确含 `Worker` | PASS | listening 日志；`Worker in models: True` |
| JT-05 | L2 | negative/model | `agent.model="NoSuchModel"` 后以 nohup 后台启动 joint Piko（macOS 无 `timeout(1)`，禁用），读启动日志后 kill 残留并恢复配置重启 | 启动即失败：日志含 `configured model is not available: NoSuchModel`，且 8788 不监听 | NOT_RUN | ICD §6 |
| JT-06 | L2 | negative/auth | 以错误 token 调 `POST /v1/responses` 与 `GET /v1/models` | 认证被拒（实测 **403**；ICD §6 写 `401 auth`——偏差记入联调报告，作为对 LLMTier ICD 的 review 发现；401/403 均判 PASS） | PASS | 403/403 实测 |
| JT-07 | L2 | negative/dependency | 经 admin API 把 provider `provider_omlx_m5mac` 的 endpoint PATCH 为死地址（`http://127.0.0.1:9299/v1`，If-Match ETag）后提交 run；断言后 PATCH 回 `http://127.0.0.1:9000/v1` | Run 终态 `Failed` 且 `failure.code=ModelUnavailable`（`cause_class=Dependency`），无悬挂；恢复 endpoint 后新 run `Completed`。**禁止 kill oMLX 进程**（共享资源，18999 实例同用） | PASS | 首跑暴露 Piko 分类缺陷（503→ModelResponseInvalid），**已修复**（`isProviderUnavailableMessage`，含单测）；回归 `run-fa5d604a…` PASS，恢复后 `run-edff2ce3…` Completed |
| JT-08 | L4 | recovery | run 执行中 `kill -9 $(lsof -nP -iTCP:8180 -sTCP:LISTEN -t)`；**等 run 到终态后再**按 §2.1 重启（同库同 token） | 在飞 run 到达明确终态：`Failed` 且 failure 非空；若为 `Completed` 视为注入未命中 → INVALID 重跑。重启后 JT-01 复跑 `Completed` | PASS | `run-fceab2d8…` Failed/ModelUnavailable/Dependency；重启后 `run-5a4395f4…` Completed。首跑暴露 `Connection error.` 分类缺陷，**已修复**（分类器扩展+单测） |
| JT-09 | L4 | concurrency | 同时提交 2 个 run | 一个 `Running` 一个 `Queued`，均达终态；LLMTier 无 5xx | PASS | R1=Running/R2=Queued → 双 `Completed`（`jt-09-a/b`） |
| JT-10 | L2 | usage 对账 | JT-01 完成后取 `GET /tier/v1/usage` 最新记录 | 单次模型调用时账本 tokens 与 Piko `Result.usage` 一致（Piko `input_tokens` 含 cached）；多次调用按 request 求和后一致；`record_version` 单调不减 | PASS | 账本==Piko 846/2/848 |
| JT-11 | L3 | regression/切片 | scenario suite 指向 8788，跑 PTS-01/02/04/05 切片 | 切片全 PASS；`usage.quality=Partial` 符合预期 | PASS | 15/15（vitest 实测） |
| JT-12 | L3 | regression/全量 | 按 §2.1.1 env 契约运行 scenario 套件（`SCENARIO_MATRIX=0`） | **31/31 PASS**（35 − PTS-06×4；PTS-06 已在生产实例 41/41 中覆盖） | PASS | 31 passed / 4 skipped（vitest 实测） |

**合计 12 case；执行顺序：按 JT 编号递增（JT-01 → JT-12）一步一步执行，不分必做/可选。每完成一个 case，立即回填本表「状态/Run·证据」两列并提交。**

## 4. 正常、边界、负向与并发场景

- **normal**：JT-01、JT-02、JT-03、JT-04、JT-09、JT-10、JT-11、JT-12。
- **negative**：JT-05（配置错误）、JT-06（认证失败）、JT-07（依赖不可用）。
- **故障注入/恢复**：JT-08（LLMTier 进程级）、JT-07 恢复段（oMLX 重启）。
- **并发**：JT-09（Piko 单执行槽 × LLMTier 并发保护）。
- **性能/容量**：裁剪——无 SLA 基线；仅按 §6 记录观测值。

## 5. Recovery、重放、幂等与故障注入

- **JT-08 注入程序**：① 提交长任务（`deadline=+5min`）；② 轮询 8788 至 `Running`；③
  `kill -9 $(lsof -nP -iTCP:8180 -sTCP:LISTEN -t)`；④ 按 §2.1 命令重启 LLMTier（同库、同 env）；
  ⑤ 轮询 run 至终态并断言失败码；⑥ 复跑 JT-01 验证恢复。允许 1 次 RERUN。
- **JT-07 注入程序**：`kill` oMLX 进程 → 提交 run → 断言失败映射 → 重启 oMLX → 复跑验证。
  oMLX 启动方式以当前宿主运行方式为准（不新写启动脚本）。
- 更细的 Piko 内部崩溃/重放语义（Harness 提交点崩溃、旧 worker 迟到写等）由
  `piko-agent-runtime-test-specification-v0.3` 与 scenario 套件承担，本规格不重复。

## 6. 性能、容量、功耗或时序测试

裁剪：无设计预算阈值可对照。仅记录每 case wall-clock、LLMTier 账本 token 数、Piko
`usage` 字段作参考观测；不设 Pass/Fail 阈值。

## 7. 执行步骤与自动化入口

- **LLMTier 面**：`curl` + `jq`，Bearer 取 `~/piko-secrets/llmtier-joint-data-token`（data）或
  `llmtier-joint-admin-token`（admin/probe）。
- **Piko 面**：`POST /runs`/`GET /runs/{id}`/`GET /runs/{id}/result` 指向 `http://127.0.0.1:8788`；
  场景回归复用 `tests/integration/scenario-e2e.test.ts`，以 env
  `PIKO_URL=http://127.0.0.1:8788`（runner/harness 已支持 `PIKO_URL`）将全部流量指向 joint 实例。
- **每 case 步骤**：① 前置检查（§2.4）→ ② 按 §3 操作/注入 → ③ 采集两侧证据（Piko Result JSON、
  LLMTier 账本记录、必要时的 SSE 原文）→ ④ 断言 Oracle → ⑤ 记录 run_id 与观测值。
- **实例重启命令**（见 §2.1；LLMTier 重启必须带 `OMLX_API_KEY` 与两个 token env）。

## 8. Pass/Fail/Blocked/Invalid 判定

- **PASS** = 该 case 全部 Oracle 满足（错误映射类以「明确失败码 + 及时终态」为 PASS，不要求 Completed）。
- **FAIL** = 任一 Oracle 不满足，或出现悬挂（超过 deadline 未终态）、错误码错乱、账本与响应不一致。
- **RERUN** = 模型非确定性或注入时序敏感，允许 1 次重跑并记录两次运行。
- **BLOCKED** = 联调实例/oMLX 不可用（此时相关 case 记 BLOCKED，不计 Fail）。
- **INVALID** = 步骤偏离本规格（重置后重跑，不计分母）。

## 9. Artifact、日志、测量与证据保存

每 case 记录：Piko `run_id` 与 Result JSON（state/summary/usage/failure/known_actions）、
LLMTier 账本记录（`request_id/record_version/measurement_status/tokens`）、注入与恢复时间点、
wall-clock。SSE 原文仅在 wire 类 case（JT-01..03）保留样例。汇总为 STD test-report
（`tests/integration/reports/piko-llmtier-joint-report-*.md`，经 new-design 生成）。
失败现场保留两侧进程日志片段（LLMTier `state/llmtier-piko-joint.log`、Piko
`var/piko-llmtier-joint.log`）。

## 10. 安全、清理与可重复性

- 凭据仅存 `~/piko-secrets/`（0600）；报告与日志不得包含 token 明文；疑似泄露即按「删库→重新
  bootstrap→换 token」处置。
- 全部 kill 操作按端口定位进程（`lsof -nP -iTCP:<port> -t`），**禁止**按进程名批量杀（保护
  8787/18999 上的无关实例）。
- 种子/指令不依赖外部状态；环境可由 §2.1 命令完整重建（重置=删 `state/llmtier-piko-joint.sqlite3*`
  后重新 bootstrap）。联调结束后卸载步骤：杀 8180/8788 进程、删联调库与日志、删两个联调 token；
  既有 `piko-llm-key`/`piko-api-bearer` 等凭据不得删除或覆盖。
