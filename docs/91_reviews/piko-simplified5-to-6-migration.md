# Piko contract migration: simplified.5 → simplified.6

Status: **交接件**（交给 Slinky 侧升级用）
Author: Claude (2026-11-03)
Piko authority: `interfaces/schemas/agent-runtime-v0.3.schema.json` (`x-contract-version: 0.3.0-simplified.6`)

---

## 0. 一句话

**Slinky 的 piko 客户端 pin 在 `simplified.5`，piko 已经到 `simplified.6`。方向是 Slinky 升到 .6，不是 Piko 退回 .5。**

Slinky 侧证据（`slinky/src/framework/piko_client.py:180`）：

```python
# Pinned to Piko e721ac0, simplified.5. No negotiation with simplified.6.
```

Slinky 全部文档中**没有一处**提及 `simplified.6`——它不知道 Piko 已经改了。`.4` 和 `.5` 都有双方 acceptance 记录，`.6` 没有（Piko 侧 `docs/91_reviews/piko-v0.3-finalization-review-packet.md` 只覆盖到 `.5`）。

**Piko 侧不动 `.5` 兼容性**：`.6` 的 machine authority 四处一致（schema / OpenAPI / contract doc / fixtures），退回 `.5` 会撤销已批准的简化决策。

---

## 1. 变更总览

`git diff e721ac0 HEAD -- interfaces/schemas/agent-runtime-v0.3.schema.json`

| 维度 | simplified.5 | simplified.6 |
|---|---|---|
| 路径 | `POST /runs`、`GET /runs/{run_id}`、`POST /runs/{run_id}:cancel`、`GET /runs/{run_id}/result` | `POST /tasks`、`GET /tasks/{task_id}`、`POST /tasks/{task_id}:cancel`、`GET /tasks/{task_id}/result` |
| 请求身份 | `client_task_id`（**必填**） | `task_id`（**必填**） |
| 视图身份 | `run_id` + `client_task_id` | `task_id` + `generation` |
| 任务预算 | `limits: RunLimits{deadline_at, max_model_calls, max_tool_calls}` **必填** | **已删除** |
| 数据面 | 无 | `input_refs`、`artifact_target` |
| 输出模板 | 无 | `std_templates` |
| 状态视图 | `RunView`（9 字段） | `TaskView`（12 字段） |
| 结果 | `AgentResult`（10 字段） | `AgentResult`（11 字段 + `executions`） |
| 路径校验 | `RelativePath` 排除 `\u0000` | 排除 `\u0000-\u001F\u007F`（更严） |
| room_id | `!.*:.+` | `!room:server` 显式形式（Synapse ≥1.116 两种都收） |

**`limits` 被删不是遗漏**——是 PK-04 撤销的 wire 体现。`docs/10_requirements/piko-requirements-traceability-v0.3.md:39`：

> PK-04 | 期限/模型预算/逻辑工具调用预算/工具安全内尽力完成（**本版撤销**：不实现任务级截止/预算）

`src/types.ts:2` 亦有 `no task-level limits`。`.6` 删掉 `limits` 正是该撤销的对外表现。

---

## 2. Slinky 侧逐处改动

### 2.1 `slinky/src/framework/piko_client.py`

| 位置 | 现状（.5） | 改为（.6） |
|---|---|---|
| `:180` 注释 | `Pinned to Piko e721ac0, simplified.5. No negotiation with simplified.6.` | 更新 pin 说明到 `.6` |
| `_call` 路径 | `"/runs"`、`"/runs/" + run_id + suffix` | `"/tasks"`、`"/tasks/" + task_id + suffix` |
| `:541` submit | `self._call("POST", "/runs", body, {"Idempotency-Key": key}, ...)` | `"/tasks"`；`Idempotency-Key` header 可保留（见 §3） |
| `:542` 断言 | `result.client_task_id != request.client_task_id` → `TaskIdentityMismatch` | `result.task_id != request.task_id` |
| `:550` 断言 | `result.run_id != run_id` | `result.task_id != run_id`（`.6` 中 `run_id` 即 `task_id`） |
| `TaskRequest` 模型 | `client_task_id` + `limits: RunLimits` | `task_id: str`；**删除 `limits`** |
| `RunView` 模型 | `run_id`、`client_task_id` | `task_id`、`generation` |
| `RunState` | `RunState` 枚举 | `TaskState` 枚举（值相同：`Queued/Running/Cancelling/Completed/Failed/Cancelled`） |
| `AgentResult` 模型 | 10 字段 | 加 `executions: list[ExecutionFact]`（见 §2.4） |

