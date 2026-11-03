# V0.1.3 决策：测试执行能力（远程执行 + 执行事实 + 授权边界）

Status: **Approved, 待编码**
Author: Claude (sandbox session, 2026-11-03)
Version: V0.1.3（沿用，不升版本）
Related: `docs/91_reviews/piko-skill-auto-prefetch-decision.md`（V0.1.3 的另一个工作项）

---

## 1. 背景与触发

**分工**（用户明确）：slinky 安排测试计划、编写测试用例；Piko 负责**执行**。HIFM 只当作「一个推理环境」——piko 不读 HIFM 资料、不改 HIFM 仓库。

**部署拓扑**（用户决策）：

```
m5air                              A7048（实验环境，可死机）
├── slinky ──loopback HTTP──► piko ──SSH──► HIFM 测试执行
└── oMLX (9000) ◄── piko llmtier.base_url
```

理由：A7048 是实验环境，前期测试**很可能死机**。piko 跑在 m5air 上，A7048 挂掉时 piko 进程存活、能正常产出失败结果。

**职责方向**：piko **不调用 slinky 的工具**。slinky 委派任务给 piko，piko 执行，slinky 消费 piko 的 Result。
- `slinky/docs/30_subsystem_design/testing/design.md:143`：「外部仅消费各IR的普通Piko任务状态、结果和Usage」
- `slinky/docs/40_module_design/testing/execution/design.md:95`：「**不得修改 Piko/LLMTier 内部实现**」

---

## 2. 核心认识：piko 是 agent，不是测试框架

**这是本轮最重要的设计纠正**（用户纠正：「piko 不是 agent 吗? 测试计划和脚本里面有啊, slinky 让 piko 怎么测就怎么测啊」）。

piko **不需要**内置测试框架、测试 DSL，或专用 `test_exec` 工具。slinky 把整个任务装配成一段 `instruction` 文本发过来：

- `slinky/src/framework/runtime.py:830` `_assemble_instruction` —— instruction 就是 PM 决定的自由文本
- `slinky/docs/60_interfaces/contracts/piko-test-task-scenarios.md` PTS-04：「instruction 包含**命令输入、超时、预期报告 JSON 字段和停止条件**」

**agent 循环照常工作**：读到 instruction 里的命令 → 用 `bash` 跑 → 写 `reports/result.json` → 汇报。

### 两层边界（缺一不可）

| 层 | 谁决定 | 作用 |
|---|---|---|
| **instruction** | slinky（PM 决定） | **怎么测**——跑哪条命令、什么超时、报告什么字段 |
| **tool profile** | piko 侧 operator 配置 | **能跑什么**——`executables` 白名单、`remote_hosts` 白名单 |

「slinky 让 piko 怎么测就怎么测」说的是第一层。第二层是 piko 自己的授权边界——slinky 契约负向矩阵明确要求「不在 profile 的工具/操作 → 拒绝，不以模型文字绕过」。缺了第二层，agent 拿到一句「清理一下构建产物」的 instruction 就能执行 `rm -rf`。

---

## 3. 决策

### 3.1 D1：补齐远程执行能力（piko → A7048，SSH）

**为什么需要**：piko 在 m5air，测试要在 A7048 上跑。本地 `bash` 到不了 A7048。

**piko 已有全部 SSH 凭据机制**——`src/transfer.ts:94-113` 的 `scpArgs` 已经在做：
- 私钥物化到 0600 临时文件（`scpKeyPath`，`:53`）
- **host key 钉扎**（`StrictHostKeyChecking=yes` + `UserKnownHostsFile`）
- `BatchMode=yes`（不交互、不回退 ~/.ssh）
- `IdentitiesOnly=yes`（只用指定密钥）

SSH 命令执行需要的是**同一套凭据、不同的调用方式**。所以不是新建机制，是复用骨架。

**安全约束（与 transfer 一致，fail closed）**：
- 私钥与 known_hosts **必填**，缺失即拒（不 fallback 到 ~/.ssh）
- **host key 必须钉扎**，不允许 `StrictHostKeyChecking=no`
- **目标 host 白名单**：`remote_hosts` 独立 allowlist（与 `network_hosts` 对称但独立——远程执行目标主机 ≠ 网络出站目标）
- argv 数组、shell=false（不拼字符串，防注入）
- 输出有界（maxBytes/maxLines），超时强制终止并回收 SSH 客户端

**关键语义**：SSH 客户端退出 **不等于** 远端进程已停止。piko 必须如实报告「远端停止状态未知」，不能宣称已终止。

**工具形态**：新增 `remote_bash` 工具（参数 `{host, command, cwd?, timeout?}`），与本地 `bash` 分开——工具名不同，语义不同，profile 可分别启用。

### 3.2 D2：`permissions.executables` 强制执行（安全修复）

**这是真缺陷，不是新功能。**

`config/tool-profiles.json` 的 `bash` 声明了白名单 `["python3","pytest","node","npm","cat","ls","mkdir"]`；`interfaces/schemas/piko-tool-profile-v0.3.schema.json:54` 也声明了类型。但**除 schema 那一行外没有任何运行时代码消费它**。`src/tool-recovery.ts:100` 的权限处理**只做了 `network_hosts`**。

