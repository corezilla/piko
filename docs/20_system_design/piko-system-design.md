<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Agent Runtime 总体系统设计

> STD 使用入口：[项目采用说明与标准导航](../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `system-design` |
| Document Version | `0.12.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Document Owner | Piko Architecture Owner |
| Last Modified Date | `2026-09-28` |
| Template ID | `design.software-system` |
| Template Version | `2.1.0` |
<!-- STD_DOCUMENT_COVER_END -->


## 1. 文档说明

Piko 仓库只有一份顶层软件设计：`system-design`（本文）。模板采用 `design.software-system` 2.1.0，纯软件项目顶层模式（无总体系统父稿）；项目 `parent_document_id` 为空。Template ID 记录在 cover 与 metadata，不允许把设计层级、依赖或目录层数填入 parent_document_id。

本文承担 Piko Agent Runtime V0.3 完整软件系统的设计，不充当子系统或模块说明。

### 1.1 设计位置与上级承接

| 设计位置 / 本对象 ID | 父对象 / 父 Document ID 或无父理由 | 固定输入 / Constraint ID | 承担范围 / 不承担范围 |
|---|---|---|---|
| `SW-P` · 软件系统 Piko Agent Runtime V0.3 · `system-design` · `design_level=system` · `domain=[software]` | 无父对象（纯软件项目顶层，无总体系统父稿） | PK-01..PK-12（本视图）+ 需求 PK-21/PK-22；需求 PK-04（期限/模型预算）本版撤销（见 `piko-requirements-traceability-v0.3`）；机器契约 `0.3.0-simplified.6` | 承担：四项 HTTP API、单 Agent execution slot、Task Store、Pi session 绑定、Matrix discussion adapter、Usage 聚合、稳定 Result、**数据面搬运（输入拉取 / 产出投递）**、内部诊断与恢复。**不承担**：Slinky 业务流程、Memory authority、LLMTier Agent 状态、Matrix homeserver、工具自身业务语义、supervisor/Secret backend、跨系统 exactly-once、产品 Topic/SID/RID、非 SSE Responses fallback。下游：11 个直属模块（M000-M010），无 subsystem（详见 §3.1 + §3.6）。 |

## 2. 产品应用与设计目标

Piko 是 Pi 的薄任务外壳。一个 Piko 实例拥有一个独立 Agent；Slinky 将每个实例视为一个独立 Intelligent Role（IR），负责组织多个 IR、提供材料与角色、验收结果并决定下一步。Piko 在 Slinky 与 Pi 之间承担"任务事务层"职责：接收并校验已签名任务，持久化 `task_id`、Run 状态和恢复边界，把任务内容作为该 Run 的初始输入交给独立 Pi session，并把 Pi 的最终输出、已知动作、usage 与失败事实封装为稳定 Result 返回 Slinky。事务层不另造 Agent 目标管理、推理循环或"换一种方法"机制；这些执行内行为由 Pi 的 session、Agent loop、tool loop 和模型重试承担，Piko 只施加授权、数据面搬运与持久化边界。

### 2.1 场景、用户入口与外部环境

唯一调用方是已配置的 Slinky principal（一个 bearer credential 引用）。Slinky 通过四项 HTTP operation 提交任务并查询结果；Piko 通过 SSE responses 把每次模型调用交给 LLMTier，并通过 `matrix-js-sdk` Client-Server API 接收/发送 Matrix 房间讨论与附件。LLMTier、Matrix homeserver、Slinky 存储主机、Secret provider 为外部依赖；**Pi 以 vendored 源码引入**（§8.2）；Piko 不重写它们。

### 2.1.1 代表用户场景与价值流

**用户**：Slinky 项目经理（也是 Piko 实例的唯一外部调用方）。**核心任务**：把 Slinky 任务组织中产生的、需要长期运行的 AI 任务交给一个独立 Agent 执行并取得结果。**痛点**：模型调用、工具循环、context 管理、断点恢复若由 Slinky 端重复实现会与 Pi upstream 升级路径持续脱节，且与 Slinky 的项目流程语义纠缠。**价值**：Slinky 只负责"派一个 Run、读一个 Result"，Piko 把模型执行 + 状态持久化 + 故障恢复封装为稳定的 Run 事务。

![SW-1](assets/diagrams/SW-1.png)

<details><summary>mermaid 源码（编辑用）</summary>

```mermaid
sequenceDiagram
  participant U as Slinky 项目经理<br/>(任务派发者)
  participant SL as Slinky<br/>(业务流程方)
  participant P as Piko<br/>(任务事务层)
  participant M as Pi Agent + LLMTier + Matrix<br/>(执行 + 集成)
  participant FS as 本地 FS<br/>(持久层)

  Note over SL,P: 一次性业务场景：派一个新 AI 任务
  U->>SL: 决定派一个新 Run（task_id 由 Slinky 生成）
  SL->>P: POST /tasks (task_id, instruction, workspace_ref, perms, input_refs?, artifact_target?, ...)
  P->>P: 校验 + 持久化 tasks/runs
  P-->>SL: 202 Accepted (task_id, state=Queued)
  Note over SL: Slinky 不阻塞；通过后续 status/result 查询

  Note over P,M: 异步执行阶段（后台 worker）
  P->>M: 启动 Pi session；驱动 Harness operation
  M->>M: 模型调用 + 工具循环 + Matrix discussion
  M->>FS: 持久化 operation/usage/tool facts
  M->>P: operation result + usage + known_actions
  P->>P: fence + 对账 + 固定 Result
  P->>FS: 写入 results generation

  Note over SL,P: 结果查询与决策
  SL->>P: GET /tasks/{task_id}/result
  P-->>SL: AgentResult (state=Completed/Failed/Cancelled + summary + outputs + stats + usage)
  U->>SL: 基于 Result 决定下一步（验收 / 重派 / 升级）
```

</details>

图 SW-1 · `system-design` v0.12.0-draft.1 / Target / NOT_BUILT。代表场景：Slinky 派一个新 Run → Piko 持久化并执行 → 返回 Result。Slinky 与 Piko 之间的所有交互是同步 HTTP；Piko 与执行栈（Pi/LLMTier/Matrix）是异步执行；Piko 与 FS 是同步持久化；产出的文件字节由 Piko 主动搬运、不经 HTTP。

### 2.1.2 应用环境与外部对象

按 STD §2.1 示例图样式：左侧 Slinky 用户环境 → 中间本软件 → 右侧外部依赖；箭头标注业务数据传递。

![SW-2](assets/diagrams/SW-2.png)

<details><summary>mermaid 源码（编辑用）</summary>

```mermaid
flowchart LR
  subgraph USER_ZONE["客户工作环境（外部项目方）"]
    direction TB
    USER["Slinky 项目经理<br/>(人工决策)"]
    SLINKY["Slinky 业务流程<br/>(派 Run / 读 Result)"]
    USER --> SLINKY
  end

  PIKO["Piko Agent Runtime<br/>(本文)"]

  subgraph EXT_ZONE["外部依赖（不在本文范围）"]
    direction TB
    LLMTier["LLMTier<br/>(OpenAI-compatible Responses SSE)"]
    Matrix["Matrix homeserver<br/>(Client-Server API)"]
    SP["Slinky 存储主机<br/>(数据面 scp 对端)"]
    SEC["Secret provider<br/>(凭据挂载)"]
    FS["本地可靠文件系统<br/>(node:sqlite WAL + JSONL + staging)"]
  end

  style USER_ZONE fill:#f7f9fc,stroke:#d4e0eb,stroke-width:1.5px
  style PIKO fill:#dceafb,stroke:#7299c3,stroke-width:2px,color:#20344b
  style EXT_ZONE fill:#f7f9fc,stroke:#d4e0eb,stroke-width:1.5px

  SLINKY <--> PIKO
  SLINKY -. "预建输入/产出目录" .-> SP
  PIKO -- "OpenAI Responses SSE" --> LLMTier
  PIKO -- "Client-Server API" --> Matrix
  PIKO -- "出站 scp（拉输入 / 推产出）" --> SP
  PIKO -- "credential_ref 解析" --> SEC
  PIKO -- "node:sqlite WAL + JSONL + fsync" --> FS
```

</details>

图 SW-2 · `system-design` v0.12.0-draft.1 / Target / NOT_BUILT。三栏环境视图：左侧 Slinky PM + Slinky 业务流程（外部项目） → 中间 Piko Agent Runtime（蓝框 = 本文责任边界） → 右侧外部依赖（LLMTier / Matrix / **Slinky 存储主机（数据面）** / **Secret provider** / FS）。虚线双向箭头 = 与 Slinky 的 HTTP API（用户业务输入/输出：TaskSubmitRequest / AgentResult），实线箭头 = Piko 对外部依赖的调用。Pi 已作为 **vendored 源码**被 Piko 框吸收（P1 内），不在外部依赖栏单列。详细职责映射：Slinky ↔ Piko 见 §5.1 HTTP 四项 operation；Piko ↔ Pi / LLMTier / Matrix / 存储主机 / Secret 见 §8.2；Piko ↔ FS 见 §3.6.1 + §4.1。

### 2.2 目标、范围与可观察成功条件

| Target / Requirement ID | 场景及适用条件 | 目标 / 单位与边界 | 判定与证据状态 | 非目标 / 未决项 |
|---|---|---|---|---|
| PK-01 单 Agent 路径 | 单实例一 Agent，跨实例需另接 Slinky | 同一实例同时至多 1 个 Running Run | 集成测试 + 设计文档保持 | 多 Agent、多 slot；执行优先级或抢占 |
| PK-02 任务事务稳定身份 | Slinky 在提交前生成全局唯一 `task_id` | 重复同 ID 同内容返回原 Run；不同内容 409 `TaskConflict`；tombstone 410 `Gone` | 契约测试 `tests/contract/agent-runtime.test.ts` | 同 ID 同内容被环境变化改变语义 |
| 需求 PK-04（期限/模型预算）· 本版撤销 | — | 本版**不实现**任务级截止/预算；请求不携带 `deadline_at`/`max_model_calls`/`max_tool_calls`（见附录 B 修订记录） | 不适用 | 上游 `piko-requirements-traceability-v0.3` 的 PK-04 **已标记撤销** |
| PK-04 模型路径单一 | Pi `0.85.1` @ commit `9767ba275f3e9a5ee0f5c5342249b629ab1b2282` + Pi `openai-responses` provider + LLMTier SSE | 非 SSE / 第二路径不实现 | LLMTier 联调 | non-stream Responses fallback |
| PK-05 工具调用记账与幂等 | `before_tool` 以 `(task_id, operation_id, tool_call_id)` 原子登记工具调用 | 重复意图不重复执行；**无预算上限** | fault 注入 + Pi 集成 | 运行时新增 `safe` 声明 |
| PK-06 工具 `replay:safe` 验证 | 启动时绑定 `recovery_contract_ref` 与已注册实现 | 未绑定/不一致 → 启动失败 | bootstrap preflight | 自行放宽为 `safe` |
| PK-07 Result 两步提交 | fence → 写 results → 写终态 | 两步间崩溃恢复器只补第二步 | fault 注入 | 合并单事务 |
| PK-08 Matrix 唯一路径 | `matrix-js-sdk` Client-Server | AS 路径不启用 | homeserver 集成 | Application Service fallback |
| PK-09 Usage 字段完整性 | 6 字段每字段 sum/null + missing_fields；Complete/Partial/Unknown | 任一 attempt 缺字段 → null 并入 missing_fields | LLMTier 联调 + 故障注入 | 用归一化 input 冒充完整 |
| PK-10 Result 冻结 UsageSnapshot | Result 发布后迟到 usage 不修改 generation | 内部 attempt ledger version 可推进 | fault 注入 | 重复相加生成第二 Result |
| PK-11 无 Memory API | Piko 不修改 Slinky 正式 Memory | 静态依赖/API 扫描 PASS | `tests/static/no-memory-api.test.ts` | 专用 Memory API |
| PK-12 恢复与 operator 边界 | 恢复顺序：Result → Run → lease → Pi session → Harness → ledger → Matrix | 恢复后必须证明非两写入者 | fault 注入 + operator 授权测试 | 自动重启掩盖数据丢失 |

## 3. 系统概览

Piko 启动时按顺序：parse → schema validate → bind tool/recovery registry → canonicalize paths → open/migrate store → verify vendored manifest hash（本地）→ 本地就绪 → listen，任一失败拒绝接收 Run；**外部依赖探测（LLMTier/Matrix）与 Pi 初始化由 P0 在 READY 后 spawn 的 P1 执行**。受理时按 §3.6.2 顺序固定为 JSON/Schema → bearer principal → 按 `task_id` 查记录 → 比较并返回原 Run 或 `TaskConflict` / `Gone`，仅新 ID 才检查 policy/discussion/dependency/queue capacity。运行时一个 execution slot 由 lease epoch 唯一 fencing，Worker 取得 lease 后在 SQLite 单事务中创建/读取 `run_sessions` 并把 Run 切到 Running，随后打开或恢复一个独立 Pi session（`pi_session_id=task_id`，lane `main`），通过确定性 operation ID（`task_id:initial` / `task_id:turn:<turn_seq>`）驱动 Harness 的 lane accept/drive/getResult。Harness 内部 stage（assistant effect intent → stream frame → tool effect intent → outcome）由 Harness 自管；Piko 只持久化已观察到的 operation/tip 与 Run generation。完成时 fence 新步骤、对账在途工具、固定 Result、冻结 UsageSnapshot，两事务分别写 `results` 与 `runs.state`/`runs.generation`。数据面（输入拉取 / 产出投递）由 `transfer` M010 经容器**出站 scp** 搬运，**与 HTTP 控制面和执行终态解耦**（详见 §6.5）。

### 3.1 软件系统架构

Piko 采用纯软件无 subsystem 结构：system 下直接挂 11 个直属模块（M000-M010）。无 subsystem 是因为：单一 subsystem 是架构代码坏味道（要么 ≥ 2 要么 0）；bootstrap 与其他模块同进程同生命周期，不具备独立 subsystem 资格。模块的功能分组（启动 / 受理 / 事务 / 适配 / 数据面 / 横切）仅在正文 §3.2 / §3.4 中描述，不在架构图上分区分层（按 STD `software-design-composition.svg` 示例：仅表达包含关系，不按对象类型或目录深度判定层级）。

![SW-3](assets/diagrams/SW-3.png)

<details><summary>mermaid 源码（编辑用）</summary>

```mermaid
flowchart TD
  SWP["SW-P · Piko Agent Runtime<br/>对象类型：system · 父对象：无（纯软件顶层）"]

  M000["M000 · bootstrap<br/>对象类型：module · 父：SW-P<br/>启动顺序 + preflight + 配置绑定"]
  M001["M001 · task-api<br/>对象类型：module · 父：SW-P<br/>四项 HTTP operation"]
  M002["M002 · policy<br/>对象类型：module · 父：SW-P<br/>request / path / tool 校验"]
  M003["M003 · task-repository<br/>对象类型：module · 父：SW-P<br/>Run / lease / session / result / ledger 事务"]
  M004["M004 · scheduler<br/>对象类型：module · 父：SW-P<br/>单 slot 领取 / 续租 / fence"]
  M005["M005 · worker<br/>对象类型：module · 父：SW-P<br/>Run 事务协调 + Result 两步发布"]
  M006["M006 · pi-adapter<br/>对象类型：module · 父：SW-P<br/>Harness session / lane / operation / raw usage"]
  M007["M007 · usage<br/>对象类型：module · 父：SW-P<br/>UsageAggregator + ResultValidator"]
  M008["M008 · matrix-adapter<br/>对象类型：module · 父：SW-P<br/>matrix-js-sdk Client-Server + discussion CAS"]
  M009["M009 · observability<br/>对象类型：module · 父：SW-P<br/>结构化日志 / metric / audit"]
  M010["M010 · transfer<br/>对象类型：module · 父：SW-P<br/>数据面搬运（scp/mount/object_store）+ sha256 + 重试幂等"]

  SWP --> M000
  SWP --> M001
  SWP --> M002
  SWP --> M003
  SWP --> M004
  SWP --> M005
  SWP --> M006
  SWP --> M007
  SWP --> M008
  SWP --> M009
  SWP --> M010

  style SWP fill:#dceafb,stroke:#7299c3,stroke-width:2px,color:#20344b
  style M000 fill:#e0e7ed,stroke:#9aafbf,stroke-width:1px
  style M001 fill:#e0e7ed,stroke:#9aafbf,stroke-width:1px
  style M002 fill:#e0e7ed,stroke:#9aafbf,stroke-width:1px
  style M003 fill:#e0e7ed,stroke:#9aafbf,stroke-width:1px
  style M004 fill:#e0e7ed,stroke:#9aafbf,stroke-width:1px
  style M005 fill:#e0e7ed,stroke:#9aafbf,stroke-width:1px
  style M006 fill:#e0e7ed,stroke:#9aafbf,stroke-width:1px
  style M007 fill:#e0e7ed,stroke:#9aafbf,stroke-width:1px
  style M008 fill:#e0e7ed,stroke:#9aafbf,stroke-width:1px
  style M009 fill:#e0e7ed,stroke:#9aafbf,stroke-width:1px
  style M010 fill:#e0e7ed,stroke:#9aafbf,stroke-width:1px
```

</details>

图 SW-3 · `system-design` v0.12.0-draft.1 / Target / NOT_BUILT。SW-P（软件系统，蓝框）下挂 11 个直属模块（灰底 module，含数据面 `transfer` M010），无 subsystem、无 UI 层（无 Web/桌面入口）、无递归。本图仅表达包含关系；模块间协作通过 §3.5 列出的 8 份 `design.system-mechanism` 文档独立描述（不靠图连线）。

### 3.2 组成与职责

Piko 采用"无 subsystem"结构：11 个直属模块按职责分 5 个功能分区（启动 / 受理 / 事务 / 适配 / 数据面）+ 1 个横切分区（观测）。每个模块对应 1 份 `design.definition`（模块定义）+ 1 份 `design.implementation`（ISD）。模块之间跨 ≥ 2 模块的共同机制另建 8 份 `design.system-mechanism` 文档（见 §3.5）。

**进程归属（关键决定 7）**：**P0 控制进程** = M000 `bootstrap`（含监督者）+ M001/M002/M003/M004/M007/M009（常驻、**唯一 SQLite writer**、只做权威状态与应答，**不做任何外部 IO / 模型 / 工具**）；**P1 执行进程** = M005/M006/M008/M010（受 P0 监督、**承载一切会阻塞的外部交互与执行**：Pi / LLM SSE / 工具 / scp / Matrix；单 slot、可被强杀重启）。M009 横切，两进程内可用，audit/指标权威落 P0。

| 对象 ID / 类型 / 父对象 | 职责 / 非职责 | 状态与资源 | 提供/消费接口 | Document ID / 文件名 / 状态 |
|---|---|---|---|---|
| `SW-P` 软件系统 / `system-design` | 承担 Piko Agent Runtime V0.3 完整软件设计 / 不承担 Slinky 业务流程、Memory authority、LLMTier Agent 状态 | — | — | `docs/20_system_design/piko-system-design.md` / Approved |
| M000 `bootstrap` 模块 / `SW-P` | 启动顺序 + preflight + 配置绑定 + 进程生命周期 / 不运行业务、不持有 Run 状态 | 进程寿命；SQLite 句柄；Pi 上游 commit 锚定 | 消费：`config/`；提供：READY / fatal | definition `piko-bootstrap-design.md` + impl `piko-bootstrap-impl.isd.md` / Approved |
| M001 `task-api` 模块 / `SW-P` | 四项 HTTP operation：submit/status/cancel/result / 不持久化业务、不直接操作 adapter | 请求寿命；TypeScript handlers | 消费：`policy`（M002）、`task-repository`（M003）；运行时 HTTP 库非模块交接；提供：`POST /tasks`、`GET /tasks/{task_id}`、`POST /tasks/{task_id}:cancel`、`GET /tasks/{task_id}/result` | definition `piko-task-api-design.md` + impl `piko-task-api-impl.isd.md` / Approved |
| M002 `policy` 模块 / `SW-P` | request/path/tool 判定 / 不持状态 | 启动绑定 | 提供：`ValidatedTaskSubmission`、`BoundToolProfile`；消费：原始请求 + config + registry | definition `piko-policy-design.md` + impl `piko-policy-impl.isd.md` / Approved |
| M003 `task-repository` 模块 / `SW-P` | Run/lease/session/result/ledger 事务 + fenced write / 不持有 Run 业务编排 | 进程寿命；SQLite connection | 提供：`createOrGetRun`、`mutateRun`、`publishResult`；消费：`scheduler` / `worker` | definition `piko-task-repository-design.md` + impl `piko-task-repository-impl.isd.md` / Approved |
| M004 `scheduler` 模块 / `SW-P` | 单 slot 领取/续租/fence / 不决策业务 | 进程寿命 | 提供：`acquireSlot`、`renewLease`、`fence`；消费：tick + `task-repository` | definition `piko-scheduler-design.md` + impl `piko-scheduler-impl.isd.md` / Approved |
| M005 `worker` 模块 / `SW-P` | Run 事务协调、取消、Result 两步发布、数据面编排 / 不镜像 Pi Agent loop | Run 寿命；持有 lease | 提供：`Result generation`；消费：Pi/Matrix/Usage/Repo | definition `piko-worker-design.md` + impl `piko-worker-impl.isd.md` / Approved |
| M006 `pi-adapter` 模块 / `SW-P` | AgentHarness session/lane/operation/abort/raw usage hook / 不替换 Pi provider adapter | Run 寿命；Pi session 句柄 | 提供：`PiRuntime`；消费：Pi（vendored 源码）+ 固定 adapter patch manifest | definition `piko-pi-adapter-design.md` + impl `piko-pi-adapter-impl.isd.md` / Approved |
| M007 `usage` 模块 / `SW-P` | Usage 聚合 + Result 语义校验 / 不在 publish 后修改 generation | 进程寿命；UsageSnapshot 缓存 | 提供：`UsageAggregator`、`ResultValidator`；消费：`pi-adapter.onRawUsage`、`worker` | definition `piko-usage-design.md` + impl `piko-usage-impl.isd.md` / Approved |
| M008 `matrix-adapter` 模块 / `SW-P` | `matrix-js-sdk` Client-Server 封装 + discussion intake CAS / 不启用 AS 路径、不管理 homeserver 内部 | 进程寿命；single identity | 提供：`MatrixRuntime`；消费：Matrix homeserver + `task-repository` | definition `piko-matrix-adapter-design.md` + impl `piko-matrix-adapter-impl.isd.md` / Approved |
| M009 `observability` 模块 / `SW-P` | 结构化日志 + metric + audit / 不反向控制业务 | 进程寿命 | 消费：所有模块事件；提供：redacted log / metric 端点 | definition `piko-observability-design.md` + impl `piko-observability-impl.isd.md` / Approved |
| M010 `transfer` 模块 / `SW-P` | 数据面搬运：输入拉取 / 产出投递（`scp`/`mount`/`object_store`）+ `sha256` 校验 + 有界重试 + 幂等 + staging / 不做模型或工具执行、不改执行终态 | 搬运寿命；staging 句柄 | 提供：`fetchInputs`、`deliverArtifacts`；消费：`worker` M005（编排时机）+ `task-repository` M003（`artifact_delivery` 事实）+ `policy` M002（路径/授权） | definition `piko-transfer-design.md` + impl `piko-transfer-impl.isd.md` / Draft |

### 3.3 总体方案、选择依据与替代方案

**关键决定 1：复用 Pi 的 Agent loop，不复制第二套。**
- 理由：减少并行状态机导致的双向恢复语义；Pi 已具备 durable session + lane/operation + tool loop + retry。
- 实现：Pi **以 vendored 源码**置于 `upstream/pi/`（pin 到 commit），Piko 按**内部模块路径** import（**非稳定公共 API**）；必要的适配补丁随 vendored 源码一并固化，启动校验 manifest 哈希。详见 §8.2。
- 替代：自建 Provider adapter（否决，理由：丢失 Pi 升级路径复用；更复杂）。
- 代价：**上游内部结构变更即破坏兼容**；升级 Pi = 独立设计变更；启动必须校验 vendored revision。

**关键决定 2：单实例单 execution slot + SQLite WAL + lease epoch。**
- 理由：单实例事务层避免多 writer 协调；lease epoch 唯一 fencing；fenced write 取代分布式锁。
- 替代：多 slot 多 worker（被否决，理由：超出 Piko "任务事务层"职责范围，跨系统 readiness/compatibility 已退出）；远程/共享 SQLite（被否决，理由：跨系统 capacity claim 已退出）。
- 代价：单实例容量受本地 SQLite + JSONL 性能限制；多实例由 Slinky 端组织，本软件不重复实现。

**关键决定 3：Responses SSE 单一模型路径，provider 内层 `maxRetries=0`。**
- 理由：固定 Pi 上游 + 简化 usage 汇总；Harness retry policy 形成可观察的 attempt。
- 替代：non-stream Responses fallback（被否决，理由：与 system design §3.6 "非流式 Responses 不是 Piko 的共同基线" 冲突）。
- 代价：必须由 Harness 形成 recoverable operation facts；SSE 缺失/提前断流由 Harness 报中断而非自动重发。

**关键决定 4：Matrix 仅 Client-Server，无 Application Service。**
- 理由：discussion 使用标准 Matrix sync + room membership + 标准消息/附件；避免双协议路径。
- 替代：Application Service 路径（被否决，理由：与 system design §3.6 "不并行使用 Application Service 路径" 冲突）。
- 代价：discussion 仍受 Matrix Client-Server 限流；homeserver 配置由 homeserver 文档负责。

**关键决定 5：Usage 字段逐项 sum/null + missing_fields + ResultValidator 前置。**
- 理由：避免下游误用归一化 input 冒充完整；保持 Complete/Partial/Unknown 三态语义。
- 替代：LLMTier 二次相加（被否决，理由：与 system design §4 "不得使用 Pi 为显示而扣除 cache 后的归一化 input" 冲突）。
- 代价：必须实现 semantic validator；Result 发布前 fail closed。

**关键决定 7：控制面/执行面进程隔离——P0 只保有权威状态并应答，P1 承载一切会阻塞的外部交互与执行。**
- 理由：控制能力（受理 / 查询 / 取消 / 诊断）必须**始终可服务**；而模型 I/O、**工具执行（不可信代码）**、`scp` 搬运、Matrix（E2EE + 长轮询）都**可能长时间阻塞、可能崩溃、且不可信**。同进程会：① 工具崩溃 / OOM / 原生崩溃**打掉整个 HTTP**；② 事件循环被阻塞时，`cancel` 请求**排不上队 → 停不下来**；③ 不可信工具与承载鉴权的进程同生共死。
- 方案：**两个 OS 进程**。**P0（常驻）** = M000 引导+监督 + M001/M002/M003/M004/M007/M009，**唯一 SQLite writer**，**只做本地短操作**（受理 / 调度 / 事实落库 / 查询 / 恢复编排），**不做任何外部 IO**。**P1（受监督子进程）** = M005/M006/M008/M010，承载 **Pi / LLM SSE / 工具 / `scp` / Matrix**，单 slot、**允许阻塞**。**P1 不写 SQLite**：事实经 IPC 上报，P0 校验 `(task_id,generation,lease_epoch)` 后单事务落库；指令（`Dispatch`/`Abort`/`FetchInputs`/`DeliverArtifacts`）由 P0 下发；取消 = P0 写 stop intent + 发 `abort`（有界等待，超时**强杀并重启 P1**，据持久事实收口）。
- 替代：同进程（否决，见上）；`worker_threads`（否决：不隔离原生崩溃 / OOM）；**把 Matrix 留 P0**（否决：E2EE / 长轮询会卡住应答）。
- 代价：IPC + 进程监督 + 启动顺序；这是**必要的隔离成本**。

**关键决定 6：数据面与执行/控制面解耦，文件由 Piko 主动搬运。**
- 理由：文件内容不进 HTTP、不进模型上下文；任务只传**路径/引用**；由 Piko 容器**出站** `scp` 拉输入、推产出。产出投递是**可失败的 IO 后处理**，与"执行终态"解耦——终态是执行事实，不因网络/对端存储故障而改变。
- 替代：HTTP 上传/下载文件（被否决，理由：大文件 + 超时 + 需在 Slinky 侧建 endpoint）；把投递纳入终态（被否决，理由：网络故障会污染"执行已完成"这一稳定事实）。
- 代价：Slinky 读取产出前必须确认 `artifact_delivery.state=delivered`；运行环境需出站网络 + 凭据 secret 挂载 + 目标主机白名单。

### 3.4 约束分配与下游保证

| Constraint ID / 条件 | 承接对象 ID | 预算或行为保证 / 推导引用 | 自由度 / 不可改变 | 下级设计入口 | 局部与组合验证 / 影响 |
|---|---|---|---|---|---|
| PK-01 单 slot + 独立 Pi session | `task-repository` M003 + `scheduler` M004 + `pi-adapter` M006 | lease epoch 唯一 fencing；`pi_session_id=task_id` 确定性绑定 | worker 内部不引入并行阶段 | mechanism `MECH-RUN`（`piko-run.md` 已建）+ M003/M004/M006 ISD | 集成测试 + cross-check Result→Run→lease→Pi session→Harness |
| PK-02 任务事务稳定身份 | `task-api` M001 + `policy` M002 + `task-repository` M003 | tombstone 永久拒绝；同 ID 同内容不重新检查动态条件 | path 集合字段按集合比较、时间按 UTC instant、对象成员顺序忽略 | contract `piko-agent-runtime-contract-v0.3` §1 | 契约测试 PK-T03 / PK-T15 |
| 需求 PK-04（期限/模型预算）· 本版撤销 | — | 本版不实现任务级截止/预算（见附录 B 修订记录） | — | — | 不适用 |
| PK-04 Responses SSE 唯一路径 | `pi-adapter` M006 | `stream:true`、`store:false`、`maxRetries=0` | 不替换 provider adapter；不静默切 non-stream | contract `0.3.0-simplified.6` | LLMTier 联调 PK-T09/PK-T10 |
| PK-05/06 工具记账/幂等 + `replay:safe` 绑定 | `pi-adapter` M006 + `policy` M002 | `tool_calls` 表登记（`(task_id, operation_id, tool_call_id)`）；启动时 `recovery_contract_ref` 必须解析 | runtime 不新增 `safe` 声明；**无预算上限** | M006 ISD | PK-T06 / PK-T17 |
| PK-07 Result 两步提交 | `task-repository` M003 + `worker` M005 | 写 `results` 与写终态不可合并 | 恢复器只补第二步 | mechanism `MECH-RUN` + M003/M005 ISD | PK-T05 / PK-T15 |
| PK-08 Matrix Client-Server | `matrix-adapter` M008 | single identity；discussion intake CAS | 不引入 AS 路径；txn 由 adapter 内部确定性派生 | mechanism `MECH-MATRIX` + M008 ISD | PK-T08 |
| PK-09/10 Usage 完整性 + 冻结 | `usage` M007 + `worker` M005 | 每字段 sum/null + missing_fields；ResultValidator 前置 | semantic validator 失败 throw `InternalError`；Result 发布后不修改 | mechanism `MECH-USAGE` + M007 ISD | PK-T10 / PK-T16 |
| PK-11 无 Memory API | 所有模块 | 静态扫描：禁止 Memory 类 export/import 引用 | 不引入 Slinky Memory 字段 | `tests/static/no-memory-api.test.ts` | PK-T11 |
| PK-12 恢复边界 | `bootstrap` M000 + 所有 worker | recovery 顺序：Result → Run → lease → Pi session → Harness → ledger → Matrix | 不复活旧权威；不模拟成功 | mechanism `MECH-RECOVERY` + ops | PK-T12 |
| PK-21 数据面（输入/产出搬运） | `transfer` M010 + `worker` M005 + `policy` M002 + `task-repository` M003 | 输入：**Queued 阶段、不占 execution slot** 预备，按 `sha256` 校验（失败=前提失败→零调用 Failed、从不领 slot）；产出：**终态后**尽力投递、有界重试、幂等 `(task_id,generation,path,sha256)`、**不改执行终态**；搬运**可中断**（cancel 对账）；凭据 secret 挂载 + 出站白名单 | 方法可换（`scp`/`mount`/`object_store`）；重试上限可配 | M010 ISD + mechanism `MECH-TRANSFER` | PK-T41 / PK-T42 |
| PK-22 控制面/执行面进程隔离 | `bootstrap` M000（监督）+ `task-api` M001 + `worker` M005 + `pi-adapter` M006 | P0 常驻服务轮询/受理/取消，**不执行模型或工具**；P1 单 slot、可被强杀重启；**P1 崩溃/卡死时 P0 仍能响应 `GET`/`cancel`**；P1 不直接写 SQLite | P1 的可丢弃性；IPC 协议与消息集；重启退避 | `piko-startup`/`piko-recovery`/`piko-cancel` + M000/M005 ISD | PK-T43 / PK-T44 |

> **CON 反向登记**：各机制的 §3.1 在本表 PK 约束下派生 `CON-<MECH>-<nnn>` 子约束。当前映射：`CON-RUN-001..004`←PK-01/02/07；`CON-USAGE-001/002`←PK-09/10；`CON-MX-001`←PK-08；`CON-CFG-001`←PK-12；`CON-ST-001`←PK-12；`CON-REC-001`←PK-12；`CON-CX-001`←PK-04（本版 PK-05/06 记账语义保留、预算上限取消）；`CON-XFER-001..003`←PK-21（输入完整性 / 投递幂等 / 投递不阻塞终态）。子约束不得放宽本表分配。


### 3.5 机制清单与文档映射

每个跨多个直属模块的共同机制独立建 1 份 `design.system-mechanism` 文档，路径在 `docs/20_system_design/mechanisms/`。机制文档唯一维护详细协议、状态、参与方协议与失败/恢复细则；本文不复制同一套字段。

| Mechanism ID / 用途 | 上级 Mechanism ID | 参与对象 / Process 或 Constraint | 前置依赖 | Document ID / 计划文件名 | Planned 或实际基线 / 未决项 |
|---|---|---|---|---|---|
| MECH-RUN · 单 Run 提交 → 完成闭环 | — | `task-api` M001 + `policy` M002 + `task-repository` M003 + `scheduler` M004 + `worker` M005 + `pi-adapter` M006 + `usage` M007；Constraint PK-01/02/07 | 无（族设计锚点） | `piko-run.md`（v0.6.0，已建；本轮修订） | Draft / PK-T05/PK-T13/PK-T15 |
| MECH-CONFIG · 配置加载/绑定/生效 | MECH-RUN | `bootstrap` M000 + `policy` M002；Constraint §9 | MECH-RUN | `piko-config.md`（v0.6.0，已建；本轮修订） | Draft / PK-T12 |
| MECH-STARTUP · 进程启动 → READY | MECH-RUN | `bootstrap` M000 + `policy` M002 + `task-repository` M003 + `pi-adapter` M006 + `matrix-adapter` M008（S1-S8）；Constraint PK-12 | MECH-CONFIG | `piko-startup.md`（v0.2.0，已建；本轮修订） | Draft / PK-T12 |
| MECH-USAGE · Usage 字段汇总与冻结 | MECH-RUN | `pi-adapter` M006 + `usage` M007 + `worker` M005（消费 snapshot）；Constraint PK-09/10 | MECH-RUN | `piko-usage.md`（v0.6.0，已建；本轮修订） | Draft / PK-T10/PK-T16 |
| MECH-MATRIX · Discussion intake + sync | MECH-RUN | `matrix-adapter` M008 + `worker` M005 + `task-repository` M003（持 turn 状态）；Constraint PK-08 | MECH-RUN | `piko-matrix.md`（v0.6.0，已建；本轮修订） | Draft / PK-T08 |
| MECH-RECOVERY · 进程崩溃后恢复 | MECH-RUN | `worker` M005 + `task-repository` M003 + `pi-adapter` M006 + `scheduler` M004（新 lease）；Constraint PK-12 | MECH-RUN | `piko-recovery.md`（v0.6.0，已建；本轮修订） | Draft / PK-T12 |
| MECH-CANCEL · Run 取消分流 | MECH-RUN | `task-api` M001 + `task-repository` M003 + `worker` M005；Constraint PK-04 | MECH-RUN | `piko-cancel.md`（v0.2.0，已建；本轮修订） | Draft / PK-T05 |
| MECH-TRANSFER · 数据面输入拉取 / 产出投递 | MECH-RUN | `task-api` M001 + `worker` M005 + `transfer` M010 + `task-repository` M003 + `policy` M002；Constraint PK-21 | MECH-RUN | `piko-transfer.md`（v0.1.0，新建） | Draft / PK-T41/PK-T42 |

> 机制归属规则：仅当共同协议或运行职责跨 ≥ 2 个直属模块时建独立 `design.system-mechanism` 文档；否则归模块设计自身描述。MECH-RUN 是机制族设计锚点（`parent none`、`prereq none`）；其余 7 个以 MECH-RUN 为归属父项，且不构成前置依赖循环（CONFIG/STARTUP/USAGE/MATRIX/RECOVERY/CANCEL/TRANSFER 的 prereq 单向指向 MECH-RUN 或 MECH-CONFIG）。

#### 3.5.1 机制依赖矩阵（唯一权威）

四类关系必须分开，只有**设计前置**参与无环检查；运行时消费与恢复读取是事实/API 关系，允许双向：

| 机制 | 上级机制（归属） | 设计前置（须无环） | 运行时消费 | 恢复时读取事实 |
|---|---|---|---|---|
| MECH-RUN | none | none | CONFIG（config）、STARTUP（READY）、USAGE（usage）、MATRIX（discussion）、CANCEL（取消入口）、TRANSFER（输入/产出搬运） | RECOVERY（恢复服务） |
| MECH-CONFIG | MECH-RUN | MECH-RUN | — | — |
| MECH-STARTUP | MECH-RUN | MECH-RUN、MECH-CONFIG | MECH-CONFIG（config） | — |
| MECH-USAGE | MECH-RUN | MECH-RUN | — | — |
| MECH-MATRIX | MECH-RUN | MECH-RUN、MECH-CONFIG | MECH-RUN（Run/Result） | MECH-RECOVERY（对账） |
| MECH-RECOVERY | MECH-RUN | MECH-RUN、MECH-CONFIG | MECH-RUN（Run 事实）、MECH-USAGE（ledger）、MECH-MATRIX（cursor） | — |
| MECH-CANCEL | MECH-RUN | MECH-RUN | MECH-RUN（state/Result） | MECH-RECOVERY（取消中崩溃对账） |
| MECH-TRANSFER | MECH-RUN | MECH-RUN、MECH-CONFIG | MECH-RUN（Run/Result 事实）、MECH-USAGE（Result 已冻结） | — |

**设计前置 DAG（无环）**：`MECH-RUN → MECH-CONFIG → MECH-STARTUP`；`MECH-RUN → {MECH-USAGE, MECH-MATRIX, MECH-RECOVERY, MECH-CANCEL, MECH-TRANSFER}`。运行时消费与恢复读取**不改变**设计前置；因此 MECH-RUN 在运行时消费 RECOVERY/USAGE/MATRIX/TRANSFER 不构成设计循环。


### 3.6 功能设计

本节按用户任务分功能，再映射实现。功能表是索引；关键功能原理见 §3.6.1，用户任务与可观察功能结果见 §3.6.2。具体操作入口、参数、反馈与退出码在 §8.4 唯一维护，本节不复制接口合同。

| Capability ID / 名称 | 用户场景 / 入口 | 输入及前提 | 输出 / 失败行为 | 对象及过程引用 | 实现状态 / 验证项 |
|---|---|---|---|---|---|
| CAP-SUBMIT · 任务提交 | Slinky 项目经理派一个新 Run；入口 `POST /tasks`（§8.1） | `TaskSubmitRequest`：`task_id`、`instruction`、`workspace_ref`、`permissions`、`output_paths`、`input_refs?`、`artifact_target?`、`discussion?`；bearer principal 已配置 | 202 + `TaskView`；失败 422 / 401 / 409 `TaskConflict` / 410 `Gone` / 429 `QueueFull` / 503 | M001 `task-api` + M002 `policy` + M003 `task-repository` + `MECH-RUN`；过程 §6.2 | Draft / PK-T03 / PK-T15 |
| CAP-STATUS · 任务状态查询 | Slinky 查询 Run 当前状态；入口 `GET /tasks/{task_id}`（§8.1） | `task_id` 路径参数；同一 principal | 200 + `TaskView`（state / generation / timestamps / input_staging / progress / result_available / artifact_delivery）；失败 401 / 404 / 410 | M001 `task-api` + M003 `task-repository`；过程 §6.2 | Draft / PK-T03 |
| CAP-CANCEL · 任务取消 | Slinky 取消一个 Run；入口 `POST /tasks/{task_id}:cancel`（§8.1） | `task_id` 路径参数；同一 principal | 200 `CancelledBeforeStart`（Queued）或 202 `StopRequested`（Running）或 200 `AlreadyTerminal`；失败 401 / 404 / 410 | M001 `task-api` + M005 `worker` + M003 `task-repository`；过程 §6.4 | Draft / PK-T05 |
| CAP-RESULT · 任务结果查询 | Slinky 读取 Run 稳定 Result；入口 `GET /tasks/{task_id}/result`（§8.1） | `task_id` 路径参数；同一 principal | 200 + `AgentResult`；失败 409 `TaskNotTerminal` / 401 / 404 / 410 / 500 `ResultUnavailable` | M001 `task-api` + M003 `task-repository`；过程 §6.2 | Draft / PK-T16 |
| CAP-DIAG · 内部诊断（只读） | Operator 读取实例诊断快照；入口由 ops 文档定义（§8.4） | operator authorization；目标为唯一 Piko 实例 | 200 + 诊断 snapshot（redacted）；失败 401 / 403 | M000 `bootstrap` + M009 `observability`；ops 文档 | Approved（设计阶段，激活由 ops Gate） / PK-T12 |

Framework: 功能与用户交互按"用户任务"组织：每个 CAP 对应一个用户任务（派 Run / 查状态 / 取消 / 读 Result / 诊断），不是按控件或命令名。§3.6.2 说明每个任务的完成事实与失败边界，§8.4 说明入口合同。

#### 3.6.1 关键功能概要（按能力展开）

**CAP-SUBMIT**：Piko 接收请求后两步验证：（1）JSON/Schema 静态校验 + bearer principal 校验；（2）按 `task_id` 在 SQLite 查记录。tombstone 返回 410 `Gone`；active `task_json` 已存且字段值与提交一致时直接返回原 Run，不重新检查 policy/queue/dependency；active 但不同返回 409 `TaskConflict`；不存在时检查 policy、discussion 事实（**若已被 P1 的 sync 缓存则同步判定；否则先接受、核实异步**）、依赖 ready fact 与 queue capacity，在一个事务中插入 `tasks` 行与初始 Queued `runs` 行（discussion 任务同时插入初始 Pending turn）。已受理返回 202，未创建任务的 422/429/503 可用同一 `task_id` 重试；新逻辑任务必须换新 `task_id`。关键规则：`task_id` 由 Slinky 生成且全局唯一，一个 `task_id` 只绑定一个不可变任务与一个 Run。受理后（异步，**Queued 阶段、不占 execution slot**）先做**输入预备**（P-INPUT，§6.5）：拉取或校验失败 = 执行前提失败 → 零调用 `Failed`（`InputFetchFailed`），**从不领取 slot**。

**CAP-CANCEL**：按 Run state 分流。Queued 取消不取得 lease，单事务写 `cancel_requested=1`、插入 `model_attempts=0` 的零调用 immutable Result、写 `runs.state='Cancelled'`，返回 `CancelledBeforeStart`；若此时 `input_staging=in_progress`，先由 M010 **中断 in-flight `scp`** 并清 staging，再走同一零调用 Result 单事务。Running 取消只写 stop intent 与 `runs.state='Cancelling'`，返回 `StopRequested`；已终态返回 `AlreadyTerminal`（投递中的 Run 亦然，投递为有界后处理、不因取消中断）。worker abort Pi operation 后再补 Result generation / 终态两步提交。关键规则：`StopRequested` 只证明停止意图已持久化，不证明执行已经停止。

**CAP-RESULT**：非终态 Run 返回 `TaskNotTerminal`；Result generation 由 `results` 表维护，已发布 generation 内容冻结。迟到 usage 替换内部 `model_attempts.record_version` 但不修改 Result、不创建新 generation。关键规则：`Completed` 只表示执行结束，不表示 Slinky 接受产物；产出是否可读见 `TaskView.artifact_delivery`（§6.5）。

#### 3.6.2 用户任务与功能结果

| 用户任务 | 触发场景 / 角色 | 前提 | 期望结果 / 结果已知性 | 失败或不支持条件 | 入口引用 | 过程与验证 |
|---|---|---|---|---|---|---|
| 派一个新 Run | Slinky 项目经理决定把 AI 任务交给独立 Agent / Slinky 流程 | Slinky 已生成全局唯一 `task_id`；bearer principal 已配置 | 202 受理回执 + `task_id`；受理后通过 `GET /tasks/{task_id}` 查询状态；完成由 `GET .../result` 取得稳定 Result；产出可读见 `artifact_delivery` | 422 Schema 拒绝 / 409 同 ID 不同内容 / 410 tombstone / 429 队列满 / 503 依赖未就绪；响应丢失时结果未知，用原 `task_id` 核对，不新建 | §8.1 `POST /tasks` | §6.2 P-BIZ / §6.2.1 Result 两步；PK-T03 / PK-T15 |
| 查一个 Run 的当前状态 | 想知道任务是否已受理 / 运行中 / 终态 / 产出是否已投递 / Slinky 流程或自动化 | 已知 `task_id`；同一 principal | 200 `TaskView`（含 `progress` / `artifact_delivery`）；`state` 是业务阶段的权威事实，不是调用成功 | 401 未授权 / 404 不存在 / 410 tombstone | §8.1 `GET /tasks/{task_id}` | §6.2；PK-T03 |
| 取消一个 Run | 业务决定中止（Slinky 流程或人工） | 已知 `task_id`；同一 principal | Queued：200 `CancelledBeforeStart` + 零调用 Result；Running：202 `StopRequested`（意图落盘）；已终态：200 `AlreadyTerminal` | 401 / 404 / 410；不支持"撤销已经生效的取消" | §8.1 `POST /tasks/{task_id}:cancel` | §6.4 P-STOP / 取消分流；PK-T05 |
| 读取 Run 的稳定结果 | Slinky 验收 / 重派 / 升级决策 | Run 已终态；同一 principal | 200 `AgentResult`：state + partial + summary + outputs + stats + known_actions + usage + failure；Result generation 内容冻结 | 409 `TaskNotTerminal`（未终态）/ 500 `ResultUnavailable`（终态丢 durable Result）；不支持修改已发布 Result；产出字节须先见 `artifact_delivery=delivered` | §8.1 `GET /tasks/{task_id}/result` | §6.2.1；PK-T16 |
| 读取实例诊断快照 | Operator 排查恢复 / 依赖健康 / 队列深度 | operator authorization | 只读 snapshot（redacted）；不改业务状态 | 401 / 403；未知实例拒绝，不改选 | ops 文档 + §8.4 | §10.2 / §10.3；PK-T12 |

**受理、处理中、完成、结果未知**分别意味着：受理 = `tasks` + `runs` 已提交（202）；处理中 = worker 已取得 lease 且 `runs.state='Running'`；完成 = `results` generation 已写且 `runs.state` 为终态；结果未知 = 客户端未收到响应但服务端状态可能已变（用原 `task_id` 核对）。功能结果以服务端事实（`tasks` / `runs` / `results` 表）为准，不以命令退出码或按钮状态代替。

## 4. 子系统与直属模块概要设计

Piko 采用"无 subsystem"结构（1 个 subsystem 是架构代码坏味道，要么 0 要么 ≥ 2；Piko 当前选择 0），system 下直接挂 11 个直属模块（M000-M010）。每个模块对应 1 份 `design.definition` + 1 份 `design.implementation` ISD（详见 §3.2 表的 Document ID 列）；本节不复制这些模块 ISD 的概要。

### 4.1 直属对象概要设计（按模块展开）

**N/A · 由各模块 ISD 承担**：本节不重复 11 个模块的概要原理；详见：

| 模块 | Definition 文档 | ISD 文档 |
|---|---|---|
| M000 `bootstrap` | `piko-bootstrap-design.md` | `piko-bootstrap-impl.isd.md` |
| M001 `task-api` | `piko-task-api-design.md` | `piko-task-api-impl.isd.md` |
| M002 `policy` | `piko-policy-design.md` | `piko-policy-impl.isd.md` |
| M003 `task-repository` | `piko-task-repository-design.md` | `piko-task-repository-impl.isd.md` |
| M004 `scheduler` | `piko-scheduler-design.md` | `piko-scheduler-impl.isd.md` |
| M005 `worker` | `piko-worker-design.md` | `piko-worker-impl.isd.md` |
| M006 `pi-adapter` | `piko-pi-adapter-design.md` | `piko-pi-adapter-impl.isd.md` |
| M007 `usage` | `piko-usage-design.md` | `piko-usage-impl.isd.md` |
| M008 `matrix-adapter` | `piko-matrix-adapter-design.md` | `piko-matrix-adapter-impl.isd.md` |
| M009 `observability` | `piko-observability-design.md` | `piko-observability-impl.isd.md` |
| M010 `transfer` | `piko-transfer-design.md` | `piko-transfer-impl.isd.md` |

模块之间的关系与各自概要在各模块 ISD §1.7 + §5 维护；本文不重复维护。

## 5. 运行组织与部署设计

![SCN-1](assets/diagrams/SCN-1.png)

图 SCN-1 · Piko 应用场景（Target · Proposed；`system-design` v0.11.4）。Slinky 把**单个任务路由到某一个 Piko 实例**（不复制、不广播）；各 Piko 实例**独立连接同一个 LLMTier**；MATRIX 供 Slinky 与 Piko 实例**协作通信**（绿细虚线，双向）。蓝粗箭头为主数据通道；绿细虚线为 Matrix 通讯通道。图内"机器 A / 机器 B"表示不同 Piko 实例位于**不同机器**，与 §5.3 `TOP-2`/`TOP-3` 对应。

![SW-4](assets/diagrams/SW-4.png)

<details><summary>mermaid 源码（编辑用）</summary>

```mermaid
flowchart LR
  classDef proc fill:#e0e7ff,stroke:#4338ca,color:#1f2937
  classDef exec fill:#ffe4e6,stroke:#be123c,color:#1f2937
  classDef ext fill:#fee2e2,stroke:#b91c1c,color:#1f2937
  classDef store fill:#fef9c3,stroke:#a16207,color:#1f2937

  Slinky["Slinky"]:::ext
  P0["P0 控制进程（常驻）<br/>task-api · policy · repository · scheduler · usage · matrix · observability<br/>唯一 SQLite writer · 只应答短事务"]:::proc
  P1["P1 执行进程（P0 监督子进程）<br/>worker · pi-adapter · Pi(vendored) · 工具 · transfer<br/>单 slot · 允许阻塞 · 可被强杀重启"]:::exec
  FS["本地可靠文件系统<br/>SQLite(WAL) + Pi JSONL + staging"]:::store
  LLMTier["LLMTier"]:::ext
  Matrix["Matrix homeserver"]:::ext
  SP["Slinky 存储主机（数据面）"]:::ext

  Slinky -- "四项 HTTP API + 轮询" --> P0
  P0 -- "本地 IPC：Dispatch / Abort / FetchInputs" --> P1
  P1 -- "本地 IPC：Facts / Staging / ResultCandidate / Heartbeat" --> P0
  P0 -- "Task Store 读写（唯一 writer）" --> FS
  P1 -- "Pi session JSONL / staging" --> FS
  P1 -- "OpenAI Responses SSE" --> LLMTier
  P0 -- "Client-Server API" --> Matrix
  P1 -- "出站 scp（拉输入 / 推产出）" --> SP
```

</details>

图 SW-4 · `system-design` v0.12.0-draft.1 / Target / NOT_BUILT。**两个进程**：P0 控制面（应答/权威）+ P1 执行面（Pi/工具/Matrix/scp），经本地 IPC；外部依赖为 LLMTier、Matrix、Slinky 存储主机、Secret provider、本地 FS。

### 5.1 执行上下文、调度与并发

**进程模型（关键决定 7）：控制面常驻，执行面隔离。**

- **P0 控制进程（常驻）**：M000（引导+监督）+ M001/M002/M003/M004/M007/M009。**唯一 SQLite writer**。只做本地短操作：受理 / 调度 / 事实落库 / 查询 / 取消裁定 / 恢复编排；**不做任何外部 IO、不执行模型或工具**。
- **P1 执行进程（P0 监督的子进程）**：M005/M006/M008/M010 + 进程内 Pi + 工具循环。承载 **Pi / LLM SSE / 工具 / `scp` / Matrix（含 E2EE）**；单 slot；**允许长时间阻塞**。
- **跨进程本地 IPC（一等公民）**：P0→P1 `Dispatch`/`Abort`/`FetchInputs`/`DeliverArtifacts`；P1→P0 `Facts`（operation/tip/usage/tool/membership/cursor）/`Staging`/`ResultCandidate`/`Delivery`/`Heartbeat`。**P1 不写 SQLite**；事实经 P0 校验 `(task_id,generation,lease_epoch)` 后**单事务**落库。
- **进度可答且廉价**：`GET /tasks/{task_id}` 的 `progress` **由 P0 已有的 durable 事实派生**（`model_attempts`/`tool_calls` 最近行 + run 时间戳）——不新增高频通道、无写放大。
- **轮询永远由 P0 服务，且与执行完全解耦（本设计的头等可用性保证）**：Slinky 的 `GET /tasks/{task_id}`、`.../result`、`POST ...:cancel` 全部落在 **P0 的 event loop**，只读/写 `runs`/`results` 的小记录。**无论 P1 在执行、卡死、崩溃还是 OOM，P0 都能响应轮询**。这正是"单进程做不到"的地方——单进程里轮询与执行抢同一个线程，执行侧阻塞即轮询停摆，Slinky 无法判断"在跑还是死了"。
- **P0 自身不得被阻塞**：只用**短事务**，不做大序列化 / 大文件哈希 / 同步重活；SQLite 驱动（`node:sqlite` `DatabaseSync`）是**同步调用**，故 P0 读路径只取必要字段（**不含 result 大对象**），写事务保持短小。
- **单 execution slot** 由 P0 `scheduler` 授予；lease epoch 跨 P1 重启仍唯一 fence（重启 = 新 epoch）。
- **P0 监督 P1**：spawn + 心跳；P1 崩溃 / 超时 / 失联 → P0 强杀并重启，再按**持久事实**走恢复（§6.4）。P1 可丢弃；权威始终在 P0 的库中。
- **取消不依赖 P1 健康**：`POST ...:cancel` 由 P0 处理；Running → 写 stop intent + 向 P1 发 `Abort`，**有界等待 ack，超时强杀并重启 P1**，P0 据事实收口。P1 卡死时取消**仍然有效**。
- **输入预备（P-INPUT）** 在 P1 的 staging lane、**不占 slot**；慢 `scp` 不拖住正在执行的 Run，也不影响 P0。
- **工具沙箱（后续）**：P1 内工具再下放受控沙箱/容器；本版先保证"不可信工具不在承载鉴权的 P0 内"。
- 队列采用 `(accepted_at, task_id)` 稳定顺序；不实现优先级或抢占。backpressure 在 Run 创建写事务内检查 queue capacity，满时不创建 Run 并返回 `QueueFull`。
- 进程内计时（drain 超时、重试退避）使用 monotonic clock；**本版无任务级 deadline / 预算**。
- shutdown 顺序：P0 停止新受理 → 写 stop intent → 向 P1 有界 drain / 超时 `abort` → 确认 **P1 退出** → 关闭 store。不能把进程退出当成 Run 已停止。

### 5.2 通信与跨实例协作

- Slinky ↔ Piko：四项 HTTP operation，同一 principal + bearer credential；同 `task_id` 同内容不创建第二 Run。
- Piko ↔ Pi：进程内 `AgentHarness`；确定性 identity（`pi_session_id=task_id`、lane `main`、operation ID 规则）保证跨进程崩溃后的对账。
- Piko ↔ LLMTier：OpenAI Responses SSE；`stream:true`、`store:false`、`maxRetries=0`；三次 prompt-cache 字段不发送。
- Piko ↔ Matrix homeserver：`matrix-js-sdk` Client-Server；每条 `MatrixSendRecord` 持久 `txn_id`，retry 复用；不是产品 outbox 协议。
- 跨实例（多实例部署）：每个 Piko 实例**独立单节点**（独立 Task Store / execution slot / 本地 FS），实例之间**不复制、不共享**；由 Slinky 端分别调用与路由；`task_id` 全局唯一由 Slinky 保证。
- **数据面与文件传输（双向，与 HTTP 解耦）**：任务只传**路径/引用**（输入路径、产出目标），**文件内容不经 HTTP**；文件由 **Piko 主动 scp**——把 Slinky 预置的输入**拉取到本地**、把任务声明的产出**推送到 Slinky 预建的目标**。方法**可选**：`scp`（本期）/ 卷挂载 / 对象存储。
- **控制面**：Slinky 用四项 HTTP operation 提交 / 查询 / 取消，并**轮询** `GET /tasks/{task_id}` 与 `.../result` 获取**执行结果 JSON**（含 `outputs` 的 `path+sha256+size` **引用**，不含字节）；产出投递状态见 `TaskView.artifact_delivery`。
- **工作区归属**：工作区（输入/产出）**持久化归 Slinky**；Piko 只做本地 staging 与搬运。
- **输入预备（不占 slot）**：输入拉取发生在 Run 仍 `Queued` 的**执行前预备阶段**（`input_staging`：`pending→in_progress→ready|failed`），由 `worker` M005 staging 循环串行执行（并发=1），**不持 execution lease**；只有 `ready` 的 Run 才进入 slot 竞争。慢速搬运不拖住正在执行的 Run。cancel 在预备中 → 中断 `scp` + 清 staging → 零调用 `Cancelled`。
- **投递状态可见性（与终态解耦）**：产出投递**不阻塞执行终态**；投递进度/结果由 `GET /tasks/{task_id}` 的 `artifact_delivery` 暴露（`none|pending|in_progress|delivered|partial|failed`），输入预备状态由 `TaskView.input_staging` 暴露。**读产出字节前必须确认 `artifact_delivery.state=delivered`**（或 `partial` 时按 `delivered[]` 逐项确认）。搬运由 `transfer` M010 执行、`worker` M005 编排时机。

### 5.3 部署拓扑、资源与故障域

| Topology ID / 配置 | 对象→进程/实例/节点 | 资源 / 负载依据 | 网络 / 账号 / 外部依赖 | 持久化 / 共享故障域 | 部署状态与验证 |
|---|---|---|---|---|---|
| TOP-1 单实例开发 | SW-P → 控制进程 P0 + 执行进程 P1 / 单节点 | SQLite WAL + JSONL session + workspace staging 位于本地可靠 FS；进程独占 instance lock | localhost bind；operator 账号只读诊断；LLMTier/Matrix Client-Server | 进程退出 = Run 终态不可继续；崩溃后由 §3.6.1 shutdown 协议保证 | Planned（NOT_BUILT，依赖 PK-T01..PK-T12） |
| TOP-2 生产跨机（单实例） | SW-P → 单实例单容器 / 单节点 | SQLite WAL + JSONL session + staging 位于**容器持久卷** | 容器**入站**：Slinky 四项 HTTP（端口发布 / 同网络 / 反代）；容器**出站**：`scp` 到 Slinky 存储主机（拉输入 / 推产出）；external LLMTier / Matrix | 容器重建不丢持久卷；Run 终态不可续；**工作区持久化归 Slinky** | Planned（NOT_BUILT） |
| TOP-3 多 Piko 实例 | SW-P → N 个实例（各自容器/卷；各自 Task Store） | 每实例单节点、单 execution slot | `task_id` 全局唯一由 Slinky 保证；路由归 Slinky；实例间不共享 DB / 存储 | 独立故障域（单实例故障不影响其他实例） | Planned（NOT_BUILT） |

部署假设在 `piko-runtime-release-and-operations-v0.3` 定义；本系统设计不重复发布/激活细节。**Piko 常以容器部署**：1 个实例 = 1 个容器（API/scheduler/worker 同进程）；SQLite / Pi session / staging 挂在**容器持久卷**（本地可靠 FS，容器重建不丢 Task Store）；容器内有 `ssh/scp` 客户端、经**出站**搬运文件；私钥等凭据以 **secret 挂载**（不烧镜像、不进日志）；Slinky 轮询需能**入站**到容器。**不支持 NFS 多 writer**（见 §3.3 关键决定 2）。**工作区（输入/产出）不再假设与 Piko 同机——持久化归 Slinky，Piko 主动 scp 搬运**（见 §5.2）。

## 6. 重要过程

| Process ID / 模式 | 触发 / 目标 | 统筹者 / 参与方 | 前提事实来源 | 阶段 / 结果可见点 | 失败及清理 / 机制引用 | 图号 / 图内路径 / 正文位置 |
|---|---|---|---|---|---|---|
| P-START · 冷启动 | 部署工具拉起进程 / READY 受理 | `bootstrap` M000（统筹 P0 引导 + **spawn/监督 P1**）；`task-repository` M003（store）；P1：`pi-adapter` M006（vendored 校验 + Pi 初始化）、`matrix-adapter` M008（whoami） | config + 固定 vendored revision + 本地 FS 可写 | **P0**：S1 parse → S2 schema → S3 bind → S4 canonicalize → S5 store → S6 verify vendored manifest（本地）→ S7 本地就绪 → S8 listen READY → **spawn P1**；**P1**：外部探测（LLMTier/Matrix）+ Pi 初始化 → 就绪上报 | 任一阶段失败：P0 F1 关闭句柄并 `InternalError` 非零退出；**P1 失败 → P0 重启 P1，P0 仍可应答** | 图 SW-5 / §4.1 |
| P-BIZ · 一次业务受理 | Slinky `POST /tasks` | `task-api` M001（统筹）；`policy` M002；`task-repository` M003；`scheduler` M004；`worker` M005；`pi-adapter` M006；`usage` M007；`matrix-adapter` M008（discussion only） | 已 READY；bearer principal 一致；task_id 唯一性已知 | J1 JSON/Schema → J2 bearer → J3 task_id 查 → J4 比较/创建 → J5 ack 202 | 422/410/409/429/503：J4 直接返回，事务回滚 | 图 SW-6 / §6.2 |
| P-INPUT · 输入预备（执行前 · **不占 slot**） | Slinky 提交含 `input_refs`；Piko 在 **Queued 阶段**预备输入 | `worker` M005（staging 循环 · 串行 并发=1）；`transfer` M010（搬运）；`policy` M002（路径边界 / 授权）；`task-repository` M003（`input_staging` 事实） | 已受理、已 READY；`input_refs` + 凭据引用（secret）；容器可出站 scp | I1 解析 `input_refs` → I2 经 M010 **出站 scp** 拉到本地 staging（**不持 lease**）→ I3 按 `sha256` 校验 → I4 置 `input_staging=ready` 交 slot 竞争 | 拉取 / 校验失败 → **零调用 `Failed`**（`failure.code=InputFetchFailed`），**从不领取 slot**；cancel 在预备中 → 中断 scp + 清 staging → 零调用 `Cancelled` | 图 SW-9 / §6.5 |
| P-ARTIFACT · 产出投递（终态后 · 不阻塞终态） | Run 达到终态（执行事实）；把 `output_paths` 交给 Slinky | `worker` M005（编排时机）；`transfer` M010（搬运）；`task-repository` M003（`artifact_delivery` 事实，写 **Run 侧**）；`usage` M007（Result 已冻结） | Result 已两步提交；`artifact_target`（`method=scp`）+ 凭据引用；容器可出站 scp | A1 收集 `output_paths` → A2 计算 `sha256` / size → A3 经 M010 **出站 scp** 推到 Slinky 目标 → A4 记录 `artifact_delivery`（**Run 侧可变**） | A3 失败：**执行终态不变**，置 `artifact_delivery=failed` 且可见；有界重试、幂等（`task_id,generation,path,sha256`） | 图 SW-9 / §6.5 |
| P-CONFIG · 配置生效（重启生效） | 部署工具拉起新进程 | `bootstrap` M000；`policy` M002（tool 绑定） | 旧进程已停止确认 | C1 校验新参数 → C2 关闭旧服务并等待退出确认 → C3 C1 重新执行 → C8 listen | 旧进程退出未确认：阻塞；新参数无效：保留旧服务 | 图 SW-7 / §6.3 |
| P-STOP · 停止 / 重启 / 异常恢复 | 部署工具发 SIGTERM 或失败恢复 | `bootstrap` M000（统筹）；`worker` M005（drain） | P-START 已成功 | T1 停止新受理 → T2 fence lease/writer → T3 等待有界 drain → T4 abort → T5 退出确认 | T3 超时 → T4 强制 abort；未确认退出 → 阻塞不启动新进程 | 图 SW-8 / §6.4 |

> **说明（数据面搬运）**：`P-INPUT` / `P-ARTIFACT` 是**文件搬运过程**（默认 `scp`，由 Piko 容器主动发起，模块 `transfer` M010），与 §6.2 的受理/执行流程衔接：先拉输入 → 执行 → 终态后投递产出。文件搬运**不属于** MECH-RUN 的模型/工具执行步骤；其模块归口（M010 `transfer`）、机制（`MECH-TRANSFER`）、约束（PK-21）与契约字段（`input_refs` / `artifact_target` / `artifact_delivery`）在本轮完成分配，并登记入 §15 与 §16.1。

### 6.1 启动与就绪过程

![SW-5](assets/diagrams/SW-5.png)

<details><summary>mermaid 源码（编辑用）</summary>

```mermaid
flowchart TD
  S1["S1 解析启动参数"] --> Q1{"有效?"}
  Q1 -- 否 --> F1["F1 记录失败阶段和原因;关闭句柄;非零退出"]
  Q1 -- 是 --> S2["S2 Schema 校验 config + tool profile"]
  S2 --> Q2{"校验通过?"}
  Q2 -- 否 --> F1
  Q2 -- 是 --> S3["S3 绑定 tool/recovery registry"]
  S3 --> Q3{"一致?"}
  Q3 -- 否 --> F1
  Q3 -- 是 --> S4["S4 canonicalize paths"]
  S4 --> Q4{"在 workspace 内?"}
  Q4 -- 否 --> F1
  Q4 -- 是 --> S5["S5 open/migrate SQLite (WAL+FK+busy_timeout)"]
  S5 --> Q5{"成功?"}
  Q5 -- 否 --> F1
  Q5 -- 是 --> S6["S6 verify Pi upstream commit + adapter patch manifest"]
  S6 --> Q6{"fingerprint 匹配?"}
  Q6 -- 否 --> F1
  Q6 -- 是 -->   S7["S7 本地就绪: store writable + vendored manifest hash 匹配"]
  S7 --> Q7{"全 PASS?"}
  Q7 -- 否 --> F1
  Q7 -- 是 --> S8["S8 bind HTTP 端口;READY"]
  W["W1 启动监督超时"] --> X["终止进程;等待退出确认;未确认则阻塞"]
```

</details>

图 SW-5 · P-START 路径。`bootstrap` 是统筹者，部署工具是外部监督 W1。S8 READY 才接受 Run；S5 之前失败不会 listen。

**正常路径及就绪判据**：S1-S5 全部成功且在应用预算内（本设计不声明预算数值，由 bootstrap 实现决定）；S6 必须证明 Pi 上游 commit 与 adapter patch manifest 哈希匹配（**本地文件校验，无外部 IO**）；S7 返回**本地就绪**（store writable + vendored manifest hash 匹配）；S8 输出 READY 消息并 listen 端口。**外部依赖探测（LLMTier `GET /v1/models`、Matrix `whoami`）与 Pi 初始化在 P0 spawn P1 后由 P1 做**，P1 就绪作为"执行可用"事实上报 P0；**P1 未就绪不影响 P0 应答 HTTP**（执行不可用期间受理仍可入队）。

**失败与清理**：任一阶段失败走 F1，记录失败阶段、原因，关闭已得句柄，释放内存，进程非零退出。S6 不匹配时不进入 S7；S7 部分失败立即 F1 不接受部分就绪。W1 启动监督超时未收到 READY 触发强制终止并等待退出确认；未确认保持阻塞，不启动第二份进程。

### 6.2 一次业务处理的完整过程

![SW-6](assets/diagrams/SW-6.png)

<details><summary>mermaid 源码（编辑用）</summary>

```mermaid
sequenceDiagram
  participant S as Slinky
  participant API as task-api M001
  participant POL as policy M002
  participant Repo as task-repository M003
  participant Sch as scheduler M004
  participant W as worker M005
  participant PI as pi-adapter M006
  participant Use as usage M007

  S->>API: POST /tasks (task_id, instruction, ...)
  API->>API: JSON/Schema + bearer principal
  API->>POL: validateSubmission
  POL-->>API: ValidatedTaskSubmission
  API->>Repo: BEGIN IMMEDIATE
  Repo->>Repo: SELECT tasks WHERE task_id = ?
  alt Tombstone
    Repo-->>API: 410 Gone
  else active + 字段比较同
    Repo-->>API: 202 + 原 Run
  else active + 不同
    Repo-->>API: 409 TaskConflict
  else 不存在
    Repo->>Repo: check policy/discussion/queue
    Repo->>Repo: INSERT tasks + Queued runs
    Repo-->>API: 202 + 新 Run
  end
  Repo->>Repo: COMMIT
  API-->>S: 202 Accepted

  Note over Sch: scheduler tick
  Sch->>Repo: acquireSlot
  Repo-->>Sch: Lease
  Sch->>W: dispatch Run
  W->>Repo: BEGIN IMMEDIATE update runs state Running and bump generation
  W->>PI: openOrCreateRunSession
  PI-->>W: handle
  W->>PI: accept typedInstruction [+ PikoDiscussionMessage]
  PI->>W: stream events
  PI->>Use: onRawUsage
  Use->>Repo: model_attempts 写入
  PI->>W: operation result
  W->>W: Result 两步提交 (见 §6.2.1)
```

</details>

图 SW-6 · P-BIZ 正常路径。`task-api` 受理 + 202 ack；scheduler 后台领 slot 并交 worker 驱动 Pi；Result 两步提交细节见 §6.2.1。

**正常路径及就绪判据**：J1-J5 完整走完后返回 202；Run 状态由 `tasks`+`runs` 表承担事实；worker 取得 lease 后切 Running 并 accept Pi operation；Result 由 `results` 表 generation 唯一持有事实。

**失败与清理**：J3 tombstone 立即 410 退出事务；J4 字段不同 409 退出事务；J4 字段同直接返回原 Run，不重新检查动态条件（PK-02）；J5 policy/queue/discussion 任一失败 422/429/503 退出事务，不创建 Run；J5 后到 scheduler 的失败由 worker 修复或 abort，不会回到 J4 冒充成功。

#### 6.2.1 Result 两步提交协议（`MECH-RUN` 关键过程）

Pi operation 完成后 worker 进入 Result 两步提交：第一步把 immutable Result generation 写入 `results` 表（原子事务），第二步把 `runs.state` 与 `runs.generation` 写入终态（原子事务）。两步间崩溃时恢复器只补第二步（绝不重跑 Pi）。

![SW-6a](assets/diagrams/SW-6a.png)

<details><summary>mermaid 源码（编辑用）</summary>

```mermaid
sequenceDiagram
  participant W as worker M005
  participant R as task-repository M003
  participant V as ResultValidator M007
  participant U as UsageAggregator M007
  participant FS as SQLite

  Note over W,FS: 第一步：写 immutable Result generation
  W->>R: BEGIN IMMEDIATE (fence new steps)
  W->>R: SELECT pending tool_calls/attempts for run
  W->>U: snapshot(runId)
  U-->>W: UsageSnapshot (6 字段 sum/null + missing_fields)
  W->>V: validateBeforePublish(result, "0.3.0-simplified.6")
  alt FAIL
    V-->>W: SemanticCheck {ok: false, reason: "..."}
    W->>R: ROLLBACK
    W-->>W: throw InternalError("semantic-validator-fail")
    Note over W: 不写 results，不写终态
  end
  V-->>W: SemanticCheck {ok: true}
  W->>R: INSERT results (task_id, generation, result_json, sha256)
  W->>R: COMMIT
  Note over W: Result generation N 已发布；Result 内容不可变

  Note over W,FS: 第二步：写终态 + discussion intake Closed
  W->>R: BEGIN IMMEDIATE (state transition)
  W->>R: UPDATE runs SET state='Completed', generation = generation + 1
  W->>R: release execution_slot
  alt Discussion run
    W->>R: UPDATE runs SET discussion_intake_state='Closed'
    W->>R: UPDATE discussion_turns SET status='Abandoned' WHERE status IN ('Pending','QueuedInPi')
  end
  W->>R: COMMIT
  Note over W: Run 终态发布；Result 对外可查

  Note over W,R: 两步间崩溃的恢复
  alt 进程在第一步 commit 后第二步 commit 前崩溃
    R-->>R: 重启时 R1 检测到 results 有 N 但 runs.state 非终态
    R->>R: 仅补写第二步（同 fencing 验证）
    Note over R: 绝不重跑 Pi
  end
```

</details>

图 SW-6a · `system-design` v0.12.0-draft.1 / Target / NOT_BUILT。两事务分开（不是合并单事务）；第一步 INSERT results 后 Result generation 即冻结；第二步 UPDATE runs.state 与 generation。Discussion run 同事务改 intake `Closed` + 未消费 turn `Abandoned`。

### 6.3 配置生效与模式切换过程

采用**重启生效**策略。理由：本软件为单实例、**控制/执行两进程**的事务层，无水平扩展；接受停止切换换取简单的一致性边界。配置字段由 §5.1 描述，过程由本节串联。

![SW-7](assets/diagrams/SW-7.png)

<details><summary>mermaid 源码（编辑用）</summary>

```mermaid
flowchart TD
  C1["C1 部署者: 校验新参数"] --> Q1{"新参数有效?"}
  Q1 -- 否 --> R0["R0 保留旧服务;不进入停止"]
  Q1 -- 是 --> C2["C2 SIGTERM 旧进程"]
  C2 --> C3{"旧进程退出确认?"}
  C3 -- 否 --> R1["R1 阻塞;不启动新进程"]
  C3 -- 是 --> S1["S1 启动协调模块: 读取并校验启动参数"] --> S2["S2 schema 校验"] --> S3["S3 绑定 tool/recovery"] --> S4["S4 canonicalize paths"] --> S5["S5 open/migrate store"] --> S6["S6 verify Pi upstream + patch manifest"] --> S7["S7 本地就绪"] --> S8["S8 bind 端口;READY"]
```

</details>

图 SW-7 · P-CONFIG 路径。本软件明确选择"部署者先校验新参数 → 关闭旧服务并确认退出 → 以新参数完整执行 P-START"；C0 不允许"参数已提交即生效"。

**正常路径及就绪判据**：C1 校验通过后 C2 停止旧进程；C3 收到旧进程退出确认后启动新进程 S1-S8。新进程 READY 才证明新配置可服务；旧进程在停止前仍使用旧配置；不存在混合版本。

**失败与清理**：C1 无效保留旧服务；C3 旧进程退出未确认阻塞不启动新进程；C0 之后新进程启动失败时整个服务不可用，修复后再启动，不自动回退到旧目录。本图不写"参数已提交即生效"或"自动回滚"等快捷路径。

### 6.4 停止、取消、重启与异常恢复

![SW-8](assets/diagrams/SW-8.png)

<details><summary>mermaid 源码（编辑用）</summary>

```mermaid
flowchart TD
  T1["T1 SIGTERM"] --> F1["F1 停止新受理 (HTTP handler 拒绝 write)"]
  F1 --> F3["F3 fence lease/writer (scheduler.fence)"]
  F3 --> T2["T2 等待有界 drain"]
  T2 --> Q1{"超时?"}
  Q1 -- 否 --> F4["F4 Pi requestAbort + 对账 in-flight tool"]
  F4 --> T3["T3 关闭 store/journal"]
  T3 --> T4["T4 进程退出"]
  Q1 -- 是 --> T5["T5 强制 abort"]
  T5 --> T4

  subgraph REC["崩溃恢复 (下次启动)"]
    R1["R1 SELECT tasks WHERE tombstone"] --> R2["R2 SELECT runs WHERE state NOT IN (终态)"]
    R2 --> R3{"有 open Harness operation?"}
    R3 -- 是 --> R4["R4 drive/getResult, 不重复 accept"]
    R3 -- 否 --> R5["R5 有 operation result?"]
    R5 -- 是 --> R6["R6 封装 Result, 走两步提交"]
    R5 -- 否 --> R7["R7 inspect Pi session 不可恢复 → InternalError"]
  end
```

</details>

图 SW-8 · P-STOP 与恢复路径。`bootstrap` 是统筹者；T4 进程退出确认后部署工具才允许 P-START。

**正常路径及就绪判据**：T1-F1-F3-T2-F4-T3-T4 顺序执行；F4 完成后所有 in-flight tool 已确认状态；T4 进程退出码 0。部署工具拿到退出码后才允许新进程启动。

**失败与清理**：T2 超时触发 T5 强制 abort，T5 完成后 T4 退出（退出码非 0）；部署工具拿到退出码后阻塞，等待人工排查；不自动回退。崩溃恢复 R1-R7 严格按"Result → Run → lease → Pi session → Harness → ledger → Matrix"顺序；已有 Result 绝不重新运行 Pi；不可恢复的 `replay:"never"` 工具产生明确失败 `UnsafeRetryBlocked` / `ExecutionStateUnknown`；不复活旧权威，不模拟成功。**进程侧（关键决定 7）**：**P1 崩溃/卡死由 P0 检出并强杀重启**，恢复由 P0 执行（P1 可丢弃）；**P0 崩溃则整体重启**（P1 一并重启），恢复仍以 P0 库中持久事实为准。

### 6.5 数据面：输入拉取与产出投递

![SW-9](assets/diagrams/SW-9.png)

<details><summary>mermaid 源码（编辑用）</summary>

```mermaid
sequenceDiagram
    participant SL as Slinky
    participant PK as Piko 容器（M001/M005）
    participant SP as Slinky 空间（输入/产出）
    participant LLM as LLMTier
    SL->>PK: POST /tasks（instruction + input_refs + artifact_target）
    PK-->>SL: 202 Queued
    Note over PK: P-INPUT · 输入预备（Queued · 不占 slot）
    PK->>SP: 出站 scp 拉取 input_refs
    SP-->>PK: 输入文件
    PK->>PK: sha256 校验，进入 staging
    Note over PK: 执行（MECH-RUN）
    PK->>LLM: Responses SSE
    Note over PK: P-ARTIFACT · 投递产出
    PK->>SP: 出站 scp 推送 output_paths
    Note over SL: 轮询
    SL->>PK: GET /tasks/{task_id}/result
    PK-->>SL: AgentResult（JSON · outputs 为引用）
```

</details>

图 SW-9 · `system-design` v0.11.4 / Target / Proposed。**文件不经过 HTTP**：任务只传路径/引用；Piko 容器经**出站 scp** 拉取输入、推送产出；执行结果 JSON 由 Slinky **轮询**取得。

**输入预备（P-INPUT，执行前 · **不占 execution slot** · M010 `transfer`）**：发生在 Run 仍 `Queued` 时，由 `worker` M005 的 staging 循环**串行（并发=1）**执行，**不持 lease**。I1 解析 `input_refs` → I2 经 M010 **出站 scp** 从 Slinky 空间拉到本地 staging → I3 按 `sha256` 校验 → I4 置 `input_staging=ready`，该 Run 才进入 slot 竞争。**失败**：拉取或校验失败即**执行前提失败**（不进入执行）→ **零调用 `Failed`**：`state=Failed`、`outputs=[]`、`known_actions=[]`、`stats` 全 0、`usage` 全 `null`（`quality=Unknown`）、`failure={code:"InputFetchFailed", cause_class:"Dependency"}`；**从不领取 slot**；清理 staging。重试必须**换新 `task_id`**（同 `task_id` 返回原 Failed，PK-02）。**cancel**：预备中收到取消 → M010 中断 in-flight `scp`（可中断）+ 清 staging → 零调用 `Cancelled`。

**产出投递（P-ARTIFACT，终态后 · 不阻塞终态）**：A1 收集 `output_paths` → A2 计算 `sha256` / size → A3 经 M010 **出站 scp** 推到 `artifact_target`（Slinky 预建）→ A4 记录 `artifact_delivery`（写 **Run 侧可变字段**，非 Result）。**失败**：A3 失败时**执行终态不变**，另置 `artifact_delivery=failed`（`partial` 时逐项在 `failed[]`）；**Result 与 `failure` 均不因此改变**；有界重试；按 `(task_id, generation, path, sha256)` **幂等**。

**顺序与前提（与终态解耦 · 与 slot 解耦）**：受理 → **Queued 阶段拉输入**（不占 slot）→ `ready` 后竞争 execution slot → 执行 → **发布执行终态** → 之后**尽力投递产出**。终态是**执行事实**，**不等待投递完成**；投递结果经 `TaskView.artifact_delivery` 暴露，输入预备经 `TaskView.input_staging` 暴露，**Slinky 读取产出字节前必须确认 `artifact_delivery.state=delivered`**（`partial` 时按 `delivered[]`）。凭据经 **secret 挂载**（不进载荷 / 日志）；容器需**出站**可达 Slinky 存储主机且落在**目标白名单**内；方法**可选**（`scp` 本期 / 卷挂载 / 对象存储）。搬运**可中断**（cancel/停止时 `abort` in-flight `scp`）。文件搬运**不属于** MECH-RUN 执行步骤，归 `transfer` M010 + `MECH-TRANSFER`（§3.5）；契约字段 `input_refs` / `artifact_target` / `artifact_delivery` / `input_staging`。

## 7. 数据结构设计

系统级不重复维护数据结构；本节把职责交给各机制文档与各模块 ISD §4，但保留关键边界与字段引用。

### 7.1 公共基础类型与枚举

#### 7.1.1 `TaskState`

- **完整定义、Data/Type/Error ID 与唯一来源**：`TaskState = "Queued" | "Running" | "Cancelling" | "Completed" | "Failed" | "Cancelled"`。固定来源 `system-design` §3 + `piko-agent-runtime-contract-v0.3` §4 + `piko-task-repository-impl.isd.md` §4.1.1（M003 module ISD）。
- **逐字段/逐值类型、范围、含义与跨字段约束**：每值代表 Run 的当前事务层阶段；与 `cancel_requested`、`discussion_intake_state` 跨字段约束见 M003 ISD §4.2 `RunRecord`。
- **生产/修改、所有权、可见点、寿命及失败出口**：唯一写入者 M003 `task-repository`；可见点为 `runs.state` 字段；寿命 = Run 寿命；不允许从 `Completed`/`Failed`/`Cancelled` 回退。
- **合法与拒绝实例、V/Case 与证据状态**：合法转移：`Queued→Running|Cancelled`、`Running→Cancelling|Completed|Failed`、`Cancelling→Cancelled|Failed`。非法转移返回内部 `FencedWrite`，不影响 HTTP。Case：M003/M005 ISD §9.1。

#### 7.1.2 `DiscussionIntakeState`

- **完整定义、Data/Type/Error ID 与唯一来源**：`DiscussionIntakeState = "Disabled" | "Open" | "Closing" | "Closed"`。来源 `MECH-MATRIX` + M003/M008 ISD §4.1.2。
- **逐字段/逐值类型、范围、含义与跨字段约束**：仅 discussion Run 使用；非 discussion Run 固定 `Disabled`；discussion Run 单向 `Open → Closing → Closed`。
- **生产/修改、所有权、可见点、寿命及失败出口**：M003 写入；可见点 `runs.discussion_intake_state`。
- **合法与拒绝实例、V/Case 与证据状态**：仅 Open 可接收 `DiscussionTurn`，仅 Closing 可发 Completed Result。Case：M005/M008 ISD §9.1。

### 7.2 业务与操作数据结构

**N/A · 由各模块 ISD 承担**：本系统设计不重复定义 `TaskRecord` / `RunRecord` / `AgentResult` / `UsageSnapshot` / `ModelAttempt` / `ToolCall` / `DiscussionTurn` / `MatrixSendRecord` / `PikoDiscussionMessage` 等结构；详见 M003（`TaskRecord` / `RunRecord` / `RunSessionRecord` / `ExecutionSlot` / `ModelAttempt` / `ToolCall` / `DiscussionTurn` / `MatrixSendRecord`）、M006（`PikoDiscussionMessage`）、M007（`UsageSnapshot`）等模块 ISD §4。Tailoring 依据：模板 §7.2 适用条件为"业务操作实际交换和保存的对象"；系统层仅承担 §3.4 约束分配，不重定义数据。

### 7.3 配置与规则数据结构

**N/A · 见 §9 与各模块 ISD §4.3**：`PikoRuntimeConfig` / `ToolProfile` 的字段定义见 M002 ISD §4.3 + M000 ISD §8.1；本系统设计不重复维护配置字段。§9.1 负责生效政策。

### 7.4 通信报文结构

**N/A · 见 §7 与契约 `0.3.0-simplified.6`**：`TaskSubmitRequest` / `TaskView` / `AgentResult` / `TaskStats` / `InputRef` / `ArtifactTarget` / `ArtifactDelivery` / `UsageSnapshot` / `PikoDiscussionMessage` 的字段定义见 `piko-agent-runtime-contract-v0.3` + `interfaces/openapi/agent-runtime-openapi-v0.3.yaml` + `interfaces/schemas/agent-runtime-v0.3.schema.json`；数据面字段（`input_refs` / `artifact_target` / `agent_result` 外的 `artifact_delivery`）与执行统计（`stats`）同源维护。本系统层不维护第二套字段定义。

### 7.5 设备与 FPGA 表项结构

**N/A · 纯软件范围**：本系统无设备/FPGA/RTL 表项。Tailoring 依据：模板 §7.5 适用条件为"实际拥有设备或 RTL 表项"。

### 7.6 运行状态数据结构

**N/A · 见各模块 ISD §4.6**：`Lease` / `FencedWrite` 定义见 M003 ISD §4.6；`PiRunObservation` 见 M006 ISD §4.6。本系统层不重定义运行态。

### 7.7 数据库表结构

<a id="m003-ddl-authority"></a>
**N/A · 见 M003 ISD §4.7**：`tasks` / `runs` / `run_sessions` / `execution_slot` / `results` / `model_attempts` / `tool_calls` / `matrix_state` / `matrix_events` / `discussion_turns` / `matrix_sends` / `audit_events` / `instance_meta` DDL 见 M003 ISD §4.7.1（`PRAGMA user_version=2` 为当前基线）；本系统层不重复 DDL。

### 7.8 错误码与错误结构

公共错误码逐码定义在 `interfaces/error-codes/agent-runtime-v0.3.yaml` + `piko-agent-runtime-contract-v0.3` §4；机器契约 `0.3.0-simplified.6` 绑定。系统层仅消费与映射：

| Error ID | 接口成员 ID | 模块/机制及使用方式 | 设计 V / Case |
|---|---|---|---|
| `Unauthorized` | CAP-SUBMIT/STATUS/CANCEL/RESULT | M001/M002 bearer principal 校验失败，HTTP 401；不暴露详细原因 | contract §6 |
| `TaskConflict` | CAP-SUBMIT | M003 同 ID 不同内容，HTTP 409；保留原任务 | contract §6 |
| `Gone` | CAP-SUBMIT/STATUS/CANCEL/RESULT | M003 tombstone，HTTP 410 | contract §6 |
| `InvalidDiscussionContext` | CAP-SUBMIT | M008 discussion 房间/事件冲突，HTTP 409 | contract §6 |
| `QueueFull` | CAP-SUBMIT | M003/M004 队列满且未创建 Run，HTTP 429 | contract §6 |
| `TaskNotTerminal` | CAP-RESULT | M003 非终态查询结果，HTTP 409 | contract §6 |
| `ResultUnavailable` | CAP-RESULT | M003/M005 终态丢失 durable Result，HTTP 500 | contract §6 |
| `CancelledBeforeStart` | CAP-CANCEL | M003/M005 Queued 取消，HTTP 200 | contract §6 |
| `StopRequested` | CAP-CANCEL | M005 Running 取消意图落盘，HTTP 202 | contract §6 |
| `AlreadyTerminal` | CAP-CANCEL | M003/M005 已终态，HTTP 200 | contract §6 |
| `InputFetchFailed` | Result `failure.code` | M010/M005 输入拉取或 `sha256` 校验失败（执行前提失败，零调用 Failed） | PK-21 / contract §6 |
| `ModelUnavailable` | Result `failure.code` | M006 配置模型不存在/LLMTier/TLS/auth/网络不可达 | contract §6 |
| `ModelResponseInvalid` | Result `failure.code` | M006 SSE/protocol/terminal event 非法 | contract §6 |
| `ToolFailure` | Result `failure.code` | M006 工具返回明确 error 且无更具体终止 | contract §6 |
| `UnsafeRetryBlocked` | Result `failure.code` | M006 `replay:"never"` 工具无 outcome | contract §6 |
| `ExecutionStateUnknown` | Result `failure.code` | M005/M006 Harness storage/invariant 无法证明最后执行状态 | contract §6 |
| `DiscussionAccessLost` | Result `failure.code` | M008 Matrix membership/event/media authority 丢失 | contract §6 |
| `CancelledByRequest` | Result `failure.code` | M005 已确认取消且 Harness operation 已停止 | contract §6 |
| `InternalError` | Result `failure.code` | M005/M003/M007 Piko 内部错误且执行状态仍可证明 | contract §6 |

### 7.9 业务数据流与形态变换

业务对象在 §6.2 P-BIZ 图中标识：`TaskSubmitRequest` → `ValidatedTaskSubmission` → `tasks.task_json` + `runs` → `run_sessions.pi_session_id` → Pi session JSONL → `operation result` → `AgentResult`。数据面另有 `input_refs` → staging（`transfer` M010）与终态后 `output_paths` → `artifact_delivery`。所有跨边界交接保留稳定身份；转换不丢信息（`usage.raw_usage_json` 保留字段存在性）；副本/峰值见 §11。

### 7.10 一致性与持久化策略

- Authoritative：`tasks`/`runs`/`results`/`run_sessions`/`model_attempts`/`tool_calls`/`discussion_turns`/`matrix_sends`。
- Observation：HTTP 客户端收到的状态码与 body 是结果观察，不是状态判定。
- Volatile：内存 lease / Pi session 句柄 / worker queue。
- Durable：所有上述 authoritative 字段在 commit 后 fsync WAL 才返回 HTTP。
- 跨对象事务：提交事务 + Run 事务 + Result 两步事务分别独立；不同事务间用 fenced write 串行化（详见 §3.4 PK-01/07/12）。
- 丢失窗口：进程崩溃可能在 worker 写 `results` 之前发生；恢复器只补第二步（见 §6.4）。

### 7.11 缓存、保留、清理与数据迁移

- 缓存：内存 lease；usage snapshot 缓存；Matrix sync cursor 缓存。失效：lease fence / Result 发布 / sync 推进。
- 持久数据保留：`accepted_at + storage.retention_days`（默认 7d）；之后可清理大对象，永久保留最小 `{task_id, Gone}` tombstone。详见 contract §3.6。
- 删除权限：worker / Result publisher；不允许 HTTP handler 删除任务。
- 临时产物寿命：Media 下载存 staging 目录，校验后移动到允许路径，失败/取消按 retention policy 清理。
- 数据迁移：`PRAGMA user_version` 单调整数；v1→v2 增加 `Abandoned` discussion turn 状态；失败保持旧库可读，worker 不启动。

## 8. 接口设计

Piko 不重写 OpenAPI / Schema / error catalog；接口契约由 `interfaces/openapi/agent-runtime-openapi-v0.3.yaml` + `interfaces/schemas/agent-runtime-v0.3.schema.json` + `interfaces/error-codes/agent-runtime-v0.3.yaml` 机器权威定义。本节给出阅读视图。

### 8.1 API

#### `POST /tasks` · `TaskSubmitRequest` → `TaskView` | `<Error>`

- **Interface/Member ID、用途、提供责任与唯一来源**：`createTask`（OpenAPI operationId）；`piko-agent-runtime-contract-v0.3` §1-§2；唯一来源 `interfaces/openapi/agent-runtime-openapi-v0.3.yaml` `paths./tasks.post`。
- **输入与前提**：`TaskSubmitRequest` 字段：`task_id`（Slinky 全局唯一，必填）、`instruction`（不可变任务定义，必填）、`workspace_ref`（**Slinky 侧工作区标识**，审计/映射用，必填）、`permissions`（`{read_paths, write_paths, tool_profile_ref}`，必填）、`output_paths`（RelPath 集合，必填）、`input_refs?`（`[{source, dest?, sha256?}]`）、`artifact_target?`（`{method: scp|mount|object_store, target, secret_ref?}`）、`discussion?`（`{room_id, trigger_event_id}`）。**路径基准**：`input_refs[].dest` / `permissions.read_paths` / `write_paths` / `output_paths` **统一相对任务 staging 根** `<workspace_root>/<task_id>/`。模型字段由实例配置，非 selector；**本版无 deadline / 预算字段**。bearer principal 已配置。
- **幂等语义**：重复同 `task_id` 的比较基于**任务定义字段**（含声明的 `input_refs` 与给定 `sha256`）；**要内容级幂等，Slinky 必须给 `sha256` 或换新 `task_id`**（外部可变引用不经 HTTP，Piko 不重取比对）。
- **成功输出与保证**：202 + `TaskView`（首次受理 `state=Queued`；重复同 ID 同内容返回当前视图）/ 410 `Gone` / 409 `TaskConflict`。返回 202 即代表已持久化任务定义并创建 Run；不证明执行开始。**受理不做同步外部调用**：discussion 事实若已被 P1 sync 缓存则据此判定，否则**先接受、核实异步**（失败 → 零调用 `Failed(DiscussionAccessLost)`）；输入拉取同理异步（§6.5）。
- **错误与合法下一步**：422（Schema）/ 401（Unauthorized）/ 409（`TaskConflict`）/ 410（`Gone`）/ 429（`QueueFull`）/ 503（dependency not ready）。
- **交互与生命周期**：同步返回；Run 状态由后续 `GET /tasks/{task_id}` 查询；同 ID 同内容重发不创建新 Run。受理后异步做输入拉取（P-INPUT，§6.5），失败 → 零调用 `Failed(InputFetchFailed)`。
- **实现与验证**：M001 `task-api` + M002 `policy` + M003 `task-repository`；Case PK-T03/PK-T15。

#### `GET /tasks/{task_id}` · `TaskView` | `<Error>`

- **Interface/Member ID、用途、提供责任与唯一来源**：`getTask`（OpenAPI operationId）；`piko-agent-runtime-contract-v0.3` §1；唯一来源 `interfaces/openapi/agent-runtime-openapi-v0.3.yaml` `paths./tasks/{task_id}.get`。
- **输入与前提**：`task_id` 路径参数；bearer principal 一致。
- **成功输出与保证**：`TaskView { task_id, state, generation, accepted_at, started_at?, finished_at?, result_available, cancel_requested, discussion_intake_state, input_staging, progress, artifact_delivery }`。`input_staging` 为输入预备状态（`none|pending|in_progress|ready|failed`，**不占 execution slot**）；`progress` 含 `model_calls`/`tool_calls`/`last_activity_at`/`elapsed_ms`/`usage_so_far`/`recent_actions`/`current_action`；`artifact_delivery` 为 **Run 侧可变**后处理状态（`none|pending|in_progress|delivered|partial|failed`）。无副作用。
- **错误与合法下一步**：401（Unauthorized）/ 404（NotFound）/ 410（`Gone`）。
- **交互与生命周期**：只读；与 cancel/result 共享同一 `task-repository` 视图；**读产出字节前确认 `artifact_delivery.state=delivered`**。
- **实现与验证**：M001 `task-api` + M003 `task-repository`；Case PK-T03。

#### `POST /tasks/{task_id}:cancel` · `CancelOutcome` | `<Error>`

- **Interface/Member ID、用途、提供责任与唯一来源**：`cancelTask`（OpenAPI operationId）；`piko-agent-runtime-contract-v0.3` §1；唯一来源同 §8.1。
- **输入与前提**：`task_id` 路径参数；bearer principal 一致。
- **成功输出与保证**：200 `CancelledBeforeStart`（Queued，零调用 Result 已发）/ 200 `AlreadyTerminal`（已终态）/ 202 `StopRequested`（Running，意图落盘不证明执行停止）。
- **错误与合法下一步**：401/404/410。
- **交互与生命周期**：与 `POST /tasks` 同源；不持有 lease 的 Queued 取消走单事务路径。
- **实现与验证**：M001 `task-api` + M005 `worker` + M003 `task-repository`；Case PK-T05。

#### `GET /tasks/{task_id}/result` · `AgentResult` | `<Error>`

- **Interface/Member ID、用途、提供责任与唯一来源**：`getTaskResult`（OpenAPI operationId）；`piko-agent-runtime-contract-v0.3` §3；唯一来源同 §8.1。
- **输入与前提**：`task_id` 路径参数；bearer principal 一致。
- **成功输出与保证**：`AgentResult`（见 §7.4 + contract §3）：`state + partial + summary + outputs + stats + known_actions + usage + failure`；Result generation 内容冻结。**不含投递状态**（投递见 `TaskView.artifact_delivery`）。
- **错误与合法下一步**：409 `TaskNotTerminal` / 401 / 404 / 410 / 500 `ResultUnavailable`。
- **交互与生命周期**：与 `getTask` 共享 read path；迟到 usage 不修改 generation。
- **实现与验证**：M001 `task-api` + M003 `task-repository`；Case PK-T16。

#### Operator Diagnostics · `DiagnosticSnapshot` | `<Error>`

- **Interface/Member ID、用途、提供责任与唯一来源**：仅 operator authorization；定义见 `piko-runtime-release-and-operations-v0.3`。
- **输入与前提**：operator 已配置；目标为唯一 Piko 实例。
- **成功输出与保证**：诊断 snapshot（redacted log tail / state counts / queue depth / Harness operation generation / ledger summary）。
- **错误与合法下一步**：401/403；未知实例返回拒绝，不改选其他实例。
- **交互与生命周期**：只读；受控不写。
- **实现与验证**：由 ops 文档与本设计 §3.6.1 shutdown 协议约束；Case PK-T12。

### 8.2 消息与数据流接口

本节固定 Piko 的**对外协作接口**（Pi / LLMTier / Matrix / Slinky 存储主机 / Secret provider）与**内部 P0↔P1 进程接口**。面向调用方（Slinky / operator）的 HTTP API 留在 §8.1。

> **进程归属（§3.3 关键决定 7）**：下列**外部协作接口全部在 P1**（会阻塞的外部 IO），P0 绝不直接调用；P0↔P1 用本地 IPC。

#### P0 ↔ P1 进程接口（本地 IPC，一等公民）

- **用途与提供责任**：P0（控制）↔ P1（执行）的生命周期监督 + 事实/指令交换。M000 `bootstrap`（监督者）+ M005 `worker`（执行侧）。
- **指令（P0→P1）**：`Dispatch{task_id, generation, lease_epoch, instruction, workspace, permissions, input_refs, artifact_target}`、`Abort{task_id, reason}`、`FetchInputs{...}`、`DeliverArtifacts{...}`。
- **事实（P1→P0，幂等，带 `(task_id,generation,lease_epoch)`）**：`Facts`（operation/tip/raw_usage/tool intent/membership/sync cursor）、`Staging{state,items}`、`ResultCandidate{result}`、`Delivery{state,items}`、`Heartbeat{alive,current_run,epoch}`。
- **交互、错误与生命周期**：P1 **不直接写 SQLite**；P0 校验后单事务落库；**P1 崩溃/失联 → P0 强杀并重启**（P1 可丢弃，权威在 P0）；`Abort` 有界等待，超时强杀。
- **实现与验证**：M000/M005；Case PK-T43/PK-T44。

#### Pi（vendored 源码）`AgentHarness.lane.accept` / `.drive` / `.requestAbort` / `.getResult` / `.watch`

- **Interface/Member ID、用途、提供责任与来源**：Pi **`0.85.1` @ commit `9767ba275f3e9a5ee0f5c5342249b629ab1b2282`**，以 **vendored 源码**置于 `upstream/pi/`，Piko 按其**内部模块路径**（`packages/agent/src/harness/...`、`packages/ai/src/...`）import——**不是稳定 SDK / 公共 API**。运行于 **P1**。
- **输入输出与关联身份**：输入 `typedInstruction` + 可选 `PikoDiscussionMessage`；输出 `PiOperationOutcome stream`；关联身份 `task_id` / `pi_operation_id` / `stepId`。
- **交互、错误与生命周期**：`stream:true, store:false, maxRetries:0`；Harness retry policy 形成新 attempt；ordered stream events；`requestAbort` 中途可中断（**外部能力假设，须在上游能力验证中确认**）；崩溃后按确定性 session id inspect/getResult，不重发。
- **实现与验证**：M006 `pi-adapter`（P1）；Case PK-T09/PK-T10 + LLMTier 联调。**风险**：上游内部结构变更即破坏兼容（pin 必需；升级 = 设计变更）。

#### Matrix `client-server` send/receive/sync

- **Interface/Member ID、用途、提供责任与来源**：`matrix-js-sdk` Client-Server API；M008 `matrix-adapter` 封装。运行于 **P1**（E2EE CPU 重 + `sync` 长轮询，**不得进 P0 应答路径**）。
- **输入输出与关联身份**：sync cursor；`event_id` 关联；`MatrixSendRecord.txn_id` 确定性派生；E2EE crypto store 持久在容器卷。
- **交互、错误与生命周期**：P1 拉取/发送，把 event dedup / `DiscussionTurn` / 新 cursor 作为**事实上报 P0** 落库（P1 不写库）；cursor 未确认前不推进；**投喂运行中 Run 的 turn 在 P1 内部完成**（`followUp`/新 accept）；membership/event/media 复核失败 → `DiscussionAccessLost`。
- **实现与验证**：M008（P1）；Case PK-T08。

#### OpenAI-compatible Responses SSE

- **Interface/Member ID、用途、提供责任与来源**：LLMTier OpenAI-compatible `/v1/responses` endpoint；Pi `openai-responses` provider。运行于 **P1**。
- **输入输出与关联身份**：固定 Pi 实际使用的事件子集（`response.created`/`output_item.added`/`output_text.delta`/`function_call_arguments.delta|done`/`output_item.done`/`completed|incomplete`/`failed`/顶层 `error`；reasoning/refusal 标准事件如有也原样支持）。
- **交互、错误与生命周期**：`stream:true, store:false, maxRetries:0`；三次 prompt-cache 字段缺席；非 SSE 整体由 Harness 形成 recoverable operation，不切非流式。**外部能力假设，须联调确认。**
- **实现与验证**：M006 `pi-adapter`（P1）；Case PK-T09/PK-T10 + LLMTier 联调。

#### 数据面搬运（`scp` / `mount` / `object_store`）

- **Interface/Member ID、用途、提供责任与来源**：Piko **容器出站** `scp`（本期）从/向 **Slinky 存储主机**搬运；M010 `transfer` 封装。运行于 **P1**。
- **输入输出与关联身份**：输入 `input_refs`（`source`/`dest`/`sha256`）；输出 `output_paths` → `<artifact_target.target>/<path>`；凭据来自 `transfer.credential_ref`；出站目标受 `transfer.target_allowlist` 限制，主机密钥由 `known_hosts` 固定。
- **交互、错误与生命周期**：**可中断**（cancel/停止时 abort in-flight `scp`）；有界重试；投递幂等 `(task_id,generation,path,sha256)`；输入拉取失败 = 前提失败。
- **实现与验证**：M010（P1）；Case PK-T41/PK-T42。

#### Secret provider

- **Interface/Member ID、用途、提供责任与来源**：按 `credential_ref` 解析 secret（bearer / LLMTier key / Matrix token / `scp` 私钥）。**接口形态由部署环境提供**（文件挂载 / env / KMS 之一，由 ops 明确）；Piko 只持引用。
- **交互、错误与生命周期**：启动时解析；**明文不进 config/DB/Result/log**；轮换 = 改挂载 + 重启。
- **实现与验证**：M000 `bootstrap` + M002 `policy`；Case PK-T12。

#### Slinky 存储主机（数据面外部对象）

- **Interface/Member ID、用途、提供责任与来源**：输入来源 + 产出目标宿主（`scp` 对端）。**外部对象**，其可达性与目录预建由 Slinky 负责。
- **交互、错误与生命周期**：出站可达 + `known_hosts` 固定；不可达 → 输入前提失败 / 投递 `failed`。
- **实现与验证**：M010；与 §2.1.2 环境图一致。

### 8.3 硬件与固件接口

**N/A · 纯软件范围**：本软件无硬件/FPGA/固件边界。Tailoring 依据：模板 §8.3 适用条件为"实际承担设备/FPGA/固件边界"。

### 8.4 人机与维护接口

操作员诊断入口见 §8.1 `Operator Diagnostics`。CLI 暂无；Slinky 通过 HTTP API 接入。Operator authorization 通过 ops 文档定义。

## 9. 配置与环境管理设计

Piko 配置由 `interfaces/schemas/piko-runtime-config-v0.3.schema.json` + `interfaces/schemas/piko-tool-profile-v0.3.schema.json` 机器权威定义；本节定义生效政策。

### 9.1 配置来源、校验与生效范围

| Config/Member ID | 来源 / 优先级 / 权限 | 校验 / 默认 / 冲突 | 作用域 / 生效点 | 在途任务 / 回退 / 确认 |
|---|---|---|---|---|
| `api_auth.slinky_principal.credential_ref` | Secret provider / 1 / operator | bootstrap 启动时解析；credential 明文拒绝 | 整个进程；READY 后生效 | 不影响在途 Run；旧 secret 仍生效；operator 显式轮换 |
| `workspace_root` | config 文件 / 2 / operator | schema 校验 + `canonicalizePath`；绝对路径/反斜线/`..` 拒绝 | 所有任务共享；READY 后生效 | 不影响在途 Run；新任务用新路径 |
| `storage.sqlite_path` | config 文件 / 2 / operator | 路径可达 + 独占 instance lock | 进程寿命 | 不迁移；仅首次启动使用 |
| `storage.max_queue_depth` | config 文件 / 3 / operator | schema 校验；0 拒绝 | 新 Run 受理 | 在途 Run 不回退 |
| `storage.retention_days` | config 文件 / 3 / operator | schema 校验；默认 7d | 清理逻辑 | 在途 Run 不回退 |
| `pi.upstream_commit` | 锁定 + 构建 / 1 / operator | bootstrap verify fingerprint 哈希 | 全局；启动时校验 | 启动失败 = 不接受 Run |
| `pi.adapter_patches.before_request_stepid` | 锁定 + 构建 / 1 | 启动时校验；与 manifest hash 一致 | 全局 | 同上 |
| `pi.adapter_patches.on_raw_usage` | 锁定 + 构建 / 1 | 启动时校验 | 全局 | 同上 |
| `llmtier.base_url` | config 文件 / 2 / operator | schema 校验 + preflight `GET /v1/models` | 全局；READY 后生效 | 不影响在途 Run |
| `llmtier.credential_ref` | Secret provider / 1 / operator | bootstrap 解析；credential 明文拒绝 | 全局 | 在途 Run 不回退；operator 显式轮换 |
| `llmtier.model` | config 文件 / 2 / operator | schema 校验；preflight 校验模型可达 | 全局 | 在途 Run 不回退 |
| `llmtier.cacheRetention` | 固定 `none` / 1 | 不接受外部覆盖 | 全局 | 启动失败 = 不接受 Run |
| `llmtier.supportsExplicitPromptCacheMode` | 固定 `false` / 1 | 不接受外部覆盖 | 全局 | 同上 |
| `llmtier.streamOptions.maxRetries` | 固定 `0` / 1 | 不接受外部覆盖 | 全局 | 同上 |
| `matrix.homeserver` | config 文件 / 2 / operator | preflight whoami | 全局 | 在途 Run 不回退 |
| `matrix.credential_ref` | Secret provider / 1 / operator | bootstrap 解析 | 全局 | 在途 Run 不回退 |
| `matrix.identity_localpart` | config 文件 / 2 / operator | 与 whoami 一致 | 全局 | 在途 Run 不回退 |
| `transfer.method` | config 文件 / 2 / operator | `scp`\|`mount`\|`object_store`；本期默认 `scp` | 全局；新任务生效 | 在途任务按其 `artifact_target.method` |
| `transfer.credential_ref` | Secret provider / 1 / operator | bootstrap 解析；凭据明文拒绝（scp 私钥经 secret 挂载） | 全局 | 不影响在途 Run；operator 显式轮换 |
| `transfer.target_allowlist` | config 文件 / 1 / operator | 出站目标主机白名单（`user@host`/URI 前缀）；不在白名单拒绝 | 全局 | 启动失败 = 不接受 Run |
| `transfer.known_hosts` | config 文件 / 1 / operator | scp 主机公钥固定；不匹配拒绝 | 全局 | 启动失败 = 不接受 Run |
| `transfer.max_input_bytes` | config 文件 / 3 / operator | 单文件 `input_refs` 大小上限；超限拒绝 | 搬运阶段 | 超限 → 前提失败 `InputFetchFailed` |
| `transfer.retry` | config 文件 / 3 / operator | 有界重试次数 / 退避；0 表示不重试 | 搬运阶段 | 用尽 → 输入前提失败 / 投递 `failed` |

生效方式：**重启生效**（§6.3）。无在线修改配置能力；operator 修改 config + SIGTERM 触发 P-STOP → P-START。多个 config 来源在 bootstrap 阶段合并为唯一生效结果，不默默忽略未知字段。

## 10. 可靠性、维护与升级

### 10.1 故障模型与恢复保证

| 故障 | 影响范围 | 检测依据 | 处置 |
|---|---|---|---|
| Pi upstream commit 不匹配 | 全局不接受 Run | bootstrap S6 fingerprint 不匹配 | F1 关闭进程；operator 重新安装正确版本 |
| LLMTier 不可达 | preflight S7 失败；运行中由 Harness 形成 recoverable operation | preflight 探测 + Harness retry policy | 启动失败 = 不 READY；运行中重试至 Harness 策略或不可达终止 |
| Matrix 不可达 | preflight S7 失败；运行中 `MatrixAdapter` 抛错 | preflight whoami + sync error | 启动失败 = 不 READY；运行中讨论 intake CAS 不前进 |
| Store 不可写 | S5 失败；运行中 SQLITE_BUSY/SQLITE_FULL | SQLite 错误码 | 启动失败 = 不 READY；运行中返回 503/500 `ResultUnavailable` |
| 进程崩溃 | Run 中途未完成 | 部署工具检测退出码非 0 | 启动 P-START；R1-R7 恢复顺序（见 §6.4） |
| P1 执行进程崩溃 / OOM / 原生崩溃 | 当前 Run 中断；**P0 与 HTTP 存活** | P0 心跳 + 子进程退出检测 | P0 强杀/拉起 P1；按持久事实恢复；**轮询与取消不受影响** |
| P1 事件循环卡死（工具/CPU 阻塞） | 当前 Run 停滞；**HTTP、查询、取消仍正常** | P0 心跳超时 | P0 判 P1 失联 → 强杀重启；取消由 P0 独立完成（不依赖 P1 健康） |
| Harness fault / invariant 损坏 | Operation result 不可信 | Harness fault event | worker 映射为 `UnsafeRetryBlocked` / `ExecutionStateUnknown` |
| `replay:"never"` 工具无 outcome | 工具结果未知 | tool intent record 无 outcome 记录 | worker 映射为 `UnsafeRetryBlocked`；不复活旧权威 |
| 取消 + Harness 已停 | 终态 Cancelled | `runs.state='Cancelled'` 与 Harness operation result 一致 | 返回 `CancelledByRequest` |
| 输入拉取失败 / `sha256` 不符 | 执行前提失败（不进入执行） | M010 拉取 / 校验错误 | 零调用 `Failed`（`failure.code=InputFetchFailed`）；换新 `task_id` 重试；清理 staging |
| 产出投递失败 | **执行终态不变** | M010 出站 scp 错误 | `TaskView.artifact_delivery=failed`/`partial`（逐项 `failed[]`）；有界重试、幂等；Result / `failure` 不变 |

副本/HA：**N/A · 单实例**；本软件不实现多副本，由 Slinky 端组织多实例。Tailoring 依据：模板 §6.1 适用条件为"采用副本/HA 必须解释能覆盖和不能覆盖的故障"。

### 10.2 统计、日志与故障定位

| 指标/事件 ID | 单位 / 窗口 / 分母 | 对象与版本关联 | 生成 / 聚合 / 重置 | 查询 / 留存 / 脱敏 | 故障判断与验证 |
|---|---|---|---|---|---|
| `piko.queue.depth` | count / 当前 | 全实例 | scheduler tick + 内存计数 | 诊断端点 + metric；脱敏 | 调度阈值告警 |
| `piko.run.state.duration.{state}` | ms / 区间 | per task_id | `runs.started_at`/`finished_at` | metric；脱敏 | 性能回归 |
| `piko.slot.lease_epoch` | count | 单实例 | scheduler 写入 `execution_slot.lease_epoch` | 诊断端点；脱敏 | 恢复顺序判定 |
| `piko.harness.operation.generation` | count | per task_id | `run_sessions.active_operation_id` 推进 | 诊断端点；脱敏 | 进度 |
| `piko.model.attempts.{state}` | count | per task_id | `model_attempts` 表 | 诊断端点 + metric；脱敏 | 用量与重试 |
| `piko.tool.attempts.{state}` | count | per task_id | `tool_calls` 表 | 同上 | 工具预算 |
| `piko.usage.quality.{Complete,Partial,Unknown}` | ratio | per task_id | `UsageSnapshot.quality` | metric；脱敏 | 模型端完整性 |
| `piko.matrix.sync.lag` | s / 当前 | 全实例 | `matrix_state.sync_cursor` 与 last observed | metric；脱敏 | 集成健康 |
| `piko.dependency.failures.{llmtier,matrix,store}` | count / 区间 | 全实例 | preflight + 错误事件 | metric；脱敏 | 集成健康 |
| `piko.recovery.outcomes.{resume,fenced,internal_error}` | count / 区间 | 全实例 | worker R 路径 | metric；脱敏 | 恢复策略效果 |
| `piko.transfer.bytes.{in,out}` | bytes / 区间 | per task_id | M010 搬运计数 | metric；脱敏 | 搬运量 |
| `piko.transfer.outcomes.{fetched,delivered,partial,failed}` | count / 区间 | per task_id | `artifact_delivery` + 拉取结果 | metric；脱敏 | 数据面健康 |

结构化日志事件：`event.run.{created,started,terminated}` / `event.tool.{reserved,started,terminal,unknown}` / `event.model.{attempt,usage,retry}` / `event.matrix.{sync,send,turn}` / `event.transfer.{fetch,deliver,retry}` / `event.recovery.{resume,fenced,internal_error}` / `event.audit.credential-ref-changed` / `event.audit.run-state-changed` / `event.audit.forced-fence` / `event.audit.schema-migration` / `event.audit.responses-probe`。每条必含 `event_name`、`instance_id`、`task_id?`、`generation`、`epoch?`、`redacted_error_class?`；禁止 instruction 正文、credential、access token、完整模型 input/output、附件内容。日志留存由 ops 配置，不在本设计声明。

### 10.3 自检与诊断设计

自检项目由故障模型反推：
1. **config schema 校验**：S2 校验 `piko-runtime-config-v0.3.schema.json` + `piko-tool-profile-v0.3.schema.json`；失败 → F1。
2. **tool/recovery registry 完整性**：S3 验证每个 `recovery_contract_ref` 解析到已注册实现；`implementation_ref` 与 tool name/effect/AgentTool.replay 一致；不一致 → F1。
3. **store writable**：S5 打开 SQLite、写 instance meta、commit、read 验证。
4. **vendored Pi manifest**：S6 **本地**校验 vendored revision 与 manifest 哈希逐位匹配（无外部 IO）。
5. **LLMTier `GET /v1/models`**：**P1** 启动探测；200 + 列表含配置 `model`，作为「执行可用」事实上报 P0。
6. **Matrix `whoami`**：**P1** 启动探测；200 + 与 `identity_localpart` 一致，上报 P0。
7. **dependency failures 计数**：运行中累积 `piko.dependency.failures.*` 指标；阈值越界 → 告警（阈值在 ops 配置）。
8. **transfer 边界**：S7 校验 `transfer.target_allowlist` + `known_hosts` 可解析、`transfer.credential_ref` 已解析；输入/产出搬运阶段校验出站可达与 `sha256`。

可达性自检不等同于业务正确性；S7 通过只证明启动条件具备，不证明 Run 业务正确。

### 10.4 升级与回滚

- 版本矩阵：本文 `0.12.0-draft.1` 绑定机器契约 `0.3.0-simplified.6` + Pi upstream `0.85.1` @ commit `9767ba275f3e9a5ee0f5c5342249b629ab1b2282`。
- 升级顺序：先升级配置（如 secret 轮换）→ 重启生效；再升级 Piko 进程 → 重启生效；最后升级 Matrix homeserver / LLMTier 端点版本（如其兼容矩阵允许）。
- 数据迁移：`PRAGMA user_version` 单调整数；v1→v2 增加 `Abandoned` discussion turn 状态。
- 回滚：配置可回退；Piko 进程可回退到上次 known-good 镜像；数据 schema 不允许从 v2 回退到 v1（`Abandoned` 状态无法在 v1 表示）。Operator 必须接受"无法回退"条件并保留数据备份。

## 11. 性能、容量、扩展与兼容性

### 11.1 预算、瓶颈与扩展边界

| 资源/指标 / Constraint ID | 负载及作用域 | 公式 / 副本与峰值 / 余量 | 对象分配 / 瓶颈 | 超限 / 扩展边界 | 证据等级 / 验证 |
|---|---|---|---|---|---|
| `queue.depth` | 全实例；新 Run 受理 | `storage.max_queue_depth` 配置上限 | `task-repository` M003 | 超限返回 429 `QueueFull`；不创建 Run | Modeled |
| `transfer.max_input_bytes` | per input | config 上限 | `transfer` M010 | 超限 → 前提失败 `InputFetchFailed` | Modeled |
| `transfer.bytes.out` | per task | 产出总字节 / 出站带宽 | `transfer` M010 | 超时 / 失败 → `artifact_delivery=failed` | Modeled |
| `transfer.retry` | per item | 有界重试 + 退避 | `transfer` M010 | 用尽 → 输入前提失败 / 投递 `failed` | Modeled |
| SQLite WAL fsync 延迟 | 每 commit | 模型不可推导；本地 NVMe 推荐 | `task-repository` M003 | fsync 阻塞事务；超时 → `ResultUnavailable` | Not measured |
| Pi session JSONL fsync | 每 append | 模型不可推导 | `pi-adapter` M006 (PikoDurableFileSystem) | 同上 | Not measured |
| Media 下载字节上限 | per attachment | schema 字段 | `matrix-adapter` M008 | 超限拒绝 | Modeled |

不支持横向扩展：单实例固定一个 execution slot。Tailoring 依据：本系统层 §3.3 关键决定 2 选定单实例单 slot，多实例由 Slinky 端组织，本软件不重复实现。

| 客户端/服务/库及平台组合 | 接口/配置/数据版本 | 允许条件 / 不支持或降级行为 | 设计/实现/验证状态 | 升级与恢复限制 / Case 及证据 |
|---|---|---|---|---|
| Slinky `TaskSubmitRequest` 提交者 | `0.3.0-simplified.6` | 唯一支持的客户端契约（含数据面字段 `input_refs`/`artifact_target`，向后兼容新增） | 设计 + 契约测试 PASS | 升级到下版契约前需独立评审 |
| Pi（vendored 源码） | `0.85.1` @ commit `9767ba275f3e9a5ee0f5c5342249b629ab1b2282` | 启动 fingerprint 校验 | 设计 + 锁定依赖 | 升级 Pi 需新建独立设计修订；不能热切 |
| LLMTier | OpenAI-compatible Responses | 唯一支持的模型路径；不支持 non-stream fallback | 设计 + LLMTier 联调 | LLMTier 端版本变化需重新评估事件子集 |
| Matrix homeserver | `matrix-js-sdk` Client-Server | 唯一支持的 Matrix 路径 | 设计 + homeserver 集成 | 不支持 AS 路径 |

## 12. 可测试性与验收设计

### 12.1 主要测试方法与结果判定

- 单元测试（`tests/unit/`）：repository / policy / usage aggregator / result validator；不依赖外部网络。
- 契约测试（`tests/contract/`）：与 `validate_v03_contract.py` 绑定机器契约 `0.3.0-simplified.6`；OpenAPI / Schema / error catalog 双向一致性。
- 集成测试（`tests/integration/`）：fixed Pi + LLMTier + Matrix homeserver；输入拉取 / 产出投递注入；Matrix discussion 集成。
- 故障注入测试（`tests/fault/`）：进程崩溃 + Result 两步提交对账；Harness fault / invariant 损坏；`replay:"never"` 工具无 outcome；响应丢失；late usage。
- 静态扫描（`tests/static/`）：无 Memory API 扫描（PK-11）。

Oracle 独立于被测实现：`validate_v03_contract.py` + JSON Schema + semantic invariants + Result schema。LLM 用例按 §11 设计：构造 prompt、控制模型/参数/上下文；检查返回结构、语义、工具调用和不允许的副作用；重复次数与容差有依据。

### 12.2 受控故障与异常收口验证

- **进程崩溃 R1-R7**：模拟 SIGKILL 中途，验证恢复器 R 路径不复活旧权威、不重复执行 Pi。
- **Result 响应丢失**：模拟 worker 在 Result 发布前崩溃，验证 Result 两步提交协议。
- **Harness fault**：注入 `replay:"never"` 工具 outcome 缺失，验证 `UnsafeRetryBlocked`。
- **Matrix 失联**：注入 whoami 失败、sync 失败、membership 撤销，验证 `DiscussionAccessLost`。
- **late usage**：构造 attempt 完成后迟到 raw_usage，验证 `model_attempts.record_version` 推进但 Result generation 不变。
- **输入拉取失败**：注入输入源不可达 / `sha256` 不符，验证**零调用 `Failed(InputFetchFailed)`**、staging 清理、同 `task_id` 不重跑。
- **产出投递失败**：注入出站不可达 / 目标拒绝，验证**执行终态不变**、`artifact_delivery=failed|partial`、有界重试幂等、Result 与 `failure` 不变。

### 12.3 测试环境快速部署与复位

- 复用 `tests/integration/matrix-acceptance.test.ts` 等的部署入口。
- 独立 SQLite + workspace staging 目录；每次测试清空任务目录。
- LLMTier 用本地 mock；Matrix 用本地 Synapse（参考 `tests/integration/reports/piko-matrix-acceptance-20260919.md`）。
- Pi 固定 commit 锁定；不能切换 Pi 上游。

### 12.4 并发测试与环境隔离

- 隔离键：`task_id` + SQLite writer 串行化 + 独立 workspace staging + Pi session `pi_session_id` 唯一。
- 不支持多实例并发；测试环境即单实例。
- 调度串行：`acquireSlot` 在 `BEGIN IMMEDIATE` 内。

### 12.5 自动化、复现与验证覆盖

| Target/Constraint / 被测对象 | 设计验证项及方法 | 全部必需参与方 / Case | 环境 / 初始状态 / 隔离 | Run / 结果 / 原始证据 | 未覆盖与组合验收 |
|---|---|---|---|---|---|
| PK-01 单 slot + 独立 session | concurrency + isolation integration | PK-T01 + PK-T13 | 本地 SQLite + 固定 Pi | `tests/integration/single-slot.test.ts` (Planned) | 组合验收：与 PK-02/PK-03 联合 |
| PK-02 任务事务稳定身份 | contract validator + HTTP E2E | PK-T03 + PK-T15 | 同上 | `tests/contract/agent-runtime.test.ts` (static PASS) + `tests/integration/http-e2e.test.ts` (NOT_RUN) | 与 PK-08 联合 |
| PK-04 Pi adapter（Responses SSE） | pinned Pi + SSE 联调 | PK-T04 | fixed Pi + LLMTier mock | `tests/integration/pi-integration.test.ts` (NOT_RUN) | 与 PK-09/10 联合 |
| PK-05/06 Tool intent + Result 协议 | crash/fault injection | PK-T06/PK-T17 | 同上 | `tests/fault/result-protocol.test.ts` (NOT_RUN) + `tests/integration/tool-cas.test.ts` (NOT_RUN) | 与 PK-07 联合 |
| PK-07 Result 两步提交 | fault injection | PK-T05 | 同上 | `tests/fault/result-protocol.test.ts` (NOT_RUN) | 与 PK-03 联合 |
| PK-08 Matrix adapter/turn 协议 | homeserver integration + crash replay | PK-T08 | local Synapse | `tests/integration/matrix-discussion.test.ts` (NOT_RUN) | 与 PK-12 联合 |
| PK-09/10 Responses SSE + Usage | LLMTier integration + missing/late | PK-T09/PK-T10/PK-T16 | LLMTier (mock+real) | `tests/integration/llmtier-usage.test.ts` (NOT_RUN) + `tests/unit/usage-aggregator.test.ts` (NOT_RUN) | 与 PK-04 联合 |
| PK-11 无 Memory API | static dependency/API scan | PK-T11 | — | `tests/static/no-memory-api.test.ts` (NOT_RUN) | — |
| PK-12 recovery/operator 边界 | restore + authorization tests | PK-T12 | operator auth | `tests/fault/restore.test.ts` (NOT_RUN) + `tests/integration/operator-auth.test.ts` (NOT_RUN) | 与 PK-08 联合 |
| PK-21 数据面（输入/产出搬运） | transfer integration + fault injection | PK-T41 + PK-T42 | 本地 scp 目标 + secret 挂载 | `tests/integration/transfer-input.test.ts` (Planned) + `tests/fault/transfer-delivery.test.ts` (Planned) | 与 PK-07 联合 |
| PK-22 控制面/执行面进程隔离 | 隔离 + 故障注入（假 P1：阻塞 / 崩溃 / 失联） | PK-T43 + PK-T44 | 双进程 + 可控假 P1 | `tests/integration/control-plane-isolation.test.ts` (Planned) + `tests/fault/exec-proc-crash.test.ts` (Planned) | 与 PK-12 联合 |

设计验证项与 `piko-agent-runtime-test-specification-v0.3` PK-T01..PK-T40 一一对应；本系统不复制 oracle 表，引用作为唯一 authority。

## 13. 信息安全架构

### 13.1 身份、权限、数据与供应链边界

- **主体**：Slinky principal（HTTP bearer credential）、operator（诊断端点）、内部模块之间无外部身份。
- **目标**：Task Store（SQLite）、Pi session store（JSONL）、workspace staging、本地 FS、LLMTier endpoint、Matrix homeserver。
- **身份传播**：HTTP `Authorization: Bearer <credential_ref>` → bootstrap 解析 → `task-api` 校验 → `policy.validateSubmission(req, principal)`。不传给 Pi provider / LLMTier（system §4）。
- **授权点**：`policy.bindToolProfile`（启动时）+ `policy.validateSubmission`（每次受理）。
- **执行点**：worker / `pi-adapter` / `matrix-adapter` / `task-repository`；权限由 `permissions` 集合与 instance policy 交集。
- **凭据取得/更新/撤销**：Secret provider 启动时解析；credential 明文不入 config dump / DB / Result / log；operator 显式轮换。
- **加密与脱敏**：transport 由 Slinky ↔ Piko / Piko ↔ LLMTier / Piko ↔ Matrix 各自 TLS；脱敏 policy 见 §6.2。
- **调试限制**：operator 诊断仅只读；restart / lease fence / migration / credential change / responses probe 需 operator authorization；强制 fence 与 schema migration 写 `audit_events`。
- **依赖/构建/插件来源**：Pi upstream commit 锁定 + adapter patch manifest hash 校验；`matrix-js-sdk` 由 lockfile 固定；SQLite 驱动为 Node 内置 `node:sqlite`（`DatabaseSync`）；LLMTier endpoint 由 config 指定 + preflight 探测；Matrix homeserver 由 config 指定 + whoami 验证。
- **数据面边界（M010 `transfer`）**：出站仅走 `transfer.target_allowlist` 白名单主机；`scp` 主机公钥由 `known_hosts` 固定（**不自动接受 host key**）；凭据（scp 私钥等）经 **secret 挂载**，不进载荷 / DB / Result / 日志；单文件输入受 `transfer.max_input_bytes` 限制；产出按 `(task_id,generation,path,sha256)` **幂等**投递，仅写白名单目标。
- **升级验证**：Pi 升级必须独立设计评审；不能热切；lockfile 锁定所有传递依赖。

## 14. 开发、构建与交付设计

### 14.1 构建复现、依赖与发布物

- **语言/运行时**：TypeScript / Node.js。
- **关键依赖**：Pi（**vendored 源码**，非稳定 SDK）`0.85.1` @ commit `9767ba275f3e9a5ee0f5c5342249b629ab1b2282`；`matrix-js-sdk`；Node 内置 `node:sqlite`（`DatabaseSync`）；OpenAI-compatible Responses 协议 client（由 Pi provider 提供）。
- **构建工具**：npm/pnpm + lockfile；构建 fingerprint 包含 Pi upstream commit + adapter patch manifest hash。
- **交付物**：控制进程 + 执行进程 包 + 配置 schema + tool profile schema + 数据库 migration + OpenAPI/Schema/error catalog + 集成测试 fixtures。
- **安装/启动入口**：`bootstrap` 顺序见 §4.1。
- **离线/跨平台**：构建可在有 lockfile 时离线完成；运行时必须可访问 LLMTier 与 Matrix homeserver（否则 preflight 失败）。

第三方许可与来源风险按项目合规义务处理；本设计不重写项目合规文档。

## 15. 实现计划与集成顺序

Piko 由 11 个直属模块组成，STD 要求每模块独立 design.definition + design.implementation。下游实现按"先 mechanism 横向稳定 → 后 module 纵向落地"两阶段；module 顺序按职责依赖倒排。

| 阶段 | 输入与前置依赖 | 任务 / 承接对象 / Owner | 交付物 | 局部及集成出口 | 未决项 / 影响 |
|---|---|---|---|---|---|
| PHASE-M 8 mechanism 文档 | §3.5 机制清单 | 8 份 `design.system-mechanism` 3.3.0 docs；Owner: Piko Architecture | `docs/20_system_design/mechanisms/piko-{run,config,startup,usage,matrix,recovery,cancel,transfer}.md` | 每份包含完整 §1-§14 + 附录 A/B；机制 ID 与 §3.5 一致 | — |
| PHASE-D 11 module definitions | system 设计 + 8 mechanism docs | 11 份 `design.definition` 3.4.0 docs；Owner: Piko Implementation | `docs/40_module_design/piko-{bootstrap,task-api,policy,task-repository,scheduler,worker,pi-adapter,usage,matrix-adapter,observability,transfer}-design.md` | 每份包含完整模块定义 + `implementation_specification.mode=self` 引用对应 ISD | transfer 为新增模块 |
| PHASE-I 11 module ISDs | 11 definitions + 8 mechanisms | 11 份 `design.implementation` 1.2.0 docs (.isd.md)；Owner: Piko Implementation | `docs/50_implementation_design/piko-{...}-impl.isd.md` | 每份含完整 §1-§7；与 mechanism + definition 一致 | transfer ISD 为新增 |
| PHASE-O 8 mechanism 联合评审 | PHASE-M/D/I 完成 | 机制 + 模块 + 系统四方组合验证；Owner: Piko Project Owner | review packet `piko-system-design-std35-review-packet` 续 | 系统组合验收 + 下游实现 Gate | 含数据面 PK-T41/PK-T42 |

阶段顺序：先机制（横向）→ 后模块定义与 ISD（纵向）→ 联合评审。下游实现顺序由 10 份 ISD §7 自定义（每份内部按各自任务拆分）。

## 16. 设计决策、风险与下游承接

### 16.1 下级设计与组合验收任务

每个直属模块对应 1 份 `design.definition`（模块定义）+ 1 份 `design.implementation`（ISD）。`implementation_view_of_document_id` 字段指向对应 definition。`parent_document_id` 指向本系统文档。

| 模块 / 父对象 | Definition 文档 | ISD 文档 | 固定输入 / Constraint / 接口 | 自由度 / 不可改变 | 局部用例 / 组合义务 / 接收方 | 缺口与反馈 |
|---|---|---|---|---|---|---|
| M000 `bootstrap` / `SW-P` | `piko-bootstrap-design.md` | `piko-bootstrap-impl.isd.md` | PK-12 / PK-22 / §4 / §4.1 / §6.3 + `MECH-CONFIG`；启动顺序 + P1 监督归模块设计 §3.6（非机制） | 进程内启动顺序可调整；preflight 项集合可增；P1 重启退避可调 | 局部 + 组合 PK-T12 / PK-T43 / receiver: SW-P 系统层 + ops | ISSUE-RUNTIME-001 Pi upstream commit 锁定 |
| M001 `task-api` / `SW-P` | `piko-task-api-design.md` | `piko-task-api-impl.isd.md` | PK-02 / contract §1-§2 / CAP-SUBMIT/STATUS/CANCEL/RESULT + `MECH-RUN` | HTTP 中间件顺序可调；error map 与 catalog 双向一致性不可破 | 局部 + 组合 PK-T03 / receiver: SW-P 系统层 | — |
| M002 `policy` / `SW-P` | `piko-policy-design.md` | `piko-policy-impl.isd.md` | PK-03 / §3.6.1 path policy + `MECH-CONFIG` | 字段校验顺序可调；`recovery_contract_ref` 不可热注册 | 局部 + 组合 PK-T03 / receiver: SW-P | — |
| M003 `task-repository` / `SW-P` | `piko-task-repository-design.md` | `piko-task-repository-impl.isd.md` | PK-01/02/07/12 / §3.4 PK-01/02/07/12 + `MECH-RUN` / `MECH-RECOVERY` | fenced write 接口稳定；SQLite DDL 单调整数 | 局部 + 组合 PK-T01/PK-T05/PK-T15 / receiver: SW-P | — |
| M004 `scheduler` / `SW-P` | `piko-scheduler-design.md` | `piko-scheduler-impl.isd.md` | PK-01 / §3.4 PK-01 + `MECH-RUN` | 调度策略不可引入优先级/抢占 | 局部 + 组合 PK-T01 / receiver: SW-P | — |
| M005 `worker` / `SW-P` | `piko-worker-design.md` | `piko-worker-impl.isd.md` | PK-01/03/07/12/13/14 + `MECH-RUN` / `MECH-MATRIX` / `MECH-RECOVERY`；取消分流归模块设计 §3.6（非机制） | 不镜像 Pi Agent loop；不复活旧权威；P1 侧允许阻塞、可被丢弃 | 局部 + 组合 PK-T05 / PK-T43 / receiver: SW-P | — |
| M006 `pi-adapter` / `SW-P` | `piko-pi-adapter-design.md` | `piko-pi-adapter-impl.isd.md` | PK-04/05/06 / contract §3 + `MECH-RUN` / `MECH-USAGE` | 不替换 Pi provider adapter；`maxRetries=0` 不变 | 局部 + 组合 PK-T04/PK-T09/PK-T10 / receiver: SW-P | ISSUE-RUNTIME-001 |
| M007 `usage` / `SW-P` | `piko-usage-design.md` | `piko-usage-impl.isd.md` | PK-09/10 / contract §3 + `MECH-USAGE` | semantic validator 版本绑定不可变 | 局部 + 组合 PK-T10/PK-T16 / receiver: SW-P | ISSUE-RUNTIME-002 |
| M008 `matrix-adapter` / `SW-P` | `piko-matrix-adapter-design.md` | `piko-matrix-adapter-impl.isd.md` | PK-08 / §3.4 PK-08 + `MECH-MATRIX` | 不启用 AS 路径；txn_id 确定性派生 | 局部 + 组合 PK-T08 / receiver: SW-P | — |
| M009 `observability` / `SW-P` | `piko-observability-design.md` | `piko-observability-impl.isd.md` | PK-11 / §6.2 / §10.1 + 5 mechanism 全部 | 不反向控制业务；脱敏 policy 不可破 | 局部 + 组合 PK-T11 / receiver: SW-P | — |
| M010 `transfer` / `SW-P` | `piko-transfer-design.md` | `piko-transfer-impl.isd.md` | PK-21 / §6.5 + `MECH-TRANSFER` / `MECH-RUN` | 方法可换（`scp`/`mount`/`object_store`）；重试上限可配；**不得改执行终态** | 局部 + 组合 PK-T41/PK-T42 / receiver: SW-P | — |

下游关闭条件：PHASE-M/D/I/O 全部 PASS + 系统组合验收 (operator auth + restore + matrix joint + cross-mechanism) PASS。

## 附录 A. 设计输入、适用性与派生关系

| 条件信息 | 判断依据 | 不适用时仍需说明 |
|---|---|---|
| 图形页面 | 是否拥有 Web/桌面入口 | 否（无 CLI）；HTTP/operator 端点见 §3.6.2 + ops 文档 |
| 多实例及扩展 | 产品是否承诺多实例 | 否（单实例单 slot；多实例由 Slinky 端组织） |
| 持久化及迁移 | 是否拥有持久状态 | 是（SQLite + JSONL + workspace staging）；迁移策略见 §7.11 + ISD §4.7 |
| 在线配置/升级 | 是否承诺在线切换 | 否（重启生效，§6.3） |
| 取证封结 | 有副作用、取证和资源收口义务 | 是（worker R1-R7；Result 两步提交；详见 §6.4） |
| 安全控制 | 按全部资产及入口逐项筛查 | 已逐项；§10.1 |

| 输入 Document/来源 | 版本/commit/hash | 适用条款 / 决定状态 | 实际内容与缺口 |
|---|---|---|---|
| `piko-requirements-traceability-v0.3` | v0.3 / commit `e721ac0...` / sha256 in metadata | PK-01..PK-12 / Approved | 全部 PK 已映射到 §3.4 / §8 / §11 / §15 |
| `piko-agent-runtime-contract-v0.3` | v0.4.0 / machine `0.3.0-simplified.6` | contract §1-§4 / Approved | 全部字段映射到 §7.4；error catalog 映射到 §7.8 |
| Pi（vendored 源码） | `0.85.1` @ commit `9767ba275f3e9a5ee0f5c5342249b629ab1b2282` | §3.3 关键决定 1 / §3.6.1 Pi upstream | 锁定；详见 §3.4 PK-04 + §6.3 S6 |
| `interfaces/openapi/agent-runtime-openapi-v0.3.yaml` | v0.3 | §5.1 / Approved | 机器权威；本设计不重写字段 |
| `interfaces/schemas/agent-runtime-v0.3.schema.json` | v0.3 | §7.4 / Approved | 机器权威；本设计不重写字段 |
| `interfaces/error-codes/agent-runtime-v0.3.yaml` | v0.3 | §7.8 / Approved | 机器权威 |
| `piko-runtime-release-and-operations-v0.3` | v0.3 | ops / Approved | 部署/激活/诊断入口由该文档维护 |

| 信息项 | keep/simplify/omit / 理由 | 替代位置 | Tailoring Document/Decision / 批准状态 |
|---|---|---|---|
| UI 设计（draft.37 起模板已移除该节） | omit · 无图形入口 | §3.6.2 + ops | TAIL-P-101 / Owner-pending |
| §4 子系统与直属模块概要设计 | omit · Piko 无 subsystem（1 个 subsystem 是架构代码坏味道，选 0 而非 ≥2） | §3.2 直属模块表 + 各模块 ISD §4 | TAIL-P-NEW-S1 / Owner-pending |
| §7.2/7.3/7.4/7.5/7.6/7.7 系统级数据/配置/通信/设备/运行态/表结构 | omit · 由各模块 ISD 唯一维护 | 各模块 ISD §4 + M003 ISD §4.7 | TAIL-P-102 / Owner-pending |
| §5.3 硬件/固件接口 | omit · 纯软件 | — | TAIL-P-103 / Owner-pending |
| §5.3 多实例/横向扩展 | omit · 单实例单 slot | §3.3 关键决定 2 | TAIL-P-104 / Owner-pending |
| §6.1 副本/HA | omit · 单实例 | §3.3 关键决定 2 | TAIL-P-105 / Owner-pending |

> Tailoring 撤销说明：`piko-std-tailoring-v0.1` §3 表中的 `TAIL-P-001` "design.system 章节映射"（keep/tailor，9 节简化 authority）已于本次升级撤销；新增 TAIL-P-NEW-S1 记录"Piko 无 subsystem"决定。

## 附录 B. 文档控制、修订与交付检查

文档控制信息见文末 STD 文档控制块（Authority/Authors/Created Date/Template Conformance/Tailoring Reference/Migration Map Reference/Repository/Canonical Path/Supersedes）。

| 文档版本 / 日期 | 变更和设计影响 | 作者 / 评审记录 |
| v0.12.0-draft.1 / 2026-09-28 | 本轮重设计：**新增数据面 `transfer` M010 + `MECH-TRANSFER` + PK-21**（输入拉取 / 产出投递，`scp`/`mount`/`object_store`；投递**不阻塞执行终态**；`artifact_delivery` 移 **Run 侧**可变字段，不再进 Result）；**移除任务级截止 / 预算**（PK-04 撤销、去 `DeadlineExceeded`/`BudgetExceeded`、retention 改 `accepted_at + retention_days`）；**全局 `run_id`→`task_id`**、路径 `/runs`→`/tasks`、类型 `Run*`→`Task*`、`RunNotTerminal`→`TaskNotTerminal`；新增错误码 `InputFetchFailed`；`AgentResult` 增 `stats`、去 `artifact_delivery`；`TaskView` 增 `progress`/`result_available`/`artifact_delivery`、补回 `discussion_intake_state`；机制 7→8、模块 10→11；Status `Approved`→`Draft`。**本轮补充**：①`§5.1` 明确 CPU 让出 / event-loop 不被执行饿死；②输入预备移到 **Queued 阶段、不占 execution slot**（慢 `scp` 不拖住执行），`TaskView` 新增 `input_staging`、契约新增 `InputStaging`；③`transfer` M010 搬运**可中断**，cancel 在预备中 → 中断 `scp` + 零调用 `Cancelled`。**接口推演（第二轮）**：④**关键决定 7 定案**——**P0 只保有权威状态并应答（无外部 IO）、P1 承载一切会阻塞的外部交互与执行**；M008 `matrix-adapter` 由 P0 **移到 P1**；新增约束 **PK-22**（进程隔离 / 轮询独立）。⑤`progress` 改为**由已有 durable 事实派生**（`model_attempts`/`tool_calls`），不加高频通道。⑥受理**不做同步外部调用**（discussion 核实/输入拉取异步化）；⑦新增 `P0↔P1` IPC 接口 + 数据面 / Secret provider / Slinky 存储主机接口登记（§8.2），环境图补外部对象；⑧Pi 如实标注为 **vendored 源码（内部路径）**，非稳定 SDK；⑨存储驱动对齐为 `node:sqlite`；⑩补路径基准与幂等语义（§8.1） | corezilla, opencode |
| v0.11.4 / 2026-09-27 | §5 运行环境补充：**Piko 常以容器部署**（1 实例=1 容器 · 持久卷 · 出站 scp · secret 挂载 · 入站 HTTP）；§5.2 明确**数据面/控制面分离**（文件经 scp 由 Piko 主动搬运、**不传字节**；HTTP 只传路径/引用与执行结果；**工作区持久化归 Slinky**）；§5.3 增 `TOP-2 生产跨机` / `TOP-3 多 Piko 实例`；§6 增 `P-INPUT`（输入拉取）/ `P-ARTIFACT`（产出投递）；§5 增 `SCN-1` 应用场景图（单任务择一·不广播；各实例独立连同一 LLMTier；Matrix 协作通信） | corezilla, opencode |
| v0.11.3 / 2026-09-27 | §3.2 M001 行消费清单纠偏：`HTTPClient`（非模块）→ 实际模块交接 `policy`(M002)、`task-repository`(M003)，与 `piko-run` §3.5 M001 行一致 | corezilla, opencode |
| v0.11.2 / 2026-09-27 | 为 M004 scheduler ISD 的 persistence `not_applicable` 决定提供稳定锚点（见 §9 数据节，锚点 id `m003-ddl-authority`，持久化 authority 属 M003）；无正文语义变化 | corezilla, opencode |
|---|---|---|
| v0.11.1 / 2026-09-26 | review 修复（AMENDMENT P1/P2）：§3.5.1 依赖矩阵区分上级机制/设计前置/运行时消费/恢复读取（仅设计前置参与无环检查）；7 份机制 §A.1/§16 同步；MATRIX 截断回补 + E2EE 唯一结果；CANCEL 停止未知隔离；接口闭合 + 可执行验证向量；§15 交付计划 5→7 修正 | corezilla, opencode |
| v0.4.0 / 2026-09-17 | 现有 9 节结构；Approved by User / Piko Project Owner | corezilla |
| v0.5.0 / 2026-09-25 | 按 STD draft.35 模板 `design.software-system` 1.0.0 重写为 17 + 2 节结构；保留 PK-T01..PK-T40 oracle 与机器契约不变 | corezilla, opencode |
| v0.6.0 (本次修订) / 2026-09-25 | 移除"1 个 subsystem"反模式；删除 `piko-runtime-implementation-design-v0.3.isd.md`（拆分到 10 份模块 ISD）；模块按 4 分区重新组织；§3.5 机制清单指向 5 份独立 `design.system-mechanism` 文档；附录 A 增加 TAIL-P-NEW-S1（无 subsystem）；修订号升 v0.6.0 | corezilla, opencode |
| v0.7.0 (本次修订) / 2026-09-25 | 删除 MECH-STARTUP / MECH-CANCEL（仅单模块，不构成跨模块机制，归入 `piko-bootstrap-design.md` §3.6 / `piko-worker-design.md` §3.6）；机制清单从 7 项收敛为 5 项（MECH-RUN / MECH-USAGE / MECH-MATRIX / MECH-CONFIG / MECH-RECOVERY）；按 STD 命名重命名文件（`<name>-design.md` / `<name>.isd.md` / `<name>.md`）；修订号升 v0.7.0 | corezilla, opencode |
| v0.8.0 (本次修订) / 2026-09-25 | **同步 STD draft.35 → draft.37**：`design.software-system` 模板 1.0.0 → **2.0.0**（MAJOR：§4 功能 → §3.6 功能；§5 子系统 → §4；§6 运行 → §5；§7 过程 → §6；§8 数据 → §7；§9 接口 → §8；§10 配置 → §9；§11 可靠性 → §10；§12 性能 → §11；§13 测试 → §12；§14 安全 → §13；§15 构建 → §14；§16 计划 → §15；§17 决策 → §16）；§3.6.3 UI 设计从模板中删除（纯软件无 UI 入口）；body 内所有 § 引用按新编号同步重写；lock 升级到 `0.1.0-draft.37`（source revision `fe28370`）；manifest 重新对齐（207 artifacts）；Document Version 0.7.0 → 0.8.0 | corezilla, opencode |
| v0.11.0 (本次修订) / 2026-09-25 | 恢复 MECH-STARTUP（跨 5 模块）与 MECH-CANCEL（跨 3 模块）为独立机制；机制清单 5 → 7；§3.4 加 CON-<MECH>-<nnn> 反向登记；§3.5 声明 MECH-RUN 为族设计锚点、依赖单向无环 | corezilla, opencode |
| v0.10.0 (本次修订) / 2026-09-25 | 新增 5 份系统机制设计文档（`docs/20_system_design/mechanisms/piko-{run,usage,matrix,config,recovery}.md`）并在 §3.5 登记"已建"；§3.5 参与方补全支撑模块（MECH-USAGE +M005、MECH-MATRIX +M003、MECH-RECOVERY +M004）；§3.4 PK-01 下级入口标注 MECH-RUN 已建；同步 lock 到 `0.1.0-draft.40`（source revision `fbb1e28`，移除 handoff 文档）；Document Version 0.9.0 → 0.10.0 | corezilla, opencode |
| v0.9.0 (本次修订) / 2026-09-25 | **同步 STD draft.38 → draft.39**：`design.software-system` 2.0.0 → 2.1.0（minor：§8.1 软件接口 → §8.1 API；§8.2 明确为协作接口，内部 HTTP/RPC 也在本节定义）；`design.subsystem` 1.1.0 → 1.2.0（minor）；lock 升级到 `0.1.0-draft.39`（source revision `24e1ff9`）；manifest 重新对齐（207 artifacts）；Document Version 0.8.0 → 0.9.0 | corezilla, opencode |

交付检查：
- [x] 开篇可独立解释产品、输入输出、工作原理与边界（§1 + §2 + §3）
- [x] 已逐段检查正文性质；图注、章节开头无编辑指令或生成过程残留
- [x] 每个直属对象有实际职责、概要原理、共同约束和下级自由度（§3.2 + §3.6 引用各模块 ISD）
- [x] 设计问题已有选定方案、依据和正常/失败推演（§3.3 + §5）
- [x] 静态组成、运行载体、过程与数据流没有混成一幅无语义的框图（§3.1 / §4 / §5）
- [x] 正常及代表失败可逐步推演（§6.1..§6.4）
- [x] 公共接口可调用且映射完整（§7 + 契约 `0.3.0-simplified.6`）
- [x] 日志、统计、自检、维护命令定义到作用域、判定和退出（§6.2 / §6.3 / §5.1 Operator）
- [x] 预算、状态、安全、配置及兼容跨章节一致（§3.4 / §6 / §7 / §10 / §12）
- [x] 测试方法、部署复位、并发隔离、自动化和全部参与方覆盖已设计（§11）
- [x] 所有适用节均能回答决定、依据、承接约束、自由度及检查方法（§3.3 / §3.4 / §15）

<!-- STD_DOCUMENT_CONTROL_BEGIN -->
| 文档字段 | 值 |
|---|---|
| Authority | piko |
| Authors | corezilla, opencode |
| Created Date | 2026-09-07 |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/20_system_design/piko-system-design.md` |
| Supersedes | `docs/99_reference/design/agent-runtime-service-design-v0.2.md` |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_CONTROL_END -->
