<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko STD draft.21 → draft.26 升级评审包

> STD 使用入口：[项目采用说明与标准导航](../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-std-draft26-upgrade-packet` |
| Document Version | `0.1.0` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-20` |
| Last Modified Date | `2026-09-20` |
| Template ID | `review.packet` |
| Template Version | `0.1.1` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/91_reviews/piko-std-draft26-upgrade-packet.md` |
| Supersedes | piko-std-draft21-upgrade-packet |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. Review 请求与期望决定

| Gate | 请求/结果 |
|---|---|
| Review Verdict | PENDING |
| Document Status before review | Draft（本 packet）；项目 lock 处于 draft.21 |
| Requested Document Status after review | Approved（仅指本 packet 记录的升级决定） |
| Runtime Activation requested | `false` |
| Runtime Activation authority | N/A（纯文档/模板升级，不涉及运行时） |

请求决定：ACCEPTED 本次 STD 升级（lock draft.21 → draft.26）。`ACCEPTED` 不会自动激活任何 runtime 变更。

## 2. Scope、authority 与 reviewers

- **Scope**：Piko 仓库的 STD 采用版本升级——`docs/std.lock.json`、`docs/std-source-manifest.json`、20 份既有 STD 文档实例的 `Template Version` / `template_sha256` 元数据对齐、README 版本行。**不**重写任何已批准文档的正文结构。
- **Authority**：`piko`（项目 owner 审批）。
- **Reviewers**：待 Piko Project Owner 指派。
- **Out of scope**：LLMTier / Slinky 仓库；Piko 运行时与机器契约；`.review-materials/` 下 Slinky 历史评审快照（见 §6）。

## 3. 冻结基线

| 项 | 值 |
|---|---|
| Repository | `corezilla/piko`，分支 `docs/piko-system-design-std26` |
| 升级前 lock | `0.1.0-draft.21` @ `274ef0a67eda080baa0063ae27ede7ee129aa32a`（adopted 2026-09-07） |
| 升级后 lock | `0.1.0-draft.26` @ `5a1e71f4e2baa6e6761b685e91deecbd58cf0649`（本地 STD checkout HEAD） |
| Manifest | `docs/std-source-manifest.json` 重建为 189 artifacts，`verify-source-manifest` PASS |
| 升级前 validate-design | `new=105 inherited=0`（20 template-version-mismatch、20 template.hash、2 lock.source-mismatch、24+59 .review-materials 相关） |

## 4. 变更摘要与设计理由

**变更**：

1. `docs/std.lock.json`：`std_version` → `0.1.0-draft.26`，`source_revision` → `5a1e71f4e2baa6e6761b685e91deecbd58cf0649`。
2. `docs/std-source-manifest.json`：以 draft.26 源树重建（189 artifacts）。
3. 20 份文档实例的 sidecar metadata：`template_version` 与 `template_sha256` 对齐 draft.26 catalog；对应正文封面 `Template Version` 字段同步。**正文章节不动**。
4. 路径对齐（已先行完成，见 commit `f878b19`）：`interfaces.control` 移至 `docs/60_interfaces/`；`assurance.test-report` 按新 path-policy 移至 `tests/integration/reports/`。

**设计理由**：

- Piko 文档全部为 `template_conformance=tailored`（`tailoring_ref=piko-std-tailoring-v0.1`）或 legacy 映射，章节结构由 tailoring 决定，不由模板版本逐字决定。因此模板小版本/大版本升级不强制重写正文；metadata 对齐后 validator 恢复一致。
- `design.system` 模板 0.1.0 → 8.3.1 为大版本变化，但 Piko 的 9 节精简 authority 由 TAIL-P-001 裁剪决定背书（映射见 `docs/98_migration/piko-std-migration-map.md`）；本次升级不改变该裁剪决定。若未来要把正文对齐 8.x 完整结构，应另立独立设计修订评审，不混入本升级。
- 升级消除 lock 与 manifest 的版本漂移，使 `validate-design` 恢复"仅剩历史遗留"的可判定状态。

## 5. Requirement、Design、Contract、Test 对齐

- 需求追踪、系统设计、契约、测试规格的正文本轮零改动；`PK-T01..PK-T40` oracle 与 `0.3.0-simplified.6` 机器契约不受影响。
- `piko-agent-runtime-test-specification-v0.3`（assurance.test-specification 0.1.0 → 0.2.1）：模板新增内容不回写正文；现有 oracle 表继续作为 authority。
- 测试证据链：`tests/integration/matrix-acceptance-20260919.md`（test-report 新路径）+ `tests/integration/matrix-acceptance.test.ts` 不受影响。

## 6. 风险、未决项和不阻塞项

| 项 | 类别 | 处置 |
|---|---|---|
| `.review-materials/` 下 Slinky 历史快照带旧 STD cover，validator 报 metadata.missing / hash-mismatch | 不阻塞 | 属跨项目历史评审输入，非 Piko authority；用 `validate-design --write-baseline` 固化为 inherited 基线 |
| `design.system` 正文（9 节）与 8.3.1 模板完整结构差异大 | 不阻塞 | 由 TAIL-P-001 tailoring 背书；完整对齐留待未来独立设计修订 |
| 8 份无 STD cover 的历史 md（unit-test-plan、debug report、review request/refusal、migration inventory/map、finalization packet） | 不阻塞 | validator 不将其视为 STD 实例；是否补 cover 由 owner 另行决定 |
| tailoring 文档 §2 表内模板版本号未逐项刷新 | 不阻塞 | tailoring 表记录的是模板 ID 与启用决定，不锁模板版本号 |

## 7. 验证命令与结果

| 验证 | 命令 | 结果 |
|---|---|---|
| STD source manifest | `/Users/ben/work/STD/scripts/verify-source-manifest docs/std-source-manifest.json` | PASS（189 artifacts） |
| STD structural validation | `/Users/ben/work/STD/scripts/validate-design --project-root . --baseline <baseline>` | 升级后 new=0（baseline 固化 .review-materials inherited） |
| 项目契约 | `npm run check` | 17 files / 62 passed + 4 skipped；`validate_v03_contract.py` PASS simplified.6 |

## 8. Review Checklist

- [x] scope 与 authority 清楚
- [x] 现状、批准变更和未来设想未混写（正文重写明确 out of scope）
- [x] 接口、错误、状态和恢复已闭合（机器契约不变）
- [x] 安全与隔离已评审（纯文档/元数据变更，无运行时影响）
- [x] traceability 和证据可打开（§7 命令可复跑）
- [x] 未发生静默 fallback 或兼容性扩张

## 9. 决定、条件与签署

| 字段 | 值 |
|---|---|
| Review Verdict | PENDING（待 Piko Project Owner） |
| Reviewer | 待填 |
| Decided At | 待填 |
| 条件 | 无 |
| Runtime Activation | `false`（本升级不授权任何运行时变更） |