这与上一轮修复的 H2 `network_hosts` 未执行是同一类漏洞（schema 声明了、执行层没接）。后果：agent 可执行 profile 之外的任何命令。

**拦截点选 `before_tool` hook**（`src/pi-runtime.ts:207-218`），而非 Pi bash tool 的 `prepare` 钩子：`prepare` 在 `env.exec` 前调用，时序虽对，但 `before_tool` 已有 `block` 机制（可复用 `toolFailure` 终止语义），且能同时覆盖未来新增的 process 类工具。

**白名单语义**：按**可执行文件粒度**，不是命令内容粒度。`python3 -c "..."` 仍放行（预期行为，设计文档必须写明）。shell 链（`;` `&&` `||` `|`）逐条校验。远程 argv 是数组，解析更简单——直接取 `argv[0]` basename。

### 3.3 D3：执行事实（exit code / timeout / 时序）

**现状**：Pi 的 bash tool 在 `bash.ts:137-141` 把非零退出码转成 Error 文本 `"Command exited with code N"` 并 throw；`details` 只有 `{truncation?, fullOutputPath?}`。**数字 exit code 在 Pi 层就被丢掉了**。Pi 的 `prepare` 钩子在 `env.exec` 之前调用，因此也拿不到。

**正确接缝**：`src/durable-fs.ts` 的 `DurableNodeExecutionEnv extends NodeExecutionEnv` 是 **piko 自己的类**，只 override 了文件方法。override `exec()` 即可直接观察 `result.value.exitCode`，**零 upstream 改动**。

**边界**：Pi 层 stdout/stderr 已合并（`nodejs.ts:579-580`），无法分离。设计文档必须写明这个限制。

**HIGH risk 提示**：`DurableNodeExecutionEnv` 的 blast radius 是 HIGH（3 direct importer，触及 `worker.ts:run` 9 步与 `pi-runtime.ts:execute` 2 步两个执行流，4 个 module）。缓解：只**新增** `exec` override 并委托 `super.exec()`，不改现有路径行为；改完跑全量测试。

### 3.4 D4：原始结果的证据化

slinky 的 `TestExecution.raw_result_ref`（`execution.isd.md:47`）是 **Artifact 引用**。PTS-04 断言「报告携带实际结束时间、实际值、错误（可为 null）和已知 cleanup 事实；**超时、非零退出和报告缺失必须成为执行失败事实**」。

piko 现有 `output_paths` 机制能回收文件并给出 `sha256`/`size_bytes`（`src/types.ts:38` `OutputArtifact`），但**没有表达「超时 / 非零退出 / 报告缺失」这类执行事实的字段**。

**新增** `AgentResult.executions: ExecutionFact[]`，包含 `exit_code` / `status` / `timed_out` / `truncated` / 起止时间 / `duration_ms`。另加 `report_missing` 语义：任务声明了 `output_paths` 但一个都没回收成功 → 失败事实。

**不动 `collectOutputs`**（HIGH risk）：`results.result_json` 是自由 JSON blob，加字段无需 DB 迁移。

### 3.5 D5：协议版本对齐是**交接件**，不阻塞 piko 开发

**协议早就定义清楚了**，不是「没定义」。piko 侧有完整机器契约（schema + OpenAPI + contract doc + fixture 四处一致），当前 `x-contract-version: 0.3.0-simplified.6`。

**问题是版本错位**：slinky 的客户端 pin 在旧版——`slinky/src/framework/piko_client.py:180` 注释原文：「**Pinned to Piko e721ac0, simplified.5. No negotiation with simplified.6.**」；slinky 全部文档无一处提及 simplified.6。

**.5 → .6 的 breaking 变更**：

| 维度 | simplified.5 | simplified.6 |
|---|---|---|
| 路径 | `/runs` | `/tasks` |
| 身份 | `client_task_id` + `run_id` | `task_id` + `generation` |
| `limits` | `RunLimits{deadline_at, max_model_calls, max_tool_calls}` 必填 | **已删** |
| 数据面 | 无 | `input_refs` / `artifact_target` |
| 视图 | `RunView`（9 字段） | `TaskView`（14 字段） |

**`limits` 被删是 PK-04 撤销的 wire 体现**（`piko-requirements-traceability-v0.3.md:39`「本版撤销：不实现任务级截止/预算」），不是遗漏。

**方向已定**：piko 的 .6 是当前 authority，**slinky 升 .6**，不是 piko 退回 .5。依据：slinky 自己的规矩「不得修改 Piko/LLMTier 内部实现」。

**排序（用户明确：「piko开发完之后才会去升级slinky」）**：piko 侧开发全部完成，最后产出 `.5 → .6` 字段级迁移清单交给 slinky。piko 侧开发**不依赖** slinky。

### 3.6 D6：不做 Oracle 比较

slinky 的执行流程是：`资格和准入 -> Runtime执行 -> 原始结果/证据回收 -> 校验身份版本 -> 独立 Oracle 比较 -> Analysis`（`slinky/docs/40_module_design/testing/execution/design.md:61`）。

