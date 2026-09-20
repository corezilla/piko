<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko STD draft.21 升级 Review Packet

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-std-draft21-upgrade-packet` |
| Document Version | `0.1.0` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Project Owner |
| Authors | corezilla |
| Created Date | `2026-09-09` |
| Last Modified Date | `2026-09-09` |
| Template ID | `review.packet` |
| Template Version | `0.1.1` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/91_reviews/piko-std-draft21-upgrade-packet.md` |
| Supersedes | none |

> 本 packet 只请求评审 STD draft.21 adoption 与两份上层设计的结构升级。它不改变机器契约、
> 已冻结业务决定、RAG canonical snapshot 或 Runtime Activation。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 请求的决定

请确认 Piko 已按新规则完成以下升级：项目层记录 adopted STD version；单份文档只记录 Template ID、
独立 Template Version 和模板 SHA-256；Agent Runtime 使用 `design.system`；CollaborationBridge 端到端
机制使用 `design.system-mechanism`；内部实现继续使用 `design.definition`。

评审结论必须与 Document Status、Runtime Activation 分离。当前结论只能作用于本次文档候选；
在明确批准和后续 promotion 前，两份 `0.3.1` 设计仍为 `review`，上一批准版本仍是生效基线。

## 2. 输入与来源锁

| 项目 | 值 |
|---|---|
| project | `corezilla/piko` |
| project base | `main@7f8839014e91c2e76b7b49a70ca55daaf410639f` |
| adopted STD | `0.1.0-draft.21` |
| STD source revision | `274ef0a67eda080baa0063ae27ede7ee129aa32a` |
| STD source tag | none |
| source manifest | `docs/std-source-manifest.json`，73 artifacts |
| project lock | `docs/std.lock.json` |
| runtime activation | `false / NOT_RUN` |

`source_revision` 是不可变 Git commit；tag 是可选字段。项目 README 与 lock 记录 adopted STD version，
单份文档封面和 sidecar 不再携带 STD aggregate version。

## 3. 变更范围

### 3.1 结构性修改

| 文档 | 原结构 | draft.21 结构 | 状态 |
|---|---|---|---|
| `docs/20_system_design/piko-agent-runtime-design-v0.3.md` | 旧通用 14 章 | arc42 风格 12 章 + A-H 工程附录 | `0.3.1 / review` |
| `docs/20_system_design/mechanisms/piko-collaboration-bridge-design-v0.3.md` | 旧通用 14 章 | 21 章跨子系统机制模板 | `0.3.1 / review` |
| `docs/30_subsystem_design/piko-collaboration-bridge-internal-design-v0.3.md` | `design.definition` | 模板版本/哈希更新，正文结构不变 | approved baseline |

系统设计保留目标、authority、构建块、Run/Result、LLMTier recovery、安全、质量与 gate；机制设计
保留 AS transaction、stable MXID、room、resolution、ExternalLink、close/archive、rename、restart 和
所有既有 requirement/test ID。重构新增了明确的 baseline/delta/open、invariant、failure、deployment、
rollout 与 evidence 分层，没有新增 runtime mechanism。

### 3.2 机械性修改

- `docs/std.lock.json` 与 README 升级项目 adoption；来源 manifest 由锁定 revision 重建。
- 所有 STD-backed 单份文档删除 `STD Version`/`std_version`，使用其模板在 catalog 中的独立版本 `0.1.0`。
- sidecar 的 `template_sha256` 更新为锁定 revision 对应模板的 SHA-256。
- 当前管理、traceability、contract、assurance 和历史 review 文档只更新模板 provenance；历史事件、
  Review ID、证据结论及当时采用的 STD 叙述不被改写。

## 4. Authority 与禁止变化

本次未修改 `interfaces/` 下 OpenAPI、JSON Schema、error catalog、fixture 或 contract validator。
以下冻结边界保持不变：

- Slinky 拥有 Project/Plan/IR/Artifact/Acceptance authority；Piko 只执行 exact materialized contract。
- LLMTier 拥有 Service Level Registry 与模型服务 authority；Piko 保持 exact-case model ID。
- V0.3 Piko generation surface 是 non-stream Responses、Models 与 Responses recovery；Chat/SSE 为 V0.4。
- CollaborationBridge 唯一路径是内建 AS virtual user + exclusive private room + ExternalLink；无外部 bridge、
  普通 sync/poll、heartbeat、ManagedUser、E2EE、iframe 或 shared-room/thread fallback。
- Session/close machine enum alignment、production persistence/HA 和真实依赖 E2E 继续是 Open Gate。

## 5. 三层验证计划

| Layer | 验证 | 判定 |
|---|---|---|
| L1 STD | source manifest verification；`validate-design --require-immutable-std` | lock、模板版本/hash、封面/metadata、目录与必需章节一致 |
| L2 project contract | `tests/contract/validate_v03_contract.py` | 冻结 OpenAPI/Schema/error/fixture 语义继续通过 |
| L3 runtime/external | Pi、LLMTier、Matrix/Element、DB crash/restart | 本次 `NOT_RUN/OPEN`，不得由 L1/L2 替代 |
| Git hygiene | JSON parse、旧字段扫描、`git diff --check` | 无格式错误、无单文档 aggregate STD version、无非预期机器改动 |

本候选的 pre-commit 执行结果：source manifest 73 artifacts 验证通过；STD validator 检查
15 份 metadata、15 份 Markdown、5 份既有 decision，0 issue；项目契约校验通过 4 个 Schema fixture、
2 个语义 fixture 以及 OpenAPI `$ref`/filter/typed error/authority boundary；JSON parse、机器契约
零差异检查和 `git diff --check` 均通过。上述结果属于 L1/L2 静态证据，不提升为 L3 运行证据。

## 6. RAG 与发布处置

现有 `rag/project-ingestion-manifest.jsonl` 保留上一 canonical snapshot，不在 review candidate 阶段重建。
只有本 packet 获得批准、候选被 promotion 为新的 canonical 文档后，才按独立 publication cohort 重新生成
RAG manifest。项目不存在外部 RAG backend 的既有事实不变。

## 7. 已知 Gate 与非目标

| Gate | 当前状态 | 本次处置 |
|---|---|---|
| 两份 `0.3.1` 结构升级 review | Open | 请求评审 |
| SessionSummary/CloseResult machine alignment | Open | 如实保留，不借迁移修改 schema |
| Pi/LLMTier/Matrix/Element 真实执行证据 | Open | 不把 static/mock 标为 runtime pass |
| persistence/HA/RPO/RTO/retention | Open | 实现前 ADR 与 fault-injection evidence |
| Runtime Activation | false | 本次不授权 |

本次不提交实现代码、不新增 endpoint、配置路径、selector、compatibility branch 或 fallback；不推送 GitHub，
除非用户在评审闭环后明确要求。
