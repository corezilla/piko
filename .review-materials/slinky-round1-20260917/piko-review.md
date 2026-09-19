覆盖原消息 ID：S-20260917-97ad71aa7e31；关联首轮请求 S-20260917-ebb757b84470。

# Piko 对 Slinky 第一轮固定快照的完整评审

结论：**AMENDMENT**。本轮只提交意见，没有修改 Slinky、Piko 或 LLMTier 的权威设计、机器契约或实现。

## 基线与完成范围

- 主包 `slinky-round1-materials-20260917/review.tar.gz`：157016 bytes，SHA-256 `9d40baba915b20822aea6164421f9b3bfd547c73d447e8e7c5cec78ba4da608d`。
- 补包 `slinky-round1-supplement-20260917/review.tar.gz`：69890 bytes，SHA-256 `c0fa277c4d1634fe32c149809ec9aa4fe0c7dea454a9229d6a4612a7011947ba`。
- 已在 Piko 评审目录只读展开；主包 20/20、补包 10/10 成员的字节数和 SHA-256 均与内嵌 manifest 一致。未执行包内内容，未读取 Slinky 活动工作树。
- 关键当前版本：system design `0.3.0-draft.29`、SRS `0.3.0-draft.6`、external interface/control contract `0.3.0-draft.6`、Runtime/IR `0.3.0-draft.5`、Plan/Knowledge `0.3.0-draft.4`。
- 30 份已交付文档/JSON的正文一致性评审已完成。包中未含被引用的 SVG/PNG、metadata、communication lifecycle JSON Schema/OpenAPI 等机器字节，因此本结论不声称完成图形渲染或机器 Schema 一致性复验；这些缺项不阻止以下文本设计结论。

## 必须修正

### SLK-R1-PK-01 — P0 — 当前权威入口仍同时指向已撤回机制

**位置**：`system-design.md` §7/§13.2（523–540、794–804）；`version-development-plan.md` §2–§4/§10（52–64、75–87、154）；`view-contracts.md` §3.2–3.4（64–74、99–101）；`testing/design.md` §14（141–143）；`test-lifecycle-specification.md` §11/§14（171、271–308）。

**证据**：当前 system design 仍把 P04 claim/backing、P08 key/契约窗口、P09 drain、Q-V03-02 Invocation dispatch、Q-V03-04 snapshot、claim/Closing drain列为当前流程/测试；开发计划仍把 Piko execution capacity/claim、LLMTier ledger/Observation列为 owner 职责，并规定 Invocation GET/POST 恢复；Testing 与生命周期规格仍要求 Tier Seat、capacity snapshot、claim、execution release、Session drain、Source/Instance。

**影响**：这些不是孤立历史段落，而是被当前系统设计、WBS、View 和验证入口继续引用；实现者可合理地把已经撤回的跨系统机制当成 Gate，形成两套相互冲突的实施依据。

**最小修改**：从当前流程表、WBS、View、测试计划和验收 Gate 删除上述义务，改为普通 Piko 任务事实、PR 本地资源安全、标准模型/Embedding、任务 Usage。需要保留的旧用例移入明确的 historical/migration appendix，不得继续出现在当前 predecessor、owner、exit criteria 或 required test 中；不新增替代协议。

### SLK-R1-PK-02 — P0 — 原生 Matrix 目标与活跃通信契约相互矛盾

**位置**：`system-design.md` §6.2（437–443）；`external-service-contracts.md` §4/§7（50–56、68–72）；`project-communication-integration.md` §2/§4–5（54–60、127–172）；`communication-lifecycle-contract.md` 全文，尤其撤回通知与 §1–3（25、31–47、84–116、134–140）；`view-contracts.md` §1/§3.4（31、99–101）。

