覆盖原消息 ID：S-20260917-a45d9a6a218f。

# Piko 第二轮固定快照自评

结论：**AMENDMENT**。已完成 `snapshot-manifest.json` 所列 Piko 当前 authority、机器契约、验证材料以及固定 Pi 依据的全文/源码定向审查。本轮只新增评审记录，没有修改设计正文、机器契约或实现；`runtime_activation=false`。

## 基线与验证

- 快照清单：`/Users/ben/work/piko/.review-materials/piko-round2-20260917/snapshot-manifest.json`。
- Git branch/head/base：`docs/piko-system-design-std26` / `4c63380f944e41d0047e9f47340689a182b62fba` / 同一 commit；简化设计是未提交 dirty working-tree 快照。
- 当前任务机器契约：`0.3.0-simplified.1`；LLMTier 消费文档与评审包：`0.3.0-simplified.2`；Pi：`0.85.1` / `9767ba275f3e9a5ee0f5c5342249b629ab1b2282`。
- `python3 tests/contract/validate_v03_contract.py`：PASS。
- JSON/YAML parse：PASS。
- fallback Git `diff --check`：PASS。
- `python3 -m pytest -q tests/contract`：没有收集到 pytest case；当前验证器是直接执行的 assertion script，不能把 “no tests ran” 写成 pytest 通过。
- 最新 `/Users/ben/work/STD/scripts/validate-design --project-root /Users/ben/work/piko --require-immutable-std`：发现 54 项新问题，主要是锁定 draft.21 无法在当前 STD checkout 解析、source manifest 与当前 STD 不一致、当前独立模板版本变化，以及旧首轮评审材料被项目级发现器扫描。此结果未被伪报为通过。

## 必须修正

### PK-R2-PK-01 — P0 — 外部请求的必填 `model` 让 Slinky 越过 Piko 控制模型选择

**位置**：`docs/60_interfaces/contracts/piko-v0.3-field-usage.md` 29–35；`interfaces/schemas/agent-runtime-v0.3.schema.json` 的 `AgentTaskRequest`；系统设计 §1、§4。

**证据**：共同边界规定 Piko 管 Agent 上下文、模型调用与执行内重试，Slinky 不越过 Piko 介入单次模型调用；但当前请求把 `model` 设为 Slinky 必填并解释为“Slinky 选择、Piko 校验”。这不是任务目标或能力需求，而是模型控制面。

**影响**：Slinky 将被迫理解 LLMTier model ID、可用性和切换策略；Piko 无法独立按 Agent profile/能力与运行条件管理模型，且后续容易重新引入跨系统模型管理。

**最小修改**：从 Slinky→Piko 的 `AgentTaskRequest` 删除 `model`。每个 Piko 实例在自身受控配置/Agent profile 中解析当前模型；若未来确有调用方选择模型的产品需求，先按“需求、标准不足、最小扩展、成本兼容”另行审批，不预留 optional 字段。

### PK-R2-PK-02 — P1 — Usage 把“未知”强制编码为 0，且 `input_tokens` 口径与 Pi 实际值不一致

**位置**：系统设计 §6；消费契约 §2.2/§3；`interfaces/schemas/agent-runtime-v0.3.schema.json` 的 `TokenUsage`；固定 Pi `openai-responses-shared.ts::finalizeResponse`。

**证据**：Schema 要求 `input_tokens/output_tokens/total_tokens` 都是非负整数，只有 cache 可 null；但消费文档要求缺失 usage 为未知。Pi 在无 usage 时保留初始化的 0，并在有 usage 时把 `input` 计算为 provider `input_tokens - cached_tokens - cache_write_tokens`，而 Piko 字段名仍叫 `input_tokens`，没有说明它是非 cache input 还是 provider total input。

**影响**：未知会被误报为零；Piko 与 LLMTier/Slinky 对 input/cache/total 的求和会重复或漏计，任务级统计不可审计。

**最小修改**：定义唯一口径与完整性状态。未知或部分事实必须可表达为 null/Unknown/Partial；明确 `total_tokens` 是否沿用 provider total，以及 input、cache read/write 的互斥/包含关系。用固定 Pi 有 usage、无 usage、部分 cache 字段和重放同一 response identity 的正负 oracle 验证。

### PK-R2-PK-03 — P1 — “重启后继续原任务”缺少 Run→Pi session 与执行提交点设计

**位置**：系统设计 §3；内部设计 §2–3；V&V plan §2–3。

**证据**：正文承诺重启扫描非终态 Run 并重新打开“对应 Pi session”，但 Task Store 数据结构未定义 durable `run_id→pi_session_id/session file/version/last committed entry` 关系，也未说明 assistant 流、tool start/result、usage 与 Result generation 的原子边界。Pi `SessionManager` 能持久 session，并不自动提供 Piko task recovery。

**影响**：崩溃点无法判断应继续、补写结果还是失败；可能重复工具副作用、漏记 usage，或打开错误 session。把它称为 Pi 原生能力会掩盖 Piko 必须实现的薄持久化协调。

