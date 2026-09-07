<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko STD Publication and RAG Review Packet

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-std-publication-packet` |
| Document Version | `0.1.0-draft.1` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Publication/RAG Owner |
| Authors | corezilla |
| Reviewer | STD reviewer |
| Created Date | `2026-09-08` |
| Last Modified Date | `2026-09-08` |
| STD Version | `0.1.0-draft.18` |
| Template ID | `review.packet` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/review/piko-std-publication-packet.md` |
| Supersedes | none |

> 本 packet 只审查 PUB-01 的 canonical publication manifest、include/exclude、ACL 与检索契约。
> 它不修改 CP-01 内容，不执行 Runtime Activation，也不把未运行的外部索引冒充为 PASS。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 决定目标与 immutable input

CP-01 已由 immutable commit `119aa51af60da32c2db8d27c53bbf2975ab12938` 固定并推送到
`corezilla/piko` 的 `main`。用户已在原 Piko 任务中单独批准 PUB-01；STD pre-commit Gate 仍须
对本 cohort 的精确文件集合和证据给出 `COMMIT_APPROVED`。

| 项目 | 值 |
|---|---|
| PUB-01 input commit | `119aa51af60da32c2db8d27c53bbf2975ab12938` |
| input tree | `9e014af426a61eb02588590750a4b3332a0df43d` |
| input branch / remote | `main` / `origin=https://github.com/corezilla/piko` |
| STD baseline | `0.1.0-draft.18` / `9841083c4d8d0ed1556bdc413d77b4567ac696b4` |
| publication artifact | `rag/project-ingestion-manifest.jsonl` |
| namespace / authority / ACL | `piko` / `piko` / `visibility=project` |

## 2. Inclusion set

Manifest 只包含 CP-01 已 Approved 的 10 份 canonical Markdown，且每条记录均绑定上述 immutable
commit、`corezilla/piko`、`status=accepted`、`visibility=project`、Document ID/type/version、模板版本
与该 commit 中实际文件字节的 SHA-256：

1. `docs/management/piko-std-migration-plan-v0.1.md`
2. `docs/management/piko-std-tailoring-v0.1.md`
3. `docs/management/piko-requirements-traceability-v0.3.md`
4. `docs/design/piko-agent-runtime-design-v0.3.md`
5. `docs/design/piko-collaboration-bridge-design-v0.3.md`
6. `docs/design/piko-collaboration-bridge-internal-design-v0.3.md`
7. `docs/contracts/piko-agent-runtime-contract-v0.3.md`
8. `docs/assurance/piko-agent-runtime-vv-plan-v0.3.md`
9. `docs/assurance/piko-agent-runtime-test-specification-v0.3.md`
10. `docs/review/piko-std-migration-review-packet.md`

## 3. Explicit exclusion and residual authority

- 排除两份 Superseded prose：`agent-runtime-service-design-v0.2.md`、
  `agent-runtime-matrix-collaboration-design-v0.3.md`。
- 排除 v0.1 历史文档、QA ledger、跨项目 review、CP/PUB packet 与 evidence、STD lock/source manifest、
  `rag/std-ingestion-manifest.jsonl` 和全部 Draft/In Review 文档。
- 排除 OpenAPI、JSON Schema、error catalog 与 fixtures；它们仍是字段级机器 authority，不通过
  Markdown RAG 复制。
- 排除 runtime/external evidence；Matrix、数据库恢复、凭据隔离和 LLMTier E2E 仍按实际 artifact
  判定，L3 状态不由 publication 改变。

## 4. Publication and retrieval verification

PUB-01 的确定性校验从 manifest 逐条读取，并对 CP-01 commit 执行：唯一 path/Document ID、固定
repository/commit/status/visibility/authority、Git blob 内容 SHA-256、sidecar status/type/version 一致、
10 项精确 inclusion、显式 exclusion 不相交和单一 current prose authority 检查。

仓库没有现存的向量数据库或外部 RAG ingestion backend。本 cohort 发布 Git-tracked manifest，
并通过 manifest lookup 验证按 `document_id`、`source_path`、`document_type` 和 `authority=piko`
可确定性检索；外部向量 indexing 记为 `N/A_NO_PROJECT_BACKEND`，而非 PASS。后续若引入 backend，
必须走独立实现、ACL 和运行证据 Gate。

## 5. Three-layer evidence

| Layer | Gate | PUB-01 状态 |
|---|---|---|
| L1 | STD source verifier + project-root validator | 必须 PASS |
| L2 | Piko contract validator + publication manifest verifier | 必须 PASS |
| L3 | 外部 RAG/runtime service | `N/A_NO_PROJECT_BACKEND`；Runtime Activation=`false` |
| Git hygiene | exact allowlist/digest + staged diff check | 必须 PASS |

## 6. Requested decision

请 STD 确认 PUB-01 的 immutable CP commit、10 项 inclusion、显式 exclusion、ACL、内容 hash、单一
authority、检索校验和无 backend 的诚实边界。收到新的 `COMMIT_APPROVED` 前不提交或推送本 cohort。
