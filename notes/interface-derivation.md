# 系统设计接口推演（notes · 迭代中）

方法：**拿系统设计自己写的接口当 oracle**，对每个接口问"要让它成立，必须什么为真？"——
答不上来 = 缺陷；能答出来的 = 被强制的设计。走完自然分解到模块。

不追求一次出结果。每轮追加，保留试错痕迹。

---

## 0. 接口清单（来自 system-design §5.2 / §8 / §9）

| # | 接口 | 出处 | 方向 |
|---|---|---|---|
| I1 | `POST /tasks`（createTask） | §8.1 | Slinky → Piko |
| I2 | `GET /tasks/{task_id}`（getTask，轮询） | §8.1 | Slinky → Piko |
| I3 | `POST /tasks/{task_id}:cancel`（cancelTask） | §8.1 | Slinky → Piko |
| I4 | `GET /tasks/{task_id}/result`（getTaskResult） | §8.1 | Slinky → Piko |
| I5 | Operator Diagnostics（`DiagnosticSnapshot`） | §8.1 / §8.4 | Operator → Piko |
| I6 | Pi Harness `lane.accept/drive/requestAbort/getResult/watch` | §8.2 | Piko → Pi |
| I7 | Matrix client-server `send/receive/sync` | §8.2 | Piko ↔ Matrix |
| I8 | OpenAI-compatible Responses SSE | §8.2 | Piko → LLMTier |
| I9 | **数据面搬运（scp/mount/object_store）** | §5.2/§6.5 —— **§8.2 未登记** | Piko ↔ Slinky 存储主机 |
| I10 | Secret provider（凭据解析） | §9.1 `credential_ref` —— **接口未定义** | Piko ← Secret |
| I11 | config 文件/启动参数 | §9.1 | Operator → Piko |
| I12 | 本地 FS（SQLite + Pi JSONL + staging） | §3.6/§7.7 | Piko → FS |
| I13 | Slinky 存储主机（数据面目标） | §5.3 TOP-2 —— **环境图/§8 未登记** | Piko → Slinky |
| I14 | Operator 授权/审计 | §8.4/§13.1 —— 定义在 ops（外部） | Operator → Piko |

---

## 1. 逐接口推演（第一轮）

### I1 `POST /tasks`
- 要成立必须：别的 Run 在执行中也能受理；幂等；落库快。
- 强制：受理路径**不得进入执行体**。
- ⚠️ 缺口：受理要校验 discussion 事实（`verify room/event/membership`）→ **受理路径要调 Matrix（外部）** → Matrix 慢/挂会拖住受理 → 与"P0 短事务、不被阻塞"冲突。**必须把"外部核实"移出受理同步路径**（先受理后核实 / 或核实结果预取）。
- ⚠️ 缺口：幂等比较基于字段，但输入是**外部可变引用**（`input_refs[].source`，`sha256` 可选）。"同 task_id 同字段" ≠ "同输入" → **幂等语义与外部引用冲突**（要么强制要求 `sha256`，要么承认"同字段即同任务"并在契约写明）。
- ⚠️ 缺口：`workspace_ref` 语义未定义（Piko 本地 staging 根？谁给？）与"工作区持久化归 Slinky"的关系不明；`permissions.read_paths/write_paths` 相对谁未定义。

### I2 `GET /tasks/{task_id}`（轮询）
- 要成立必须：**执行期间持续可答**，且含运行中进度。
- 强制：**应答体不能被执行阻塞** → 执行与应答分离；执行侧**持续上报事实**；读路径廉价。
- ⚠️ 缺口：`progress.recent_actions` / `current_action` 的**产生源与频率**未定义。若高频写库 → 写放大 + P0 被写占；若读执行侧内存 → P0 够不着。**必须定义"进度事实通道与聚合/节流策略"**（例如执行侧按阈值/间隔上报，P0 落当前快照，不逐动作写）。

### I3 `POST /tasks/{task_id}:cancel`
- 要成立必须：执行**卡死**时仍能送达并真的停。
- 强制：控制面**能信号/杀**执行体；取消**不依赖**执行体健康。
- ⚠️ 缺口：cancel 与 dispatch 的**竞态**未定义（stop intent 写库 ↔ Dispatch 已发出/未收到）→ 需定义 happens-before（例如用 lease epoch/generation 把关：过期 Dispatch 不得开跑）。
- ⚠️ 缺口：取消发生在 **staging（P1）** 中要中断 `scp`——M010 的中断语义与对账未定义（已在 §6.5 提了一句，但接口级未定）。

### I4 `GET /tasks/{task_id}/result`
- 要成立必须：终态后可取、内容冻结、不依赖执行体。
- 强制：Result **持久在控制面**；执行侧只"提议"（ResultCandidate），控制面"提交"。
- ✅ 与已有 §6.2.1 一致。