**证据**：当前系统设计明确只要求 Matrix 原生身份、membership、文本、reply、media，并明确不要求 Topic/SID/RID、outbox/ingress、Run trigger、授权投影或跨系统 drain。与此同时，ADR draft.13 仍定义 CollaborationSession/Topic、session binding/version、Piko codec、SID/RID、ingress、content_ref；View 仍主动消费这些字段；生命周期契约虽在第25行声明相关内容退出 authority，随后却继续把其 Schema 称为“字段候选唯一来源”并完整定义 CreateTopic、binding、trigger、drain、backup 等当前操作。

**影响**：UI、Runtime 与 Piko 会得到完全不同的实现任务；仅加撤回横幅无法消除机器契约和活跃 View 引用。还会重新引入用户已取消的自建内容服务和消息路由协议。

**最小修改**：保留 Slinky 自有的 project→room 映射、用户授权过滤、Element 安全宿主和正式业务决定引用；删除 Piko 产品 codec、Topic/SID/RID、ingress/trigger、专用附件读取、binding-version/drain 作为跨系统前提。通信生命周期契约若仍需保存为历史，应整体标为 superseded 且不再被 View/ADR 当前章节引用。Agent 入退房、发收消息、reply、media 使用 Matrix 标准能力；Piko 仅提供其 Agent 身份与实际参与能力。

### SLK-R1-PK-03 — P1 — 智能推进与“原 DAG 决定顺序/固定节点”仍冲突

**位置**：`system-design.md` §2.3 第3项（101）与 §7.2（550–558）；`plan/design.md` §1/§3（16–28）；`view-contracts.md` §3.3（68–74）；`version-development-plan.md` §2/§4（52、75）。

**证据**：新版 Runtime/Plan 说 PM 决定下一步、阶段只作分类，不由固定 15 节点 AND-join 自动派单；但 system design 仍写“次序由原 DAG 决定”，View 仍要求“固定 Stage nodes/edges”，开发计划仍以 fixed Stage/fixed DAG 为当前开发方法和 B0 出口。

**影响**：核心产品目的不唯一：PM 是决策者，还是固定 DAG 才是决策者。实现和 UI 会继续把流程节点状态当业务 authority。

**最小修改**：统一为“PM 在用户批准范围内，从满足确定性依赖/权限/质量约束的候选动作中决策”；依赖图仅用于验证前置条件、影响与展示，不自行生成业务决定。View 可展示阶段和依赖，但不得把 fixed nodes/edges 写成执行 authority。不引入通用工作流/DAG 编辑器。

### SLK-R1-PK-04 — P1 — Memory 当前目标与旧 Implemented 接口仍有双 authority

**位置**：`knowledge/design.md` §1.1/§7（23–33、96–104）；`memory_subsystem.md` 目标更新与 §1–6（3、11–19、25–30、61–69、81–92）。

**证据**：Knowledge draft.4 已确定“Piko 普通任务给建议，Slinky 验收/冲突检查后落库”，并退出 Tier judge/自动 promotion；Memory 文档虽有目标更新横幅，正文仍把 Retrieval/Judge、Role Agent Memory promotion、lesson admission、自动三层持久化列为 Implemented/当前接口和恢复义务。

**影响**：迁移实现可能继续让旧 judge/promotion 写正式 Memory，绕过新 authority；同一份文档同时描述旧事实和目标接口，无法作为下游实现依据。

**最小修改**：把旧实现事实单独列为 migration inventory；目标接口只保留 Slinky 正式 Memory writer、普通 Piko 建议输入、授权验收/版本冲突和可重建索引。所有 promotion 必须由 Slinky 授权决定产生；Tier 仅提供 Embeddings，不参与语义更新或准入判断。

### SLK-R1-PK-05 — P1 — PM 决定到确定性命令的最小映射尚未定义

**位置**：`runtime/design.md` §2/§4–8（21–53）；`system-design.md` §7.2（548–558）；`plan/design.md` §3–5（24–36）。

**证据**：设计要求保存理由、事实和目标，并拒绝越权/旧版本/重复决定，但没有列出复用现有记录时的最小决定字段、允许动作集合、提交前守卫与重放结果。Runtime 自己也在 §14 将“决定到操作映射”留给下游。

