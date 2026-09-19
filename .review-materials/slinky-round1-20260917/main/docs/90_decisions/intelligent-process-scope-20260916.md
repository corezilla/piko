# 智能流程推动器与跨系统简化裁决

Document ID: slinky-intelligent-process-scope
Version: 0.3.0-draft.1
Date: 2026-09-16
Status: User-directed design revision

## 来源

依据当前会话用户逐项裁决及“根据这些重新修改设计”的明确授权。本记录不借外部消息授予权限。Piko的P-20260916-f6e5b8f888ee与LLMTier的L-20260916-423c90e1869a只用于区分既有能力/设计/实现状态；未跨项目读取源码。

## 当前边界

- Slinky为智能参与决策的流程推动器；项目经理作业务判断，代码执行权限、版本、数据一致性与安全约束。
- 每个IR对应一个独立Piko Agent实例，多IR Review由Slinky组织并收口，房间用于讨论，不是自动批准通道。
- Piko负责执行内重试与恢复；最终失败由PM选择换IR或转待用户事务，禁止固定专家升级链。
- Memory属于Slinky；更新作为普通Piko任务返回建议，由Slinky验收落库；标准embedding服务是Memory内部向量化依赖。
- LLMTier提供标准模型、Embeddings和统一token Usage；Cost暂不做，未知/估算不得冒充实测。
- 各系统分别设计环境诊断恢复，Slinky可协调环境事务，不接管Piko如何调用模型。

## 撤回与保留

撤回固定15节点图自动作业务决定、容量快照/共享池/配额组合/claim/Seat、SourceInstance、模型级幂等/Invocation恢复、跨系统close/drain/release、产品自定义Topic/SID/RID/trigger、专用附件服务和兼容协商作为本轮必需机制。

保留普通任务标识与查询、取消和结果、真实失败、项目/文件权限、版本冲突检查、PR独占保护、来源与测试证据、用户批准。本地防重复执行业务决定不构成跨系统恢复协议；provider内部限流/排队/会话实现不由本记录要求删除。

## Authority与迁移

当前入口：system-design draft.29、SRS draft.6、接口控制/消费契约draft.6、Runtime/IR draft.5、Plan/Knowledge draft.4。旧冻结记录不再批准被撤回机制；历史文件、旧机器fixture及provider-evidence不改写成新证据。

旧fixed-stage ISD、SM002/SM003/SM004、通信/View机器契约与Memory底层模块中的冲突段落退出当前实施authority，需后续细化替换。禁止选择旧条款绕过新范围；无关的STD、质量、隔离要求继续有效。这是明确撤回，不是并行兼容路径。

本轮修改设计，不修改运行源码、不启动服务、不执行部署、不自动commit/push。提供方需同步其设计；不能声称三方缩减后的机器契约已签署或生产验证通过。
