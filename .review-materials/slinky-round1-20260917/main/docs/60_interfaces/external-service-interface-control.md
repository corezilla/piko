<!-- STD_DOCUMENT_COVER_BEGIN -->
# Slinky v0.3 外部服务 Interface Control

| 文档字段 | 值 |
|---|---|
| Document ID | `v0.3-external-service-interface-control` |
| Document Version | `0.3.0-draft.6` |
| Status | `Draft` |
| Project | `slinky` |
| Authority | `slinky` |
| Document Owner | `Slinky Design Owner` |
| Authors | `原方案作者（原始 attribution 见固定来源 commit）, Codex（主干设计归并）` |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-16` |
| Template ID | `interfaces.control` |
| Template Version | `0.1.0` |
| Template Conformance | `legacy-mapped` |
| Tailoring Reference | `none` |
| Migration Map Reference | `docs/98_migration/v03-mainline-rollin/migration-map.md` |
| Repository | `corezilla/slinky` |
| Canonical Path | `docs/60_interfaces/external-service-interface-control.md` |
| Supersedes | `none` |
<!-- STD_DOCUMENT_COVER_END -->

## 1. 接口目的、范围与双方 authority

本轮以用户2026-09-16简化决定为准。Slinky是智能参与决策的流程推动器，项目经理决定业务下一步；Piko是每个IR的单Agent执行实例；LLMTier是标准模型服务。旧provider候选只保留历史证据，不是当前必需能力清单。本文件是Slinky需求/消费边界，不宣称替提供方修改或签署机器契约。

## 2. 接口注册表

| 关系 | 能力 | Owner |
|---|---|---|
| Slinky -> Piko | 提交任务、查询状态、取消、获取结果 | Piko提供，Slinky消费 |
| Piko -> LLMTier | 标准OpenAI-compatible模型调用 | 双方对齐标准surface，Slinky不介入执行 |
| Memory内部 -> embedding服务 | 标准/v1/embeddings向量化 | LLMTier提供模型；Memory管理索引/检索 |
| Piko -> LLMTier Usage | 统一token用量查询及模型响应usage | LLMTier统计，Piko按任务向Slinky提供 |
| 多个IR/Piko -> Matrix | 入房、讨论、标准回复、退出和原生附件 | 每个Piko只管自己的Agent |
| Slinky环境事务 -> 服务运维能力 | 授权诊断与恢复 | 各系统设计自身能力，Slinky协调业务影响 |

## 3. 传输与物理边界

标准HTTP模型接口和Matrix原生通信优先。Piko模型调用的凭据留在Piko服务侧，不进浏览器。Memory向量化是内部索引依赖，不建立Slinky通用Agent推理接口。记忆提取、总结、去重作为普通任务交Piko，而非Memory直连模型完成Agent工作。

## 4. 数据、命令与Schema

最小任务消费信息：任务标识、目标IR、输入/授权范围、预期结果、期限/预算；返回任务状态、结果或失败原因、已有产物和token用量。具体wire字段由任务契约细化，不在本文件新造endpoint/header。

项目经理的决定、派单关系、旧新任务关联、待用户事务使用Slinky既有领域记录。业务任务标识不等于LLMTier调用标识，不能删除基本任务追踪能力。

## 5. 状态机、顺序和时序

Slinky记录授权业务决定 -> 调用对应Piko实例 -> 查询/接收状态与结果 -> 由项目经理/相应评审角色决定业务接受或后续动作。每个IR独立任务，多个IR在指定房间讨论；不由一个Piko在内部代理整队。

Piko完成不自动等于业务接受。取消已收到不等于任务已经停止。房间消息不是用户授权；讨论结果由Slinky按权限写入业务决定。

## 6. 错误、timeout、重试、幂等和恢复

执行内有限重试与session恢复属于Piko。最终失败交项目经理决定换IR、调整工作或转待用户事务；不规定自动升级链。状态未知先查询任务，避免重复副作用。

撤回Slinky消费模型级Idempotency-Key/Invocation/结果恢复协议的要求，不承诺后端恰好调用一次或绝不重复计费。内部可靠性由提供方最小化处理；保留本地版本检查与防重复执行同一业务决定，不升级成跨服务事务协议。

## 7. 并发、流控、容量与性能

不要求Piko容量快照、shared pool、配额组合、execution claim、Tier Seat或原子团队预留。提供方内部并发控制不由Slinky管理。实际PR环境的独占写保护继续有效。

### 7.1 Piko容量旧消费条款处置

旧DF-13容量消费定义撤回；不因曾经签署而继续要求该观察面。一个IR对应一个Piko实例，仅跟踪实际任务事实。

### 7.2 可信输入证据旧消费条款处置

材料来源、授权和结果真实性仍需检查，但不将旧broker专用artifact及机器Schema作为普通任务的必需接口。Agent声称“已读”不等于理解或正确评审；业务接受依靠产物、测试和评审证据。若具体安全/审计需求要求逐字节读取证明，须单独确认，不能隐含保留旧复杂协议。

## 8. 安全、身份、权限和隔离

复用项目/用户权限与Matrix成员身份。跨项目、越权写入、Secret泄露仍禁止；删除自定义授权投影并不删除鉴权。附件优先Matrix原生媒体与权限机制，不新建Piko内容store、下载token或保留服务。

环境只读诊断不授予restart/reset/清库/修改凭据或收费probe权限；各自恢复设计必须列出影响和操作授权。环境恢复不等于原任务成功。

## 9. 版本协商、兼容矩阵与弃用

专用兼容版本检查暂不做，保留正常文档/代码版本管理与标准接口测试。旧SourceInstance、Cost、capacity/claim/Seat、模型恢复、close/drain/release、Topic/SID/RID/Run-trigger及自定义附件契约退出当前实施依据。

当前Matrix项目协调桥仍按它已部署的格式使用；那是开发协作工具，不是要求产品复制同样协议。

## 10. Contract fixture、验证与证据

见[修订验证场景](../70_verification/specifications/intelligent-process-design-checks.md)。设计审查关注需求、边界与消费一致性；尚未实现不是设计缺口，fixture通过不是运行验证。旧fixture只证明旧候选，不作为当前设计验收门槛。

## 11. 未决项与双方批准

需Piko/LLMTier同步缩减后的自身设计及最小任务/标准模型/Usage接口。不重开用户方向裁决，不因旧实现仅有/call而强制保留它。

Usage仅token：输入、输出、总量、可用时缓存量；区分实际/估算/未知，不将缺失写零，不重复累计。Cost功能暂不做。runtime_activation=false，本文不批准环境操作。
