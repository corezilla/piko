<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko STD Relocated Publication Review Packet

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-std-relocated-publication-packet` |
| Document Version | `0.1.0` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Publication/RAG Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner; STD reviewer |
| Created Date | `2026-09-08` |
| Last Modified Date | `2026-09-08` |
| Template ID | `review.packet` |
| Template Version | `0.1.1` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | `docs/98_migration/piko-std-migration-map.md` |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/91_reviews/piko-std-relocated-publication-packet.md` |
| Supersedes | `docs/91_reviews/piko-std-publication-packet.md` |

> PUB-02 删除项目 manifest 中全部旧 Piko 条目，并基于目录迁移后的最终文档 snapshot 全量重建。
> 本 packet 不执行外部 vector indexing，也不授权 Runtime Activation。
<!-- STD_DOCUMENT_COVER_END -->

## 1. Immutable publication input

- repository：`corezilla/piko`
- source commit：`84d12da6f786e57e200b64cf80567e32f68f8d45`
- source branch：`main`
- STD：`0.1.0-draft.19` / `eeaf9bf33012928e3e74a9ca30e87d717690d343`
- publication artifact：`rag/project-ingestion-manifest.jsonl`
- namespace / authority / ACL：`piko` / `piko` / `visibility=project`

## 2. Replacement semantics

PUB-02 不在旧 manifest 上增量追加。文件内容整体替换：旧 commit
`119aa51af60da32c2db8d27c53bbf2975ab12938`、旧 `docs/management`、`docs/design`、
`docs/contracts`、`docs/assurance` 和 `docs/review` Piko 路径的记录全部归零；随后从 immutable
input commit 重新生成 10 条唯一记录。

每条记录保存 repository、source path、source commit、Document ID/type/version、status、visibility、
authority、template version、chunk strategy 和 Git blob 字节 SHA-256。机器契约、历史资料、QA、
review/evidence、STD source 与 runtime evidence仍按 authority 规则排除。

## 3. Verification and boundaries

必须验证 10 条记录的 path/Document ID 唯一性、exact inclusion、旧 path/commit absence、sidecar
一致性，以及逐项 `git show <commit>:<path>` 内容 hash。STD L1、Piko L2、diff hygiene 必须通过。

项目没有现存外部 vector backend，故外部 indexing 为 `N/A_NO_PROJECT_BACKEND`；本次“重新录入”
的可审计权威是 Git-tracked manifest。Runtime Activation 保持 `false / NOT_RUN`。
