<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Runtime V0.3 实现级设计

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-runtime-implementation-design-v0.3` |
| Document Version | `0.1.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Implementation Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | `2026-09-17` |
| Created Date | `2026-09-17` |
| Last Modified Date | `2026-09-17` |
| Template ID | `design.definition` |
| Template Version | `2.1.1` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/50_implementation_design/piko-runtime-implementation-design-v0.3.md` |
| Supersedes | none |

> 本文细化 `0.3.0-simplified.6`：保留四项外部 API 和既有状态机，并把提交身份统一为
> Slinky 生成的全局唯一 `task_id`。Pi/Matrix/LLMTier 边界不变。
> 若实现需要偏离本文，必须先修改设计并重新评审。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目的、范围与上位输入

本文把已批准的总体设计和 Runtime Core 内部设计落实为可编码的单路径方案，覆盖模块划分、
Task Store、事务与恢复、Pi/Matrix/LLMTier adapter、配置、安全、部署、可观测性和验证映射。

上位 authority：

- `piko-agent-runtime-design-v0.3`：系统边界与全局策略；
- `piko-agent-runtime-core-internal-design-v0.3`：Run/Harness operation/usage/Matrix 顺序；
- `piko-agent-runtime-contract-v0.3` 与机器契约：外部字段、状态、错误和不变量；
- `piko-runtime-release-and-operations-v0.3`：发布、恢复与部署 Gate。

范围外：多 Agent、多 execution slot、远程/共享数据库、分布式队列、Matrix Application Service、
模型 non-stream fallback、跨系统 exactly-once、产品 Topic/SID/RID 和正式 Memory authority。

## 2. Ownership 与边界

- 负责：四项 HTTP API、单 slot 调度、Task Store、Pi session 绑定、policy、usage、Matrix discussion
  adapter、稳定 Result、内部诊断和恢复。
- 不负责：Slinky 业务流程与 Memory、LLMTier Agent 状态、Matrix homeserver、工具自身业务语义、
  supervisor/Secret backend 的实现。
- authority：机器契约优先于本文；本文只定义内部实现，不新增调用方可见字段。
- 单路径约束：每项职责只有一个生产实现；测试 fake 只能通过同一内部 interface 注入。

上述模块共同形成唯一的任务事务层。它的输入是一个已验证的 Slinky 任务，输出是一个稳定
`AgentResult`；中间只记录任务/Run 事务事实并调用固定 Pi runtime。任务规划、上下文管理、工具循环、
模型重试和执行内改换方法均留在 Pi，不在 Piko 中实现平行状态机。

## 3. Current Baseline 与 Approved Delta

当前仓库没有生产代码。首个实现采用：

- TypeScript/Node.js，与固定 Pi SDK 在同一进程集成；构建时用 lockfile 固定实际 Node、Pi、
  `matrix-js-sdk`、SQLite driver 和所有传递依赖；
- 一个 API/scheduler/worker 进程服务一个逻辑 Piko 实例和一个 Agent execution slot；
- 本地 SQLite Task Store，WAL 模式、foreign keys、busy timeout、同步持久化；
- Pi AgentHarness `JsonlSessionRepo` 保存 Agent history、operation state、tool intent/outcome 和 usage；Task Store
  只保存任务/Run 绑定、跨系统观察与稳定 Result；
- `matrix-js-sdk` Client-Server 是唯一 Matrix 路径；
- Pi `openai-responses` provider + LLMTier Responses SSE 是唯一模型路径。

SQLite 是单实例持久事实库，不是共享 capacity 或跨实例协调服务。若未来需要多主机或共享 store，
必须形成新的需求和迁移设计，不在本实现中预留第二 backend。

## 4. 设计概览与主流程

```text
HTTP Client
    |
 TaskApi -> RequestPolicy -> TaskRepository(SQLite)
                              |
                         SingleSlotScheduler
                              |
                      RunWorker/RunCoordinator
                      /          |          \
                PiAdapter   MatrixAdapter   UsageLedger
                    |             |             |
             Pi session store  matrix-js-sdk  ModelAttempt rows
                    |
             LLMTier Responses SSE
