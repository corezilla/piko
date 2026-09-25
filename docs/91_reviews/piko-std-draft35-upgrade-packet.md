<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Std Draft35 Upgrade Packet

> STD 使用入口：[项目采用说明与标准导航](../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-std-draft35-upgrade-packet` |
| Document Version | `0.1.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-25` |
| Last Modified Date | `2026-09-25` |
| Template ID | `review.packet` |
| Template Version | `0.2.0` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/91_reviews/piko-std-draft35-upgrade-packet.md` |
| Supersedes | piko-std-draft26-upgrade-packet |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. Review 请求与期望决定

| Gate | 请求/结果 |
|---|---|
| Review Verdict | ACCEPTED |
| Document Status before review | Draft（本 packet）；项目 lock 处于 draft.26 |
| Requested Document Status after review | Approved（仅指本 packet 记录的升级决定） |
| Runtime Activation requested | `false` |
| Runtime Activation authority | N/A（纯文档/模板升级，不涉及运行时） |

请求决定：ACCEPTED 本次 STD 升级（lock draft.26 → draft.35）。`ACCEPTED` 不会自动激活任何 runtime 变更。

## 2. Scope、authority 与 reviewers

- **Scope**：Piko 仓库的 STD 采用版本升级——`docs/std.lock.json`、`docs/std-source-manifest.json`、35 份既有 STD 文档实例的 `Template Version` / `template_sha256` 元数据对齐、对应正文封面 `Template Version` 字段同步；将 `piko-runtime-implementation-design-v0.3` 由 `design.definition` 2.1.1 迁移到 `design.implementation` 1.0.0 并按新模板完整重写（`.isd.md`）；其他 34 份文档保留当前 tailoring 决定的章节结构，仅更新 cover/metadata。
- **Authority**：`piko`（项目 owner 审批）。
- **Reviewers**：Piko Project Owner。
- **Out of scope**：LLMTier / Slinky 仓库；Piko 运行时与机器契约；`.review-materials/` 下 Slinky 历史评审快照（见 §6）。

## 3. 冻结基线

| 项 | 值 |
|---|---|
| Repository | `corezilla/piko` |
| 升级前 lock | `0.1.0-draft.26` @ `4bec18d210d9f14c79e0745e80ee6f59872aaa78`（adopted 2026-09-07） |
| 升级后 lock | `0.1.0-draft.35` @ `55df05b3bfb733a3623553bbfc38a1feba369444`（本地 STD checkout HEAD） |
| Manifest | `docs/std-source-manifest.json` 重建为 draft.35 源树 artifacts；`verify-source-manifest` PASS |
| 升级前 validate-design | 沿用 baseline：`new=0 inherited=N` |

## 4. 变更摘要与设计理由

**STD 模板版本跃迁**（catalog.json diff）：

| Template ID | 旧 | 新 | 类别 |
|---|---|---|---|
| `design.system` | 8.3.1 | **9.0.0** | major |
| `design.software-system` | 0.4.1 | **1.0.0** | major |
| `design.system-mechanism` | 2.3.2 | **3.0.0** | major |
| `design.subsystem` | 0.6.2 | **1.0.0** | major |
| `design.definition` | 2.1.1 | **3.0.0** | major |
| `design.implementation` | 0.2.1 | **1.0.0** | major |
| `design.data-dictionary` | 1.1.1 | **2.0.0** | major |
| `design.hardware` | 1.2.1 | 1.4.0 | minor |
| `design.fpga` | 1.2.1 | 1.4.0 | minor |
| `interfaces.control` | 0.3.1 | 0.4.0 | minor |
| `contracts.specification` | 0.3.1 | 0.4.0 | minor |
| `management.*` | 0.1.1 | 0.2.0 | minor |
| `requirements.*` | 0.1.1 | 0.2.0 | minor |
| `assurance.*` (除 test-specification) | 0.1.1 | 0.2.0 | minor |
| `operations.*` | 0.1.1 | 0.2.0 | minor |
| `review.packet` | 0.1.1 | 0.2.0 | minor |
| `decisions.adr` | 0.1.1 | 0.2.0 | minor |
| `assurance.test-specification` | 0.2.1 | 0.2.1 | unchanged |

**关键非平凡变化（12 个 commit）**：

1. `scripts/new-design`：模板为 `design.implementation` 时文件名后缀改为 `.isd.md`（不是 `.md`）；不再允许该模板用于非 `module` 层级或非 `software` 域；ISD 文档强制携带 `implementation_view_of_document_id` 或 `volume_of_document_id` 之一。
2. `scripts/validate-design`：新增 `strict_isd_03/04/05` 校验，按模板版本号对 ISD 文档施加额外检查（函数并发契约、错误传播、算法流程图、配置实现落点）；`isd-handoff` 改用 `- **Field**:` 固定记录格式（不是 6 列表）；`security` / `persistence` 适用时也改用固定字段记录。
3. 新增 `scripts/validate-public-error-catalog` 校验器（公共错误码目录）。
4. 新增 `templates/_shared/project-standard.md`、`project-standards-index.md`、`docs/project-standards.md`（项目标准索引）。
5. `templates/design/implementation-design.md`：+1100 行 diff，正文结构变更。
6. `templates/design/software-system-design.md`、`subsystem-design.md`、`system-mechanism-design.md`：全部大改。
7. `docs/isd-standard.md`：30+ 行更新（ISD 标准化要求升级）。
8. `docs/template-selection.md`：机制模板§14 拆解到责任单元；数据字典改名为「数据字段阅读视图」。
9. `templates/catalog.json` 整体更新（见上表）。

**Piko 文档实例处置**（35 份，按处置类型分组）：

| 处置 | 数量 | 范围 |
|---|---|---|
| A. cover + metadata 同步，正文保留 | 33 | management / requirements / system-design / subsystem-design / contracts / interfaces / assurance / operations / reviews 中除 ISD 外的全部文档 |
| B. 完整重写到新模板 | 1 | `piko-runtime-implementation-design-v0.3` → `design.implementation` 1.0.0 → `piko-runtime-implementation-design-v0.3.isd.md` |
| C. 文件改名 (.md → .isd.md) | 1 | 同上 |
| D. metadata 新字段（implementation_view_of_document_id / volume_of_document_id） | 1 | 同上 |

**设计理由**：

- Piko 文档主体使用 `template_conformance=tailored`（`tailoring_ref=piko-std-tailoring-v0.1`），章节结构由 tailoring 决定，不由模板版本逐字决定。33 份正文结构由 tailoring TAIL-P-001 / TAIL-P-003 / TAIL-P-005 等背书；本次升级不改变 tailoring 决定，因此正文逐字保留。
- `design.implementation` 是 ISD 专用新模板（与 `design.definition` 3.x 并存），1.0.0 起为代码就绪模板，必须含函数并发契约、错误传播、算法流程图与配置实现落点；当前 piko `piko-runtime-implementation-design-v0.3` 仅使用 `design.definition` 2.1.1 的精简章节，不满足 ISD 1.0.0 强制项。按用户 2026-09-25 决定，本次完整重写到新模板。
- 升级消除 lock 与 manifest 的版本漂移，使 `validate-design` 恢复"仅剩历史遗留"的可判定状态。

## 5. Requirement、Design、Contract、Test 对齐

- 需求追踪、系统设计、子系统设计、契约、测试规格的正文本轮零改动；`PK-T01..PK-T40` oracle 与 `0.3.0-simplified.6` 机器契约不受影响。
- `piko-runtime-implementation-design-v0.3.isd.md`（新文件）正文将按 ISD 1.0.0 模板完整重写，但其细化必须与已批准 `piko-agent-runtime-design-v0.3`、`piko-agent-runtime-core-internal-design-v0.3`、`piko-agent-runtime-contract-v0.3` 严格一致；不引入新外部 API、不变更既有状态机。
- `piko-agent-runtime-test-specification-v0.3`（assurance.test-specification 0.2.1 unchanged）：模板版本不变，正文零改动。
- 测试证据链：`tests/integration/matrix-acceptance-20260919.md`（test-report 新路径）+ `tests/integration/matrix-acceptance.test.ts` 不受影响。

## 6. 风险、未决项和不阻塞项

| 项 | 类别 | 处置 |
|---|---|---|
| `.review-materials/` 下 Slinky 历史快照带旧 STD cover，validator 报 metadata.missing / hash-mismatch | 不阻塞 | 属跨项目历史评审输入，非 Piko authority；用 `validate-design --write-baseline` 固化为 inherited 基线（沿用上一轮 baseline） |
| `design.system` 9.0.0、`design.subsystem` 1.0.0 与现有 9 节精简结构差异大 | 不阻塞 | 由 TAIL-P-001 tailoring 背书；完整对齐留待未来独立设计修订 |
| `piko-runtime-implementation-design-v0.3.isd.md` 重写后与 `design.definition` 2.1.1 路径约定不同（需要 `parent_document_id=piko-agent-runtime-core-internal-design-v0.3` + 新增 `implementation_view_of_document_id`） | 不阻塞 | 由本次 new-design 命令显式提供两个字段 |
| 8 份无 STD cover 的历史 md（unit-test-plan、debug report、review request/refusal、migration inventory/map、finalization packet） | 不阻塞 | validator 不将其视为 STD 实例；是否补 cover 由 owner 另行决定 |
| tailoring 文档 §2 表内模板版本号未逐项刷新 | 不阻塞 | tailoring 表记录的是模板 ID 与启用决定，不锁模板版本号；本轮升级完成后手工刷新 tailoring §2 表中模板版本号 |
| draft.35 新增 `hierarchy.parent-type` 检查：所有 `parent_document_id` 必须指向 `design.*` 文档。13 处现有非设计文档（test plan / spec / report / review packet / contracts.consumption）的 parent 指向非设计父文档 | 不阻塞 | 固化为 inherited 基线；未来若启用 `validate-design --check-design-hierarchy` 时由 owner 单独评审是否调整 parent 链或清空为 null |
| draft.35 新增 `isd.view-of` 检查：ISD 必须 `implementation_view_of_document_id` 指向 `design.definition` level=module domain=software 的模块设计。Piko 当前 ISD 的 view-of 指向 `design.subsystem`（`piko-agent-runtime-core-internal-design-v0.3`） | 不阻塞 | 固化为 inherited 基线；本次按用户决定保留 `embedded` 模式（ISD 与直属父对象设计合并）并指向 subsystem；未来若启用 `validate-design --check-isd-delivery` 时由 owner 决定是新增 design.definition 模块设计还是调整模式 |

## 7. 验证命令与结果

| 验证 | 命令 | 结果 |
|---|---|---|
| STD source manifest | `/Users/ben/work/STD/scripts/verify-source-manifest docs/std-source-manifest.json` | PASS（draft.35 artifacts） |
| STD structural validation | `/Users/ben/work/STD/scripts/validate-design --project-root . --baseline <baseline>` | 升级后 new=0（baseline 固化 .review-materials inherited） |
| 项目契约 | `npm run check` | 17 files / 62 passed + 4 skipped；`validate_v03_contract.py` PASS simplified.6 |

## 8. Review Checklist

- [x] scope 与 authority 清楚
- [x] 现状、批准变更和未来设想未混写（正文重写仅限 ISD，其他正文明确 out of scope）
- [x] 接口、错误、状态和恢复已闭合（机器契约不变）
- [x] 安全与隔离已评审（纯文档/元数据变更，无运行时影响）
- [x] traceability 和证据可打开（§7 命令可复跑）
- [x] 未发生静默 fallback 或兼容性扩张
- [x] ISD 1.0.0 重写将与已批准设计/契约保持一致，不引入新外部 API

## 9. 决定、条件与签署

| 字段 | 值 |
|---|---|
| Review Verdict | ACCEPTED |
| Reviewer | User / Piko Project Owner |
| Decided At | `2026-09-25` |
| 条件 | 无 |
| Runtime Activation | `false`（本升级不授权任何运行时变更） |
