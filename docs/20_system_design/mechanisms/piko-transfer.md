<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko 机制：数据面输入拉取与产出投递

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-transfer` |
| Document Version | `0.1.0` |
| Status | `Draft` |
| Project | `piko` |
| Document Owner | Piko Architecture Owner |
| Last Modified Date | `2026-09-28` |
| Template ID | `design.system-mechanism` |
| Template Version | `3.3.0` |
<!-- STD_DOCUMENT_COVER_END -->


## 1. 机制摘要：解决什么问题

Slinky 派来的任务，其输入（`input_refs`）与产出（`output_paths`）是**文件**；文件**不经 HTTP**，由 Piko **主动搬运**（本期 `scp`，方法可选 `mount`/`object_store`）。搬运不能由单个模块完成：`task-api` 只规范化请求；`policy` 只判路径与授权；`worker` 只编排"何时拉、何时推"；`task-repository` 只持事实；真正的搬运、校验、重试、幂等、staging 需要一个独立责任单元 `transfer` M010（运行在 **P1**，避免阻塞 P0 应答）。

本机制的价值：让"输入到位"成为**执行前提**、让"产出可读"成为**可查询的交付事实**，且**两者都不干扰控制面**。

- **机制形态与适用性 / 业务副作用**：有副作用（拉取/写入对端文件、本地 staging 落盘）。
- **交接域**：**纯软件 + 跨进程（P0/P1）+ 外部存储主机**。
- **裁剪依据**：无裁剪；按附录 A 核对（纯软件机制，跨 ≥2 责任单元）。

## 2. 使用场景与功能

| Capability / Scenario ID | 业务任务与触发/条件 | 输入与可观察结果 | 提供方/全部消费者 | 实现状态 | 验证结果/判据 |
|---|---|---|---|---|---|
| CAP-TRANSFER-INPUT · 输入预备（P-INPUT） | 任务含 `input_refs`；Run 处于 `Queued` | `input_staging: pending→in_progress→ready`；失败 → 零调用 `Failed(InputFetchFailed)` | 提供：M005 编排 + M010 搬运 + M003 事实；消费：M001/执行前置 | Planned | PK-T41（NOT_RUN） |
| CAP-TRANSFER-ARTIFACT · 产出投递（P-ARTIFACT） | Run 终态、含 `artifact_target` | `artifact_delivery: pending→in_progress→delivered/partial/failed`；**不改执行终态** | 提供：M005 编排 + M010 搬运 + M003 事实；消费：Slinky（读产出前查状态） | Planned | PK-T42（NOT_RUN） |

不适用：无 `input_refs`/`artifact_target` 时 `input_staging=none` / `artifact_delivery=none`。

## 3. 参与方、责任和 authority

| Participant / 工程 Owner | 负责/不负责 | 决定/写入/事实来源/恢复 | Provided/Consumed interface | 部署/实现位置 | 依赖机制与基线 |
|---|---|---|---|---|---|
| M010 `transfer` / Piko Implementation | 负责搬运（`scp`/`mount`/`object_store`）、`sha256` 校验、有界重试、幂等、staging、凭据使用 / 不做模型或工具执行、不改终态 | 决定：单次尝试；写入：无（事实上报）；事实来源：对端 + 本地 staging | 提供：`fetchInputs`/`deliverArtifacts` | **P1** `src/transfer/`（Planned） | MECH-TRANSFER（本） |
| M005 `worker` / Piko Implementation | 负责编排时机（staging lane / 终态后投递）、取消中断 / 不直接搬运 | 决定：编排；写入：经 M003（事实） | 提供：编排；消费：M010 | **P1** `src/worker/` | MECH-RUN |
| M002 `policy` | 负责路径边界与授权判定 | 决定：路径/授权 | 提供：判定；消费：请求 + config | **P0** | MECH-CONFIG |
| M003 `task-repository` | **唯一 writer**：`input_staging` / `artifact_delivery` 事实落库 | 写入：`runs`(staging/delivery) ；事实来源：P1 上报 | 提供：事务接口 | **P0** | MECH-RUN |
| M000 `bootstrap` | 启动校验（白名单/known_hosts/凭据引用）+ 监督 P1 | — | — | **P0** | MECH-STARTUP |

### 3.1 系统约束与参与方承接

| Constraint | 来源 | 承接 | 组合验证 |
|---|---|---|---|
| `CON-XFER-001` 输入完整性 | PK-13 | 拉取后**必须**按 `sha256`（给定则校）校验；不符 → 前提失败 | PK-T41 |
| `CON-XFER-002` 投递幂等 | PK-13 | 幂等键 `(task_id, generation, path, sha256)`；重试不产生重复副作用 | PK-T42 |
| `CON-XFER-003` 投递不阻塞终态 | PK-13 | 投递在终态后异步进行；失败只改 `artifact_delivery`，`Result.failure` 不变 | PK-T42 |

## 4. 数据结构设计

### 4.2 业务与操作数据结构
- `InputRef { source, dest?, sha256? }`；`dest` 相对任务 staging 根。
- `ArtifactTarget { method, target, secret_ref? }`。
- `OutputArtifact { path, sha256, size_bytes }`；`FailedItem { path/source, error }`。
- 定义与机器契约同源：`interfaces/schemas/agent-runtime-v0.3.schema.json`。

### 4.3 配置与规则数据结构
- `transfer.method`、`transfer.credential_ref`、`transfer.target_allowlist`、`transfer.known_hosts`、`transfer.max_input_bytes`、`transfer.retry`。

### 4.6 运行状态数据结构
- `InputStaging { state: none|pending|in_progress|ready|failed, fetched[], failed[] }`。
- `ArtifactDelivery { state: none|pending|in_progress|delivered|partial|failed, delivered[], failed[] }`。

### 4.7 数据库表结构
- 事实落在 `runs` 行的 `input_staging_json` / `artifact_delivery_json` 列（M003 §4.7）；**P0 写入**。

### 4.8 错误码与错误结构
- `InputFetchFailed`（`failure.code`，`cause_class=Dependency`）：输入拉取/校验失败，零调用 `Failed`。
- 投递失败**不产生** `failure.code`，由 `artifact_delivery.state=failed/partial` 表达。

### 4.10 一致性、可见性与数据寿命
- 事实可见点：`TaskView.input_staging` / `TaskView.artifact_delivery`。
- 寿命：随 Run 保留期；staging 在终态或失败后按 retention 清理。

## 5. 接口设计

### 5.1 API（适用时）
本机制**无面向 Slinky 的 API**；对外只体现为 `TaskView` 的两个字段。

### 5.2 消息与数据流接口
- **P0→P1**：`FetchInputs{task_id,...}`、`DeliverArtifacts{task_id,...}`、`Abort{task_id}`。
- **P1→P0**：`Staging{state,items}`、`Delivery{state,items}`、`Facts`。
- **外部**：出站 `scp` 至 Slinky 存储主机；Secret provider 解析 `transfer.credential_ref`。

### 5.4 人机与维护接口
无独立 CLI；状态经 `TaskView` 与诊断快照可见。

## 6. 正常端到端流程
1. M001 受理（P0），Run=Queued，`input_staging=pending`。
2. M005（P1）staging lane 领 Run → 发 `FetchInputs` → M010 出站 `scp` 拉到 `<staging>/<task_id>/<dest>` → 校 `sha256` → 上报 `Staging{ready}`。
3. M003（P0）落库；Run 才有资格竞争 execution slot。
4. 执行（MECH-RUN）→ 终态发布。
5. M005 终态后发 `DeliverArtifacts` → M010 计算 `sha256`/size → 出站 `scp` 推 `<target>/<path>` → 上报 `Delivery{delivered}`。
6. Slinky 轮询见 `artifact_delivery=delivered` 后读产出。

## 7. 分支和替代流程
- `sha256` 不符 → 重试（有界）→ 仍失败 → `Failed(InputFetchFailed)`，清理 staging，**从不领 slot**。
- 目标不可达/拒绝 → 投递 `failed`/`partial`；`Result` 与 `failure` 不变。
- staging 中 cancel → `Abort` → M010 中断 in-flight `scp` + 清 staging → 零调用 `Cancelled`。
- 无 `input_refs`/`artifact_target` → `none`，跳过相应阶段。

## 8. 状态机与不变量
- `input_staging`：`none|pending→in_progress→ready|failed`（单调，不回退）。
- `artifact_delivery`：`none|pending→in_progress→delivered|partial|failed`。
- 不变量：`delivered`/`failed` 的 path 集合不相交；`failed` ≠ 执行失败。

## 9. 失败传播、重试与恢复
- 输入失败是**执行前提失败**：零调用 `Failed(InputFetchFailed)`；重试必须换新 `task_id`。
- 投递失败：有界重试 + 退避；幂等 `(task_id,generation,path,sha256)`；**不阻断终态**。
- 恢复：P1 重启后按 P0 事实重放（已 `ready`/`delivered` 不重复副作用）。

## 10. 并发、排序与容量
- staging 与投递各**串行（并发=1）**；`transfer.max_input_bytes` 限单文件；重试次数可配。
- 慢 `scp` 只占 P1，不影响 P0 与正在执行的 Run（staging 在槽前）。

## 11. 安全、权限与信任边界
- 凭据经 **secret 挂载**，不进载荷/DB/Result/log；出站仅白名单主机；`known_hosts` 固定（不自动接受）。
- 路径经 `policy` 边界校验，禁止逃逸 staging 根。

## 12. 可观测性与证据
- 指标：`piko.transfer.bytes.{in,out}`、`piko.transfer.outcomes.{fetched,delivered,partial,failed}`。
- 事件：`event.transfer.{fetch,deliver,retry}`（含 `task_id`/`generation`）。

## 13. 配置、兼容与部署
- 配置见 §4.3；方法可换；部署在 P1 容器内，需出站可达存储主机。

## 14. 跨责任单元分解与接口分配
### 14.1 参与方到架构对象映射
- M010→`transfer`；M005→`worker`；M003→`task-repository`；M000→`bootstrap`。
### 14.3 责任单元间接口契约
- P0↔P1：`FetchInputs`/`DeliverArtifacts`/`Abort`/`Staging`/`Delivery`。
### 14.4 下级设计输入清单
- M010 definition+ISD（`piko-transfer-design.md` / `piko-transfer-impl.isd.md`）。

## 15. 验证、上线与回滚
### 15.1 输入构造、故障控制与独立判据
- PK-T41：注入源不可达 / `sha256` 不符 → 断言零调用 `Failed` 且从未领 slot。
- PK-T42：注入目标拒绝 / 部分失败 → 断言终态不变、`failed/partial`、重试幂等。
### 15.3 组合验收、启用与旧机制退出
- 与 MECH-RUN / MECH-CANCEL / MECH-RECOVERY 组合验收。

## 16. 风险、未决问题与决定
- `scp` 私钥轮换与白名单维护成本；方法可换（`mount`/`object_store`）以降低。

## A. 输入基线、适用性与图文规则
- 上级：`system-design` §3.5 / §5.2 / §6.5；契约 `0.3.0-simplified.6`。

### A.1 统一适用与复审规则
- 机制模板 3.3.0；复审随 system-design 变更。

### A.2 纯软件 API 机制裁剪示例
- 无硬件/FPGA 边界。

## B. 文档控制与修订记录

| 文档版本 / 日期 | 变更和设计影响 | 作者 |
|---|---|---|
| v0.1.0 / 2026-09-28 | 新建 MECH-TRANSFER：数据面输入预备（不占 slot）+ 产出投递（与终态解耦）；承接 PK-13，`CON-XFER-001..003` | corezilla, opencode |

<!-- STD_DOCUMENT_CONTROL_BEGIN -->
| 文档字段 | 值 |
|---|---|
| Authority | piko |
| Authors | corezilla, opencode |
| Created Date | 2026-09-28 |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/20_system_design/mechanisms/piko-transfer.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_CONTROL_END -->
