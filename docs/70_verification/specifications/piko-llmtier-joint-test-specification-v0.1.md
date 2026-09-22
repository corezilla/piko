<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko ↔ LLMTier 联调方案（联合调试规格）

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-llmtier-joint-test-specification-v0.1` |
| Document Version | `0.2.0-draft.6` |
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

> 0.2.0 重构说明（Owner review 结论）：联调必须具备**节点级可观测性设计**，而非事后补短板。
> 本版新增：§2.4 控制通道/数据通道架构与节点清单、§2.5 节点调试能力矩阵与需求（未实现项提需求）、
> §3.1 每用例调试选项/中间结果预期/定位预案。oMLX 为**外部系统**：只依赖其现有能力
> （`/v1/models`、`/v1/responses`、Bearer），任何观测不足一律在 **LLMTier 端补偿**。

## 0. 联调性质与方法论（白盒原则）

**联调是白盒联合调试，不是黑盒系统测试。** 允许并鼓励通过**改变实现与配置**来发现和定位问题——
Piko 与 LLMTier 双侧的代码、设计、配置、数据均可修改。目标是**最快调通功能、发现并消灭问题**，
而非在固定实现下验证“能用”。因此本规格把六类白盒方法作为**第一等方法**贯穿设计与执行：

| 方法 | 用途 | 本规格落点 |
|---|---|---|
| 探针 | 快速判定某节点/某路径是否存活与可用 | §3.1 S0、各 case 探活步骤 |
| 流程改变的调试开关 | 改走故障/替代路径，让问题**确定性地**暴露 | JT-05 配置改写、JT-07 endpoint PATCH、JT-08 kill、`PIKO_PROVIDER_DEBUG`、R-T-5 注入开关 |
| 统计 | 前后增量/计数对账，暴露丢失与重复 | JT-10/13/15、usage 账本、`provider_calls` |
| 日志 | 过程事实与错误现场 | 两侧 stdout、会话 JSONL、`/admin/v1/logs` |
| 数据快照 | 任意时刻的证据定格与事后比对 | 双侧 SQLite、SSE 原文、`joint-diagnose.sh` |
| 环回 | 捕获节点收发的原始数据 | 会话 JSONL（prompt 级）、provider 响应环回（R-P-1）；上游捕获 R-T-1 |

**禁止“知道有问题却定位不出/观测不到”的状态**：任何观测缺口一律当场转为需求（R-P-*/R-T-*，
§2.5），先以替代证据继续执行，实现后复核。

## 1. 目标、范围与被测对象

验证 Piko 与**真实 LLMTier 服务**在 Data Plane 契约（`llmtier-piko-data-plane-control`
v0.3.2-draft.3 + LLMTier V0.3 OpenAPI）下的端到端行为：请求/SSE wire 形状、模型解析、
usage 采集与对账、错误映射、故障恢复，以及 Piko 任务语义（工具环/deadline/budget/cancel）
在真实模型依赖下的保持。**每个 case 都必须：声明打开哪些调试选项、写明各节点中间结果预期、
给出数据/统计/日志不符时的定位预案**（§3.1）。**不证明**：m5air 生产部署、production TLS/auth
激活、embeddings、Slinky capacity、模型输出质量。

被测对象为双服务联合链路；Piko 侧既有 PK-T41..T54（mock，wire 基线 **candidate.7**）是本规格
的契约对照基线。联调通过不改变 `overall.runtime_activation=false`。

## 2. 引用基线、环境与前置条件

### 2.1 拓扑与实例

| 项 | 值 |
|---|---|
| Piko joint | `127.0.0.1:8788`，`PIKO_CONFIG=config/runtime.llmtier.json`（gitignored），独立 `var/piko-llmtier-joint.sqlite` / `pi-sessions-llmtier-joint` / `staging-llmtier-joint`，`matrix.enabled=false` |
| LLMTier joint | `0.3.0-dev`，`PYTHONPATH=src python3 -m llmtier_v03 --host 0.0.0.0 --port 8180 --database state/llmtier-piko-joint.sqlite3 --settings config/settings.json`，库已 bootstrap（6 个 chat service level + `deployment_omlx_qwen36`；2026-09-22 增配 `deployment_e496a5ebb3834e6e`=Qwen3-Embedding-0.6B-4bit-DWQ，1024 维，挂 `Embedding-v1` 冻结空间 bge-m3-dense-1024-v1） |
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
  `llmtier.base_url` 已放宽为 `^https?://`，负面样例改 `ftp://`；`config/runtime.llmtier.json`
  直用 LAN IP `http://192.168.1.8:8180/v1/`（符合 LLMTier 测试规范 TS-003 的 LAN 要求）。

