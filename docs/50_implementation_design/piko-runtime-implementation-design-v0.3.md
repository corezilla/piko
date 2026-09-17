<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Runtime V0.3 实现级设计

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-runtime-implementation-design-v0.3` |
| Document Version | `0.1.0-draft.1` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Implementation Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner |
| Created Date | `2026-09-17` |
| Last Modified Date | `2026-09-17` |
| Template ID | `design.definition` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/50_implementation_design/piko-runtime-implementation-design-v0.3.md` |
| Supersedes | none |

> 本文细化已批准的 `0.3.0-simplified.5`，不改变四项外部 API、状态机、Pi/Matrix/LLMTier
> 边界或 Runtime Activation。若实现需要偏离本文，必须先修改设计并重新评审。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目的、范围与上位输入

本文把已批准的总体设计和 Runtime Core 内部设计落实为可编码的单路径方案，覆盖模块划分、
Task Store、事务与恢复、Pi/Matrix/LLMTier adapter、配置、安全、部署、可观测性和验证映射。

上位 authority：

- `piko-agent-runtime-design-v0.3`：系统边界与全局策略；
- `piko-agent-runtime-core-internal-design-v0.3`：Run/session/checkpoint/usage/Matrix 顺序；
- `piko-agent-runtime-contract-v0.3` 与机器契约：外部字段、状态、错误和不变量；
- `piko-runtime-release-and-operations-v0.3`：发布、恢复与激活 Gate。

范围外：多 Agent、多 execution slot、远程/共享数据库、分布式队列、Matrix Application Service、
模型 non-stream fallback、跨系统 exactly-once、产品 Topic/SID/RID 和正式 Memory authority。

## 2. Ownership 与边界

- 负责：四项 HTTP API、单 slot 调度、Task Store、Pi session 绑定、policy、usage、Matrix discussion
  adapter、稳定 Result、内部诊断和恢复。
- 不负责：Slinky 业务流程与 Memory、LLMTier Agent 状态、Matrix homeserver、工具自身业务语义、
  supervisor/Secret backend 的实现。
- authority：机器契约优先于本文；本文只定义内部实现，不新增调用方可见字段。
- 单路径约束：每项职责只有一个生产实现；测试 fake 只能通过同一内部 interface 注入。

## 3. Current Baseline 与 Approved Delta

当前仓库没有生产代码。首个实现采用：

- TypeScript/Node.js，与固定 Pi SDK 在同一进程集成；构建时用 lockfile 固定实际 Node、Pi、
  `matrix-js-sdk`、SQLite driver 和所有传递依赖；
- 一个 API/scheduler/worker 进程服务一个逻辑 Piko 实例和一个 Agent execution slot；
- 本地 SQLite Task Store，WAL 模式、foreign keys、busy timeout、同步持久化；
- Pi 原生 session store 保存 Agent history/checkpoint；Task Store 只保存绑定与提交事实；
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
                         RunWorker/TaskLoop
                      /          |          \
                PiAdapter   MatrixAdapter   UsageLedger
                    |             |             |
             Pi session store  matrix-js-sdk  ModelAttempt rows
                    |
             LLMTier Responses SSE
```

主流程：

1. `TaskApi` 认证、规范化并校验请求，`RequestPolicy` 计算 canonical digest。
2. `TaskRepository.createOrGetRun` 在单事务内完成 task-key/client-task 去重并写 Queued Run。
3. `SingleSlotScheduler` 以 lease epoch 取得唯一 slot；`RunWorker` 创建或恢复 Pi session。
4. `TaskLoop` 在每个外部副作用前写 durable intent，在 checkpoint 后提交对应 generation。
5. Result publisher fence writer、固定 usage/output/known actions、写 immutable Result，再提交终态。
6. 恢复器只从 SQLite 与 Pi durable checkpoint 对账，不从日志猜测成功。

## 5. 内部分解与依赖

| 模块 | 提供 | 只允许依赖 |
|---|---|---|
| `bootstrap` | 配置加载、schema migration、preflight、进程生命周期 | config、store、adapters |
| `task-api` | 四项 HTTP operation | auth、policy、task-repository |
| `policy` | request/path/tool/deadline/budget 判定 | config、纯函数库 |
| `task-repository` | Run/lease/session/result/ledger 事务 | SQLite adapter |
| `scheduler` | 单 slot 领取、续租、fence、排队 | task-repository、clock |
| `run-worker` | task loop、取消、deadline、Result 发布 | repository、Pi、Matrix、policy |
| `pi-adapter` | session create/open/checkpoint/abort、raw usage hook | 固定 Pi SDK、LLMTier client config |
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
  createOrGetRun(input: CanonicalSubmission): Promise<CreateRunOutcome>;
  acquireSlot(ownerId: string): Promise<Lease | null>;
  renewLease(lease: Lease): Promise<Lease>;
  mutateRun(command: FencedRunCommand): Promise<RunRecord>;
  publishResult(command: FencedPublishResult): Promise<ResultRecord>;
}

interface PiRuntime {
  createSession(runId: string): Promise<PiSessionRef>;
  openSession(ref: PiSessionRef): Promise<PiSession>;
  appendEntryOnce(entryId: string, entry: PiEntry): Promise<void>;
  checkpoint(expectedGeneration: number): Promise<PiCheckpointRef>;
  abort(reason: AbortReason): Promise<void>;
}

interface MatrixRuntime {
  verifyDiscussionStart(context: DiscussionContext): Promise<VerifiedEvent>;
  syncOnce(cursor: string | null): Promise<MatrixBatch>;
  sendWithStableTxn(record: MatrixSendRecord): Promise<MatrixSendOutcome>;
}
```

