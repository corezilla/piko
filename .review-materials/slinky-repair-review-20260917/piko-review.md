# Slinky 修订基线交叉复审（Piko）

覆盖原消息 ID：S-20260917-1e50e874429d。

结论：AMENDMENT。第一轮八项意见的大部分已经关闭，但固定快照仍有三处 current-authority 矛盾，尚不能给出 ACCEPTED。本结论仅针对设计一致性；不要求生产 capture，也不判断实现已完成。

## 基线与覆盖

- 固定 manifest：`/Users/ben/slinky/docs/91_reviews/slinky-repair-review-manifest-20260917.json`
- manifest SHA-256：`edd567a29f993c525b4b5c7d91469d83fca95cc8f52a51039a2427c6bef76468`
- base：`2d46f490b594fb35d3594353590651dee0a56d4d`
- 53/53 个文件的绝对路径、字节数和 SHA-256 均重新核对一致；未混入核对后的工作树变化。
- 复审覆盖：authority/README、计划、SRS、系统设计、四项 current mechanism、Knowledge/Memory/Runtime/Plan/IR/PR/Research/Component/Testing、接口控制/消费/View、WBS、V&V/测试生命周期/设计检查、两份 ADR、处置记录及 authority 检查器/单测。
- `python3 tools/check_design_authority.py`：PASS；`python3 -m pytest tests/unit/design_baseline/test_current_design_authority.py -q`：14 passed；fallback git 的 `diff --check`：PASS。原生 `/usr/bin/git` 因本机 Xcode license 未接受而不可用，此限制不影响只读内容评审。

## 第一轮 finding 处置核对

- SLK-R1-PK-03、04、05、06、07：当前 Slinky 边界已关闭。PM/Runtime、Memory writer、决定落盘、IR 稳定逻辑实例、Usage 快照语义均已形成单一解释；Piko wire 仍按文档如实列为后续对齐，不冒充已冻结。
- SLK-R1-PK-01、02：主体修复完成，但仍有下列 A1、A2 残留。
- SLK-R1-PK-08：检查器和负例已经建立，但仍有下列 A3 漏检。

## 必须修正

### SLK-R1-PK-02 / P1 / current 系统设计重新要求已退役的 Session、Topic 与备份操作

证据：`docs/20_system_design/system-design.md` §4.2.6 第314–320行。第320行仍要求“话题、关闭状态和备份状态”、创建会话、提出/结束话题、关闭房间、申请备份与恢复，并要求相关回执与 Action 关联。

影响：这不是单纯 Element RoomView 展示；它重新产生产品 Session/Topic/close/backup 操作面，与 current `view-contracts.md` §7（产品 Session/Topic 目录退役）、通信 ADR（原生 Matrix room/event/reply/media）及 Interface Control §9（Topic/SID/RID/close/drain 等退出）直接冲突。实现者无法判断应做原生房间映射，还是恢复旧 lifecycle 控制面。

最小修复：保留 exact project→room 映射、当前 membership、原生 timeline/reply/media、Work/event 引用、Needs Response 和业务 Artifact/审计历史；删除本段中的产品 Session/Topic 状态、房间关闭/备份恢复操作及其旧回执要求。若 Slinky 确需自身业务备份，须作为独立且已确认的 Slinky 数据能力设计，不复用已退役通信生命周期，也不成为 Piko/Matrix 前提。

### SLK-R1-PK-01 / P1 / current 系统设计仍要求 Piko 提供已撤回的材料读取覆盖证据

证据：`docs/20_system_design/system-design.md` §8.4.4 第652行仍写“需补齐……Piko Context 材料读取与覆盖证据”。同一 current authority 中，`mechanisms/task_context.md` §3、`external-service-interface-control.md` §7.2、`external-service-contracts.md` §7 和 Knowledge §7 都明确普通任务不要求专用逐字节 broker 证据协议。

影响：该句会把已撤回 DF-14 类提供方能力重新变成实现门禁，并与“产物/引用/质量证据验收，不以 Agent 自述代替”的现行方案混为一谈。

最小修复：将本句收缩为 Slinky 自有 Context Manifest 的材料引用、版本、hash、授权、装配/分批清单及产物 Review 证据；明确不要求 Piko 提供专用材料读取覆盖协议。特殊审计证据仍按 current 文档要求另立已确认需求再设计。

### SLK-R1-PK-08 / P1 / authority registry 同时把五份 current mechanism 匹配为 historical

证据：`docs/design-authority.json` 第11–15行把 `docs/20_system_design/mechanisms/{execution_scope,work_delegation,artifact_acceptance,task_context,README}.md` 列为 current，第50行又以 `docs/20_system_design/mechanisms/*.md` 将同五份文件匹配为 historical。`tools/check_design_authority.py` 的 `classification()` 先返回 current，因此 `check_design_authority.py` 和现有14项单测均没有报告集合重叠。

影响：registry 本身不是互斥分类；外部消费者若按 historical glob 处理会把 current mechanism 退役，而按 current 优先处理又得到相反结论。当前 PASS 不能证明 authority 唯一。

最小修复：删除/收窄该 historical glob，显式列出真正旧 mechanism 文件；检查器增加 current/supporting/historical 展开后的互斥负例，至少拒绝任何 current 路径同时命中 historical pattern。

## 其余复审结论与限制

当前 PM 智能决定与确定性守卫、一 IR 一逻辑 Piko 实例、失败交 PM、Memory 普通任务建议与 Slinky writer、原生 Matrix 基本边界、token Usage unknown/partial/重试累计、Embedding 空间变化重建索引以及旧 Slot/Seat/Invocation/SourceInstance/Cost 退出均未发现新的阻塞性矛盾。

本轮只读复审固定 53 文件，不读取凭据、环境、生产数据或未列入 manifest 的实现；不把静态 PASS 当运行证据。三处修正后应重新生成 manifest，运行 authority overlap 负例，并对上述精确段落做一次定向语义复审。runtime_activation 保持 false。
