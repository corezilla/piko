<!-- STD_DOCUMENT_COVER_BEGIN -->

# Slinky v0.3 Knowledge 设计

| 文档字段 | 值 |
|---|---|
| Document ID | `v0.3-knowledge-memory-skill` |
| Document Version | `0.3.0-draft.4` |
| Status | `Draft` |
| Project | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Last Modified Date | `2026-09-16` |
| Template ID | `design.subsystem` |
| Template Version | `0.5.0` |
<!-- STD_DOCUMENT_COVER_END -->

规范来源、六份主指令、Context 固定与实际覆盖证据遵循 [SM004](../../20_system_design/mechanisms/task_context.md)。

对象 ID：`S02`；子系统名：`Knowledge`；直属父对象：`Slinky`；目标 code_directory：`src/knowledge/`。当前实现位置及迁移边界见本文基线章节；编号与目录以系统对象登记表为准。

## 1. 概述

### 1.1 当前记忆所有权与更新路径

记忆系统属于Slinky，不属于Piko或LLMTier。Slinky持有正式内容、版本、权限、索引与检索。Piko的Agent session历史不替代项目记忆。

记忆更新沿既有Runtime普通任务：提供来源材料、当前记忆及版本、提取/归纳/去重要求 -> 对应IR/Piko执行 -> 返回建议变更及来源依据 -> Slinky验收与冲突检查 -> 正式落库 -> 更新派生索引。Piko不得直接修改正式记忆，不新增专用更新协议。

代码检查访问范围、输入结构、Secret、版本冲突和写入一致性；内容是否值得接受、如何处理冲突由授权智能角色判断，需要用户时提交待用户事务，不能只以机械分数自动晋升。拒绝/失败保留候选和原因，不污染有效记忆；并发新版本不得被旧建议覆盖。

记忆向量化只是本子系统内部实现，LLMTier按标准Embeddings提供专用模型能力。Memory负责分块、维度一致性、索引与检索，不把embedding内部依赖扩成三方控制协议。语义更新Agent任务仍经过Piko；不增加Memory直连生成模型执行任务的旁路。

旧文中的Tier judge、固定资格/自动promotion、模型级key/Invocation恢复和能力backing内容不再是目标；索引、来源、权限和派生数据可重建原则保留。现有Memory模块说明只证明旧基线，须按以上路径细化后用于新实现。


本子系统为 IR 提供可资格化的 Skill、Experience 和 project context，同时为 Artifact authoring/review 提供动态知识选择，不改变 Artifact Standard/Base Template 的硬约束。

本对象直属 Slinky 软件系统；不递归包含软件子系统。Piko/LLMTier 不属于本对象。

## 2. 功能需求与设计约束

- 负责：Knowledge Asset registry、Skill/Experience lifecycle、profile/eligibility、retrieval、Context Manifest、lesson promotion。
- 不负责：Artifact 内容 authority、IR allocation、LLM routing、外部 code/spec tool execution。
- authority：Knowledge/Skill/Experience 的 identity、version、qualification 与检索策略。
- 上级设计与需求：System Design、Artifact type/Standard、Role/IRDemand、Project/Code/Spec Artifact。

- Current Baseline：Artifact-aware RAG 已索引 requirement、SRS、system/ISD design、code、unit/system test Artifact；splitter 主要按 Markdown heading、JSON item、Python symbol。每类 Artifact 静态绑定 template、standard、author/reviewer experience 和 review prompt。
- Approved Delta：建立统一 Knowledge/Skill library；原 Role Experience 文件迁移为 Experience Asset；按 Artifact/System/Behavior/Risk/NFR 形成 Spec Profile，动态选择 Skill、template fragment、经验、反例和 checklist。
- 保留一个项目 RAG authority；CodeGraph/GitNexus 等只通过 `code.*` Adapter 提供能力，不建立第二个 RAG。

## 3. 总体方案（第 0 层设计）