`RunLimits` 类（`:199`）可整体删除。

### 2.2 `slinky/src/framework/runtime.py`

| 位置 | 现状 | 改为 |
|---|---|---|
| `:965` | `p.TaskRequest(client_task_id=key, instruction=..., ...)` | `p.TaskRequest(task_id=key, instruction=..., ...)`；去掉 `limits=` 参数 |
| `:539`（在 `piko_client.py` 内） | `c._require(deadline_at <= request.limits.deadline_at)` | 删除该断言（`.6` 无 `limits`）；deadline 由 Slinky 侧自行管理 |
| `submit()` 签名 | `submit(request, key, deadline_at)` | `submit(request, key)` |

### 2.3 `slinky/docs/50_implementation_design/units/runtime/piko.isd.md`

- `:47` — 「逐字段采用 Piko **simplified.5** Schema」→ 改 `.6`，并按 §1 更新字段表
- `:58` — 基线路径 `/runs` → `/tasks`；`Idempotency-Key=原submission_identity` 与 `client_task_id=原attempt.id` 两行需重写
- `:59` — 「仅允许绑定 origin；禁止重定向携带凭据，TLS验证不关闭」**不变**，Piko 侧同样遵守

### 2.4 `slinky/docs/60_interfaces/contracts/piko-test-task-scenarios.md`

- `:58` — 「以 Piko 当前 **`0.3.0-simplified.5`** Schema 为准」→ 改 `.6`
- 场景正文里的字段名按 §1 同步（`client_task_id` → `task_id`；`run_id` → `task_id`）

### 2.5 `slinky/src/framework/piko_client.py` 中的 `RunLimits` 与 `AgentResult`

`.6` 的 `AgentResult` 新增**必填**字段 `executions`：

```python
@dataclass(frozen=True, kw_only=True)
class ExecutionFact:
    tool_call_id: str | None
    command: str
    exit_code: int | None      # 未产生退出码时为 null（超时/中止/启动失败）
    status: str                # exited | timeout | aborted | spawn_error | policy_denied
    output: str                # Pi 层 stdout/stderr 已合并，无法分离
    truncated: bool
    timed_out: bool
    started_at: datetime
    ended_at: datetime
    duration_ms: int
```

`executions` 是**必填**（缺失则 schema 校验失败）。无 process 类执行时为 `[]`。

**语义要点（Slinky 侧消费时注意）**：

- `summary` 是**模型自述的自然语言**，**不构成执行判定依据**。判 Pass/Fail 必须用 `executions[]` + `outputs[]`
- `exit_code` 在 `status == "exited"` 时必有值；`timeout` / `aborted` / `spawn_error` 时为 `null`
- **SSH 客户端退出 ≠ 远端进程已停止**：`status=timeout` 或 `aborted` 时远端停止状态为**未知**，不得宣称已终止
- 任务声明了 `output_paths` 但一个都没回收 → 该任务是**失败**（Piko 侧已实现为 `state=Failed` + `ToolFailure`），不是成功
- **任一执行失败（非零退出 / 超时 / spawn_error / policy_denied）→ 该任务是 `Failed`**，即使 agent 声称成功、即使报告文件存在。这条已在 Piko 侧实现并实机验证。

**远程执行的状态语义**（`remote_bash`，MECH-TESTEXEC）：

ssh(1) 对**自己的失败**和「远程命令真的退出 255」用同一个退出码 255，Piko 靠 ssh 的 stderr 诊断区分。因此：

| 情形 | `exit_code` | `status` |
|---|---|---|
| 远程命令正常结束 | 0 | `exited` |
| 远程命令非零退出 | 实际退出码 | `exited` |
| 远程命令真的退出 255 | 255 | `exited` |
| **目标主机不可达 / 认证被拒** | `null` | **`spawn_error`** |
| 超时 | `null` | `timeout` |
| 主机或可执行文件不在白名单 | `null` | `policy_denied` |

**对 Slinky 侧的直接含义**：远端主机死机时，`executions[0].status == "spawn_error"` 且 `exit_code == null`，`output` 里是 ssh 的诊断（如 `ssh: connect to host … Operation timed out`）。这是「A7048 死了」和「测试跑过了但失败了」之间的判别依据——**前者 `exit_code` 为 null，后者有具体退出码**。

---

## 3. `Idempotency-Key` header 还需要吗

`.6` 的 `TaskRequest` **没有** `client_task_id` + `run_id` 双字段，但 **`.6` 的幂等规则是「同 `task_id` 比较任务定义字段」**：