### 2.3 环境就绪证据（已完成，2026-09-21）

| # | 检查 | 实测 |
|---|---|---|
| V1 | `GET /healthz` | 200 `{"status":"ok","version":"0.3.0-dev"}` |
| V2 | `POST /tier/admin/v1/probes`（deployment_omlx_qwen36） | `{"status":"healthy"}` |
| V3 | `GET /v1/models`（data token） | OpenAI 形状，`data[].id` 含 `Worker` 等 6 个 service level |
| V4 | 真实 `POST /v1/responses`（`stream:true,store:false`） | 10 个 SSE 事件至 `response.completed`；usage `input 18/output 1/total 19` |
| V5 | `GET /tier/v1/usage?from&to` | 记录含 `request_id/record_version=2/is_final/measurement_status=measured` |
| V6 | Piko joint 启动 preflight | `/v1/models` 含 `Worker`，启动成功 |
| V7 | Piko→LLMTier→oMLX 端到端 run | `Completed`，`usage.quality=Partial`（缺 `cache_write_tokens`，契约允许） |
| V8 | LAN 可达 | `http://192.168.1.8:8180/healthz` 200 |
| V9 | Piko 回归 | `npm run check` 绿 |

### 2.4 通道与节点架构（控制通道 / 数据通道）

```text
━━━━━━━━━━━━━━━━━━━━━━━ 控制通道（任务与管理） ━━━━━━━━━━━━━━━━━━━━━━━
 Operator/测试执行器 ──1──▶ 【节点A：Piko joint】 127.0.0.1:8788
     1a POST /runs            （提交任务）
     1b GET  /runs/{id}       （状态轮询）
     1c POST /runs/{id}:cancel（取消）
     1d GET  /runs/{id}/result（结果）
 Operator/测试执行器 ──2──▶ 【节点B：LLMTier joint】 192.168.1.8:8180
     2a /tier/admin/v1/providers|deployments|service-levels（CRUD，If-Match ETag）
     2b /tier/admin/v1/probes  （部署探活）
     2c /tier/admin/v1/audit|logs|usage（管理面观测）
 Piko ──3──▶ LLMTier：GET /v1/models（启动 preflight，配置校验）

━━━━━━━━━━━━━━━━━━━━━━━ 数据通道（模型推理） ━━━━━━━━━━━━━━━━━━━━━━━━
 Piko ──4──▶ LLMTier：POST /v1/responses（SSE；model=Worker；stream:true,store:false）
 Piko ──5──▶ LLMTier：GET /tier/v1/usage（用量对账查询）
 LLMTier ──6──▶ 【节点C：oMLX（外部系统）】 127.0.0.1:9000
     6a POST /v1/responses（上游推理，Bearer OMLX_API_KEY）
     6b GET  /v1/models（上游模型清单）
     6c POST /v1/embeddings（上游 embedding 推理）
 Operator ──7──▶ LLMTier：POST /v1/embeddings（embedding 数据面验证，JT-16；Piko 无 embedding consumer，不经 Piko）
```

| 节点 | 角色 | 本节点内部可观测载体（现状） |
|---|---|---|
| A：Piko joint | Agent runtime（prompt 装配、工具环、任务状态机） | Pi 会话 JSONL（prompt/响应/工具历史）；SQLite（runs/results/model_attempts/tool_calls）；stdout 日志 |
| B：LLMTier joint | 模型网关（鉴权、路由 service level、透传 SSE、usage 计量） | state SQLite（usage 账本）；`/admin/v1/logs`（HTTP 访问行，含 request_id）；`/admin/v1/audit`（管理动作）；service stdout |
| C：oMLX（外部系统） | 模型推理后端 | 仅其现有 HTTP API；**不可要求其新增观测**，不足在节点 B 补偿（见 §2.5 R-T-1） |