```text
Task + ArtifactType + Role + Project context
-> resolve mandatory Standard/Base Template
-> build Spec/Capability Profile
-> select eligible Skill + Experience + examples/checklist
-> retrieve exact project evidence through existing RAG/ports
-> emit Context Manifest
-> Piko Agent executes
-> result/review/evidence
-> candidate lesson -> independent qualification -> promote or reject
```

Author 与 Reviewer 独立选择 Skill；Reviewer 输出 coverage manifest，不能复用 Author 的结论作为 review evidence。

## 4. 软件架构与模块分解（第 1 层设计）

### 4.1 内部模块登记表

| 对象 ID | 名称 | 类型 | 直属父对象 | 目标 code_directory | 旧名称 | 职责 / 接口归属 | 验证关联 | Document ID / 详细设计路径 | 状态 |
|---|---|---|---|---|---|---|---|---|---|
| M201 | Registry | 模块 | S02 | `src/knowledge/registry/` | Asset Registry | 知识资产身份、版本与 STD 规范引用 | V03-KM-001 | 未分配 / 未编写 | Planned |
| M202 | Profile | 模块 | S02 | `src/knowledge/profile/` | Profile Resolver | 任务、产物、角色与风险条件匹配 | V03-KM-002 | 未分配 / 未编写 | Planned |
| M203 | Qualify | 模块 | S02 | `src/knowledge/qualify/` | Qualification | 知识资产版本、范围、证据、有效期及独立性资格 | V03-KM-001/002 | 未分配 / 未编写 | Planned |
| M204 | Context | 模块 | S02 | `src/knowledge/context/` | Retrieval/Context Broker | 通过唯一 RAG/Port 检索、权限检查、预算与 Context Manifest | V03-KM-003/005 | 未分配 / 未编写 | Planned |
| M205 | Lesson | 模块 | S02 | `src/knowledge/lesson/` | Lesson Pipeline | 执行经验候选、独立审查及晋升流程 | V03-KM-004 | 未分配 / 未编写 | Planned |

本表是本子系统内部模块编号的唯一分配来源。无历史 S/M 编号或 Retired 对象；旧名称仅作映射，改名保持 ID。详细设计尚未编写，不以登记表替代接口 Schema 或实现证据。

![内部模块](../../assets/v0.3/knowledge-modules.svg)

模块共享既有子系统状态与恢复机制，不各建配置入口、执行器或状态库。后续接口规格按本表确定 provider/consumer 对象，验证项沿用原 ID 关联被测模块。

## 5. 运行设计

- Task dispatch 前固定 exact profile/asset versions；执行中 registry 更新不改变当前 attempt。
- Reviewer profile 必须独立解析，且满足 independence policy。
- 上游 Artifact version 变化使引用它的 Context Manifest stale，并触发局部 revalidation。
- RAG retrieval 只读；Template selection 不依赖相似度自动替代 mandatory Standard。

## 6. 数据与状态设计

Knowledge Asset：`Draft -> Qualified -> Active -> Deprecated -> Retired`；Experience candidate 未经过 review 不得进入 Active。Project evidence 与 generic method knowledge 分 namespace/authority。IR 只引用 `KnowledgeCapabilityProfile`，不复制资产内容。

## 7. 接口设计与 interfaces 映射

- Provided：resolve Artifact package、qualify Knowledge profile、build Context Manifest、retrieve by authority/scope、submit lesson candidate、review/publish/deprecate asset。
- Consumed：Artifact registry、ProjectEngineeringGraph、Code/Spec Intelligence Port、Piko execution result、Testing defect/evidence。
- Context Manifest 必须列出 asset ID/version/hash/source/authority/selection reason/token budget。

外部依赖只消费普通Piko任务结果及标准Embeddings向量化；见[接口总纲](../../60_interfaces/external-service-interface-control.md)。不依赖旧candidate的模型key/Invocation恢复与保留时钟。向量数目、索引对应关系和维度需在写入前验证，模型/维度变化重建相应派生索引，不静默混用。

