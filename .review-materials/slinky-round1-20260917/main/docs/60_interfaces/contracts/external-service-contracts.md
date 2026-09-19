<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky v0.3 外部服务 Contract Specification

| 文档字段 | 值 |
|---|---|
| Document ID | `v0.3-external-service-contracts` |
| Document Version | `0.3.0-draft.6` |
| Status | `Draft` |
| Project | `slinky` |
| Authority | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Authors | `原方案作者（原始 attribution 见固定来源 commit）, Codex（主干设计归并）` |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-16` |
| Template ID | `contracts.specification` |
| Template Version | `0.1.0` |
| Template Conformance | `legacy-mapped` |
| Tailoring Reference | `none` |
| Migration Map Reference | `docs/98_migration/v03-mainline-rollin/migration-map.md` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/60_interfaces/contracts/external-service-contracts.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_COVER_END -->

## 1. Contract scope 与authority

本版是简化后的Slinky最小消费要求，承接[Interface Control](../external-service-interface-control.md)。它撤回本文件此前复杂字段表作为目标契约的地位，不声称Piko/LLMTier已发布对应新机器包。旧候选及导入字节留作历史，不能据此增加需求。

## 2. 任务操作

保留普通任务提交、状态查询、取消和结果获取。一个IR对应一个Piko实例，每个参与Review的IR分别持有任务。复用既有Run操作概念；具体路径和wire在Piko缩减契约中核对，不新造第二套任务API。

| 信息 | 消费规则 |
|---|---|
| 任务标识与目标IR | 可关联原Work和执行实例，不使用模型Invocation作为任务身份 |
| 输入与要求 | 来源材料、当前上下文、预期结果、授权workspace/tool范围、任务期限及预算 |
| 任务状态 | 区分尚未结束、成功、失败、取消及当前无法确认；未知不伪报失败或成功 |
| 结果与失败原因 | 返回产物/说明、已有部分结果、已知操作与失败原因；不要求暴露Tier内部ledger |
| 取消 | 记录取消请求与实际任务停止，不能据收到请求就伪报停止 |
| Usage | 输入/输出/总token，可用时缓存token；实际/估算/未知明确区分 |

没有机器字段落盘不等于上述设计不能通过；但进入实现前须有明确映射和契约测试，不能拿旧复杂Schema冒充新版。

## 3. 智能业务决策

项目经理依据任务、失败、已有操作、IR能力和环境信息作出决定。换IR需记录原任务及交接材料；需要用户时写入待用户事务。禁止硬编码“失败N次升级专家/转用户”。权限与数据版本由代码检查，模型不自行批准越权操作。

任务重试由Piko内部执行；任务最终失败后的重新派单是新的业务决定，不是回滚历史。未知任务先查询，不自动重做可能有副作用的步骤。

## 4. 多IR讨论与记忆更新

多IR评审由Slinky组织，每个Piko独立参与同一指定房间。使用Matrix原生消息、回复、成员和附件能力；讨论不自动构成业务批准，不要求产品Topic/SID/RID/Run-trigger协议。

记忆属于Slinky。更新使用普通任务：材料+当前记忆版本+更新目标 -> Piko建议变更及依据 -> Slinky验收/冲突检查 -> 持久化正式版本 -> 更新索引。Piko不直接写正式记忆或创建第二记忆系统。

Memory内部使用标准embedding模型服务进行向量化；索引和检索不是Agent会话，也不是给Slinky增加模型调用管理权。

## 5. 模型服务与统计

Piko通过标准OpenAI-compatible接口使用LLMTier。模型上下文、工具循环和重试归Piko；LLMTier不保存Agent会话或管理KV cache。保留有需求依据的逻辑等级路由，不要求调用来源生命周期。

LLMTier提供统一token Usage查询，Piko按任务关联提供用量，不要求Slinky进入模型调用控制面。不能可靠归属任务的数据不得伪造任务分摊。Cost、币种、pricing version、账单与Coding Plan费用换算不在当前范围。

## 6. 环境事务

各系统设计自身健康、故障诊断与恢复。Slinky识别业务影响，在授权范围内协调环境恢复；Piko处理执行继续与真实任务状态。使用现有/标准运维能力，不新建统一恢复协议，不自动操作环境。

## 7. 撤回的消费要求

以下不再是当前实施输入：Piko execution-capacity、shared pool/quota组合、execution claim、Tier Seat、SourceInstance、模型Idempotency-Key/Invocation恢复、compatibility协商、strict Session close/drain/Tier release、自定义消息与附件服务。旧固定保留时钟、精度表与复杂消费者oracle随其相关能力退出范围。

旧逐字节输入读取broker协议不作为普通任务默认要求；项目材料授权、来源追踪和真实质量检查仍保留。后续若有特殊审计要求需明确需求并单独评审。

## 8. 验证与状态

必验：任务失败可消费；多IR互不替代；取消不伪报停止；项目经理决定有权限与理由；旧失败及部分结果不丢；记忆候选不能绕过验收；Usage未知不填零；环境恢复不伪报任务完成。

当前为设计修订，提供方新契约仍需同步，未批准runtime activation。历史测试结果与旧签署不重写。
