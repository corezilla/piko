<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko STD 分阶段迁移计划

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-std-migration-plan-v0.1` |
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
| Template ID | `management.project-plan` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/00_management/piko-std-migration-plan-v0.1.md` |
| Supersedes | none |

> MR-01、CP-01 与 PUB-01 已分别形成 immutable commit。用户随后要求按 STD 默认软件目录树
> 一次性搬移；DIR-01 只改变路径与引用，Runtime Activation 保持 `false / NOT_RUN`。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 目标、范围与成功标准

- 目标：保持既有 authority 与 immutable history，把 Piko 文档、机器契约和测试入口迁入 STD
  默认软件目录树，并在后续 PUB-02 重新发布可追溯的项目 RAG manifest。
- 范围内：draft.19 source lock、编号文档树、顶层 `interfaces/`、`tests/contract/`、全部路径引用、
  sidecar/封面 source path 和目录迁移 review evidence。
- 范围外：实现变更、新 runtime/config/fallback/compatibility path、其他项目文件、外部产品发布和
  Runtime Activation。
- 成功标准：immutable STD source 可复验；单一 current authority；机器契约 authority 不丢失；
  L1/L2 通过且 L3 如实记录；每个 cohort 经 STD pre-commit Gate 后单独提交。

## 2. 输入基线与 dirty-worktree 保护

| 项目 | 值 |
|---|---|
| project root | `/Users/ben/work/piko` |
| DIR-01 input commit | `21e24df144ef81e73203372dcbab15f533e3c511` |
| DIR-01 input state | clean；MR-01、CP-01、PUB-01 已提交并推送 |
| input tree | `80c3db41ab43a84a9165200215b00838e45dcaee` |
| tracked-index SHA-256 | `ad4961da2cdf518307413e4710b471b6afca4b73232ee90c23e228fb5128b26a` |
| STD source revision/tag | `274ef0a67eda080baa0063ae27ede7ee129aa32a` / none（项目采用 `0.1.0-draft.21`） |
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

MR-01、CP-01、PUB-01 已分别提交。DIR-01 已用 immutable commit
`9f55da4a82e764b8479b134b0c5ffe11d1ce5ec4` 完成并推送一次性目录搬移；PUB-02 以包含本状态更新的
最终文档快照为输入重建 RAG manifest，因此不会伪造包含自身的 publication commit。

| Cohort / 包 | 内容 | 依赖 | 当前状态 | 首要 milestone / 完成标准 |
|---|---|---|---|---|
| MR-01.A Source & Control | lock、source manifest、inventory、tailoring、migration map、计划 | draft.17 immutable source | `COMPLETED` | M1 已完成：计划纳入候选且 L1/L2 复验通过 |
| MR-01.B Design | Agent Runtime system、Bridge end-to-end mechanism、Piko internal definition | A；现有设计事实 | `COMPLETED` | G2 已确认：无 authority 漂移 |
| MR-01.C Contract/Trace/V&V | contract spec、机器附件索引、traceability、V&V、test spec | A/B；现有机器契约/QA | `COMPLETED` | L2 PASS；L3 缺口已逐项标注 |
| MR-01.D Review Closure | packet、终局 decision、原始命令/exit/output/digest | A-C | `ACCEPTED` | G4 已完成；Document Status 仍保持 Draft |
| MR-01.E Pre-Commit Gate | 计划、27-file cohort 清单、packet/decision、三层证据、HEAD/dirty preservation | D | `COMPLETED` | STD approved；commit `f2bb0937f31a27c36ecc1adefc31b1b78b6dc722` |
| CP-01 Canonical Promotion | approved scope 的 canonical path、reviewed commit、索引和旧文档标记 | G4 + repository ID + 独立批准 | `COMPLETED` | commit `119aa51af60da32c2db8d27c53bbf2975ab12938` |
| PUB-01 Publication/RAG | publication manifest、RAG include/exclude、检索验证 | CP-01 commit + 独立批准 | `COMPLETED` | commit `21e24df144ef81e73203372dcbab15f533e3c511` |
| DIR-01 Default Layout | 编号 docs 树、顶层 interfaces、tests/contract 与引用修复 | 用户直接批准；draft.19 | `COMPLETED` | commit `9f55da4a82e764b8479b134b0c5ffe11d1ce5ec4` 已推送；L1/L2/链接检查通过 |
| PUB-02 Relocated Publication | 以最终文档 snapshot 重建 RAG manifest | DIR-01 commit + 用户直接批准 | `COMPLETED` | commit `11c6408cd7767342a69ae45f67a0871240ac980a`；旧 Piko 记录为零 |

## 5. 源→目标与模板映射