**Oracle 比较在 slinky 侧做**。piko 的职责止于「原始结果/证据回收」。`execution.design.md:63`：「不用自然语言成功声明替代记录」。

### 3.7 D7：PK-04 不恢复任务级预算

PK-04 撤销的是**任务级**截止/预算（模型/工具调用上限）。piko **不引入** `limits` 字段（`.6` 已删）。但**单次工具调用**的 timeout 要结构化暴露（Pi 已支持 bash schema 的 `timeout` 参数，只是 piko 没暴露结果）。这两件事不是一回事。

### 3.8 D8：不做 Docker 隔离

A7048 是实验环境，其隔离由 A7048 自身负责。piko 的责任边界是：**只跑白名单里的可执行文件、只连白名单里的 host、用钉扎的凭据**。

slinky 的 Tools 强制 Docker（`network=none`、`read-only root`、`cap-drop=ALL`），但那是 slinky 管的 **PR 环境**隔离，有完整的环境指纹/租约/清理机制。piko 是执行者，不是环境管理者。

### 3.9 D9：TLS 本轮不加

slinky 的 `validate_url`（`piko_client.py:32-37`）要求 HTTPS，或 HTTP 仅限 loopback。piko 与 slinky 同机（m5air）走 loopback HTTP → 无需 TLS。加 TLS 是独立决策。

---

## 4. 与 HIFM 场景的对应

| HIFM 需要 | piko 提供 | 状态 |
|---|---|---|
| 跑 slinky 指定的测试命令 | `remote_bash`（SSH → A7048）+ 现有 `bash` | D1 待编码 |
| 只能跑授权的 checker | `executables` 白名单强制 | D2 待编码（真缺陷） |
| 知道跑成功没有 | `ExecutionFact.exit_code` / `timed_out` | D3 待编码 |
| 原始报告可被 slinky 消费 | `output_paths` + `artifact_target` + `executions[]` | .6 已有 + D4 |
| 判 Pass/Fail | — | **slinky 侧做**（Oracle 比较） |
| A7048 死机时 piko 存活 | 拓扑保证 + 失败事实如实表达 | D1 + D3 |

---

## 5. 决策记录

| 日期 | 决策 | 理由 |
|---|---|---|
| 2026-11-03 | piko 部署在 m5air，不部署在 A7048 | A7048 是实验环境会死机；piko 存活才能产出失败结果 |
| 2026-11-03 | piko 自己实现 SSH 客户端，不调用 slinky 的 Tools | 依赖方向是 slinky → piko；slinky 文档明写「不得修改 Piko 内部实现」 |
| 2026-11-03 | 不内置测试框架 / 测试 DSL / `test_exec` 工具 | piko 是 agent，按 instruction 执行即可 |
| 2026-11-03 | `executables` 在 `before_tool` 拦截 | 复用现有 block 机制；覆盖所有 process 类工具 |
| 2026-11-03 | exit code 在 `DurableNodeExecutionEnv.exec` 捕获 | Pi bash tool 会丢弃数字 exit code；此接缝零 upstream 改动 |
| 2026-11-03 | 不引入 `limits` 字段 | PK-04 撤销；`.6` 已删；只暴露单次调用 timeout |
| 2026-11-03 | 不加 `/runs` 兼容别名 | `.6` 的 authority 是 `/tasks`；加别名会破坏「唯一外部任务面」 |
| 2026-11-03 | 协议对齐排在 piko 开发完成之后 | 用户明确「piko开发完之后才会去升级slinky」 |

---

## 6. 余项与风险

| 风险 | 缓解 |
|---|---|
| A7048 的测试代码如何同步（piko scp 推 vs A7048 自己 git checkout） | **已定**：A7048 自己 git checkout。A7048 是实验环境，代码由开发流程管理；piko 只负责在 A7048 上**执行**命令，不负责搬代码 |
| A7048 的 SSH 私钥（复用 `PIKO_SCP_KEY` vs 单独配） | **已定**：复用 `transfer.credential_ref`（不新增配置项）。m5air 部署脚本把工作站自己的 `~/.ssh/id_ed25519` 装成 `var/keys/id_a7048`，host key 从工作站 `known_hosts` 钉扎 |
| `DurableNodeExecutionEnv` HIGH blast radius | 只增不改；全量测试验证 |
| stdout/stderr 无法分离 | Pi 层已合并；设计文档写明限制 |
| piko 与 slinky 不同机时需 HTTPS | 记为部署约束；本轮同机不触发 |
| SSH 客户端失败与「远程命令真的退出 255」无法从退出码区分 | ssh 的 stderr 诊断可区分；因此 SSH 调用**不得**带 `-q`（quiet 会静音这些诊断） |
| 远端主机不可达时任务报 `Failed` 而非 `Completed` | 已实现：`executions[].status = spawn_error` + `exit_code = null`；worker 把 `execution_failed` 映射到终态 |

> 上述两条「已定」项的落地细节与实机验证见 `docs/91_reviews/v0.1-coding-notes-2026-10-18.md` §0.10.7。