### 2.5 节点调试能力与白盒方法库（未实现项 → 提需求）

每节点四类调试能力：**环回**（收发捕获）、**日志**、**数据快照**、**统计**。

| 节点 | 维度 | 现状 | 缺口 → 需求 ID | 承接方 |
|---|---|---|---|---|
| A Piko | 环回 | Pi 会话 JSONL 捕获完整 prompt/响应/工具历史（会话级）✅；provider 响应环回（status/x-request-id，调试开关）✅ **已实现** | 原始请求体贴捕获（现以字节数+会话 JSONL 替代） | R-P-1（主体已实现） |
| A Piko | 日志 | stdout（info）；`observability.log_level` 可配 ✅；**已实现** `PIKO_PROVIDER_DEBUG`/`PIKO_PROVIDER_DEBUG_FILE` 开关（逐请求出站明细落 JSONL） | — | R-P-2（已实现） |
| A Piko | 数据快照 | SQLite（runs/results/model_attempts.raw_usage/tool_calls）✅ | — | — |
| A Piko | 统计 | progress 计数 + Result.usage 聚合 ✅；**已实现** `provider_calls` 表持久化出站调用（ts/status/x-request-id） | — | R-P-3（已实现，实测 x-request-id==账本 request_id） |
| B LLMTier | 环回 | ❌ 无上游(oMLX)调用捕获 | 每请求记录上游 URL/status/时延/错误体（调试开关控制，管理面可查） | **R-T-1** |
| B LLMTier | 日志 | `/admin/v1/logs` HTTP 访问行（含 request_id）✅；stdout ✅ | 上游错误细节不落日志（并入 R-T-1） | R-T-1 |
| B LLMTier | 数据快照 | state SQLite + usage 账本（逐请求）✅ | 缺 per-request 上游响应快照（并入 R-T-1） | R-T-1 |
| B LLMTier | 统计 | usage 账本 ✅；audit（仅管理动作）✅ | 缺数据面计数器（按 model/status 的请求数、错误数、时延分布，管理面可查） | **R-T-2** |
| B LLMTier | 审计语义 | audit 仅记管理动作（实测证实） | 数据面是否审计需在管理控制文档**明示** | **R-T-3** |
| B LLMTier | 流程改变开关 | provider endpoint PATCH（改路由/断链）✅ | 缺**确定性故障/时延/限流/流注入开关**（按 deployment 注入上游 502/503/429/时延/流终止/畸形流，admin 控制、运行时可切）——否则 429/慢响应/带体 5xx/流异常无法确定性触达 consumer | **R-T-5** |
| B LLMTier | 单请求 trace | 无（需按 request_id 查全生命周期：逐阶段时间戳/上游快照/SSE 终止原因/usage，导出 JSON，保留 ≥7 天） | **R-T-6** |
| B LLMTier | consumer 关联透传 | 可选接收 `X-Correlation-ID`/`traceparent` 并在 logs/usage/trace 回显 | **R-T-7** |
| A Piko | 流程改变开关 | 配置改写（base_url/model/matrix）、`PIKO_PROVIDER_DEBUG`、进程级注入（kill）✅ | — | — |
| A/B | 探针 | healthz/readyz/probes/API 探活 ✅ | — | — |
| B LLMTier | readyz | 占位 `Embedding-v1` 曾致全局 `degraded` → **已解决**（2026-09-22 挂载真实 embedding 部署，`readyz=ready`）；「占位不得降级全局」的语义硬化仍建议保留 | R-T-4（配置已解决；LT-OBS-4 语义硬化为改进项） |
| C oMLX（外部） | 全部 | **外部系统：只依赖现状**（`/v1/models`、`/v1/responses`、Bearer） | 任何观测不足**在节点 B 补偿**（R-T-1 的上游捕获即为其补偿点）；可用性探测用节点 B 的 probes | — |

