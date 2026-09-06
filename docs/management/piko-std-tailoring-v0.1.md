# Piko STD 迁移裁剪清单

## 1. 适用背景

- 项目：`piko`
- 生命周期阶段：v0.3 架构与接口契约评审，尚无 production implementation
- 产品类型：software
- 安全或业务关键性：跨项目 Agent Runtime；涉及 Secret、代码执行、外部模型调用和
  Matrix 身份，按高一致性与高隔离要求设计

## 2. 启用模板

| Template ID | Profile | 是否必需 | 计划文档 | Owner |
|---|---|---|---|---|
| `management.tailoring` | software | 是 | `piko-std-tailoring-v0.1.md` | Piko |
| `design.definition` | software/subsystem | 是 | `piko-agent-runtime-design-v0.3.md` | Piko |
| `design.definition` | software/subsystem | 是 | `piko-collaboration-bridge-design-v0.3.md` | Piko |
| `contracts.specification` | software | 是 | `piko-agent-runtime-contract-v0.3.md` | Piko |
| `assurance.vv-plan` | software | 是 | `piko-agent-runtime-vv-plan-v0.3.md` | Piko |
| `assurance.test-specification` | software | 是 | `piko-agent-runtime-test-specification-v0.3.md` | Piko |
| `review.packet` | software | 是 | `piko-std-migration-review-packet.md` | Piko |
| `decisions.adr` | software | 条件启用 | 仅在迁移产生新架构决定时新建 | Piko + 决策相关方 |
| `operations.release` | software | 暂不启用 | production implementation 前建立 | Piko Operator |

## 3. 裁剪决定

| ID | 模板/章节 | keep / simplify / omit | 理由 | 风险 | 批准人 | ADR |
|---|---|---|---|---|---|---|
| TAIL-P-001 | `design.definition` 全部 14 章 | keep | Agent Runtime 与 CollaborationBridge 均有复杂边界、状态和恢复 | 无 | 待项目 Review | N/A |
| TAIL-P-002 | `design.system` | omit | 当前迁移对象是 Piko service/subsystem；Slinky 承担上位 Project/System authority | 若未来 Piko 成为独立产品需补系统级文档 | 待项目 Review | N/A |
| TAIL-P-003 | `requirements.specification` | simplify | 本轮保留外部 Requirement/Matrix ID 和 traceability，不复制 Slinky 需求 authority | 需求分散在外部冻结记录 | 待项目 Review | N/A |
| TAIL-P-004 | `interfaces.control` | simplify | 当前单一调用方与接口面已由 OpenAPI/Schema 描述；使用 contract spec 聚合 | 跨部署网络参数后续可能需要 ICD | 待项目 Review | N/A |
| TAIL-P-005 | `contracts.specification` | keep | OpenAPI、Schema、error 和 fixture 是字段级权威 | 无 | 待项目 Review | N/A |
| TAIL-P-006 | `assurance.vv-plan` + `test-specification` | keep | 必须区分验证策略与可执行 Case | 无 | 待项目 Review | N/A |
| TAIL-P-007 | `assurance.test-report` | omit | 尚未执行 production、Matrix homeserver 或 crash E2E | 不能误报验证完成 | 待项目 Review | N/A |
| TAIL-P-008 | `operations.release` | omit | 尚无实现、部署或 release baseline | 运维设计必须在实现前补齐 | 待项目 Review | N/A |
| TAIL-P-009 | Piko 项目文档 RAG ingestion | omit | 新文档尚未完成项目 Review，不是 canonical artifact | 暂不可通过 RAG 发现候选迁移 | 待项目 Review | N/A |
| TAIL-P-010 | STD 来源 SHA-256 manifest | keep | `source_revision=null` 时仍须保留公共 STD 来源哈希，并由 `docs/std.lock.json.manifest_path` 指向 | STD draft 内容变化时必须重新生成快照并复审 | 待项目 Review | N/A |

## 4. 禁止裁剪项

以下内容若适用，不得无理由删除：authority、接口、状态与数据所有权、失败恢复、安全、
验证方法、traceability、版本和来源证据。

Piko 额外禁止裁剪：单一 Agent Runtime path、完整 IR/Slot 约束、LLMTier exact model
identity、Matrix stable identity、exclusive room、多 room cursor、structured resolution、
Element ExternalLink、durable delivery、UnknownOutcome、Secret boundary、fail-closed 与
activation gate。

## 5. Review 与生效

当前状态为 `review`。STD `source_revision` 尚未冻结，因此本清单及全部迁移候选不能标记
accepted/released。来源 manifest 仅锁定 STD draft 内容，不提升候选状态，也不执行项目 RAG。

重新评审触发条件：STD 首次 immutable commit/tag、模板或 Schema version 变化、Piko
authority/API/状态机变化、Pi/LLMTier/Matrix contract 变化、production topology 确定，或
任何新增 runtime/config/fallback path 提案。