### I5 Operator Diagnostics
- 要成立必须：**系统坏了也能看**。
- 强制：由控制面提供，不依赖执行体。
- ⚠️ 缺口：诊断要看"执行侧健康/进度"（Harness operation generation）→ 执行侧**心跳/状态**必须落在 P0 可见处（心跳事实）。**心跳接口未在 §8.2 定义**。

### I6 Pi Harness
- 要成立必须：`drive` 长循环可中断；崩溃后能按 session 续。
- 强制：执行体允许阻塞（隔离后无妨）；abort 走进程信号；session 持久 + 确定性 id。
- ⚠️ 缺口：`watch` 语义未定义（§8.2 列了但没说明）。
- ⚠️ 缺口：`drive` 的"可中断"是**外部能力假设**，未验证。
- ⚠️ 缺口（重要）：代码实际是 `import ".../upstream/pi/packages/agent/src/harness/..."`——**依赖 Pi 源码内部路径**，不是稳定 API。§8.2 说"固定 Pi SDK"，实为 **vendored internals**。任何上游改动即破。

### I7 Matrix client-server
- 要成立必须：**不阻塞应答**；讨论事实可被受理/执行消费。
- 强制：**M008 不能放在 P0 应答关键路径**（E2EE CPU 重 + `sync` 长轮询）。
- ⚠️ 缺口（连锁）：但 discussion 的"投喂运行中 turn"要求 Matrix 与**执行侧**联动（`followUp` 到运行中的 Pi operation）→ Matrix 事实**既要给 P0（受理/状态）又要给 P1（投喂）** → Matrix 放哪、事实怎么分发，未定义。
- ⚠️ 缺口：E2EE 需要**持久 crypto store**（megolm/olm sessions）；重启后要恢复；放哪未定义。

### I8 LLMTier Responses SSE
- 强制：执行侧。
- ⚠️ 缺口：`store:false`/`maxRetries=0`/prompt-cache 缺席是**外部能力假设**，未验证。
- ✅ usage 缺失已有 `missing_fields`/`Unknown` 收口。

### I9 数据面搬运
- 强制：执行侧；可中断；凭据 secret；出站白名单。
- ⚠️ 缺口：**§8.2 没有登记这个接口**（§8 不完整）。
- ⚠️ 缺口：`artifact_target.target` ↔ 白名单/凭据的关系未在接口级定义。

### I10 Secret provider
- ⚠️ 缺口：**接口未定义**（`credential_ref` 指向什么？文件/env/KMS？）——外部依赖缺规格。

### I12 本地 FS
- ⚠️ 缺口：设计与代码不一致——§14.1 写 `better-sqlite3`，代码用 **`node:sqlite`（DatabaseSync）**。

### I13 Slinky 存储主机
- ⚠️ 缺口：数据面引入的**新外部对象**未进 §2.1.2 环境图 / §8.2。

### I14 Operator 授权
- ⚠️ 缺口：定义在外部 ops 文档；系统设计未给接口。

---

## 2. 被强制出的设计（第一轮结论）

1. **控制面/执行面分离**（轮询、取消、诊断、崩溃存活都被 I2/I3/I5 强制）。
2. **执行侧→控制面的"事实流"**（I2/I4/I5 强制）：operation/tip/usage/progress/heartbeat/result-candidate。
3. **控制面→执行面的"指令流"**（I3/I6 强制）：Dispatch / Abort / FetchInputs / DeliverArtifacts。
4. **Result 的"提议-提交"两步**（I4 强制，已有）。
5. **取消走进程信号**（I3 强制），不依赖执行体 event loop。
6. **Matrix 移出控制面应答关键路径**（I7），但需解决"给 P1 投喂讨论 turn"。

## 5. 决议（第二轮：把缺口钉死）

**边界原则（一句话，替代零散判断）**：**P0 只做权威状态 + 应答（纯本地、短、绝不被外部阻塞）；P1 承载一切会阻塞的外部交互与执行（Pi / LLM / 工具 / scp / Matrix）。**
→ 由此 M008 `matrix-adapter` **从 P0 移到 P1**（E2EE CPU + 长轮询不能进应答路径）。