任务上下文保留材料来源、版本与授权引用，不发送业务DTO给Tier。Review按材料与实际产物检查业务覆盖，不相信Agent自述就自动通过；本轮不要求专用broker逐字节证据协议。特殊审计需求如出现须先确认，不能从旧机器字段反推需求。

## 8. 关键业务流程与机制协作

### 项目文档规范包

承接系统设计 §8.4/P16。STD 文档规范管理与 Knowledge 并列，负责规范包导入、资格、替换解析、裁剪及基线生效，借助 Artifact 保存版本。
Knowledge 消费 STD 返回的精确资产引用、来源及资格结果，不维护第二份规范目录、覆盖规则或生效决定。
STD 解析失败时，Context Broker 将其缺项或冲突交 Runtime，相关文档 Work 保持准备阻塞。

Context Broker 向作者和独立评审者提供同一基线的完整必需材料，分批读取保留覆盖清单；RAG 提供补充经验。
STD 注册新包只解析静态内容，内含检查脚本须经 Tool/PR 资格及授权后执行。Knowledge 在读取资产时继续检查 ACL 与版本。
STD 基线升级后，未开始工作重准备，原 Attempt 保留旧 Context。

接口待补项：包目录与覆盖键、依赖与冲突、解析后逐项来源、裁剪、expected version、资格报告及影响工作。
对应验证：默认离线、整包缺项、局部覆盖、引用冲突、恶意脚本、权限隔离、版本竞争及在途升级。

一次任务先固定硬性 Standard/Template，再解析资格、按 ACL 检索、生成带版本与预算的 Context Manifest，交 IR/Runtime 调用 Piko。失败时返回具体缺失来源，不自动用通用提示替代。经验候选须独立审查后才能用于下一次任务。

### 8.1 六份任务指令与上下文装配

承接系统设计 §8.5，V0.3 只维护 task.md、review.md、analysis.md、research.md、plan.md、pm.md 六份主指令，目标路径为 `src/prompts/`。Context（M204）复用版本化资产及 Context Manifest 管理其引用、版本、摘要与材料覆盖；Runtime 按任务目的确定一种主指令。文档、编码、测试、修复共用 task；具体产物要求来自 TaskRequest 与 STD。

原“每类 Artifact 静态绑定 author/reviewer Prompt”是 V0.2 基线。V0.3 将模板和编写/评审规则交 STD，业务契约及程序约束保留在各 owner，经验作为 Knowledge 资格资产；Manifest 装配一次任务所需材料。STD 局部覆盖仅改变对应规范条目，主指令仍使用六份基线。可选经验缺失可为空，必需指令或材料缺失返回资格缺口。

原 Attempt 的主指令与材料版本保留到恢复义务完成；新版本只作用于新工作准备。六类正文、映射、完整材料覆盖、权限与预算、Schema 和实际 Piko 消费证据完成后才能切换旧加载逻辑；测试承接测试生命周期规格 §13。

## 9. 配置管理设计

沿用系统配置来源和唯一 active binding。启动先校验自身 Schema、输入版本与外部能力，按受影响 scope 返回就绪状态；不得新建子系统专用的配置发现或 fallback。具体参数字段及生效分类仍须补入接口目录后才可编码。

## 10. 异常处理、可靠性与安全设计

- mandatory Standard/Template 缺失直接阻塞。
- Skill/Experience 不匹配返回 qualification gap，不静默退到 generic prompt。
- Retrieval source 缺失、ACL 拒绝、index stale、backend unavailable 分别报告。
- 记录 selected/rejected assets、retrieval hits、coverage manifest、lesson promotion evidence。

Project/authority/visibility/ACL 在 ingest 和 retrieve 两端执行。Credential、Secret 和未经授权 transcript 不进入 RAG。Element discussion只有经结构化提炼和 review 后才能成为 Experience candidate。

## 11. 可调试性设计

诊断先读取当前 owner record、输入版本和 Evidence；只读查询不得触发执行。故障注入仅限隔离测试 profile，退出后检查租约、数据和指纹。未冻结调试操作字段前不开放 production mutation。

