<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko v0.3 需求追踪矩阵

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-requirements-traceability-v0.3` |
| Document Version | `0.3.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Project Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | `2026-09-07` |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-08` |
| STD Version | `0.1.0-draft.18` |
| Template ID | `requirements.traceability` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/management/piko-requirements-traceability-v0.3.md` |
| Supersedes | none |
<!-- STD_DOCUMENT_COVER_END -->

## 1. 追踪范围

本矩阵连接现有 Piko v0.2/v0.3 需求/协议 ID、STD 候选设计、机器契约与验证证据。它不复制或取得
Slinky、LLMTier、Matrix 的 Owner authority。

## 2. Traceability Matrix

| Requirement / Need | Owner | Design allocation | Machine contract | Verification | 当前状态 |
|---|---|---|---|---|---|
| 唯一 Agent Runtime surface | Piko | `piko-agent-runtime-design-v0.3` | runtime OpenAPI/Schema v0.2 + Matrix v0.3 | contract validator + AR QA | Candidate |
| MX-013 cursor/filter | Piko | CollaborationBridge mechanism/internal definition | Matrix OpenAPI/Schema v0.3 | MX-U/C/R-013 | Validator evidence available |
| MX-014/015 structured resolution | Piko | CollaborationBridge mechanism/internal definition | Matrix Schema/fixtures v0.3 | MX-U/C/S-014/015 | Validator evidence available |
| MX-016 descriptor unavailable | Piko | CollaborationBridge mechanism | Matrix OpenAPI/error catalog v0.3 | MX-C-015 | Validator evidence available |
| Crash/retry/UnknownOutcome | Piko | system + mechanism + internal definition | typed errors and persisted identities | recovery/E2E cases | Planned/Blocked by runtime env |
| Consumed LLMTier invocation | LLMTier fields; Piko adapter | Agent Runtime system design | reviewed Piko-facing bundle | adapter contract/E2E | Semantics reviewed; activation false |
| Project/IR/Decision/Acceptance | Slinky | external context only | Slinky-owned | Slinky acceptance | Outside Piko authority |

## 3. Coverage gaps

- SessionSummary/CloseResult enum alignment remains a contract/runtime gate.
- Real Matrix, database crash/restart, credential isolation and LLMTier E2E evidence do not yet exist.
- Immutable reviewed Piko commit is `f2bb0937f31a27c36ecc1adefc31b1b78b6dc722`;
  document approval does not close the listed contract/runtime evidence gates.