| # | 决议 |
|---|---|
| R1 受理不被外部阻塞 | 受理**不做同步外部调用**。discussion 核实作为**执行前提**在 Queued 阶段异步做；失败 → 零调用 `Failed(DiscussionAccessLost)`。若 P0 已有缓存的房间/成员事实（P1 sync 上报），可同步早拒。 |
| R2 进度来源 | `progress` **完全由已有 durable 事实派生**：`model_attempts`/`tool_calls` 表（每次模型/工具调用一行，非高频）+ run 时间戳。`recent_actions` = 这两张表的最近 N 行；`current_action` = 最近 Started/InProgress 那条。**不加新通道、无写放大。** |
| R3 cancel × dispatch | 以 P0 事务定序：`scheduler` 只 dispatch `state=Queued && !cancel_requested`；Dispatch 带 `(task_id,generation,epoch)`；**P1 在执行前先确认权威状态**，过期/已取消则不启动。Abort 先于启动 → P1 直接不开跑。 |
| R4 cancel × staging | staging 在 P1；Abort → P1 中断 scp 子进程 + 清 staging + 上报；P0 收口零调用 `Cancelled`。P0 强杀为兜底。 |
| R5 心跳/健康 | P1 定期发 `Heartbeat{alive,current_run,epoch}`；P0 据此监督（超时→杀+重启）与诊断。`Diagnostics` 读 P0 视图。 |
| R6 Pi 定位 | **Pi 是 vendored 源码、按内部路径 import，不是稳定 SDK**。设计如实标注；pin 必需；升级 Pi = 设计变更。§8.2 改写。 |
| R7 §8.2 补接口 | 补 **数据面搬运**、**Secret provider**、**Slinky 存储主机**（并进 §2.1.2 环境图）、**执行侧心跳**。 |
| R8 存储驱动 | 代码用 **`node:sqlite`(DatabaseSync)**；设计 §13.1/§14.1 的 `better-sqlite3` 改为 `node:sqlite`。 |
| R9 路径基准 | `input_refs[].dest` / `permissions.read_paths` / `write_paths` / `output_paths` **统一相对任务 staging 根**（`<workspace_root>/<task_id>/`）；`workspace_ref` = Slinky 侧工作区标识（审计/映射用，非可访问路径）。 |
| R10 幂等 vs 外部输入 | 幂等比较**任务定义字段**（含声明的 `input_refs` 与 `sha256`）。要内容级幂等，Slinky 必须给 `sha256` 或换 `task_id`；此规则写入契约。 |
| R11 E2EE 持久化 | Matrix crypto store（olm/megolm）持久在容器卷；cursor/crypto 事实经 P1→P0 上报，重启续。 |
| R12 投喂运行中 turn | discussion turn 在 **P1 内部**投给运行中的 Pi operation（`followUp`/新 accept）；事实（turn 状态）上报 P0 落库。 |

**第二轮复核结论**：把 M008 移 P1、进度改为派生、受理去外部依赖后，I1–I14 **逐步都能推通**（每步有出处）。见 §6 复核表。

## 6. 第二轮复核（走通验证）

| 接口 | 现在能推通吗 | 靠什么 |
|---|---|---|
| I1 | ✅ | R1（异步核实）+ R9（路径基准）+ R10（幂等规则） |
| I2 | ✅ | R2（派生进度）+ 控制面分离 |
| I3 | ✅ | R3/R4（事务定序 + P1 中断 + 强杀兜底） |
| I4 | ✅ | Result 提议-提交（已有） |
| I5 | ✅ | R5（心跳事实） |
| I6 | ✅ | P1 承载 Pi（允许阻塞）；R6（如实标注 vendored） |
| I7 | ✅ | M008→P1；R11/R12 |
| I8 | ✅ | P1 承载 LLM |
| I9 | ✅ | R7 登记；P1 承载 scp |
| I10 | ✅ | R7 登记 Secret 接口 |
| I12 | ✅ | R8（node:sqlite）+ P0 单 writer |
| I13 | ✅ | R7 环境图登记 |

**未再走通、需后续独立处理的**（不属本系统设计接口层）：Pi 上游能力验证（`drive` 可中断、SSE 事件子集）、Slinky/Matrix/Secret 环境的真实可用性。

---

## 7. 回写状态（本轮已完成）

已回写 `docs/20_system_design/piko-system-design.md`：

- §3.3 **关键决定 1 改写**（Pi = vendored 源码、内部路径 import）；**关键决定 7 定案**（P0=权威+应答、无外部 IO；P1=一切阻塞外部交互）。
- §3.2 进程归属；M008 移 P1。§5.1 进程模型 + IPC 消息集 + 进度派生 + 心跳。
- §3.4 **PK-14**；§10.1 故障模型 +P1 崩溃/卡死；§12.5 +PK-T43/44；§16.1 M000/M005 注入 PK-14。
- §8.2 **重写**：P0↔P1 IPC、Pi(vendored)、Matrix(P1)、SSE(P1)、**新增 数据面 / Secret provider / Slinky 存储主机**接口。
- §8.1 路径基准 + 幂等语义 + 受理不做同步外部调用。
- §2.1.2 环境图 +Slinky 存储主机 +Secret provider；§13.1/§14.1 `node:sqlite`。
- 图 SW-1/2/3/4/6/6a/8 重渲染 + `.mmd` 同步；SCN-1、SW-9 新增。
- 附录 B 修订记录追加接口推演决议。

**尚未同步（下游，下一步）**：机制（§3.5 目标版本 0.6.x）、模块设计/ISD（含 M010 transfer、M008 移 P1）、契约说明/错误码/测试规格。


```