需求管理：R-T-1..R-T-4 已作为正式需求提交至 LLMTier 仓库
（`docs/10_requirements/llmtier-observability-debug-requirements-v0.1`）；R-P-1..R-P-3 由 Piko
承接（记录于本节，实现后在本表回填状态）。**未实现的需求不阻塞 case 执行**——case 以现有能力
的替代证据执行，并在证据中标注"R-* 待实现后复核"。

### 2.6 前置条件（每次执行前）

1. 两个联调实例存活（8180、8788），oMLX 健康（9000）；
2. LLMTier `readyz` 全局 `ready`（2026-09-22 起；chat 与 embedding 均 `available`）；
3. `npm run check` 绿；
4. 不携带无关环境变量启动（避免误连生产配置）；
5. 按 §3.1 确认本 case 的调试选项：已实现的打开；未实现的（R-*）记录"替代证据"标注。

## 3. Case Matrix

| Case | 层 | 维度 | 输入/操作 | 独立 Oracle | 状态 | 对照 |
|---|---|---|---|---|---|---|
| JT-01 | L1 | normal/wire | `POST /runs`（8788）纯文本指令，`max_model_calls=2,max_tool_calls=0` | Run `Completed`；LLMTier 账本新增 `model=Worker,measurement_status=measured` 记录且 tokens>0 | PASS | `run-47311c90…`；账本 846/2/848 |
| JT-02 | L1 | wire/tool-loop | 允许 `read` 的最小任务，指令要求读 `var/scenario-seeds/pts-01/inputs/requirements.md` 后作答 | `Completed`；LLMTier 收到 ≥2 次请求（第二轮含工具结果历史）且均接受 | PASS | `run-cdfe7fa5…`；attempts=2，账本 2 条 |
| JT-03 | L1 | wire/reasoning | 触发推理输出的任务（与 JT-01 同指令即可，模型带 reasoning） | SSE/结果正常；下一轮历史含 opaque reasoning item 时仍被接受（以 JT-02 第二轮成功佐证） | PASS | `run-d6b07de8…`；reasoning_tokens=2 |
| JT-04 | L2 | models/preflight | 启动 joint Piko（正常配置） | preflight 通过；`GET /v1/models` 的 `data[].id` 精确含 `Worker` | PASS | listening 日志；`Worker in models: True` |
| JT-05 | L2 | negative/model | `agent.model="NoSuchModel"` 后以 nohup 后台启动 joint Piko（macOS 无 `timeout(1)`，禁用），读启动日志后 kill 残留并恢复配置重启 | 启动即失败：日志含 `configured model is not available: NoSuchModel`，且 8788 不监听 | PASS | 日志实测命中报错；8788 无监听；恢复后正常 |
| JT-06 | L2 | negative/auth | 以错误 token 调 `POST /v1/responses` 与 `GET /v1/models` | 认证被拒（实测 **403**；ICD §6 写 `401 auth`——偏差记入联调报告 F-1；401/403 均判 PASS） | PASS | 403/403 实测 |
| JT-07 | L2 | negative/dependency | 经 admin API 把 provider `provider_omlx_m5mac` 的 endpoint PATCH 为死地址（`http://127.0.0.1:9299/v1`，If-Match ETag）后提交 run；断言后 PATCH 回 `http://127.0.0.1:9000/v1` | Run 终态 `Failed` 且 `failure.code=ModelUnavailable`（`cause_class=Dependency`），无悬挂；恢复 endpoint 后新 run `Completed`。**禁止 kill oMLX 进程**（共享资源，18999 实例同用） | PASS | `run-fa5d604a…` PASS；恢复后 `run-edff2ce3…` Completed。首跑暴露 D-1 分类缺陷，已修复 |
| JT-08 | L4 | recovery | run 执行中 `kill -9 $(lsof -nP -iTCP:8180 -sTCP:LISTEN -t)`；**等 run 到终态后再**按 §2.1 重启（同库同 token） | 在飞 run 到达明确终态：`Failed` 且 failure 非空；若为 `Completed` 视为注入未命中 → INVALID 重跑。重启后 JT-01 复跑 `Completed` | PASS | `run-fceab2d8…` Failed/ModelUnavailable/Dependency；重启后 `run-5a4395f4…` Completed。首跑暴露 D-2 分类缺陷，已修复 |
| JT-09 | L4 | concurrency | 同时提交 2 个 run | 一个 `Running` 一个 `Queued`，均达终态；LLMTier 无 5xx | PASS | R1=Running/R2=Queued → 双 `Completed` |
| JT-10 | L2 | usage 对账 | JT-01 完成后取 `GET /tier/v1/usage` 最新记录 | 单次模型调用时账本 tokens 与 Piko `Result.usage` 一致（Piko `input_tokens` 含 cached）；多次调用按 request 求和后一致；`record_version` 单调不减 | PASS | 账本==Piko 846/2/848 |
| JT-11 | L3 | regression/切片 | scenario suite 指向 8788，跑 PTS-01/02/04/05 切片 | 切片全 PASS；`usage.quality=Partial` 符合预期 | PASS | 15/15 |
| JT-12 | L3 | regression/全量 | 按 §2.1.1 env 契约运行 scenario 套件（`SCENARIO_MATRIX=0`） | **31/31 PASS**（35 − PTS-06×4；PTS-06 已在生产实例 41/41 中覆盖） | PASS | 31 passed / 4 skipped |
| JT-13 | L2 | 管理面统计变化 | 前值采样（audit/logs/usage）→ ① Piko run（数据面）② admin probe（管理面）→ 复读 | 数据面：logs ≥+1 ∧ usage +1（audit 不变属预期，audit 仅管理动作）；管理面：probe 后 audit +1 | PASS | run=`run-e6cf0850…`；logs +4、usage +1；probe 后 audit 8→9 |
| JT-14 | L2 | negative/请求校验 | 直接调 `POST /v1/responses`：① 未知模型 ② 坏 JSON（不经 Piko；Piko 不会产生此类请求） | ① `404 model_not_found` ② `400 invalid_json`（与 ICD §6 错误面一致） | PASS | 实测 404/400（对照 ICD §6） |
| JT-15 | L2 | usage 快照稳定性 | 同一 from/to 查询两次；第二次带 `cursor=<snap>:0` | 带 cursor 复查 `snapshot_id` 与首次一致、`has_more=False`、记录数一致 | PASS | `snap_22c246cf…` 一致，4 条（对照 PK-T53） |
| JT-16 | L2 | embeddings 数据面 | Operator 直接调 `POST /v1/embeddings`（model=`Embedding-v1`，真实 oMLX 后端 Qwen3-Embedding-0.6B）：float 双条 + base64 单条 | float：向量数=输入数、dims=1024；base64：字符串；`readyz=ready` | PASS | float 2×1024、base64 5464 字符、readyz=ready（对照管理面控制文档） |
| JT-17 | L4 | 白盒注入（故障/时延/限流/流） | 经 R-T-5 注入开关（按 deployment、运行时可切）：① 上游 502（带错误体）② 上游时延 +5s ③ 上游 429+Retry-After ④ 上游流提前终止 ⑤ 畸形流事件 | ① `Failed/ModelUnavailable/Dependency`（带体 5xx 分类与断链一致）② 时延可观测增加且不误判失败 ③ Piko 在预算/重试语义内处置 ④⑤ 流中断/畸形事件有明确错误处置，**不悬挂、不伪报**；均无悬挂 | **BLOCKED**（待 R-T-5/LT-OBS-5 实现） | PK-T51/49/48 |