## 12. 可维护性与升级设计

统计区分成功、失败、Blocked、Invalid 和 Stale；日志绑定 Project/Work/Attempt。升级先停止新工作，保留未完成义务；迁移必须对账版本、引用与历史证据。回滚不能把报告或索引重新提升为业务 authority。物理存储迁移方案仍需下级设计。

## 13. 可部署性、可测试性与验证设计

本轮新增验证：Piko返回建议不直接落库；旧版本建议冲突时不覆盖新记忆；缺来源/越权候选不接受；Agent失败不改正式内容；接受后的索引失败可见且可重建；实际、估算、未知token区分。具体场景见[当前修订验证](../../70_verification/specifications/intelligent-process-design-checks.md)。

| Requirement | Design element | Verification method | Evidence | Status |
|---|---|---|---|---|
| V03-KM-001 | mandatory Standard before Skill | negative test | missing standard blocks | Planned |
| V03-KM-002 | independent reviewer profile | Contract test | distinct coverage manifest | Planned |
| V03-KM-003 | single RAG authority | architecture scan | no duplicate index path | Planned |
| V03-KM-004 | Experience promotion | mutation/review | bad lesson rejected | Planned |
| V03-KM-005 | code backend interchange | Adapter Contract test | equivalent `code.*` semantics | Planned |

部署与复位使用 PR 环境指纹和本 scope 的清理 manifest。先执行真实单环境纵向链路，再扩大至并行环境；每层记录独立结果，不把静态 Schema 校验当成子系统执行通过。

## 14. 性能与资源设计

Context window 是 IR qualification constraint；Context Broker 必须在 token budget 内优先保留 mandatory constraints、current Artifact、accepted decision 和 failure evidence。Embedding=0 或 index 污染时不得宣称 semantic retrieval ready。

## 15. 实现与下游详细设计

扩展现有 Artifact-aware RAG 与 Adapter；删除原 Role Experience 的直接文件绑定入口。CodeGraph 可作为统一 `code.*` Backend 候选，但必须先通过 Backend Contract Test；GitNexus 的 Cypher/process/rename/PDG/taint 不因采用 CodeGraph 自动消失。

- [ ] Knowledge Asset/Profile/Context Manifest Schema。
- [ ] Role Experience migration map。
- [ ] Code/Spec splitter and parser capability matrix。
- [ ] reviewer independence and expiry policy。
- Gate：mandatory asset、qualification 与 ACL 未通过时 IR 不得执行相关 Work。

迁移来源：`docs/30_subsystem_design/v0.3/v0_3_knowledge_memory_skill_upgrade_draft_20260801.md`。

## A. 输入与适用性

输入是 v0.3-system-design、SRS、原子方案和其既有接口/测试 ID。结构采用新模板，具体配置、机器接口和部署细节尚未全部闭合，因此保持 legacy-mapped，不宣称原生完整设计。

## B. 文档控制与修订记录

2026-09-14：按系统对象登记补齐内部模块编码、父对象、短名称、目标目录、接口职责和验证关联，新增内部模块结构图。模块详细设计保持 Planned。

2026-09-13：从旧 design.definition 迁移到 design.subsystem 0.5.0；保留全部原章节正文与验收 ID，新增运行、配置、调试、部署与验证承接。尚未批准发布或 runtime activation。

### 文档控制字段

<!-- STD_DOCUMENT_CONTROL_BEGIN -->
| 字段 | 值 |
|---|---|
| Authority | `slinky` |
| Authors | `原方案作者（原始 attribution 见固定来源 commit）, Codex（主干设计归并）` |
| Created Date | `2026-09-07` |
| Template Conformance | `legacy-mapped` |
| Tailoring Reference | `none` |
| Migration Map Reference | `docs/98_migration/std-software-upgrade/migration-map.md` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/30_subsystem_design/knowledge/design.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_CONTROL_END -->
