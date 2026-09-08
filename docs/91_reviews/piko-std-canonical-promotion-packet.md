<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko STD Canonical Promotion Review Packet

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-std-canonical-promotion-packet` |
| Document Version | `0.1.0-draft.1` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Project Owner |
| Authors | corezilla |
| Reviewer | STD reviewer |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-08` |
| STD Version | `0.1.0-draft.19` |
| Template ID | `review.packet` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/91_reviews/piko-std-canonical-promotion-packet.md` |
| Supersedes | none |

> 本 packet 只审查 CP-01 文档 authority promotion。它不执行 PUB-01 RAG publication，
> 不提供 runtime evidence，也不授权 Runtime Activation。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 决定目标与批准输入

MR-01 的内容候选已由 commit `f2bb0937f31a27c36ecc1adefc31b1b78b6dc722` 固定，并已有
Migration Review `ACCEPTED`。用户随后通过 Codex 内部任务通道向 Piko 原任务直接批准执行
CP-01 canonical promotion 与后续独立 PUB-01；Runtime Activation 明确保持 `false / NOT_RUN`。

本 packet 请求 STD 对 CP-01 的精确 allowlist、authority disposition、状态映射和验证证据做
pre-commit 复核。收到 `COMMIT_APPROVED` 前不提交、不配置 remote、不推送。

## 2. 输入与 source lock

| 项目 | 值 |
|---|---|
| project root | `/Users/ben/work/piko` |
| input HEAD | `f2bb0937f31a27c36ecc1adefc31b1b78b6dc722` |
| input tree | `3113a2ef8947602a2b2d86f21a68489312753d3e` |
| input worktree | clean |
| input tracked-index SHA-256 | `ad4961da2cdf518307413e4710b471b6afca4b73232ee90c23e228fb5128b26a` |
| STD revision | `9841083c4d8d0ed1556bdc413d77b4567ac696b4` |
| STD annotated tag | `std-v0.1.0-draft.19` |
| STD source artifacts | 71 |
| project profile/domains | `software`; `management`, `systems`, `software` |
| reviewed content commit | `f2bb0937f31a27c36ecc1adefc31b1b78b6dc722` |

所有纳入 CP-01 的封面、sidecar、lock、source manifest 与 packet 使用单一 draft.18 baseline，
不得混合 draft.17 metadata。MR-01 commit 与原 evidence 保留，不重写其历史事实。

## 3. Promoted document set

下列 10 份文档从 Draft 升级为 Approved，sidecar `reviewed_commit` 均指向 MR-01 immutable candidate：

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

本 CP-01 packet 自身仍为 In Review；它不借自己的 decision 自我提升为 Approved。

## 4. Authority disposition

| Scope | CP-01 current authority | 旧 artifact disposition |
|---|---|---|
| Agent Runtime system prose | `piko-agent-runtime-design-v0.3.md` | v0.2 design prose Superseded，文件保留历史 |
| CollaborationBridge mechanism prose | `piko-collaboration-bridge-design-v0.3.md` | 原 v0.3 mechanism prose Superseded，文件保留历史 |
| CollaborationBridge internal structure | `piko-collaboration-bridge-internal-design-v0.3.md` | 新拆分 Piko-owned scope，无旧整份文档被替代 |
| API/Schema/error/fixture fields | 既有机器文件 | 不被 Markdown 复制或 Supersede |
| Contract boundary prose | `piko-agent-runtime-contract-v0.3.md` | 只引用机器 authority；不取得外部 Owner scope |
| Traceability | `piko-requirements-traceability-v0.3.md` | 原 ID 保留；Slinky/LLMTier authority 不迁入 |
| V&V/Test | 两份 assurance 文档 | QA ledger 保留未关闭 item 与历史证据，不整体 Supersede |
| Runtime/external evidence | 实际执行 artifact | 本次 L3 仍 NOT_COMPLETE/BLOCKED，不由文档状态改变 |

`current-document-inventory.md` 是 authority registry；`piko-std-migration-map.md` 保存旧→新与
residual-scope mapping。README 只指向 current canonical prose，并明确机器 authority 与 QA residual。

## 5. Document status 与版本

- 7 份 v0.3 文档使用 `0.3.0`，3 份迁移控制/packet 文档使用 `0.1.0`。
- 封面 `Status=Approved` 与 sidecar `status=accepted` 一一对应。
- `Reviewer/Approver/Approval Date` 在封面记录；sidecar `reviewed_commit` 只指向被评审候选。
- canonical publication commit 不写入自身文档；由后续 PUB-01 manifest 记录。
- 两份旧 prose 只在其完整 prose scope 已迁出后标记 Superseded；未关闭 QA 与机器文件不整体降级。

## 6. 三层验证

| Layer | Gate | CP-01 状态 |
|---|---|---|
| L1 STD source/structure | source verifier + project-root validator | 见 evidence；要求 PASS |
| L2 project contract | `python3 scripts/validate_v03_contract.py` | 见 evidence；要求 PASS |
| L3 runtime/external | Matrix、DB crash/restart、credential isolation、LLMTier E2E | `NOT_COMPLETE_UNCHANGED`；不阻塞纯文档 promotion，不允许 activation |
| Git hygiene | exact allowlist/digest + `git diff --check` | 见 evidence；要求 PASS |

## 7. Blockers 与非目标

- CP-01 文档迁移 blocker：none，等待 STD pre-commit review。
- PIKO-CON-B01 与 PIKO-L3-B01 保留，不得由 Approved 文档状态关闭。
- Git remote 缺失只阻塞最终 push；获提交批准前不配置 remote。
- PUB-01 不在本 cohort；不生成 `rag/project-ingestion-manifest.jsonl`。
- Runtime Activation、实现、配置、fallback、兼容路径和外部产品发布均不在范围内。

## 8. Requested decision

请确认 CP-01 的精确文件集合、draft.18 一致性、reviewed-commit 绑定、单一 authority、旧文档
disposition、三层验证与 preservation。终局 promotion authority 决定记录在
`piko-std-canonical-promotion-packet.review-decision.json`；STD 仍须独立发出
`COMMIT_APPROVED` 后才能提交本 cohort。