**合计 17 case；执行顺序：按 JT 编号递增（JT-01 → JT-17）一步一步执行，不分必做/可选。每完成一个
case，立即回填本表「状态/对照」两列并提交。0.1.x 版已按序执行完毕（全 PASS）；0.2.0 重构后的
复核执行见 §3.1 各 case 的调试选项与中间结果预期。**

### 3.1 每用例调试选项、中间结果预期与定位预案

**通用默认（所有 case 均打开）**：节点A 会话 JSONL（prompt 环回，会话级）、节点A SQLite 快照、
节点B `logs`、节点B `usage` 账本；失败即运行 `scripts/joint-diagnose.sh <run_id>`（§7.1）。
**R-P-1/R-P-2/R-P-3/R-T-1/R-T-2 实现后**，对应 case 复核时增开：provider HTTP 环回、per-run
DEBUG、request_id 关联、上游捕获、数据面计数器（复核记录回填报告）。

| Case（族） | 打开的调试选项（节点） | 中间结果预期（节点 → 证据） | 定位预案（数据/统计/日志不符时） |
|---|---|---|---|
| JT-01/03（wire-文本） | A:JSONL+SQLite；B:logs+usage | A1 Piko attempts=1、usage.observed=1；A2 JSONL 含完整 system/user 历史与 assistant 输出；B1 logs 有 `POST /v1/responses 200`；B2 usage +1 且 tokens>0 | 无 B1 行→Piko→B 网络/B 挂（探活区分）；B1 4xx→请求形状（对照 A2 判 Piko 装配）；B1 5xx→上游（B→C，见 JT-07 预案）；A2 prompt 异常→Piko 装配 |
| JT-02（wire-工具环） | 同上 + A:known_actions | A1 attempts=2、tool_calls≥1；A2 第二轮历史含 `function_call`+`function_call_output`；B1 两条 200；B2 usage +2 | attempts=1→工具未被调用（查 A2 模型输出是否 function_call）；B 只收 1 条→Piko 二轮装配缺陷（对照 A2） |
| JT-04/05（配置/模型解析） | A:启动日志；B:logs(/v1/models) | 正常：A listening（preflight 200）；异常：A 日志含 `configured model is not available` | preflight 非 200→查 B `/v1/models` 实际返回（service level 是否配置/启用） |
| JT-06（认证） | B:logs | `POST /v1/responses` 与 `/v1/models` 均认证拒绝（401/403） | 200→token 未生效（B 端凭据状态）；对照 §2.2 token 文件 |
| JT-07（依赖断链） | B:audit（PATCH 记录）+logs；A:Result | audit +1（`provider.update`）；logs 5xx `provider_unavailable`；A `Failed/ModelUnavailable/Dependency` | A 得 ModelResponseInvalid→Piko 分类缺陷（已修 D-1）；audit 无记录→PATCH 未生效（查 ETag）；恢复后不 Completed→B 端 provider 状态未刷新（probe） |
| JT-08（LLMTier 进程级） | A:JSONL（retry 记录）；B:logs/探活 | A JSONL 含 `assistant.retry_wait`×2 → `assistant_error: Connection error.`；A `Failed/ModelUnavailable`；B 重启前 healthz 000 | A 悬挂不终态→Piko 重试/取消路径缺陷；B 重启后 healthz 非 200→bootstrap/env 问题（§2.1）；误判 Completed→注入未命中 INVALID |
| JT-09（并发） | A:两 run 状态轮询；B:logs | 立即态 Running+Queued；终态双 Completed；B logs 无 5xx | B 5xx/429→B 并发保护触发（对账 R-T-2 计数器，未实现前以 logs 佐证）；双 Running→Piko 单槽破坏 |
| JT-10（usage 对账） | B:usage；A:Result.usage | 单次调用：账本==Piko（input 含 cached）；多次：按 request 求和 | 不一致→先比对窗口（时区/边界），再对照 B2 逐条与 A1 attempts 数 |
| JT-11/12（回归） | 全默认 | 套件计数：15/15、31/31；失败 case 转 §7.1 定位 | 任一失败 case → `joint-diagnose.sh` → 按其层位结论处置 |
| JT-13（统计变化） | B:audit/logs/usage 三面 | 数据面：logs ≥+1、usage +1（audit 不变属预期）；管理动作（probe）：audit +1 | logs 不增→请求未到 B；usage 不增→上游未完成计量（对照 B1 状态）；probe 后 audit 不增→B 审计缺陷（R-T-3） |
| JT-14（校验负向） | B:logs | 直接 POST 两种非法请求 | 未知模型→`404 model_not_found`；坏 JSON→`400 invalid_json` | 码不符→B 校验层问题（对照 ICD §6）；Piko 不产生此类请求 |
| JT-15（usage 快照） | B:usage | 同查询带 `cursor=<snap>:0` 复查 | `snapshot_id` 一致、`has_more=False`、记录数一致 | 不一致→B 快照/游标缺陷（对账不可信，升级 R-T-2） |
| JT-16（embeddings） | B:probe+logs+readyz；C 直连 | float 2×1024、base64 字符串、`readyz=ready` | `unsupported_model`→deployment 未挂/能力错（对照 admin 配置）；dims 不符→capability 与后端不一致（对照 C 直连） |
| JT-17（注入开关） | **B:注入开关（§5.1 程序开/关/回读）**+logs+usage；A:Result/JSONL | 注入状态在 B logs/usage 可见（502/429/时延）；A 侧处置符合重试/预算语义 | 打开后 GET 回读非 enabled→B 开关缺陷；注入未生效（流量无差异）→注入点实现缺陷；A 侧表现与预期码不符→Piko 分类缺陷（对照 §7.1） |