**影响**：实现容易回到隐式 prompt 驱动，或重新造通用 workflow；也无法系统测试同一决定重放、版本竞争、越权和部分失败。

**最小修改**：不新增引擎，只在现有 Plan/Work/Attempt/用户事务命令中明确：decision identity、授权 actor/role、project/scope、引用事实版本、action kind、target、expected version、权限结果、执行 receipt/outcome。列出派单、追加 Review、调整计划、接受/拒绝、换 IR、转用户这几类映射与失败语义。

## 下游细化前必须闭合

### SLK-R1-PK-06 — P1 — 一 IR 一 Piko 的身份与生命周期语义不足

**位置**：`ir/design.md` §1–7（17–43）；`runtime/design.md` §5–7（35–49）；`external-service-interface-control.md` §2/§4（29–48）。

**证据**：只声明“一IR对应一个独立Piko Agent实例”，尚未定义 Slinky 记录中哪个稳定引用标识该实例、唯一性范围、不可用/退役后的任务查询与历史保持、Matrix身份如何与该实例事实关联。旧 binding/version 机制又已撤回。

**影响**：派单、状态查询、多 IR Review 和失败改派可能把 Agent 身份、进程实例、任务和 Matrix 用户混为一体。

**最小修改**：在 Slinky 自有 IR 记录中定义稳定 `piko_instance_ref`（名称可由 owner 决定）、一对一不变量、lifecycle/availability 和历史任务引用；鉴权与 Matrix membership 继续用各自标准事实，不恢复授权投影或 binding-version 协议。具体 Piko wire 留到第二轮对齐。

### SLK-R1-PK-07 — P1 — token Usage 的消费口径不足以避免重复或漏计

**位置**：`external-service-contracts.md` §2/§5（33–40、58–62）；`runtime/design.md` §12（67–69）；`system-design.md` §12.1（784–788）。

**证据**：已有 input/output/total/cache 与 actual/estimated/unknown，但没有明确任务总量是否累计 Piko 内部所有模型调用及重试、流式中间值如何更新、何时 final、相同任务重复查询如何以 revision/snapshot 覆盖而不是累加。

**影响**：Slinky 项目统计无法一致消费；失败任务、重试和 streaming 最容易重复计数或漏计。

**最小修改**：定义 Slinky 所需的是“任务累计 Usage 快照”，包含 scope=task、measurement kind、as_of/finality、输入/输出/总量及可用的 cache token；Piko 内部合并所有实际发生的调用，重试产生的真实 token 也计入，同一快照重复读取不重复累计，无法归属则 Unknown。不要增加 SourceInstance 或让 Slinky读取模型调用控制面。

## 建议

### SLK-R1-PK-08 — P2 — 增加“撤回机制不得从当前入口可达”的静态一致性检查

**位置**：`intelligent-process-design-checks.md` IP-15（24–27）；`intelligent-process-design-revision-20260917.md` 限制（20–24）。

**证据**：IP-15 只描述编码者引用旧包应被拒绝，但当前系统设计、WBS、View、Testing 本身仍能到达旧机制。

**影响**：后续每轮编辑都可能再次把历史契约链接回当前 Gate，人工很难发现。

**最小修改**：新增只读静态 oracle：从当前权威入口、WBS、active View/Module/Test 追踪链接，若在非 historical/migration 区域发现 SourceInstance、capacity snapshot/claim/Tier Seat、模型 Invocation恢复、自定义 Topic/SID/RID/trigger/content service 或跨系统 drain/release，则失败并报告路径。该检查不替代语义 Review，也不创建运行机制。

## 无需用户裁决的结论

上述修订均直接落实用户已经确定的简化范围，不需要重新询问是否保留旧复杂机制。Element 宿主的 exact-room 导航隔离可以保留为 Slinky UI 内部安全设计，但不能借此恢复 Piko 产品消息 codec、内容服务或跨系统 Session 状态机。

第一轮 Piko 评审状态：**已完成（限上述两份固定快照及30个成员）**。当前没有因材料缺失而阻塞本轮文本结论。