```

主流程：

1. `TaskApi` 认证、规范化并校验请求，`RequestPolicy` 形成不可变的已验证任务定义。
2. `TaskRepository.createOrGetRun` 在单事务内按 `task_id` 查找或创建唯一 Queued Run。
3. `SingleSlotScheduler` 以 lease epoch 取得唯一 slot；`RunWorker` 创建或恢复 Pi session，并把已验证任务
   适配为该 session 的初始 user entry。
4. `RunCoordinator` 只协调 Task Store 与 Harness：Pi 自行提交 provider/tool effect intent 和 operation
   result；Piko 观察 durable operation/tip 后推进 Run generation，Agent turn/tool loop 仍由 Pi 驱动。
5. Result publisher fence writer，从已提交的 Pi 输出与执行事实固定 usage/output/known actions，写
   immutable Result，再提交终态供 Slinky 查询。
6. 恢复器只从 SQLite 与 Pi durable session/operation facts 对账，不从日志猜测成功。

## 5. 内部分解与依赖

| 模块 | 提供 | 只允许依赖 |
|---|---|---|
| `bootstrap` | 配置加载、schema migration、preflight、进程生命周期 | config、store、adapters |
| `task-api` | 四项 HTTP operation | auth、policy、task-repository |
| `policy` | request/path/tool/deadline/budget 判定 | config、纯函数库 |
| `task-repository` | Run/lease/session/result/ledger 事务 | SQLite adapter |
| `scheduler` | 单 slot 领取、续租、fence、排队 | task-repository、clock |
| `run-worker` | Run 事务协调、取消、deadline、Result 发布 | repository、Pi、Matrix、policy |
| `pi-adapter` | AgentHarness session/lane/operation、abort、raw usage hook | 固定 Pi SDK、LLMTier client config |
| `result-validator` | Usage跨字段语义与Result状态不变量；发布前fail closed | 版本化纯函数、Agent schema |
| `matrix-adapter` | membership/sync/event/media/reply/txn | `matrix-js-sdk`、repository、policy |
| `observability` | structured log、metric、audit event | redaction policy；不得反向控制业务 |

禁止 `task-api` 直接操作 Pi/Matrix，禁止 adapter 直接变更 Run 终态，禁止日志或指标成为恢复
authority。所有时间、ID、SQLite 和外部 client 通过明确 interface 注入，以支持故障测试。

建议源码映射：

```text
src/bootstrap/        src/config/          src/http/
src/policy/           src/store/           src/scheduler/
src/worker/           src/adapters/pi/     src/adapters/matrix/
src/usage/            src/observability/   src/testing/
migrations/           schemas/             tests/{unit,contract,integration,fault}/
```

## 6. 内部接口与配置契约

核心 interface：

```ts
interface TaskRepository {
  createOrGetRun(input: ValidatedTaskSubmission): Promise<CreateRunOutcome>;
  acquireSlot(ownerId: string): Promise<Lease | null>;
  renewLease(lease: Lease): Promise<Lease>;
  mutateRun(command: FencedRunCommand): Promise<RunRecord>;
  publishResult(command: FencedPublishResult): Promise<ResultRecord>;
}

interface PiRuntime {
  openOrCreateRunSession(runId: string): Promise<PiRunHandle>;
  inspect(handle: PiRunHandle): Promise<PiRunObservation>;
  accept(handle: PiRunHandle, operationId: string, messages: AgentMessage[]): Promise<void>;
  drive(handle: PiRunHandle, operationId: string): Promise<PiOperationOutcome>;
  enqueueDiscussion(handle: PiRunHandle, turn: PikoDiscussionMessage): Promise<PiQueueRef>;
  requestAbort(handle: PiRunHandle, operationId: string): Promise<void>;
}