## 4. 正常、边界、负向与并发场景

- **normal**：JT-01、JT-02、JT-03、JT-04、JT-09、JT-10、JT-11、JT-12、JT-13、JT-15、JT-16。
- **negative**：JT-05（配置错误）、JT-06（认证失败）、JT-07（依赖不可用）、JT-14（请求校验）、JT-17（注入故障/限流/时延，待 R-T-5）。
- **故障注入/恢复**：JT-08（LLMTier 进程级）、JT-07 恢复段。
- **并发**：JT-09（Piko 单执行槽 × LLMTier 并发保护）。
- **性能/容量**：裁剪——无 SLA 基线；仅按 §6 记录观测值。

## 5. Recovery、重放、幂等与故障注入

- **JT-08 注入程序**：① 提交长任务（`deadline=+5min`）；② 轮询 8788 至 `Running`（`model_calls≥1`）；
  ③ `kill -9 $(lsof -nP -iTCP:8180 -sTCP:LISTEN -t)`；④ **等 run 终态**；⑤ 按 §2.1 重启 LLMTier
  （同库、同 env：`OMLX_API_KEY`+两 token）；⑥ 复跑 JT-01。允许 1 次 RERUN。
- **JT-07 注入程序**：admin API PATCH provider endpoint → 死地址（If-Match ETag）→ 提交 run →
  断言失败映射 → PATCH 恢复 → 复跑验证。**禁止 kill oMLX 进程**（共享资源，18999 实例同用；
  oMLX 为外部系统，观测不足在 LLMTier 端补偿）。