> **幂等**：同 `task_id` 比较基于任务定义字段（含声明的 `input_refs` 与给定 `sha256`）；要内容级幂等，Slinky 必须给 `sha256` 或换新 `task_id`。
> —— `docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md` §2

`Idempotency-Key` header 在 `.6` 的 schema 中**不是必填**（`AgentTaskRequest` 无该属性），且 `additionalProperties: false` 意味着**多发该 header 不会进 schema**（header 不是 body 字段，所以安全）。Slinky 侧可继续发送以维持自己的客户端语义，**但幂等的权威依据是 `task_id`**。

**给 Slinky 的建议**：把 `Idempotency-Key` 的值继续设为原 `submission_identity`（UUID），并让它与 `task_id` 同值；这样 Slinky 现有的「同 key 重发返回同一逻辑任务」逻辑不必改。

**内容级幂等的额外要求**：若 Slinky 要求「同一逻辑内容重发不产生副作用」，必须给 `input_refs[].sha256`；否则仅靠 `task_id` 比较的是**声明的**定义，不是实际字节。

---

## 4. Piko 侧已有的实测证据

Piko 已在 m5air 上以 `.6` 实现跑通（`scripts/deploy-m5air.sh` 可复现）：

| 项 | 结果 |
|---|---|
| `tsc --noEmit` | 零错误 |
| `npm run test:node` | 121/121 pass |
| `npx vitest run` | 248 pass / 1 skipped / 0 fail |
| `python3 tests/contract/validate_v03_contract.py` | PASS |
| 活任务 | 模型写出 `reports/greeting.ts`，被捕获为带 sha256 的 `OutputArtifact` |
| 幂等 | 相同请求重发 → 同一任务，`model_attempts` 不变（**未重跑**） |
| 取消 | `StopRequested` → 终态 `Cancelled` + `CancelledByRequest` + `partial: true` |
| 执行事实 | `python3 -c "import sys; sys.exit(7)"` → `executions[0].exit_code = 7` |
| 报告缺失 | 声明 `reports/x.json` 未产出 → `state=Failed` + `ToolFailure`，尽管 agent 说 "done." |
| **远程执行（A7048 真机）** | `remote_bash` → `cat /etc/hostname` → `executions[0] = {status: "exited", exit_code: 0, output: "a7048-Super-Server\n"}` |
| **远端主机不可达** | `state=Failed` + `ToolFailure`；`executions[0] = {status: "spawn_error", exit_code: null, output: "ssh: connect to host … Operation timed out"}`；**piko 进程存活** |

---

## 5. Piko 侧 `.6` 之后的增量（不改变 `.6` 契约）

以下能力是 `.6` **之上**的增量，Slinky 升 `.6` 时**不需要**同步，但消费时可受益：

| 能力 | 位置 | 说明 |
|---|---|---|
| `permissions.executables` 强制执行 | `src/tool-exec-policy.ts` | 修的是「schema 声明了但运行时从未消费」的缺陷 |
| `remote_bash` 工具 | `src/remote-exec.ts` / `src/remote-exec-tools.ts` | SSH 远程执行；`remote_hosts` 独立白名单；远程执行**也进 `executions[]`** |
| `AgentResult.executions` | `src/execution-facts.ts` | **这是 `.6` 契约的一部分**（`executions` 已在 schema 中为必填） |
| **执行失败 → 任务失败** | `src/worker.ts` | 任一执行非零退出 / 超时 / spawn_error → `state=Failed` + `ToolFailure`，不再发布绿色任务 |

> 注：`executions` 已在 `.6` 的 schema 里（本次 V0.1.3 增量已并入 `.6` 的 `AgentResult`），所以 Slinky 升 `.6` 时**必须**能解析该字段。

---

## 6. 待 Slinky 侧确认

1. **Slinky 的 `run_id` 概念如何映射**——`.6` 只有 `task_id`。若 Slinky 内部用 `run_id` 表达「一次执行」，它对应 `.6` 的 `task_id` + `generation`（`generation` 在恢复重派时递增）。
2. **`RunLimits` 删除后的 deadline 归属**——Slinky 侧是否仍需自行强制 deadline？Piko 侧 `.6` 不提供任务级预算（PK-04 撤销），只提供**单次工具调用**的 timeout。
3. **`.6` 的复审**——`.4` / `.5` 都有双方 acceptance 记录，`.6` 没有。Slinky 升 `.6` 时需要补一次 acceptance，还是沿用「已实现 + 已实测」的证据？
