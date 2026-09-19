<!-- STD_DOCUMENT_COVER_BEGIN -->

# Slinky v0.3 Runtime 设计

| 文档字段 | 值 |
|---|---|
| Document ID | `v0.3-project-runtime-engine` |
| Document Version | `0.3.0-draft.5` |
| Status | `Draft` |
| Project | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Last Modified Date | `2026-09-16` |
| Template ID | `design.definition` |
| Template Version | `1.3.0` |
<!-- STD_DOCUMENT_COVER_END -->

## 1. 单元摘要：为什么存在

Runtime是智能业务决定的执行器，不是固定Stage图的业务决策器。项目经理等授权角色依据目标、产物、评审与环境决定下一步；Runtime负责验证、执行和记录。复用现有Work/Attempt/Artifact/Actual与用户事务，不创建第二引擎。

## 2. 输入、输出与authority

输入：当前计划、任务及IR状态、产物、授权决定、环境事实。输出：任务关联、状态/结果、Actual、可供PM处理的问题和可追溯操作记录。Plan拥有计划；Runtime拥有执行事实；Knowledge拥有正式记忆；用户与授权业务角色拥有批准决定。

## 3. 基线与迁移

现有固定Stage代码是迁移来源，不因本文而已变成智能推进。旧fixed-stage-runtime ISD的固定join、自动升级、Slot/Seat与跨服务恢复内容退出目标设计。单一路径内逐步替换，不保留模式开关长期运行两套语义。

## 4. 智能决策与确定性约束

PM在其授权范围内决定派单、追加Review、调整计划、接受结果或请求用户。必须保留理由、引用的事实与目标对象。代码拒绝越权、过期版本、非法输入、重复执行同一已落实决定及冲突写入。结构检查不替代业务判断，模型文本不能扩大权限或篡改测试结果。

阶段作为计划分类与界面组织，不因满足固定15节点AND关系自动下发任务。质量约束仍有效；授权不足的调整转用户事务。

## 5. 普通任务生命周期

记录获授权派单 -> 检查IR及输入权限 -> 向该IR对应Piko提交 -> 保存任务关联 -> 查询/接收状态 -> 保存结果和Usage -> 调起相应业务评审/PM。

每个IR对应一个Piko Agent实例。多个IR各有任务，不由一个Piko协调其余实例。任务完成不是业务接受；同一通知不能反复执行已记录的动作。本地防重和状态一致性不是模型级exactly-once协议。

## 6. 多IR Review

Slinky按项目经理决定准备共同材料、评审职责和房间，分别派给各IR。各Piko负责自己的上下文、工具循环和讨论。收集每个成员的意见、依据、分歧及失败，再交PM决定修改、追加评审或收口。房间消息不直接批准业务，不硬编码多数票/最后发言为结论。

## 7. 失败与交接

Piko在期限/预算内处理执行重试；最终失败报告原因、部分结果和已知操作。Runtime将其交PM。PM可换更合适的IR（例如专家）重派，并保留原任务关联及交接材料；需用户时进入既有待用户事务，说明问题、影响、已有尝试及所需处理。

不规定失败N次自动升级/转用户。任务结果未知先查询Piko，不直接等同失败，不盲重派有副作用的工作。重新派单不回滚原副作用，PM与新执行者须看到已做事项。

## 8. 取消与恢复

取消受理不等于任务停止。Piko管理执行session和工具安全停止；Runtime记录真实状态，不查询Tier Seat/release。Slinky重启恢复已记录业务决定与任务关联，再向Piko确认事实；不接管Agent会话或模型调用恢复。

## 9. 记忆更新任务

Knowledge准备来源材料、当前记忆版本和更新目标，由Runtime走普通任务通道交Piko提取/归纳/去重。结果只是候选变更；Knowledge在权限、来源、冲突与业务验收后落库，成功后重建派生索引。失败仍用普通PM处置，不另建记忆任务协议。

## 10. 环境事务

各系统分别设计健康、诊断和恢复。LLMTier故障是环境问题，Runtime记录任务影响，交PM按授权协调环境处理；需要权限或用户操作则转待用户事务。恢复可用不代表任务成功；Piko决定其执行内继续，PM决定业务是否重新派单。

## 11. 安全与资源

保留workspace、工具、项目、用户权限及PR独占保护，拒绝Secret进入普通日志。取消跨系统capacity/claim/Seat不取消这些保护。不存在SourceInstance生命周期要求。

## 12. 统计

从Piko消费任务token Usage，已确认、估算、未知分开；不以零冒充未知，不重复累计。LLMTier内部统计由Piko按需消费；不做Cost。

## 13. 测试

按[intelligent-process-design-checks](../../70_verification/specifications/intelligent-process-design-checks.md)验证决定授权、非固定处置、多IR结果隔离、用户事务、记忆验收和环境恢复边界。旧固定图测试不作为新语义oracle；当前实现测试仍反映旧源码回归。

## 14. 下游实施

先在现有Runtime/Plan/IR记录上细化决定到操作的映射和Piko最小任务适配，再修改源码。未落盘的字段需在实现前明确，不引入新配置/旁路。本文不声明生产接线或运行验收完成。

## 15. 文档控制

2026-09-16：依据用户裁决重写目标职责，撤回固定流程与复杂跨服务控制的实施义务。上位文档为system-design draft.29；runtime_activation=false。