- 更细的 Piko 内部崩溃/重放语义由 `piko-agent-runtime-test-specification-v0.3` 与 scenario 套件
  承担，本规格不重复。

### 5.1 JT-17 注入开关操作程序（脚本级；契约 = LLMTier 需求文档 §5.1，normative）

前置变量：`ADMIN`/`DATA`=两侧 token；`DID=deployment_omlx_qwen36`；`BASE=http://192.168.1.8:8180`。
以 `fault_502` 为例（其余模式仅替换 type/config 与预期状态码，见注）：

| 步 | 请求 | 预期响应 |
|---|---|---|
| 1 打开 | `PATCH $BASE/tier/admin/v1/deployments/$DID/diagnostics`，体=`[{"type":"fault_502","config":{"error_body":"injected backend error"},"enabled":true}]` | `200`，体含该注入项（type/config/enabled=true） |
| 2 回读 | `GET 同路径` | `200`，数组含 `{"type":"fault_502",…,"enabled":true}` |
| 3 触发（数据面直接） | `POST $BASE/v1/responses`，model=Worker，正常 input | `503` 不出现；**`502`** + body 含 `injected backend error` |
| 4 触发（经 Piko） | `POST /runs`（8788，纯文本指令） | Piko run 终态 `Failed` + `failure.code=ModelUnavailable`、`cause_class=Dependency` |
| 5 关闭 | `PATCH` 同路径，体=`[{"type":"fault_502","enabled":false}]` | `200`，enabled=false |
| 6 恢复验证 | 复跑步骤 4 | `Completed`（注入影响消除） |

其余模式（替换步骤 1 的 type/config 与步骤 3/4 预期）：
`fault_503`→同 502；`delay {"delay_ms":5000}`→响应时延 ≥5s 且请求不判失败；
`rate_limit {"retry_after_sec":N}`→`429`+`Retry-After: N` 头；
`stream_terminate`/`malformed_event`（Phase 5b）→consumer 收到不完整/畸形流且**有明确错误处置**。
**纪律**：每步失败即停，按计划 §4.2 B-4 修订后再执行；结束态必须关闭全部注入并回读确认。

