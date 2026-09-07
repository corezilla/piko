<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko STD draft.17 分阶段迁移计划

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-std-migration-plan-v0.1` |
| Document Version | `0.1.0-draft.17` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Project Owner |
| Authors | corezilla |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-07` |
| STD Version | `0.1.0-draft.17` |
| Template ID | `management.project-plan` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `piko` |
| Canonical Path | `docs/management/piko-std-migration-plan-v0.1.md` |
| Supersedes | none |

> 本计划只授权非破坏 Migration Review 工作；不授权 canonical promotion、Document Status 升级、
> 项目 RAG ingestion、外部发布或 Runtime Activation。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目标、范围与成功标准

- 目标：把 Piko 当前设计、机器契约索引、traceability 与验证计划整理为可审阅的 STD draft.17
  Migration Review candidate，同时保持既有事实、ID、authority 和 dirty worktree。
- 范围内：source lock、inventory、tailoring、migration map、计划、system/mechanism/internal design、
  contract specification、traceability、V&V、test specification、review packet/decision/evidence。
- 范围外：实现变更、新 runtime/config/fallback/compatibility path、其他项目文件、canonical promotion、
  状态升级、RAG ingestion、外部发布和 Runtime Activation。
- 成功标准：immutable STD source 可复验；所有受控候选通过结构校验；项目机器契约 Gate 通过；L3
  证据如实标为 PASS/NOT_RUN/BLOCKED/N/A；Owner 能从单一 packet 审阅映射、残余 authority 与 blocker。

## 2. 输入基线与 dirty-worktree 保护

| 项目 | 值 |
|---|---|
| project root | `/Users/ben/work/piko` |
| input commit | `2386ea7fa6e5161ed6074b1e261fad74d148c067` |
| 本次计划输入状态 | dirty；全部为已存在的 draft.17 migration cohort |
| status SHA-256 | `5330c02f813f56f436534da43e1eb26da66f745726e76aa70b80517a957a0969` |
| 25-path content SHA-256 | `78b2f8fe0d070f2a55fc942cd5daa1936a619b78655303266f486cbc30add073` |
| STD commit/tag | `94c0262de35b5b989bba9f8d23f212af709c9dbf` / `std-v0.1.0-draft.17` |
| profile/domains | `software`; `management`, `systems`, `software` |

不得 reset、clean、checkout 覆盖或重建候选；任何增量先确认路径与 diff，只修改本项目。

## 3. Stakeholder、Owner 与 authority Gate

| Gate | Owner | 决定范围 | Exit criteria |
|---|---|---|---|
| G0 Source Integrity | Piko migration agent | STD lock/manifest 与执行证据 | full SHA、annotated tag、clean checkout、71 artifacts 通过 |
| G1 Plan/Tailoring | Piko Project Owner | profile、domains、cohort、路径裁剪 | 本计划与 tailoring/inventory/map 可审阅 |
| G2 Architecture | Piko Architecture Owner | system/mechanism/internal definition | authority、状态、恢复与禁止项无语义漂移 |
| G3 Contract & V&V | Piko Contract Owner、Piko Verification Owner | 机器 authority、traceability、验证覆盖 | project contract/schema validator PASS；L3 缺口显式 |
| G4 Migration Review | Piko Project Owner/reviewer | packet verdict | machine decision 从 PENDING 转为明确 verdict；不自动升级文档状态 |
| G4.5 STD Pre-Commit Review | STD reviewer | cohort 文件边界、三层证据与 dirty preservation | 收到明确 `COMMIT_APPROVED` 前禁止 commit/push |
| G5 Canonical Promotion | 用户 + Piko Project Owner | authority/索引切换 | repository identifier、reviewed commit、逐 scope promotion 独立批准 |
| G6 Publication/RAG | Piko publication/RAG owner | inclusion/exclusion 与 publication commit | 仅 canonical promoted artifacts 入库；重复 authority 检查通过 |
| G7 Runtime Activation | 独立 runtime authority | 部署/外部依赖激活 | L3 运行证据满足且另有明确授权 |