interface MatrixRuntime {
  verifyDiscussionStart(context: DiscussionContext): Promise<VerifiedEvent>;
  syncOnce(cursor: string | null): Promise<MatrixBatch>;
  sendWithStableTxn(record: MatrixSendRecord): Promise<MatrixSendOutcome>;
}
```

所有 repository 写命令必须携带 `run_id`、expected Run generation 和有效 lease epoch；不匹配返回
内部 `FencedWrite`，不得自动覆盖。外部 HTTP typed error 仍由现有 error catalog 映射。

`PiRunHandle` 固定 `{session_id:run_id,lane:"main"}`；初始 operation 为 `run_id:initial`，讨论续轮为
`run_id:turn:<turn_seq>`。`inspect` 必须同时返回 Harness open operation、`getResult(operation_id)`、lane tip、
transcript 和 durable queues；adapter 不允许在未 inspect 的情况下调用 `accept`。

运行配置的机器约束位于 `interfaces/schemas/piko-runtime-config-v0.3.schema.json`，tool profile 位于
`interfaces/schemas/piko-tool-profile-v0.3.schema.json`。第一阶段 `api_auth` 只允许一个 bearer principal；
所有 Secret 只保存 reference，不允许 credential 明文。Schema 校验后必须做 tool registry 交叉验证：每个
`recovery_contract_ref` 必须存在于同文件 `recovery_contracts`，`implementation_ref` 必须解析到进程内已注册
实现，并与 tool name/effect/AgentTool.replay 声明一致；任一不匹配即启动失败。启动顺序为 parse → schema
validate → bind tool/recovery registry → canonicalize paths → open/migrate store → verify Pi upstream commit + adapter patch manifest → dependency preflight → listen；
任一步失败均不接受 Run。

## 7. 数据、状态与生命周期

### 7.1 SQLite 规则

- 每个逻辑实例一个数据库文件；进程以独占 instance lock 防止两个 supervisor 实例误用同一文件。
- 启用 `foreign_keys=ON`、WAL、busy timeout；提交关键事实时使用同步 durability。
- 所有 schema 变更使用单调整数 `schema_generation` 和前向 migration；migration 前备份并禁止 worker。
- JSON 列写 UTF-8 JSON；任务定义以首次通过校验并持久化的字段值为准，不创建请求摘要。对象成员顺序
  忽略，三个 path 集合按集合比较，时间按 UTC instant 比较，其余值严格比较。
- token、API key、Matrix access token、下载 credential 不进入数据库。

### 7.2 最小关系模型

| 表 | 主键/唯一约束 | 关键字段 |
|---|---|---|
| `instance_meta` | `key` | schema generation、instance id、boot id |
| `tasks` | `task_id`; unique `run_id` | owner principal、immutable task JSON 或 Gone tombstone、accepted/purge time |
| `runs` | `run_id`; FK task | state、generation、cancel flag、discussion intake、timestamps、limits |
| `run_sessions` | `run_id`; unique `pi_session_id` | lane、active/last operation、observed tip、lease epoch |
| `execution_slot` | singleton `slot_id=1` | run id、owner id、lease epoch、heartbeat、state |
| `results` | `run_id`; unique `(run_id,generation)` | terminal state、canonical result JSON/hash、published time |
| `model_attempts` | `(run_id,attempt_id)`; unique ordinal | Started/UsageObserved/Terminal/Unknown、raw usage presence/value、record version |
| `tool_calls` | `(run_id,operation_id,tool_call_id)` | Reserved/Started/Terminal/Unknown、tool/effect/replay、recovery count |
| `matrix_state` | singleton identity | sync cursor、membership snapshot version |
| `matrix_events` | `(room_id,event_id)` | sender、txn id、visibility fact、observed time |
| `discussion_turns` | `(run_id,event_id)`; unique `(run_id,turn_seq)` | Pending/QueuedInPi/Consumed/Abandoned、Pi entry/operation id |
| `matrix_sends` | stable txn id | run/turn/action、payload digest、event id、state |
| `audit_events` | monotonic id | action、actor class、run id、redacted detail、time |

首个 migration 的逻辑 DDL 固定如下；实现可以增加无语义索引，但不得改变约束：

```sql
CREATE TABLE instance_meta (
  key TEXT PRIMARY KEY, value_json TEXT NOT NULL
) STRICT;