## 6. 性能、容量、功耗或时序测试

裁剪：无设计预算阈值可对照。仅记录每 case wall-clock、LLMTier 账本 token 数、Piko
`usage` 字段作参考观测；不设 Pass/Fail 阈值。

## 7. 执行步骤与自动化入口

每 case：① 按 §2.6 确认/打开调试选项 → ② 按 §3 操作/注入 → ③ 采集各节点中间证据（§3.1 预期）→
④ 判定 Oracle → ⑤ 不符时走 §3.1 定位预案 / §7.1 决策树 → ⑥ 回填并提交。
Matrix 与重启类按 §3.1/§5 程序；`POST /runs` 统一封装 `scripts/scenario-run.sh`。

### 7.1 失败定位流程（诊断入口）

失败时先运行 `scripts/joint-diagnose.sh <run_id>`（五层证据一次拉取）：
① Piko run/Result → ② Pi 会话 JSONL（**Piko 组装的完整 prompt 历史**）→ ③ LLMTier logs（时间窗）→
④ LLMTier usage → ⑤ oMLX/LLMTier 直连探活，输出层位结论：

| failure.code | 层位 | 再区分 |
|---|---|---|
| `ModelUnavailable` | 依赖可用性（LLMTier 或 oMLX） | 窗口内有 5xx/provider_unavailable → 上游(oMLX)；窗口内无日志行 → LLMTier 未收到（挂/网络） |
| `ModelResponseInvalid/ModelProtocol` | Piko prompt 或 LLMTier 协议 | 对照 ②：请求形状违规 → Piko；形状正常而响应体异常 → LLMTier |
| `ToolFailure` | Piko 工具/权限 | — |
| `BudgetExceeded`/`DeadlineExceeded` | Piko 任务限额 | — |
| `UnsafeRetryBlocked` | Piko 恢复语义 | — |

已知观测缺口（需求 R-P-1..3 / R-T-1..4 承接）：Piko 与 LLMTier 之间无端到端 request_id 关联、
数据面无审计与计数器、无逐跳时延、`logs` 仅为 HTTP 访问日志。

## 8. Pass/Fail/Blocked/Invalid 判定

- **PASS** = 该 case 全部 Oracle 满足（错误映射类以「明确失败码 + 及时终态」为 PASS，不要求 Completed）。
- **FAIL** = 任一 Oracle 不满足，或出现悬挂（超 deadline 未终态）、错误码错乱、账本与响应不一致。
- **RERUN** = 模型非确定性或注入时序敏感，允许 1 次重跑并记录两次运行。
- **BLOCKED** = 联调实例/oMLX 不可用（相关 case 记 BLOCKED，不计 Fail）。
- **INVALID** = 步骤偏离本规格（重置后重跑，不计分母）。

## 9. Artifact、日志、测量与证据保存

每 case 记录：Piko `run_id` 与 Result JSON、LLMTier 账本记录、注入与恢复时间点、wall-clock；
wire 类 case 保留 SSE 原文样例。汇总为 STD test-report（`tests/integration/reports/
piko-llmtier-joint-report-v0.1.md`）。失败现场保留两侧进程日志片段（`LLMTier/state/
llmtier-piko-joint.log`、`piko/var/piko-llmtier-joint.log`）。

## 10. 安全、清理与可重复性

- 凭据仅存 `~/piko-secrets/`（0600）；报告与日志不得包含 token 明文；疑似泄露即「删库→重新
  bootstrap→换 token」处置。
- 全部 kill 操作按端口定位进程（`lsof -nP -iTCP:<port> -t`），**禁止**按进程名批量杀。
- 环境可由 §2.1 命令完整重建（重置=删 `state/llmtier-piko-joint.sqlite3*` 后重新 bootstrap）。
  联调结束后卸载：杀 8180/8788 进程、删联调库/日志/token；既有 `piko-llm-key`/`piko-api-bearer`
  等凭据不得删除或覆盖。
