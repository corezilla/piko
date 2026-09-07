<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko STD 迁移裁剪清单

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-std-tailoring-v0.1` |
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
| STD Version | `0.1.0-draft.18` |
| Template ID | `management.tailoring` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/management/piko-std-tailoring-v0.1.md` |
| Supersedes | none |

> 内部 repository identifier 为 `piko`，canonical GitHub repository 为 `corezilla/piko`。
> 本裁剪清单已完成文档批准；Runtime Activation 仍为独立 Gate。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 适用背景

- 项目：`piko`
- 生命周期阶段：v0.3 架构与接口契约评审，尚无 production implementation
- 产品类型：software
- 安全或业务关键性：跨项目 Agent Runtime；涉及 Secret、代码执行、外部模型调用和
  Matrix 身份，按高一致性与高隔离要求设计

## 2. 启用模板

| Template ID | Profile | 是否必需 | 计划文档 | Owner |
|---|---|---|---|---|
| `management.project-plan` | software | 是 | `piko-std-migration-plan-v0.1.md` | Piko Project Owner |
| `management.tailoring` | software | 是 | `piko-std-tailoring-v0.1.md` | Piko |
| `design.system` | software/system | 是 | `piko-agent-runtime-design-v0.3.md` | Piko |
| `design.system-mechanism` | software/cross-level | 是 | `piko-collaboration-bridge-design-v0.3.md` | Piko |
| `design.definition` | software/subsystem | 是 | `piko-collaboration-bridge-internal-design-v0.3.md` | Piko |
| `contracts.specification` | software | 是 | `piko-agent-runtime-contract-v0.3.md` | Piko |
| `requirements.traceability` | systems/software | 是 | `piko-requirements-traceability-v0.3.md` | Piko |
| `assurance.vv-plan` | software | 是 | `piko-agent-runtime-vv-plan-v0.3.md` | Piko |
| `assurance.test-specification` | software | 是 | `piko-agent-runtime-test-specification-v0.3.md` | Piko |
| `review.packet` | software | 是 | `piko-std-migration-review-packet.md` | Piko |
| `decisions.adr` | software | 条件启用 | 仅在迁移产生新架构决定时新建 | Piko + 决策相关方 |
| `operations.release` | software | 暂不启用 | production implementation 前建立 | Piko Operator |

## 3. 裁剪决定

| ID | 模板/章节 | keep / simplify / omit | 理由 | 风险 | 批准人 | ADR |
|---|---|---|---|---|---|---|
| TAIL-P-001 | `design.system` 章节映射 | keep/tailor | Piko Agent Runtime 作为本项目 system；保留既有 14 章内容结构，映射见 migration map | 章节编号不与模板逐字相同 | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-002 | `design.system-mechanism` | keep/tailor | CollaborationBridge 跨 API、存储、Matrix 与恢复边界 | 端到端内容与内部定义必须保持 authority 分离 | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-003 | `requirements.specification` | simplify | 本轮建立 traceability matrix，不复制 Slinky 需求 authority | 需求来源仍有外部 authority | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-004 | `interfaces.control` | simplify | 当前单一调用方与接口面已由 OpenAPI/Schema 描述；使用 contract spec 聚合 | 跨部署网络参数后续可能需要 ICD | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-005 | `contracts.specification` | keep | OpenAPI、Schema、error 和 fixture 是字段级权威 | 无 | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-006 | `assurance.vv-plan` + `test-specification` | keep | 必须区分验证策略与可执行 Case | 无 | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-007 | `assurance.test-report` | omit | 尚未执行 production、Matrix homeserver 或 crash E2E | 不能误报验证完成 | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-008 | `operations.release` | omit | 尚无实现、部署或 release baseline | 运维设计必须在实现前补齐 | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-009 | Piko 项目文档 RAG publication | defer | 只有 CP-01 提交后才可生成 publication manifest | PUB-01 必须记录 canonical commit、ACL、include/exclude 与 retrieval evidence | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-010 | STD 来源 SHA-256 manifest | keep | 以完整 commit、annotated tag 和 71-artifact manifest 锁定 draft.18 | STD revision 变化时必须重新生成并复审 | Approved | N/A |
| TAIL-P-011 | 现有 `docs/{management,design,contracts,assurance,review}` 路径 | keep | 避免非必要移动并保留当前链接；通过 sidecar `source_path` 管理 | 与 STD 默认目录名不同 | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-012 | Repository 字段 | keep | 内部 identifier=`piko`；canonical GitHub repository=`corezilla/piko` | remote 只在提交 Gate 后配置；不影响 runtime | User / Piko Project Owner（2026-09-07） | N/A |

## 4. 禁止裁剪项

以下内容若适用，不得无理由删除：authority、接口、状态与数据所有权、失败恢复、安全、
验证方法、traceability、版本和来源证据。

Piko 额外禁止裁剪：单一 Agent Runtime path、完整 IR/Slot 约束、LLMTier exact model
identity、Matrix stable identity、exclusive room、多 room cursor、structured resolution、
Element ExternalLink、durable delivery、UnknownOutcome、Secret boundary、fail-closed 与
activation gate。

## 5. Review 与生效

当前 Document Status 为 `Approved`。STD 来源已锁定到完整 commit
`9841083c4d8d0ed1556bdc413d77b4567ac696b4` 与 annotated tag
`std-v0.1.0-draft.18`。MR-01 immutable candidate 经独立 Gate 后由 CP-01 提升文档状态；
项目 RAG publication 仍由 PUB-01 单独执行，Runtime Activation 不随文档状态改变。

重新评审触发条件：STD immutable commit/tag、模板或 Schema version 变化、Piko
authority/API/状态机变化、Pi/LLMTier/Matrix contract 变化、production topology 确定，或
任何新增 runtime/config/fallback path 提案。
