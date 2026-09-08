<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko STD Default Directory Relocation Review Packet

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-std-directory-relocation-packet` |
| Document Version | `0.1.0-draft.1` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Project Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner; STD reviewer |
| Created Date | `2026-09-08` |
| Last Modified Date | `2026-09-08` |
| STD Version | `0.1.0-draft.19` |
| Template ID | `review.packet` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | `docs/98_migration/piko-std-migration-map.md` |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/91_reviews/piko-std-directory-relocation-packet.md` |
| Supersedes | none |

> DIR-01 仅把已迁移、已 promotion 的 Piko 文档和机器 artifact 一次搬到 STD 默认软件目录树，
> 并修复路径引用；不改变业务语义、authority、Document Status 或 Runtime Activation。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 决定目标与 immutable input

用户在 Piko 原会话直接要求按标准建立新目录树并一次移动文件。DIR-01 以 PUB-01 immutable
commit `21e24df144ef81e73203372dcbab15f533e3c511` 为唯一项目输入，以 STD draft.19 immutable
commit `eeaf9bf33012928e3e74a9ca30e87d717690d343` 和 annotated tag
`std-v0.1.0-draft.19` 为标准输入。

DIR-01 不重写 MR-01、CP-01、PUB-01 的历史结论。旧 packet/evidence 和
`rag/project-ingestion-manifest.jsonl` 内的旧路径与 commit 是当时 immutable snapshot 的审计事实；
新路径 publication 必须在 DIR-01 形成 immutable commit 后由 PUB-02 单独生成。

## 2. 单次目录迁移范围

| Scope | Source layout | Target layout |
|---|---|---|
| project control | `docs/management/` | `docs/00_management/`、`docs/10_requirements/`、`docs/98_migration/` |
| canonical design | `docs/design/` | `docs/20_system_design/`、`docs/20_system_design/mechanisms/`、`docs/30_subsystem_design/` |
| contract prose | `docs/contracts/` | `docs/60_interfaces/contracts/` |
| verification | `docs/assurance/`、`docs/qa/` | `docs/70_verification/{plans,specifications,reports}/` |
| review/audit | `docs/review/` | `docs/91_reviews/` |
| historical/reference | legacy files in design/contracts/qa | `docs/99_reference/{design,interfaces,verification}/` |
| machine authority | current files in `docs/contracts/` | top-level `interfaces/{openapi,schemas,error-codes,vectors}/` |
| executable contract Gate | `scripts/validate_v03_contract.py` | `tests/contract/validate_v03_contract.py` |

`docs/std.lock.json`、`docs/std-source-manifest.json` 和 `rag/` 保留顶层职责。`upstream/pi`
不是本 cohort 的 tracked artifact，不读取、不移动、不纳入提交。

## 3. Authority 与历史边界

- 10 份 current canonical Markdown 的 Document ID、review provenance 和 scope authority 不变。
- OpenAPI、JSON Schema、error catalog、fixtures 继续是字段级机器 authority；Markdown 只引用它们。
- QA ledger、跨项目 review 与旧 evidence 继续承担未关闭项及历史证据，不因搬移变为运行 PASS。
- 两份 Superseded prose 与 v0.1 historical artifact 只移动到 `docs/99_reference/`，不恢复 current authority。
- Git rename/history、inventory、migration map 和本 packet 共同记录 old-to-new 路径关系。
- PUB-01 manifest 保留旧 immutable commit 的精确事实；PUB-02 才发布 DIR-01 后的新路径。
- 外部 vector ingestion 仍为 `N/A_NO_PROJECT_BACKEND`；Runtime Activation 为 `false / NOT_RUN`。

## 4. 变更控制与验证

DIR-01 允许的内容变化仅限：路径移动、链接/引用修复、sidecar 与封面 canonical/source path、
STD draft.19 lock/source metadata，以及本 cohort 的 inventory/map/plan/packet/decision/evidence。
候选使用不含 evidence 自身的确定性 artifact-set digest，另以临时 Git index 校验完整 staged
path set 和 `git diff --cached --check`。

| Layer | Gate | Required result |
|---|---|---|
| L1 source | STD source verifier，71 artifacts | PASS |
| L1 project | project-root validator，immutable STD | PASS，0 issue |
| L2 project | Piko contract/schema/fixture validator | PASS |
| L2 relocation | source-path、cover、link/ref、old-tree absence、rename map | PASS |
| L3 runtime/external | no runtime or external behavior changed | `NOT_RUN` / `N/A_NO_PROJECT_BACKEND` |
| Git hygiene | exact allowlist/digest + temporary-index cached check | PASS |

## 5. Requested decision

请 STD 复核 DIR-01 的精确路径集合、确定性 digest、目录映射、authority preservation 与三层证据。
收到 `COMMIT_APPROVED` 前不提交或推送。DIR-01 获批并形成 immutable commit 后，PUB-02 将作为
独立 cohort 重建项目 ingestion manifest；本请求不授权 Runtime Activation。
