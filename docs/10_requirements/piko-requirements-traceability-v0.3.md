<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko v0.3 需求追踪矩阵
| 文档字段 | 值 |
|---|---|
| Document ID | `piko-requirements-traceability-v0.3` |
| Document Version | `0.4.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Project Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | `2026-09-17` |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-17` |
| Template ID | `requirements.traceability` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/10_requirements/piko-requirements-traceability-v0.3.md` |
| Supersedes | none |
<!-- STD_DOCUMENT_COVER_END -->

- Document ID: `piko-requirements-traceability-v0.3`
- Version: `0.4.0`
- Status: Approved

| ID | 需求 | 设计 | 机器/验证 |
|---|---|---|---|
| PK-01 | 一个 Piko 实例管理一个 Agent | System §1 | 单任务 schema 不含 team/participant |
| PK-02 | 提交、查询、取消、结果四项任务面 | System §2 | OpenAPI 四 paths |
| PK-03 | 复用 Pi session/context/tool/retry；每个 Run 隔离 session | System §2-3 | 内部设计 §1-3；PK-T07/15/16 |
| PK-04 | 期限/预算/工具安全内尽力完成 | System §3 | RunLimits、failure fixture |
| PK-05 | 未知副作用不盲目重试 | System §3 | `UnsafeRetryBlocked` oracle |
| PK-06 | 失败返回原因、部分结果、已知动作 | System §3、6 | AgentResult schema |
| PK-07 | Slinky 决定失败后的业务动作 | System §3 | 不存在 expert escalation API |
| PK-08 | 标准 Matrix 身份、房间消息、reply、media；只有显式讨论任务可持续消费 | System §5 | discussion schema；PK-T11/17/18 |
| PK-09 | 标准 OpenAI-compatible LLMTier | System §4 | consumption contract |
| PK-10 | 任务级 token usage，无 Cost；缺失为 Partial/Unknown 而非零 | System §6 | TokenUsage schema；PK-T10/19 |
| PK-11 | Memory 更新为普通任务，Slinky 为 authority | System §6 | 无 memory endpoint |
| PK-12 | Piko/Pi 内部诊断恢复不交给 Slinky | System §7 | 运维设计/故障注入（后续） |
| PK-13 | 一个逻辑实例同一时刻只执行一个 Run；历史按稳定 run_id 查询 | System §2-3 | RunSessionRecord；PK-T15/20 |
| PK-14 | 终态、结果、取消与错误码组合可机器判定 | Contract §3-5 | Schema invariants/error matrix；PK-T09/21 |

明确退出的旧需求：跨系统 capacity/claim/Seat、Session binding/drain/release、产品消息 envelope/trigger、Piko content service、模型 Invocation recovery、SourceInstance、compatibility/readiness 管理面。历史追踪只说明迁移，不进入当前验收。