Slinky 继续拥有 Project/Plan/IR/Work/Decision/Acceptance；LLMTier 继续拥有 provider/capacity/routing/
Invocation；Matrix/Element 实现不属于 Piko。Piko 只迁移本项目拥有或消费边界的事实。

## 4. Cohort、工作包与顺序

当前授权只有 `MR-01`；其内部工作包按依赖顺序推进，但共享一个可审阅 Migration Review Packet。

| Cohort / 包 | 内容 | 依赖 | 当前状态 | 首要 milestone / 完成标准 |
|---|---|---|---|---|
| MR-01.A Source & Control | lock、source manifest、inventory、tailoring、migration map、计划 | draft.17 immutable source | `COMPLETED` | M1 已完成：计划纳入候选且 L1/L2 复验通过 |
| MR-01.B Design | Agent Runtime system、Bridge end-to-end mechanism、Piko internal definition | A；现有设计事实 | `COMPLETED` | G2 已确认：无 authority 漂移 |
| MR-01.C Contract/Trace/V&V | contract spec、机器附件索引、traceability、V&V、test spec | A/B；现有机器契约/QA | `COMPLETED` | L2 PASS；L3 缺口已逐项标注 |
| MR-01.D Review Closure | packet、终局 decision、原始命令/exit/output/digest | A-C | `ACCEPTED` | G4 已完成；Document Status 仍保持 Draft |
| MR-01.E Pre-Commit Gate | 计划、27-file cohort 清单、packet/decision、三层证据、HEAD/dirty preservation | D | `READY_FOR_COMMIT` | 等待 STD `COMMIT_APPROVED`；期间不 commit/push |
| CP-01 Canonical Promotion | approved scope 的 canonical path、reviewed commit、索引和旧文档标记 | G4 + repository ID + 独立批准 | 未授权 | 单一 authority 且 residual scope 无丢失 |
| PUB-01 Publication/RAG | publication manifest、RAG include/exclude、检索验证 | CP-01 + 独立批准 | 未授权 | 只索引 promoted canonical artifacts |
| RT-01 Runtime Evidence/Activation | 真实 Matrix/DB recovery/security/LLMTier E2E 与激活 | 实现、环境、G7 | 未授权/部分 BLOCKED | 运行证据完整；activation 独立决定 |

## 5. 源→目标与模板映射

| 源 authority / artifact | 目标 candidate | Template | 迁移规则 |
|---|---|---|---|
| `design/agent-runtime-service-design-v0.2.md` | `design/piko-agent-runtime-design-v0.3.md` | `design.system` | 迁移系统边界；原文 promotion 前保留 residual authority |
| `design/agent-runtime-matrix-collaboration-design-v0.3.md` | `design/piko-collaboration-bridge-design-v0.3.md` | `design.system-mechanism` | 保留身份、幂等、恢复、Element/Slinky route |
| 上述 mechanism 的 Piko-owned 内部结构 | `design/piko-collaboration-bridge-internal-design-v0.3.md` | `design.definition` | 不取得外部 Owner 或端到端 authority |
| v0.2/v0.3 OpenAPI、Schema、error、fixtures | `contracts/piko-agent-runtime-contract-v0.3.md` | `contracts.specification` | Markdown 只索引；机器文件继续是字段 authority |
| Requirement/Matrix/Test IDs | `management/piko-requirements-traceability-v0.3.md` | `requirements.traceability` | 保留 ID；不复制 Slinky/LLMTier Owner authority |
| QA v0.2/v0.3 | V&V plan + test specification | `assurance.vv-plan` / `assurance.test-specification` | 区分计划、可执行 contract test 与未运行 E2E |
| cohort 变更与验证 | `review/piko-std-migration-review-packet.md` | `review.packet` | verdict、Document Status、activation 独立 |

详细章节等价关系见 `docs/management/piko-std-migration-map.md`。

