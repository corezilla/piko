<!-- STD_DOCUMENT_COVER_BEGIN -->

# Slinky v0.3 IR 设计

| 文档字段 | 值 |
|---|---|
| Document ID | `v0.3-intelligent-resource-management` |
| Document Version | `0.3.0-draft.5` |
| Status | `Draft` |
| Project | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Last Modified Date | `2026-09-16` |
| Template ID | `design.definition` |
| Template Version | `1.3.0` |
<!-- STD_DOCUMENT_COVER_END -->

## 1. 定位与authority

IR是Slinky可安排工作的智能执行者。一个IR对应一个独立Piko Agent实例；本模块登记其身份、能力、实例关联和任务事实，不再将IR定义为Slot、Tier Seat与Knowledge Profile的组合资源。

## 2. 输入与输出

输入为当前任务要求、可用IR信息及项目经理决定；输出为选定IR与Piko任务关联、当前执行情况及能力缺口。具体字段复用现有IR/Work记录细化，不创建模型容量目录。

## 3. 选择与派发

项目经理依据工作难度、专业领域和历史结果选择IR；Runtime执行有权限的派单。Piko自行使用LLMTier完成任务，Slinky不查询模型Invocation或配置模型恢复流程。

## 4. 多IR Review

每个参与者独立派单并进入指定房间，通过各自Piko讨论。Slinky汇总不同意见、未决问题和失败；不把协调者完成当作所有成员完成，不把一个Piko扩成多Agent管理器。

## 5. 失败与替换

最终失败由项目经理判断是否换IR，通常可选择能力更高的专家；保留原任务、原因、部分结果及已执行操作。需用户解决则进入待用户事务。无固定失败次数升级链；状态未知先查询Piko，不能默认旧任务已停止。

## 6. 资格与安全

基本身份、workspace、工具和项目授权必须检查；删除自定义投影不取消真实鉴权。能力描述不是资源预留，不保证任务一定受理。PR安全独占保护保留。

## 7. 查询与统计

提供IR任务状态与token用量；未知与估算明确，Cost暂不做。Piko提供任务用量，必要时内部消费LLMTier统一Usage；不把不可归属的统计伪造为单任务事实。

## 8. 退出当前范围

execution-capacity snapshot、共享池、配额组合、execution claim、Tier Seat、SourceInstance、跨系统Session release/drain、专用兼容协商退出本模块。旧finalization.10签署是历史，不构成继续消费这些机制的授权。

## 9. 验证与下游

验证一IR一实例、多IR结果独立、失败交PM、替换保留历史、授权与数据不串写。见修订验证场景。现有源码和历史测试是迁移输入，本文不声明实现完成。任务API由Piko缩减后与Slinky对齐。
