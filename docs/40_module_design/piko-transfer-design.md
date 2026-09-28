<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko 模块定义：transfer（数据面搬运）

> STD 使用入口：[项目采用说明与标准导航](../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-transfer-design` |
| Document Version | `0.1.1` |
| Status | `Draft` |
| Project | `piko` |
| Document Owner | Piko Implementation |
| Last Modified Date | `2026-09-28` |
| Template ID | `design.definition` |
| Template Version | `3.4.0` |

| 项目 | 内容 |
|---|---|
| 模块编号 / 正式英文名称 | M010 / `transfer` |
| 运行进程 | P1 执行进程（见 `system-design` §3.3 关键决定 7） |
| 直属父对象编号 / 名称 | `SW-P` / Piko Agent Runtime V0.3（软件系统，`design_level=system`） |
| implementation_specification.mode | `self`（见 `piko-transfer-impl.isd.md`） |
<!-- STD_DOCUMENT_COVER_END -->


## 1. 单元摘要：为什么存在

M010 `transfer` 解决一个问题：任务的**输入文件**与**产出文件**如何在不经 HTTP、不干扰控制面的前提下，被 Piko **主动搬运**到本地 staging / 推送到 Slinky 目标。Slinky 只传**路径/引用**（`input_refs` / `artifact_target`）；`transfer` 负责实际搬运（本期 `scp`，方法可选 `mount`/`object_store`）、`sha256` 校验、有界重试、幂等与 staging 管理。

`transfer` 运行在 **P1 执行进程**：搬运是**可能长时间阻塞的外部 IO**，绝不能落在 P0（控制面必须始终应答轮询/取消）。它不做模型或工具执行、**不改执行终态**；事实经 IPC 上报 P0，由 M003 落库。

**核心不变量**：① 输入拉取失败 = **执行前提失败**（零调用 `Failed(InputFetchFailed)`，从不领取 execution slot）；② 产出投递**与终态解耦**（失败只改 `artifact_delivery`，`Result`/`failure` 不变）；③ 幂等键 `(task_id, generation, path, sha256)`。

### 1.1 继承的上级约束与落实方式

| 上级 Constraint | 来源 | 落实 |
|---|---|---|
| PK-21 数据面搬运 | `system-design` §3.4 | 本模块实现；机制 `MECH-TRANSFER` |
| `CON-XFER-001` 输入完整性 | PK-21 | 拉取后按 `sha256` 校验；不符→前提失败 |
| `CON-XFER-002` 投递幂等 | PK-21 | 幂等键 `(task_id,generation,path,sha256)`；重试不重复副作用 |
| `CON-XFER-003` 投递不阻塞终态 | PK-21 | 终态后异步；只改 `artifact_delivery` |

## 2. 需求、功能与验收条件

| 功能 ID | 功能 | 验收条件 |
|---|---|---|
| `F-TRANSFER-FETCH` | 输入预备：按 `input_refs` 出站 `scp` 拉到 `<staging>/<task_id>/<dest>`，校 `sha256` | 校验通过→`input_staging=ready`；失败→零调用 `Failed(InputFetchFailed)`，从未领 slot |
| `F-TRANSFER-DELIVER` | 产出投递：终态后按 `output_paths` 推 `<artifact_target.target>/<path>`，算 `sha256`/size | 成功→`delivered`；部分/失败→`partial`/`failed`；`Result` 不变 |
| `F-TRANSFER-ABORT` | 可中断：收到 `Abort` 时中断 in-flight `scp` | staging 中 cancel → 清 staging + 零调用 `Cancelled` |

## 3. UI、CLI、服务端点或设备操作面

**N/A**：无 UI/CLI/设备面；对外只体现为 `TaskView.input_staging` / `TaskView.artifact_delivery` 两个字段（由 M001/M003 呈现）。

## 4. 外部边界与依赖

| 边界 | 谁 | 说明 |
|---|---|---|
| Slinky 存储主机 | 外部 | 输入源 / 产出目标；出站 `scp`；白名单 + `known_hosts` |
| Secret provider | 外部 | `transfer.credential_ref`（scp 私钥）；只持引用 |
| P0 控制进程 | 内部 | 经 IPC 收 `FetchInputs`/`DeliverArtifacts`/`Abort`，上报 `Staging`/`Delivery` |
| M005 worker | 内部 | 编排时机；不直接搬运 |

## 5. 内部结构与实现位置

位置：**P1**，`src/transfer/`。

### 5.1 内部组成
- `TransportTransport`（方法抽象：`scp`/`mount`/`object_store`）。
- `ChecksumVerifier`（`sha256`+size）。
- `RetryPolicy`（有界重试 + 退避）。
- `StagingManager`（`<workspace_root>/<task_id>/` 的建/清）。
- `DeliveryTracker`（幂等键去重 + 上报事实）。

### 5.2 内部调用过程
`worker`（编排）→ `fetchInputs`/`deliverArtifacts` → `Transport` 出站 → `ChecksumVerifier` → `DeliveryTracker` 上报 `Staging`/`Delivery` 事实 → P0 落库。

### 5.3 文件间接口契约
`fetchInputs(spec) -> Staging`；`deliverArtifacts(spec) -> Delivery`；两者可中断（`AbortSignal`）。

### 5.5 依赖方向
`transfer` → (外部)存储主机/Secret；`transfer` → (IPC)P0 事实。**无反向依赖**：P0 不调用 `transfer`。

## 6. 数据结构设计

### 6.2 业务与操作数据结构
- `InputRef{source, dest?, sha256?}`、`ArtifactTarget{method, target, secret_ref?}`、`OutputArtifact{path, sha256, size_bytes}`、`FailedItem{source|path, error}`。

### 6.3 配置与规则数据结构
- `transfer.method` / `credential_ref` / `target_allowlist` / `known_hosts` / `max_input_bytes` / `retry`。

### 6.6 运行状态数据结构
- `InputStaging{state: none|pending|in_progress|ready|failed, fetched[], failed[]}`。
- `ArtifactDelivery{state: none|pending|in_progress|delivered|partial|failed, delivered[], failed[]}`。

### 6.7 数据库表结构
- **N/A（本模块不写库）**：事实落在 `runs.input_staging_json` / `runs.artifact_delivery_json`（M003 §4.7，**P0 写**）。

### 6.8 错误码与错误结构
- `InputFetchFailed`（`Result.failure.code`，`cause_class=Dependency`）。投递失败**不产生** `failure.code`。

## 7. 主流程与数据流
1. `FetchInputs` → 解析 `input_refs` → `StagingManager` 建目录 → 逐项出站 `scp` → `sha256` 校验 → `Staging{ready}`。
2. 执行（MECH-RUN）。
3. 终态后 `DeliverArtifacts` → 计算 `sha256`/size → 逐项出站 `scp` → `Delivery{delivered|partial|failed}`。

## 8. 关键算法与业务规则
| 规则 ID | 规则 |
|---|---|
| `R-TRANSFER-CHECKSUM` | 拉取后 `sha256` 必须匹配（给定则校）；不符→重试→前提失败 |
| `R-TRANSFER-IDEMPOTENT` | 幂等键 `(task_id,generation,path,sha256)`；已 `ready`/`delivered` 不重复副作用 |
| `R-TRANSFER-DECOUPLE` | 投递失败**不改** `Result`/`failure`，只改 `artifact_delivery` |

## 9. 接口设计

### 9.2 消息与数据流接口
- 收 `FetchInputs` / `DeliverArtifacts` / `Abort`；发 `Staging` / `Delivery`。
- 外部：出站 `scp`；Secret provider 解析。

## 10. 并发、失败与恢复
- staging 与投递各**串行（并发=1）**。
- 输入失败→零调用 `Failed`；投递失败→有界重试+幂等，终态不变。
- 恢复：P1 重启后按 P0 事实重放（已 `ready`/`delivered` 不重复）。

## 11. 安全、权限与可观测性
- 凭据 secret 挂载；出站白名单；`known_hosts` 固定；路径 `policy` 边界校验。
- 事件 `event.transfer.{fetch,deliver,retry}`；指标 `piko.transfer.*`。

## 12. 容量、性能与运行限制
- 单文件 `transfer.max_input_bytes`；重试上限 `transfer.retry`；方法可换。

## 13. 实现步骤与文件清单
`src/transfer/index.ts`、`transport.ts`、`checksum.ts`、`retry.ts`、`staging.ts`、`delivery.ts`。

## 14. 测试与验收
| VRC | 内容 |
|---|---|
| `VRC-TRANSFER-001` | 输入源不可达 / `sha256` 不符 → 零调用 `Failed`、从未领 slot（PK-T41） |
| `VRC-TRANSFER-002` | 目标拒绝 / 部分失败 → 终态不变、`failed/partial`、重试幂等（PK-T42） |

## 15. 风险、未决问题与引用
- `scp` 私钥轮换与白名单维护成本；方法可换以降级。

## 附录 A. 机制承接表
| 机制 | 承接 |
|---|---|
| `MECH-TRANSFER`（`piko-transfer.md`） | 本模块为其搬运执行者 |
| `MECH-RUN` / `MECH-CANCEL` / `MECH-RECOVERY` | 提供编排时机 / Abort / 重放 |

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
| Canonical Path | `docs/40_module_design/piko-transfer-design.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_CONTROL_END -->