CREATE TABLE tasks (
  task_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE,
  owner_principal TEXT NOT NULL,
  identity_state TEXT NOT NULL CHECK(identity_state IN ('Active','Tombstone')),
  task_json TEXT,
  accepted_at TEXT NOT NULL,
  purge_after TEXT NOT NULL,
  CHECK((identity_state='Active' AND task_json IS NOT NULL) OR
        (identity_state='Tombstone' AND task_json IS NULL))
) STRICT;

CREATE TABLE runs (
  run_id TEXT PRIMARY KEY REFERENCES tasks(run_id),
  state TEXT NOT NULL CHECK(state IN
    ('Queued','Running','Cancelling','Completed','Failed','Cancelled')),
  generation INTEGER NOT NULL CHECK(generation >= 1),
  cancel_requested INTEGER NOT NULL DEFAULT 0 CHECK(cancel_requested IN (0,1)),
  discussion_intake_state TEXT NOT NULL
    CHECK(discussion_intake_state IN ('Disabled','Open','Closing','Closed')),
  accepted_at TEXT NOT NULL, started_at TEXT, finished_at TEXT,
  deadline_at TEXT NOT NULL, max_model_calls INTEGER NOT NULL,
  max_tool_calls INTEGER NOT NULL
) STRICT;

CREATE TABLE run_sessions (
  run_id TEXT PRIMARY KEY REFERENCES runs(run_id),
  pi_session_id TEXT NOT NULL UNIQUE,
  lane_name TEXT NOT NULL CHECK(lane_name='main'),
  active_operation_id TEXT, last_operation_id TEXT, observed_tip_id TEXT,
  lease_epoch INTEGER NOT NULL CHECK(lease_epoch >= 1)
) STRICT;

CREATE TABLE execution_slot (
  slot_id INTEGER PRIMARY KEY CHECK(slot_id=1),
  run_id TEXT REFERENCES runs(run_id), owner_id TEXT, boot_id TEXT,
  lease_epoch INTEGER NOT NULL, heartbeat_at TEXT
) STRICT;

CREATE TABLE results (
  run_id TEXT PRIMARY KEY REFERENCES runs(run_id),
  generation INTEGER NOT NULL, result_json TEXT NOT NULL,
  result_sha256 TEXT NOT NULL, published_at TEXT NOT NULL,
  UNIQUE(run_id,generation)
) STRICT;

CREATE TABLE model_attempts (
  run_id TEXT NOT NULL REFERENCES runs(run_id),
  operation_id TEXT NOT NULL, step_id TEXT NOT NULL, attempt INTEGER NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('Reserved','Started','UsageObserved','Terminal','Unknown')),
  raw_usage_json TEXT, record_version INTEGER NOT NULL, updated_at TEXT NOT NULL,
  PRIMARY KEY(run_id,operation_id,step_id,attempt)
) STRICT;

CREATE TABLE tool_calls (
  run_id TEXT NOT NULL REFERENCES runs(run_id),
  operation_id TEXT NOT NULL, tool_call_id TEXT NOT NULL,
  tool_name TEXT NOT NULL, effect TEXT NOT NULL,
  replay TEXT NOT NULL CHECK(replay IN ('never','safe')),
  recovery_contract_ref TEXT,
  state TEXT NOT NULL CHECK(state IN ('Reserved','Started','Terminal','Unknown')),
  recovery_count INTEGER NOT NULL DEFAULT 0 CHECK(recovery_count >= 0),
  updated_at TEXT NOT NULL,
  PRIMARY KEY(run_id,operation_id,tool_call_id)
) STRICT;

