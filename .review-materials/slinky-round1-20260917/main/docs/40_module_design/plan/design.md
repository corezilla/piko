<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky v0.3 Plan 设计

| 文档字段 | 值 |
|---|---|
| Document ID | `v0.3-plan-module` |
| Document Version | `0.3.0-draft.4` |
| Status | `Draft` |
| Project | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Last Modified Date | `2026-09-16` |
| Template ID | `design.definition` |
| Template Version | `1.3.0` |
<!-- STD_DOCUMENT_COVER_END -->

## 1. 定位与authority

Plan保存项目计划、排期、依赖、进度预测和风险，供项目经理智能决定下一步。Plan不以固定Stage图或模型容量公式代替业务判断。阶段名称用于工程分类与展示，不引入通用DAG平台。

## 2. 输入与输出

输入为用户目标/范围、Analysis、IR能力、PR实际约束、Runtime执行事实及评审结果。输出为当前计划及版本、工作安排候选、风险与影响说明。Actual由Runtime提供，不随计划调整改写。

## 3. 计划调整

项目经理可在授权范围内安排任务、并行Review、追加研究或换IR；越出用户批准范围的决定进入待用户事务。代码检查权限、对象版本、合法依赖和数据一致性，不根据固定15节点AND-join自动批准/派单。

保留逐级细化、甘特图和预计/实际分离；不自动补跑未选择的阶段，不伪造完成记录。

## 4. 资源安排

按IR能力、当前任务情况及PR的真实使用约束安排工作，不组合Piko容量快照、Tier Seat、shared pool或配额。实际设备/workspace不可冲突的安全约束仍由代码保障，冲突及未知环境作为事实交项目经理。

## 5. 失败与用户事务

Piko执行内恢复由Piko处理；最终失败交项目经理分析。换IR需有理由及交接，需用户处理则记录问题、影响、所需操作与等待状态。无固定错误码到业务动作表，无自动专家升级链。

## 6. 验证与下游

验证计划版本并发、授权范围、Actual不变、多IR可见、失败分支由PM决定、用户事务可追踪。新目标使用既有Plan与Runtime，不增加第二存储/配置入口。下游字段映射需在实现前细化，未实现不阻止设计审查。