| 源 authority / artifact | 目标 candidate | Template | 迁移规则 |
|---|---|---|---|
| `docs/99_reference/design/agent-runtime-service-design-v0.2.md` | `docs/20_system_design/piko-agent-runtime-design-v0.3.md` | `design.system` | 迁移系统边界；原文 promotion 前保留 residual authority |
| `docs/99_reference/design/agent-runtime-matrix-collaboration-design-v0.3.md` | `docs/20_system_design/mechanisms/piko-collaboration-bridge-design-v0.3.md` | `design.system-mechanism` | 保留身份、幂等、恢复、Element/Slinky route |
| 上述 mechanism 的 Piko-owned 内部结构 | `docs/30_subsystem_design/piko-collaboration-bridge-internal-design-v0.3.md` | `design.definition` | 不取得外部 Owner 或端到端 authority |
| v0.2/v0.3 OpenAPI、Schema、error、fixtures | `docs/60_interfaces/contracts/piko-agent-runtime-contract-v0.3.md` | `contracts.specification` | Markdown 只索引；机器文件继续是字段 authority |
| Requirement/Matrix/Test IDs | `docs/10_requirements/piko-requirements-traceability-v0.3.md` | `requirements.traceability` | 保留 ID；不复制 Slinky/LLMTier Owner authority |
| QA v0.2/v0.3 | V&V plan + test specification | `assurance.vv-plan` / `assurance.test-specification` | 区分计划、可执行 contract test 与未运行 E2E |
| cohort 变更与验证 | `docs/91_reviews/piko-std-migration-review-packet.md` | `review.packet` | verdict、Document Status、activation 独立 |

详细章节等价关系见 `docs/98_migration/piko-std-migration-map.md`。

## 6. 三层验证与证据

| Layer | 命令/证据 | 当前预期 | Completion rule |
|---|---|---|---|
| L1 STD structural/source | `verify-source-manifest` + `validate-design --project-root ... --require-immutable-std` | PASS | 0 new/inherited error；全部 sidecar/cover/decision/source 一致 |
| L2 project contract/schema/test | `python3 tests/contract/validate_v03_contract.py` | PASS | fixtures、OpenAPI refs/filter、typed errors、authority boundary 通过 |
| L3 runtime/external | Runtime Activation 与外部 vector backend | `N/A` for migration | 后续设计、编码和运行验证使用独立 Gate，不作为迁移 blocker |

每次 cohort packet 保存原始命令、exit code、关键输出、artifact 路径、执行 commit 和 dirty/content digest。

## 7. Blocker、风险与依赖

| ID | 类型 | 描述 | 影响 | 处置 / Owner Gate |
|---|---|---|---|---|
| PIKO-MIG-B01 | 已关闭决定 | 用户已批准内部 repository identifier 为 `piko` | 字段已定稿；不自动授权 promotion | 2026-09-07 关闭；G5 仍需独立批准 |
| PIKO-MIG-R01 | 已关闭风险 | promoted 文档与旧文档并存可能造成双 authority | 已通过删除旧工作树副本关闭 | Git history 与迁移 evidence 保留审计，不参与 current authority |

当前没有未关闭的迁移 blocker。MR-01、CP-01、PUB-01、DIR-01 与 PUB-02 均已完成并推送。
契约对齐、系统实现、运行环境和测试证据属于后续重新设计与编码，不在迁移计划中跟踪。

## 8. 旧文档 residual authority 与完成标准

- CP-01/DIR-01 完成 authority 切换后，被 Superseded 的旧 prose、机器草案、QA 和旧 review 工作树
  副本已删除；历史由 Git commit 与迁移 evidence 保存。
- 机器契约始终保留字段级 authority；迁移后的 contract specification 不复制字段定义。
- 本项目当前没有 residual prose scope；后续设计变更直接修改对应 canonical 文档并重新 review。
- MR-01 完成：G0-G3 证据齐全、packet/decision 可审阅且 G4 给出 verdict；这不等于 status/promotion。
- Commit 前：向 STD 报 `READY_FOR_COMMIT` 并冻结 cohort 文件清单；只有收到 `COMMIT_APPROVED` 才可提交，
  且提交不得夹带清单外文件。commit 本身也不构成 canonical promotion。
- 全迁移已完成：每份 scope 已完成单一 authority 切换，旧工作树副本已删除，项目 RAG 已重建；
  Runtime Activation 保持 false，不是文档迁移完成的必要推论。

## 9. 沟通、配置与变更控制

跨项目迁移协调只通过 `std-migration` Matrix profile，以固定身份 `piko` 回复；不轮询旧房间。
G4 接受的内容集合由 MR-01 commit 固定；CP-01 记录 Document Status 与 authority promotion；PUB-01
记录旧路径 publication。DIR-01 已由 `9f55da4a82e764b8479b134b0c5ffe11d1ce5ec4` 固定并推送；PUB-02
以随后的最终文档 snapshot 发布新路径 manifest。
Runtime Activation 不从任何文档或目录 Gate 推导。
重大设计变化单独提出，不藏入格式迁移；STD revision、模板 hash、authority 或 contract 改变即触发增量复审。

资源/采购：本轮只需本地仓库、locked STD checkout 与现有 validator；无采购、模型权重或外部数据依赖。
