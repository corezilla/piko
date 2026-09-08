<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko STD Migration Review Packet

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-std-migration-review-packet` |
| Document Version | `0.1.0` |
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
| STD Version | `0.1.0-draft.19` |
| Template ID | `review.packet` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/91_reviews/piko-std-migration-review-packet.md` |
| Supersedes | none |

> 本 packet 是 MR-01 的 Approved audit record。其 `ACCEPTED` verdict 固定内容候选；后续 CP-01
> 由独立授权执行，PUB-01 与 Runtime Activation 仍是分离 Gate。
<!-- STD_DOCUMENT_COVER_END -->

## 1. Review 目标与期望决定

确认本 cohort 是否忠实地把 Piko 当前事实组织为 STD draft.17 候选，并维持既有 authority、机器契约、
运行证据与 residual scope 边界。终局决定记录在同名 `.review-decision.json`；用户已于
2026-09-07 给出 `ACCEPTED`。

## 2. Scope 与输入基线

| 项目 | 值 |
|---|---|
| canonical project root | `/Users/ben/work/piko` |
| input HEAD | `2386ea7fa6e5161ed6074b1e261fad74d148c067` |
| input working tree | clean |
| input tracked-index SHA-256 | `514460c6d55b577008093abf4df36517c1d0f69e8cbe3b27064205df870050bc` |
| draft.17 upgrade input | draft.16 cohort dirty；status SHA-256 `5330c02f813f56f436534da43e1eb26da66f745726e76aa70b80517a957a0969` |
| STD revision | `94c0262de35b5b989bba9f8d23f212af709c9dbf` |
| STD annotated tag | `std-v0.1.0-draft.17` |
| profile/domains | `software`; `management`, `systems`, `software` |
| READY request | `S-20260907-1b9e2433919c` |
| draft.17 review request | `S-20260907-7a832b6e147e` |

只读取 STD 标准来源，只修改本项目。未 reset/clean/覆盖输入；旧文档、机器契约、QA、跨项目 review 和
`rag/std-ingestion-manifest.jsonl` 保持原状。

## 3. 候选 artifact

- source control：`docs/std.lock.json`、`docs/std-source-manifest.json`；
- control：migration plan、inventory、tailoring、migration map、requirements traceability；
- design：Agent Runtime system、CollaborationBridge end-to-end mechanism、Piko-owned internal definition；
- contract：contract specification；字段 authority 仍由现有 OpenAPI/JSON Schema/error catalog/fixtures 承担；
- assurance：V&V plan、test specification；
- review：本 packet、终局 review decision、`piko-std-migration-evidence.json`。

## 4. Authority 与 canonical 边界

| 范围 | canonical authority（本轮不变） |
|---|---|
| Piko project/system | Piko Agent Runtime、内部模块、adapter 与恢复设计 |
| Piko machine contract | 本项目现有 OpenAPI、JSON Schema、error catalog、fixtures |
| testing source | `scripts/validate_v03_contract.py` 与 QA/Test IDs |
| runtime evidence | 实际执行输出；文档断言不是 production evidence |
| Slinky | Project/Plan/IR/Work/Decision/Acceptance；Piko 不复制 |
| LLMTier | provider/capacity/routing/Invocation；Piko 仅描述 consumed boundary |
| legacy/current docs | promotion 前继续保留全部 residual-scope authority |

## 5. Validation plan 与结果

三层验证：

1. STD source：verify 71-artifact manifest 对 locked clean checkout；
2. STD project-root：校验 lock/catalog/hash/path/sidecar/cover/ID/ref/decision；
3. project contract：执行 `python3 scripts/validate_v03_contract.py`。

draft.17 discovery 定点核验：Piko 没有名称匹配的 symlink、同后缀目录、ignored candidate 或 tracked
non-regular candidate。10 份 STD metadata/Markdown 与 1 份 decision 均属于 tracked 或未忽略 untracked
普通文件，因此新 discovery 语义不会漏掉本 cohort。STD 自身 2 个 discovery/read regression test 通过。

相对 draft.16，内容模板 SHA-256 未变化；本 cohort 只升级 lock、71-artifact source manifest、metadata 的
STD/catalog version、封面/文本版本引用与验证证据，不重写设计事实或 authority。

原始命令、exit code、摘要、artifact hashes 与执行时 Git 状态记录在
`docs/review/piko-std-migration-evidence.json`。reviewed immutable Piko commit 为
`f2bb0937f31a27c36ecc1adefc31b1b78b6dc722`。

## 6. Risk、blocker 与开放项

### Migration Review blocker

- none。用户已批准 `Repository/source_repository=piko` 并接受本 packet。
- MR-01 verdict 本身不授权 canonical promotion；后续用户已通过独立 Gate 授权 CP-01。
- 本 packet 与 promoted 文档的 sidecar 记录 reviewed commit `f2bb0937f31a27c36ecc1adefc31b1b78b6dc722`。

### 非迁移 blocker

- SessionSummary/CloseResult enum alignment 仍是 contract/runtime activation gate；本轮不改机器契约。
- 真实 Matrix、数据库 crash/restart、credential isolation、LLMTier E2E 尚无运行证据。

## 7. Publication 与 RAG 计划

后置 Gate 批准后才可：以批准 commit 填写 `reviewed_commit`、逐份 promotion、切换项目索引、按迁移完成范围
标记旧文档 Superseded。部分迁移时旧文档继续承担 residual authority。项目 RAG 只纳入已 promotion 的
canonical artifact，排除 Draft、旧版本、review evidence、source manifest 与 runtime evidence；本 cohort 不做
ingestion。Runtime Activation 必须另有独立 authority。

## 8. Recorded decision

Review Verdict=`ACCEPTED`。该 verdict 与 Document Status、publication、RAG inclusion 和 Runtime
Activation 相互独立；本轮没有启动任何后置动作。

## 9. STD Pre-Commit Review Gate

- 状态：`COMPLETED`。
- immutable candidate commit：`f2bb0937f31a27c36ecc1adefc31b1b78b6dc722`；27 个批准路径。
- candidate artifact digest：`99c0c1ad90b9366fb397a787f48fd18c48bf29ab0c8c57082c78f15916c92ddf`。
- 完整变更文件清单、三层命令/exit/output 与 artifact digest 位于
  `docs/review/piko-std-migration-evidence.json`。
- MR-01 immutable history 不因 CP-01/PUB-01 重写。Runtime Activation 仍未授权。