## 6. 三层验证与证据

| Layer | 命令/证据 | 当前预期 | Completion rule |
|---|---|---|---|
| L1 STD structural/source | `verify-source-manifest` + `validate-design --project-root ... --require-immutable-std` | PASS | 0 new/inherited error；全部 sidecar/cover/decision/source 一致 |
| L2 project contract/schema/test | `python3 scripts/validate_v03_contract.py` | PASS | fixtures、OpenAPI refs/filter、typed errors、authority boundary 通过 |
| L3 runtime/external | V&V/Test Specification 中 Matrix、DB crash/restart、credential、LLMTier E2E | NOT_COMPLETE/BLOCKED | 不以文档或 mock 冒充；每项有真实环境与 artifact 才能 PASS |

每次 cohort packet 保存原始命令、exit code、关键输出、artifact 路径、执行 commit 和 dirty/content digest。

## 7. Blocker、风险与依赖

| ID | 类型 | 描述 | 影响 | 处置 / Owner Gate |
|---|---|---|---|---|
| PIKO-MIG-B01 | 已关闭决定 | 用户已批准内部 repository identifier 为 `piko` | 字段已定稿；不自动授权 promotion | 2026-09-07 关闭；G5 仍需独立批准 |
| PIKO-CON-B01 | contract/runtime gate | SessionSummary/CloseResult enum alignment 未关闭 | 不阻止文档迁移；阻止相关契约/runtime activation | 单独 contract amendment/review；G3/G7 |
| PIKO-L3-B01 | evidence gate | 真实 Matrix、DB recovery、credential isolation、LLMTier E2E 未完成 | L3 不能 PASS | 实现与环境就绪后按 RT-01 执行 |
| PIKO-MIG-R01 | 迁移风险 | 新候选与旧文档并存可能造成双 authority | review 期间检索/引用歧义 | 所有候选保持 Draft；README/packet 明示 residual boundary |

当前没有未关闭的 Migration Review blocker。G4 已接受 MR-01；提交仅等待 G4.5 STD pre-commit review。
CP-01、PUB-01、RT-01 仍因未获独立授权而不启动。

## 8. 旧文档 residual authority 与完成标准

- G5 前不删除、不移动、不整体 Supersede 原设计、机器契约、QA 或 review 文档。
- 机器契约始终保留字段级 authority；迁移后的 contract specification 不复制字段定义。
- 若未来只 promotion 部分 scope，原文档继续承担未迁出的 residual scope，并在索引中明确边界。
- MR-01 完成：G0-G3 证据齐全、packet/decision 可审阅且 G4 给出 verdict；这不等于 status/promotion。
- Commit 前：向 STD 报 `READY_FOR_COMMIT` 并冻结 cohort 文件清单；只有收到 `COMMIT_APPROVED` 才可提交，
  且提交不得夹带清单外文件。commit 本身也不构成 canonical promotion。
- 全迁移完成：G5 对每份 scope 完成单一 authority 切换，旧 scope 正确标记，G6 如获授权完成 publication/RAG；
  G7 Runtime Activation 可保持 false，不是文档迁移完成的必要推论。

## 9. 沟通、配置与变更控制

跨项目迁移协调只通过 `std-migration` Matrix profile，以固定身份 `piko` 回复；不轮询旧房间。
G4 接受的是 evidence 中由 artifact-set digest 固定的当前内容集合；下一次获准提交只把该固定集合形成
immutable candidate snapshot，不构成 canonical promotion。该 snapshot 提交后，`reviewed_commit` 的记录、
Document Status 变化与 authority promotion 仍分别受后续独立 Gate 控制，不从 G4 或 commit 自动推导。
重大设计变化单独提出，不藏入格式迁移；STD revision、模板 hash、authority 或 contract 改变即触发增量复审。

资源/采购：本轮只需本地仓库、locked STD checkout 与现有 validator；无采购、模型权重或外部数据依赖。