**最小修改**：只在 Piko 内部设计中增加最小 durable RunSessionRecord 和提交点，不新增外部协议：固定 session ID、当前 session entry/version、worker lease/attempt、最后安全 checkpoint、在途模型/工具事实、恢复决策与 Result generation。列出 crash-before-session、mid-stream、tool-start-before-result、result-published-before-run-terminal 四个 oracle。

### PK-R2-PK-04 — P1 — Run/Result Schema 允许正文禁止的状态组合

**位置**：`interfaces/schemas/agent-runtime-v0.3.schema.json` 的 `RunView`、`AgentResult`；系统设计 §3；契约 §1/§3。

**证据**：Schema 可接受 `Queued` 但 `started_at/finished_at` 非 null、`Completed` 但 `result_available=false`、非终态但 `finished_at` 非 null；`Cancelled` 可带任意 Failure code；`partial` 与 state/failure 没有约束。现有 validator 只检查 Completed+failure，不覆盖这些组合。

**影响**：Slinky 无法仅凭机器契约判断任务是否真正终态、结果是否可取或取消含义；不同实现会产生互不兼容的状态。

**最小修改**：用 JSON Schema if/then 和 semantic fixtures 固定状态时间/result/failure/partial 矩阵；Cancelled 只允许取消或已知停止失败的明确规则。不要增加新状态机，只把现有六状态写成可验证不变量。

### PK-R2-PK-05 — P1 — 原生 Matrix 方向正确，但当前设计不足以独立实现

**位置**：系统设计 §5；内部设计 §4；需求 PK-08；V&V PK-T11。

**证据**：仅列 invite/join/membership/sync/text/reply/media/leave，没有固定采用的 Matrix SDK/Client-Server 版本、identity/token owner、sync cursor 与事件去重持久化、发送 txn id、membership/revocation 的 fail-closed 行为、media MXC/ACL 到 workspace read path 的授权交接。当前仓库也没有 Matrix adapter 实现或依赖清单。

**影响**：实现者仍需自行决定最关键的安全和重启语义；“使用原生 Matrix”不足以避免重复回复、撤权后继续读取或把 MXC 当文件权限。

**最小修改**：保持 Matrix 标准机制，不恢复 Topic/SID/RID/outbox/trigger。补一份内部 adapter 设计，固定现有 SDK/标准 API 子集、credential owner、sync cursor/txn 去重、membership gate、media 下载后的 workspace 授权边界和错误处理；实际 SDK 选择若尚未决定，作为明确跨方/下游裁决，不声称已具备。

### PK-R2-PK-06 — P1 — Current authority 与旧 STD/migration authority 仍冲突

**位置**：`docs/98_migration/current-document-inventory.md`；`docs/98_migration/piko-std-migration-map.md` 8–17、28–36；`docs/00_management/piko-std-tailoring-v0.1.md` 58–81；`docs/std.lock.json` 与 `docs/std-source-manifest.json`。

**证据**：current inventory 声明 CollaborationBridge 已退休且仅在 Git 历史，但仍在当前树中的 migration map/tailoring 把已删除的 collaboration mechanism 当 residual authority，并保留 exclusive room、structured resolution、durable delivery、UnknownOutcome 等旧必需项。项目仍锁 draft.21；当前 STD validator 无法解析该 revision/source manifest，并报告模板版本不匹配。

**影响**：README 与管理/STD authority 给出两套相反实施依据，且“符合最新 STD”无法成立；后续生成、RAG 或 reviewer 仍会恢复已取消机制。

**最小修改**：一次性更新 current authority、migration map、tailoring 和 STD lock/source manifest；把旧机制只保留为有明确 superseded 标志的历史记录。按当前 STD 独立模板迁移受影响文档，并让 review-materials 排除项目 authority 扫描。不要用新兼容分支保留旧义务。

## 下游细化/建议

### PK-R2-PK-07 — P2 — LLMTier 标准子集仍有一个未冻结的模糊扩展点

**位置**：消费契约 §2.1–2.2、§5；系统设计 §4/§9。

**证据**：固定 Pi 代码证明 SSE、function tool/result 和 usage 的基础路径；但正文仍写 provider continuation “需要时才透传”，没有当前需求或字段。Pi 当前 full-input、`store:false`、`cacheRetention:none` 基线不需要把 continuation 提升为共同契约。

**影响**：这会成为未确认 optional 协议入口，与“有理由就做、没有就不做”的设计原则冲突。

**最小修改**：当前版本明确不使用 provider continuation；以后如固定 Pi/模型真实需要，再走显式变更评审。LLMTier 的 candidate 需只按实际 SSE 子集对齐。

## 结论与限制

本轮全文自评完成，结论为 AMENDMENT：6 项必须修正、1 项建议收紧。没有要求恢复容量/Seat/Invocation、产品消息协议或其他已退出机制，也没有把缺生产 capture 当成本轮设计缺陷。正式修改应在本轮三方意见收齐后由 Piko owner 集中实施，再重新生成唯一机器版本、复审、提交并 push。