所有 repository 写命令必须携带 `run_id`、expected Run generation 和有效 lease epoch；不匹配返回
内部 `FencedWrite`，不得自动覆盖。外部 HTTP typed error 仍由现有 error catalog 映射。

运行配置的机器约束位于
`interfaces/schemas/piko-runtime-config-v0.3.schema.json`。配置只允许 Secret reference，不允许
credential 明文。启动顺序为 parse → schema validate → canonicalize paths → open/migrate store →
dependency preflight → listen；任一步失败均不接受 Run。

## 7. 数据、状态与生命周期

### 7.1 SQLite 规则

- 每个逻辑实例一个数据库文件；进程以独占 instance lock 防止两个 supervisor 实例误用同一文件。
- 启用 `foreign_keys=ON`、WAL、busy timeout；提交关键事实时使用同步 durability。
- 所有 schema 变更使用单调整数 `schema_generation` 和前向 migration；migration 前备份并禁止 worker。
- JSON 列写 canonical UTF-8 JSON；digest 使用机器契约规定的 canonical request bytes。
- token、API key、Matrix access token、下载 credential 不进入数据库。

### 7.2 最小关系模型

| 表 | 主键/唯一约束 | 关键字段 |
|---|---|---|
| `instance_meta` | `key` | schema generation、instance id、boot id |
| `runs` | `run_id`; unique client/key hash; unique client/task id | request digest/json、state、generation、cancel flag、timestamps、limits |
| `run_sessions` | `run_id`; unique `pi_session_id` | session version、checkpoint generation/ref、lease epoch |
| `execution_slot` | singleton `slot_id=1` | run id、owner id、lease epoch、heartbeat、state |
| `results` | `run_id`; unique `(run_id,generation)` | terminal state、canonical result JSON/hash、published time |
| `model_attempts` | `(run_id,attempt_id)`; unique ordinal | Started/UsageObserved/Terminal/Unknown、raw usage presence/value、record version |
| `tool_actions` | `(run_id,action_id)` | intent、idempotency class、status、result/evidence ref |
| `matrix_state` | singleton identity | sync cursor、membership snapshot version |
| `matrix_events` | `(room_id,event_id)` | sender、txn id、visibility fact、observed time |
| `discussion_turns` | `(run_id,event_id)`; unique `(run_id,turn_seq)` and entry id | Pending/Consumed、checkpoint generation |
| `matrix_sends` | stable txn id | run/turn/action、payload digest、event id、state |
| `audit_events` | monotonic id | action、actor class、run id、redacted detail、time |

全文 instruction、Result 和必要事件内容受同一 retention policy；大附件不进 SQLite，只保存受控
workspace path、Matrix MXC ref、digest、size 和 MIME。任何未知字段不会默认为零或成功。

### 7.3 提交协议

Run 创建事务：

1. 查 client/idempotency-key hash；同 digest 返回原 Run，不同 digest 冲突；
2. 查 client/client_task_id；已绑定其他 key 则冲突；
3. 插入 Queued Run、唯一键和初始 generation；
4. commit 后才返回 202。

领取事务：

1. `BEGIN IMMEDIATE`；确认 singleton slot 空闲且 Run 仍 Queued；
2. 增加 lease epoch，绑定 owner/boot id/run id；
3. 建立或读取 `run_sessions`，Run 进入 Running 并增加 generation；
4. commit 后才允许 Pi 或工具动作。

Result 协议分两个 durable commit：

1. fence 新步骤、对账在途动作、计算固定 Result，在 `results` 插入唯一 generation；
2. 以相同 result generation 把 Run 提交到终态并释放 slot。

两步间崩溃时，恢复器只补第二步；已有 Result 时绝不重新运行 Pi。

Queued cancel 在一个事务中写 cancel flag、零调用 Result、Cancelled state 并保持 slot 未取得。
Running cancel 只写 stop intent/Cancelling；worker abort 并完成对账后才能写终态。

## 8. 控制流、并发与时序