CREATE TABLE matrix_state (
  singleton INTEGER PRIMARY KEY CHECK(singleton=1),
  sync_cursor TEXT, membership_version INTEGER NOT NULL
) STRICT;
CREATE TABLE matrix_events (
  room_id TEXT NOT NULL, event_id TEXT NOT NULL, sender TEXT NOT NULL,
  txn_id TEXT, observed_at TEXT NOT NULL,
  PRIMARY KEY(room_id,event_id)
) STRICT;
CREATE TABLE discussion_turns (
  run_id TEXT NOT NULL REFERENCES runs(run_id), event_id TEXT NOT NULL,
  turn_seq INTEGER NOT NULL, status TEXT NOT NULL
    CHECK(status IN ('Pending','QueuedInPi','Consumed','Abandoned')),
  visible_content TEXT NOT NULL, pi_entry_id TEXT, pi_operation_id TEXT,
  PRIMARY KEY(run_id,event_id), UNIQUE(run_id,turn_seq)
) STRICT;
CREATE TABLE matrix_sends (
  txn_id TEXT PRIMARY KEY, run_id TEXT NOT NULL REFERENCES runs(run_id),
  turn_seq INTEGER, payload_sha256 TEXT NOT NULL, event_id TEXT,
  state TEXT NOT NULL CHECK(state IN ('Pending','Sent','Unknown'))
) STRICT;
CREATE TABLE audit_events (
  audit_id INTEGER PRIMARY KEY AUTOINCREMENT, event_name TEXT NOT NULL,
  actor_class TEXT NOT NULL, run_id TEXT, detail_json TEXT NOT NULL, occurred_at TEXT NOT NULL
) STRICT;
```

Repository 只允许这些 Run 转移：`Queued→Running|Cancelled`、
`Running→Cancelling|Completed|Failed`、`Cancelling→Cancelled|Failed`。所有更新使用
`WHERE run_id=? AND generation=? AND state IN (...)`，影响行数必须恰为一；终态不可回退。进入任何终态的
同一事务必须已经存在同 generation Result。非 discussion Run 的 intake 固定 Disabled；discussion Run
按 `Open→Closing→Closed` 单向转换，只有 Open 可新增 turn，只有 Closing 可发布正常 Result。migration 以
`PRAGMA user_version=2` 为当前基线；v1→v2 增加 `Abandoned` discussion turn 状态。升级时先备份、独占
instance lock、单事务执行并在成功后更新 generation；失败保持旧库可读且 worker 不启动。

全文 instruction、Result 和必要事件内容受同一 retention policy；大附件不进 SQLite，只保存受控
workspace path、Matrix MXC ref、digest、size 和 MIME。任何未知字段不会默认为零或成功。

### 7.3 提交协议

Run 创建事务前先完成 JSON/Schema 和单一 principal 验证。随后：

1. `BEGIN IMMEDIATE`，按 `task_id` 查 `tasks`；
2. tombstone 返回 `Gone`；存在完整定义时按 §7.1 规则比较：相同直接返回原 Run，且不重新检查动态受理条件；
   不同返回 `TaskConflict`，不得覆盖、重启或创建第二个 Run；
3. 仅当 ID 不存在时检查 deadline、实例 policy、discussion verified fact、依赖 ready fact 和 queue capacity；
4. 插入 `tasks`、Queued `runs` 和初始 generation；普通任务 intake=Disabled，discussion 任务 intake=Open
   并同时写 trigger event 对应的初始 Pending turn；
5. commit 后固定返回 202。未创建任务的 422/429/503 可用同一 `task_id` 重试；新逻辑任务必须换新 ID。

领取事务：

1. `BEGIN IMMEDIATE`；确认 singleton slot 空闲且 Run 仍 Queued；
2. 增加 lease epoch，绑定 owner/boot id/run id；
3. 建立或读取 `run_sessions`，Run 进入 Running 并增加 generation；
4. discussion 首次 accept 在一个 Harness operation 中写 typed instruction 与初始 `PikoDiscussionMessage`；
   Pi commit 后按 transcript event_id 把初始 turn 标为 Consumed；
5. commit 后才允许 Pi 或工具动作。

Result 协议分两个 durable commit：

1. fence 新步骤、对账在途动作、计算固定 Result，在 `results` 插入唯一 generation；
2. 以相同 result generation 把 Run 提交到终态并释放 slot；discussion intake 同事务改为 Closed。

两步间崩溃时，恢复器只补第二步；已有 Result 时绝不重新运行 Pi。

Queued cancel 在一个事务中写 cancel flag、零调用 Result、Cancelled state 并保持 slot 未取得。
Running cancel 只写 stop intent/Cancelling；worker abort 并完成对账后才能写终态。

## 8. 控制流、并发与时序

- HTTP handler 不持有长事务；SQLite writer transaction 只包围本地状态改变。
- 单 slot 保证一个 Running/Cancelling Run；读取 status/result 可并发。
- lease epoch 是 fencing authority；heartbeat/时间只用于检测，不可越过 epoch 判定。
- deadline 使用持久 UTC timestamp 判定，单次进程内 elapsed timeout 使用 monotonic clock。
- queue 采用 `accepted_at,run_id` 稳定顺序；不实现优先级或抢占。
- backpressure 在 Run 创建写事务内检查配置的 queue capacity，满时不创建 Run并返回 `QueueFull`。
- shutdown 先停止新受理，写 stop intent，等待有界 drain；超时后 abort，不能把进程退出当成 Run 已停止。

Pi JSONL 与 SQLite 无法形成跨存储事务，因此使用确定性 identity + probe：`pi_session_id=run_id`、lane
`main`、initial operation `run_id:initial`、discussion operation `run_id:turn:<turn_seq>`。Pi commit 永远先于
Task Store 的观察更新；恢复时依次检查 Harness open operations、`getResult(operation_id)`、transcript/queues
和 tip，存在则补交 SQLite，均不存在才允许 accept/enqueue。不得依赖 Pi 自动拒绝重复 operation ID。

## 9. Pi、LLMTier、Matrix 与文件实现

### 9.1 Pi/LLMTier

- `pi-adapter` 固定 Pi upstream version/commit、Piko adapter patch manifest/hash 并验证 startup fingerprint；
  使用 `AgentHarness.create` + `JsonlSessionRepo` 公共面，不复制 Agent loop。
- 注入 `PikoDurableFileSystem`；JSONL append 后 fsync 文件，create/rename 后 fsync 文件与父目录。
- `before_request{runId:piOperationId,stepId,attempt}` 做 deadline/budget CAS；Piko Run 由 session binding取得；`streamOptions.maxRetries=0`，Harness retry
  policy 产生下一 attempt。无 Pi effect intent 的孤立 reservation 在恢复时释放。
- `before_tool{runId:piOperationId,toolCallId}` 以 operation/toolCall ID 对 `tool_calls` 做 CAS；Piko Run 由session binding取得；同 logical call 的恢复重放
  复用记录且不再次占预算，超限返回 block+terminate。Harness intent/outcome observation推进状态。
- `onRawUsage` 在 OpenAI Responses normalization 前更新同一 attempt；response/request identity 去重。
- Harness 已提交的 orphaned assistant effect只从 frame prefix生成中断结果，不重新 dispatch。
- `supportsExplicitPromptCacheMode=false`、`cacheRetention:none`，三个 prompt-cache 字段不发送。
- typed prompt 直接传 `AgentMessage`，禁止调用 `skill`/`promptFromTemplate`；实例 system prompt 只提供
  任务约束说明，实际权限由 tool context 强制。

### 9.2 Matrix

- 只使用单一 configured identity；启动后验证 whoami/current membership。
- 每批 sync 在一个 SQLite 事务中写 event dedup、DiscussionTurn 和新 cursor；失败则 cursor 不推进。
- 自身 sender 或已知 txn/event echo 只写 dedup，不生成 DiscussionTurn。
- discussion 使用自定义 `PikoDiscussionMessage` 保存 `event_id`；provider projection 删除内部 identity，
  仅输出可见正文、reply context 和已验证附件引用。
- enqueue 前后扫描 Harness snapshot queues/transcript；同 `event_id` 已存在时只补 SQLite 状态。
- active operation 使用 `followUp`；idle lane 使用 `run_id:turn:<turn_seq>` accept 新 operation。
- `txn_id` 由 instance/run/turn/action identity 确定性生成，retry 复用。
- Pi idle 后以 `BEGIN IMMEDIATE` 检查 Pending/QueuedInPi；为空才把 intake `Open→Closing`。Matrix turn 插入
  同样要求 intake=Open，因此事件要么先入队阻止 closing，要么在 closing 后不再附着该 Run。

### 9.3 Workspace 与附件

- 请求 path 必须先通过 RelativePath schema，再相对已配置 workspace root 逐段解析。
- 打开文件时拒绝 symlink 越界、设备文件和 root 外真实路径；写入采用临时文件 + 同目录原子 rename。
- Matrix media 下载先验证 membership/event、声明和实际 size/MIME，再写入 Run 专属 staging 目录。
- staging 文件扫描/校验后才移动到允许路径；失败或取消时按 retention policy 清理。

## 10. 失败、恢复与可观测性

### 10.1 Result 投影

- `summary`：取最终成功 Harness operation 的最后一个 settled assistant message，将 text block 按原顺序
  以换行连接；失败/取消时取最后已提交的可见 assistant text，缺失则为空串。
- `outputs[]`：operation 停止后逐一打开 `output_paths` 中存在的 regular file，重新做 realpath/policy 校验，
  计算 SHA-256 与 size；未声明路径、目录、symlink、设备文件和校验失败文件不得发布。
- `known_actions[]`：从 Harness transcript/tool effect facts 投影。已有 tool result 为 Completed/Failed；
  `replay:"never"` intent 无 outcome 为 Unknown；不得从日志补写成功。
- `partial`：Completed 固定 false；Failed/Cancelled 只要 summary 非空、outputs 非空或存在 Completed/Unknown
  action 就为 true，否则 false。
- `usage`：在同一 Task Store snapshot 中按 §5 ledger 规则冻结；共享 semantic validator 必须在持久化前
  验证 attempts 数量、精确算术和 token 子集关系；Result 发布后不修改。

失败映射固定如下，先匹配更具体项；未知异常只能落到 `InternalError`：

| 来源事实 | `Failure.code` / `cause_class` |
|---|---|
| deadline 在 accept/drive/tool 前耗尽 | `DeadlineExceeded` / `TaskDeadline` |
| model/tool attempt 预算耗尽 | `BudgetExceeded` / `Budget` |
| 配置模型不存在、LLMTier/TLS/auth/网络不可达 | `ModelUnavailable` / `Dependency` |
| SSE/protocol/terminal event 非法 | `ModelResponseInvalid` / `ModelProtocol` |
| tool 返回明确 error 且无更具体终止原因 | `ToolFailure` / `Tool` |
| `replay:"never"` tool intent 无可核实 outcome | `UnsafeRetryBlocked` / `ExecutionUnknown` |
| Harness storage/invariant 无法证明最后执行状态 | `ExecutionStateUnknown` / `ExecutionUnknown` |
| Matrix membership/event/media authority 丢失 | `DiscussionAccessLost` / `Authorization` |
| 已确认取消且 Harness operation 已停止 | `CancelledByRequest` / `Cancellation` |
| Piko 内部错误且执行状态仍可证明 | `InternalError` / `Internal` |

### 10.2 恢复与可观测性

恢复决策固定顺序：Result → Run terminal facts/intake state → lease epoch → deterministic Pi session → Harness open
operation/result/transcript → model attempt/tool call ledger → Matrix cursor/turn。无法证明的外部副作用标 Unknown，不从日志推断成功。

日志为结构化 JSON，必须包含 event name、instance id、run id（若有）、generation/epoch 和 redacted error
class；禁止 instruction 正文、credential、access token、完整模型 input/output 和附件内容。审计记录状态改变、
credential ref 变更、强制 fence、schema migration 和 operator-authorized Responses probe。

最低指标：queue depth、Run state duration、slot/lease epoch、Harness operation/result generation、model/tool attempts、
usage quality、Matrix sync lag、dependency failures、recovery outcomes。告警阈值属于部署配置；未测量前不发布 SLO。

## 11. 资源、容量、性能与限制

- 单实例固定一个 execution slot；queue capacity 是本地保护值，不是跨系统 capacity contract。
- SQLite、Pi session 和 workspace 必须位于本地可靠文件系统；不支持 NFS 多 writer。
- instruction/Result/附件/队列上限由配置和外部 schema 较小者控制；拒绝超限而非截断语义数据。
- media 流式下载必须有字节上限；模型 stream 不整体缓存在内存。
- 性能基线在实现后测量；本设计不声明吞吐、延迟或可用性数字。

## 12. 安全与隔离

- HTTP 认证映射为稳定 client principal；授权取请求 permissions 与实例 policy 的交集。
- Secret provider 只按 reference 在进程启动/受控轮换时读取；Secret 不进入 config dump、DB、Result 或日志。
- tool profile 是 allowlist；shell/network/外部写权限默认拒绝，不能由 instruction 提升。
- 每 Run 使用独立 Pi session 和 workspace staging；不同 Run 不共享可写临时目录。
- Matrix membership、event visibility 和 media ACL 在接收与实际读取前分别复核。
- diagnostics 默认只读；restart、lease fence、migration、credential change 和真实 Responses probe 需要 operator 授权。

## 13. 实现映射与变更范围

第一阶段允许新增生产源码、migration、配置 schema 和测试；不得修改已批准外部 OpenAPI/Agent schema/error
catalog 来迁就实现。若代码发现现有契约无法实现，停止编码并提交 design change，不建立隐藏兼容分支。

实现顺序：

1. config + SQLite migration + repository transaction tests；
2. scheduler/lease/Result recovery；
3. Pi adapter + attempt/usage ledger；
4. HTTP four-operation surface；
5. Matrix discussion/media；
6. fault injection、security、operations packaging。

## 14. Verification、测试义务与证据

| Requirement | Design element | Verification method | Evidence | Status |
|---|---|---|---|---|
| PK-01/13 | single slot、isolated session | concurrency + isolation integration | implementation test report | NOT_RUN |
| PK-02/14 | TaskApi + machine contract | existing contract validator + HTTP E2E | test report | static PASS / E2E NOT_RUN |
| PK-03/04 | PiAdapter/RunCoordinator | pinned Pi integration + budget/deadline injection | test report | NOT_RUN |
| PK-05/06 | tool intent/result + Result protocol | crash/fault injection | test report | NOT_RUN |
| PK-08 | Matrix adapter/turn protocol | homeserver integration + crash replay | test report | NOT_RUN |
| PK-09/10 | Responses SSE + UsageLedger | LLMTier integration + missing/late usage | test report | NOT_RUN |
| PK-11 | no Memory write interface | static dependency/API scan | build evidence | NOT_RUN |
| PK-12 | recovery/operator boundary | restore and authorization tests | operations evidence | NOT_RUN |

必须实现测试规格 PK-T01..PK-T40；静态 oracle 不替代真实 crash、Matrix、LLMTier、security、retention
和 performance evidence。

## 15. 设计完整性检查与实现 Gate

- [x] SQLite logical DDL、状态约束、migration与事务顺序已定义。
- [x] Pi additive patch 只补 stable stepId 与 raw usage observer，不替换 provider adapter。
- [x] Matrix 只有 Client-Server 单路径。
- [x] 无 retired 字段、endpoint、fallback 或第二 backend。
- [x] config schema 不允许 credential 明文或外部 model selector；tool recovery ref 启动时必须绑定已注册实现。
- [x] 所有副作用都有 Harness intent/result/Unknown 路径。
- [x] 文档如实标注为设计阶段，不声称已有生产实现或运行证据。

实现前 Gate：本文与配置 schema 获 Piko Project Owner 批准。实现完成后的 Node/依赖 lock、构建制品、
安装命令、SLO 数值和运行证据由实现/发布材料记录，不反向伪造为当前设计证据。
