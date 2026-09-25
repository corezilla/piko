<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko v0.3 需求追踪矩阵

> STD 使用入口：[项目采用说明与标准导航](../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-requirements-traceability-v0.3` |
| Document Version | `0.4.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Project Owner |
| Authors | corezilla |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-25` |
| Template ID | `requirements.traceability` |
| Template Version | `0.2.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/10_requirements/piko-requirements-traceability-v0.3.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

- Document ID: `piko-requirements-traceability-v0.3`
- Version: `0.4.0`
- Status: Approved

| ID | 需求 | 设计 | 机器/验证 |
|---|---|---|---|
| PK-01 | 一个 Piko 实例管理一个 Agent | System §1 | 单任务 schema 不含 team/participant |
| PK-02 | 提交、查询、取消、结果四项任务面 | System §2 | OpenAPI 四 paths |
| PK-03 | 复用 Pi session/context/tool/retry；每个 Run 隔离 session | System §2-3 | 内部设计 §1-3；PK-T07/15/16 |
| PK-04 | 期限/模型预算/逻辑工具调用预算/工具安全内尽力完成 | System §3 | RunLimits、tool call ledger、failure fixture；PK-T05/37 |
| PK-05 | 未知副作用不盲目重试 | System §3 | `UnsafeRetryBlocked` oracle |
| PK-06 | 失败返回原因、部分结果、已知动作 | System §3、6 | AgentResult schema |
| PK-07 | Slinky 决定失败后的业务动作 | System §3 | 不存在 expert escalation API |
| PK-08 | 标准 Matrix 身份、房间消息、reply、media；起始事件只进入Pi一次；只有Open的显式讨论任务可持续消费 | System §5 | discussion schema；PK-T11/17/18/38/39 |
| PK-09 | 标准 OpenAI-compatible LLMTier | System §4 | consumption contract |
| PK-10 | 任务级 token usage，无 Cost；缺失为 Partial/Unknown 而非零 | System §6 | TokenUsage schema；PK-T10/19 |
| PK-11 | Memory 更新为普通任务，Slinky 为 authority | System §6 | 无 memory endpoint |
| PK-12 | Piko/Pi 内部诊断恢复不交给 Slinky | System §7 | 运维设计/故障注入（后续） |
| PK-13 | 一个逻辑实例同一时刻只执行一个 Run；历史按稳定 run_id 查询 | System §2-3 | RunSessionRecord；PK-T15/20 |
| PK-14 | 终态、结果、取消与错误码组合可机器判定 | Contract §3-5 | Schema invariants/error matrix；PK-T09/21 |
| PK-15 | `task_id` 全局唯一且一对一绑定不可变任务与 Run；重复提交不创建或重启执行 | System §2；Contract §1 | Schema `task_id`；PK-T03 |
| PK-16 | Piko 是 Slinky 与 Pi 之间的任务事务层：负责受理、持久状态、恢复边界和结果封装；Agent 循环、上下文和执行内尝试复用 Pi | System §1-3 | Internal §1-3；Implementation §2-4；PK-T03/07/20 |
| PK-17 | 使用固定 Pi AgentHarness 的 durable session、operation、retry 与 tool replay；Piko 不复制第二套执行状态机 | System §2-4 | Implementation §4/9；PK-T05/07/13/35 |
| PK-18 | 第一阶段 API 只接受配置中的一个 Slinky bearer principal，凭据仅以 SecretRef 配置 | Contract §2 | runtime config schema；PK-T33 |
| PK-19 | task_id 永不复用；详细任务/结果过期后永久保留最小 tombstone 并返回 Gone | System §2/7；Contract §5 | error catalog；PK-T31/32 |
| PK-20 | 非只读工具仅在recovery contract引用成功绑定已注册实现且匹配实际工具时允许safe replay | System §3 | tool profile schema/startup binding；PK-T34/40 |

明确退出的旧需求：跨系统 capacity/claim/Seat、Session binding/drain/release、产品消息 envelope/trigger、Piko content service、模型 Invocation recovery、SourceInstance、compatibility/readiness 管理面。历史追踪只说明迁移，不进入当前验收。