- HTTP handler 不持有长事务；SQLite writer transaction 只包围本地状态改变。
- 单 slot 保证一个 Running/Cancelling Run；读取 status/result 可并发。
- lease epoch 是 fencing authority；heartbeat/时间只用于检测，不可越过 epoch 判定。
- deadline 使用持久 UTC timestamp 判定，单次进程内 elapsed timeout 使用 monotonic clock。
- queue 采用 `accepted_at,run_id` 稳定顺序；不实现优先级或抢占。
- backpressure 在创建 Run 前检查配置的 queue capacity，满时不创建 Run并返回 `QueueFull`。
- shutdown 先停止新受理，写 stop intent，等待有界 drain；超时后 abort，不能把进程退出当成 Run 已停止。

Pi checkpoint 与 SQLite 无法形成跨存储事务，因此使用确定性 ID + probe：写 SQLite intent，调用 Pi
append/checkpoint，再提交 checkpoint ref。恢复时先在 Pi session 查 entry/action identity；存在则补交 SQLite，
不存在才在安全边界内执行。

## 9. Pi、LLMTier、Matrix 与文件实现

### 9.1 Pi/LLMTier

- `pi-adapter` 固定 Pi version/commit 并验证 startup fingerprint；不复制 Agent loop。
- `options.fetch` wrapper 在网络 dispatch 前用 budget CAS 插入 Started attempt；插入失败则不发请求。
- raw terminal usage observer 在 Pi normalization 前更新同一 attempt record；response/request identity 去重。
- 首 SSE event 前按 Pi policy 有界 retry，每次真实 dispatch 新建 attempt；首 event 后不透明重放。
- `supportsExplicitPromptCacheMode=false`、`cacheRetention:none`，三个 prompt-cache 字段不发送。

### 9.2 Matrix

- 只使用单一 configured identity；启动后验证 whoami/current membership。
- 每批 sync 在一个 SQLite 事务中写 event dedup、DiscussionTurn 和新 cursor；失败则 cursor 不推进。
- 自身 sender 或已知 txn/event echo 只写 dedup，不生成 DiscussionTurn。
- `entry_id=sha256("piko-discussion-v1\0" + run_id + "\0" + event_id)`；稳定、不可从消息正文变化。
- `txn_id` 由 instance/run/turn/action identity 确定性生成，retry 复用。
- Pi idle 后在同一 store snapshot 检查 Pending；为空立即结束有限 Run。

### 9.3 Workspace 与附件

- 请求 path 必须先通过 RelativePath schema，再相对已配置 workspace root 逐段解析。
- 打开文件时拒绝 symlink 越界、设备文件和 root 外真实路径；写入采用临时文件 + 同目录原子 rename。
- Matrix media 下载先验证 membership/event、声明和实际 size/MIME，再写入 Run 专属 staging 目录。
- staging 文件扫描/校验后才移动到允许路径；失败或取消时按 retention policy 清理。

## 10. 失败、恢复与可观测性

恢复决策固定顺序：Result → Run terminal facts → lease epoch → Pi session/checkpoint → tool intent/result →
model attempt → Matrix cursor/turn。无法证明的外部副作用标 Unknown，不从日志推断成功。

日志为结构化 JSON，必须包含 event name、instance id、run id（若有）、generation/epoch 和 redacted error
class；禁止 instruction 正文、credential、access token、完整模型 input/output 和附件内容。审计记录状态改变、
credential ref 变更、强制 fence、schema migration 和 operator-authorized Responses probe。

最低指标：queue depth、Run state duration、slot/lease epoch、checkpoint/result generation、model/tool attempts、
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
| PK-03/04 | PiAdapter/TaskLoop | pinned Pi integration + budget/deadline injection | test report | NOT_RUN |
| PK-05/06 | tool intent/result + Result protocol | crash/fault injection | test report | NOT_RUN |
| PK-08 | Matrix adapter/turn protocol | homeserver integration + crash replay | test report | NOT_RUN |
| PK-09/10 | Responses SSE + UsageLedger | LLMTier integration + missing/late usage | test report | NOT_RUN |
| PK-11 | no Memory write interface | static dependency/API scan | build evidence | NOT_RUN |
| PK-12 | recovery/operator boundary | restore and authorization tests | operations evidence | NOT_RUN |

必须实现测试规格 PK-T01..PK-T29；静态 oracle 不替代真实 crash、Matrix、LLMTier、security、retention
和 performance evidence。

## 15. Review Checklist、未决项与 Gate

- [ ] SQLite schema/migration 与上述事务顺序一致。
- [ ] Pi hook 只观察 raw usage，不替换 provider adapter。
- [ ] Matrix 只有 Client-Server 单路径。
- [ ] 无 retired 字段、endpoint、fallback 或第二 backend。
- [ ] config schema 不允许 credential 明文或外部 model selector。
- [ ] 所有副作用都有 intent/result/Unknown 路径。
- [ ] runtime activation 仍为 false。

实现前 Gate：本文与配置 schema 获 Piko Project Owner 批准。实现完成后的 Node/依赖 lock、构建制品、
安装命令、SLO 数值和运行证据由实现/发布材料记录，不反向伪造为当前设计证据。
