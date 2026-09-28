<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko 实现设计：transfer（数据面搬运）

> STD 使用入口：[项目采用说明与标准导航](../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-transfer-impl.isd` |
| Document Version | `0.1.1` |
| Status | `Draft` |
| Project | `piko` |
| Document Owner | Piko Implementation |
| Last Modified Date | `2026-09-28` |
| Template ID | `design.implementation` |
| Template Version | `1.2.0` |
| implementation_view_of_document_id | `piko-transfer-design` |
<!-- STD_DOCUMENT_COVER_END -->


## 1. 实现目标与输入基线

本 ISD 实现 `design.definition` `piko-transfer-design`（M010 `transfer`）：数据面搬运（输入拉取 / 产出投递），运行在 **P1**，不写库、不改执行终态。

### 1.1 实现对象
`fetchInputs` / `deliverArtifacts`（可中断）、`Transport`（`scp`/`mount`/`object_store`）、`ChecksumVerifier`、`RetryPolicy`、`StagingManager`、`DeliveryTracker`。

## 2. 既有实现差异

**N/A**：新建模块，无既有实现。

## 3. 文件、内部组件与调用关系
| File / Internal ID | 说明 |
|---|---|
| `src/transfer/index.ts` | 导出 `fetchInputs`/`deliverArtifacts`/`abort` |
| `src/transfer/transport.ts` | 方法抽象（`scp`/`mount`/`object_store`） |
| `src/transfer/checksum.ts` | `sha256` + size |
| `src/transfer/retry.ts` | 有界重试 + 退避 |
| `src/transfer/staging.ts` | staging 建/清 |
| `src/transfer/delivery.ts` | 幂等键 + 上报事实 |

调用：`worker`（P1 内）→ 本模块 → 外部存储主机 / IPC 上报 P0。

## 4. 数据结构设计

### 4.2 业务与操作数据结构
`InputRef{source,dest?,sha256?}`、`ArtifactTarget{method,target,secret_ref?}`、`OutputArtifact{path,sha256,size_bytes}`、`FailedItem{source|path,error}`。

### 4.6 运行状态数据结构
`InputStaging{state,fetched[],failed[]}`、`ArtifactDelivery{state,delivered[],failed[]}`、`TransferAttempt{item,attempt,outcome,at}`。

### 4.7 数据库表结构
**N/A（不写库）**：事实经 IPC 由 P0 写 `runs.input_staging_json` / `runs.artifact_delivery_json`（M003 §4.7）。

### 4.8 错误码与错误结构
`InputFetchFailed`（`Result.failure.code`，`Dependency`）；投递失败由 `artifact_delivery.state` 表达（非 `failure.code`）。

## 5. 接口设计

### 5.2 消息与数据流接口
- 入：`FetchInputs{task_id,generation,epoch,input_refs}`、`DeliverArtifacts{...output_paths,artifact_target}`、`Abort{task_id}`。
- 出：`Staging{state,items}`、`Delivery{state,items}`。
- 外部：出站 `scp`；Secret provider。

## 6. 关键流程与算法

### 6.1 `P-TRANSFER-FETCH` · 输入预备
建 staging → 逐项 `scp` → `sha256` 校验 → `Staging{ready}`。失败：有界重试 → `Staging{failed}` → P0 落零调用 `Failed(InputFetchFailed)`。

### 6.2 `P-TRANSFER-DELIVER` · 产出投递
计算 `sha256`/size → 逐项 `scp` 到 `<target>/<path>` → `Delivery{delivered|partial|failed}`。失败：重试 + 幂等；**不改 `Result`**。

### 6.3 `P-TRANSFER-ABORT` · 中断
`Abort` → 中断 in-flight `scp`（`AbortSignal`）→ 清 staging → 上报。

## 7. 并发、失败、持久化与安全生命周期

### 7.1 并发、交错与失败收口
staging 与投递各串行（并发=1）；同一 key 幂等；cancel × staging 由 `Abort` 收口。

### 7.2 持久化、恢复与 schema 演进
本模块**无自有持久化**；恢复时按 P0 事实重放（已 `ready`/`delivered` 不重复副作用）。

### 7.3 安全、权限与可观测性
secret 挂载；白名单 + `known_hosts`；路径边界；`event.transfer.*`。

## 8. 资源、构建与宿主接入

### 8.1 配置实现
`transfer.method` / `credential_ref` / `target_allowlist` / `known_hosts` / `max_input_bytes` / `retry`。

## 9. 验证规格与实现任务

### 9.1.1 `VRC-TRANSFER-001` · 输入前提失败
源不可达 / `sha256` 不符 → 断言零调用 `Failed(InputFetchFailed)` 且从未领 slot（PK-T41）。

### 9.1.2 `VRC-TRANSFER-002` · 投递与终态解耦
目标拒绝 / 部分失败 → 断言终态不变、`artifact_delivery=failed/partial`、重试幂等（PK-T42）。

### 9.2.1 `T-TRANSFER-01` · 实现任务
实现 §3 文件 + §6 流程；按 §9.1 验证。

## 10. 映射、复核与未决项

### 10.1.1 `MAP-TRANSFER-01` · 成员映射
`fetchInputs`/`deliverArtifacts` ↔ `design.definition` `F-TRANSFER-*`。

### 10.2 状态一致性复核
与 `piko-transfer-design` / `MECH-TRANSFER` 一致；PK-21 与 `CON-XFER-001..003` 覆盖。

### 10.3.1 `RISK-TRANSFER-01` · 凭据/白名单运维
`scp` 私钥轮换、白名单维护成本 → 方法可换（`mount`/`object_store`）。

### 10.4 Metadata 与 coverage 交付检查
cover/sidecar 一致；`template_sha256` 校验通过；发现见 `notes/interface-derivation.md`。

<!-- STD_DOCUMENT_CONTROL_BEGIN -->
| 文档字段 | 值 |
|---|---|
| Authority | `piko` |
| Authors | corezilla, opencode |
| Created Date | `2026-09-28` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/50_implementation_design/piko-transfer-impl.isd.md` |
| Supersedes | none |
<!-- STD_DOCUMENT_CONTROL_END -->
