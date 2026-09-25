<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko STD 迁移裁剪清单

> STD 使用入口：[项目采用说明与标准导航](../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-std-tailoring-v0.1` |
| Document Version | `0.1.3` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Project Owner |
| Authors | corezilla |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-25` |
| Template ID | `management.tailoring` |
| Template Version | `0.2.0` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/00_management/piko-std-tailoring-v0.1.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 适用背景

- 项目：`piko`
- 生命周期阶段：v0.3 架构、接口契约与实现级设计已批准，尚无 production implementation
- 产品类型：software
- 安全或业务关键性：跨项目 Agent Runtime；涉及 Secret、代码执行、外部模型调用和
  Matrix 身份，按高一致性与高隔离要求设计

## 2. 启用模板

| Template ID | Profile | 是否必需 | 计划文档 | Owner |
|---|---|---|---|---|
| `management.project-plan` | software | 是 | `piko-std-migration-plan-v0.1.md` | Piko Project Owner |
| `management.tailoring` | software | 是 | `piko-std-tailoring-v0.1.md` | Piko |
| `design.system` | software/system | 是 | `piko-agent-runtime-design-v0.3.md` | Piko |
| `design.system-mechanism` | software/cross-level | 否 | 当前没有经确认的自定义跨系统机制 | Piko |
| `design.definition` | software/subsystem/implementation-unit | 是 | `piko-agent-runtime-core-internal-design-v0.3.md`；`piko-runtime-implementation-design-v0.3.md` | Piko |
| `contracts.specification` | software | 是 | `piko-agent-runtime-contract-v0.3.md` | Piko |
| `requirements.traceability` | systems/software | 是 | `piko-requirements-traceability-v0.3.md` | Piko |
| `assurance.vv-plan` | software | 是 | `piko-agent-runtime-vv-plan-v0.3.md` | Piko |
| `assurance.test-specification` | software | 是 | `piko-agent-runtime-test-specification-v0.3.md` | Piko |
| `review.packet` | software | 是 | `piko-std-migration-review-packet.md` | Piko |
| `decisions.adr` | software | 条件启用 | 仅在迁移产生新架构决定时新建 | Piko + 决策相关方 |
| `operations.release` | software | 是 | `piko-runtime-release-and-operations-v0.3.md`（设计阶段） | Piko Operator |

## 3. 裁剪决定

| ID | 模板/章节 | keep / simplify / omit | 理由 | 风险 | 批准人 | ADR |
|---|---|---|---|---|---|---|
| ~~TAIL-P-001~~ 已撤销 | ~~`design.system` 章节映射~~ | ~~keep/tailor~~ | ~~Piko Agent Runtime 作为本项目 system；当前简化 authority 为9节，映射见 migration map~~ | ~~章节编号不与模板逐字相同~~ | ~~User / Piko Project Owner（2026-09-07）~~ | ~~N/A~~ | 撤销理由：TAIL-P-001 把"tailored"误用为"可自定章节"，违背 STD draft.35 模板结构强约束；本次 draft.26→draft.35 升级已按 `design.software-system` 1.0.0 17+2 节、`design.subsystem` 1.0.0 14+2 节、`design.implementation` 1.0.0 10 节重写设计正文。撤销人：User / Piko Project Owner（2026-09-25）；相关新决定：TAIL-P-101..TAIL-P-105 |
| TAIL-P-002 | `design.system-mechanism` | omit | 用户已撤回自定义 CollaborationBridge；Matrix 使用主流 SDK/协议并纳入 runtime core | 不得借模板恢复产品消息协议 | User / Piko Project Owner（2026-09-17） | N/A |
| TAIL-P-003 | `requirements.specification` | simplify | 本轮建立 traceability matrix，不复制 Slinky 需求 authority | 需求来源仍有外部 authority | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-004 | `interfaces.control` | simplify | 当前单一调用方与接口面已由 OpenAPI/Schema 描述；使用 contract spec 聚合 | 跨部署网络参数后续可能需要 ICD | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-005 | `contracts.specification` | keep | OpenAPI、Schema、error 和 fixture 是字段级权威 | 无 | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-006 | `assurance.vv-plan` + `test-specification` | keep | 必须区分验证策略与可执行 Case | 无 | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-007 | `assurance.test-report` | omit | 尚未执行 production、Matrix homeserver 或 crash E2E | 不能误报验证完成 | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-008 | `operations.release` | keep/tailor | 评审要求在下游实现前明确诊断、恢复和授权边界；正文仍标NOT_BUILT | 不得冒充发布或激活证据 | User / Piko Project Owner（2026-09-17） | N/A |
| TAIL-P-009 | Piko 项目文档 RAG publication | keep | PUB-01 已生成固定 inclusion/exclusion 与 retrieval evidence | 目录搬移后必须基于新 immutable commit 再发布 manifest | User / Piko Project Owner（2026-09-08） | N/A |
| TAIL-P-010 | STD 来源 SHA-256 manifest | keep | 以 `docs/std.lock.json` 与来源manifest锁定 draft.35 revision `55df05b3bfb733a3623553bbfc38a1feba369444` | STD revision 变化时必须重新生成并复审 | Approved | N/A |
| TAIL-P-011 | STD 默认软件目录树 | adopt-default | 用户明确要求一次性迁入编号 `docs/`、顶层 `interfaces/` 与 `tests/contract/` | 历史证据中的旧路径只作为旧 commit 审计记录 | User / Piko Project Owner（2026-09-08） | N/A |
| TAIL-P-012 | Repository 字段 | keep | 内部 identifier=`piko`；canonical GitHub repository=`corezilla/piko` | remote 只在提交 Gate 后配置；不影响 runtime | User / Piko Project Owner（2026-09-07） | N/A |
| TAIL-P-101 | `design.software-system` §4.3 UI 设计 | omit · Piko 无 Web/桌面图形入口 | 替代位置：§4.2 + ops 文档 | User / Piko Project Owner（2026-09-25） | N/A |
| TAIL-P-102 | `design.software-system` §8.2/8.3/8.4/8.5/8.6/8.7 系统级数据/配置/通信/设备/运行态/表结构 | omit · 由 subsystem + ISD 唯一维护 | 替代位置：`piko-agent-runtime-core-internal-design-v0.3` §5 + `piko-runtime-implementation-design-v0.3.isd.md` §4 | User / Piko Project Owner（2026-09-25） | N/A |
| TAIL-P-103 | `design.software-system` §9.3 硬件/固件接口 | omit · 纯软件 | — | User / Piko Project Owner（2026-09-25） | N/A |
| TAIL-P-104 | `design.software-system` §6.3 多实例/横向扩展 | omit · 单实例单 slot | 替代位置：§3.3 关键决定 2 | User / Piko Project Owner（2026-09-25） | N/A |
| TAIL-P-105 | `design.software-system` §11.1 副本/HA | omit · 单实例 | 替代位置：§3.3 关键决定 2 | User / Piko Project Owner（2026-09-25） | N/A |

## 4. 禁止裁剪项

以下内容若适用，不得无理由删除：authority、接口、状态与数据所有权、失败恢复、安全、
验证方法、traceability、版本和来源证据。

Piko 额外禁止裁剪：单一Agent Runtime path、一个实例一个Agent execution slot、每Run session隔离、
稳定任务查询、Matrix stable identity/membership/cursor/txn安全、未知副作用fail-closed、Secret boundary、
typed error/usage缺失事实和activation gate。已退出的IR/Slot产品约束、exclusive room、structured resolution、
Element ExternalLink或自定义durable delivery不得借裁剪规则恢复。

## 5. Review 与生效

当前修订的 Document Status 为 `Approved`；此前批准记录保留在 Git 历史。当前项目采用的 STD
锁定为 `0.1.0-draft.35`、source revision
`55df05b3bfb733a3623553bbfc38a1feba369444`，`source_tag=null`；不得从当前 STD checkout 推导或擅自升级。
MR-01、CP-01、PUB-01、DIR-01、PUB-02 与 STD-35 升级（draft26→draft35）均已完成。文档状态不代表生产实现或部署准备状态。

重新评审触发条件：STD immutable commit/tag、模板或 Schema version 变化、Piko
authority/API/状态机变化、Pi/LLMTier/Matrix contract 变化、production topology 确定，或
任何新增 runtime/config/fallback path 提案。
