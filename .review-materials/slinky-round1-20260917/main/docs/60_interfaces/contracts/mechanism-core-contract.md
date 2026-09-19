# Slinky 系统机制核心契约

> 2026-09-17：以下旧DTO中固定流程、外部容量/恢复/Session协议不再是当前实施authority。以[最新裁决](../../90_decisions/intelligent-process-scope-20260916.md)、system-design draft.29及接口控制draft.6为准；必须先按新边界修订再编码，不保留并行解释。

Document ID：slinky-mechanism-core-contract；版本：0.3.0-draft.2；状态：Draft。
Owner：Slinky；日期：2026-09-16。

## 1. 定义权与范围

Slinky 定义内部接口及对外能力需求；跨系统 wire 以双方已签署的提供方机器契约为准，不以本内部 DTO 要求外部软件增加字段。要求定义、双向消费签署、实现符合性和运行验证分别记录。

本批唯一机器定义是 [mechanism-core.schema.json](schemas/mechanism-core.schema.json) 的 Resolution、ContextManifest、ReleaseEvidence。它们是现有 STD/Knowledge/Runtime/Artifact/PR 边界的数据类型，不新增服务或 HTTP 路径。Session DTO 与 close/read 归 Slinky communication-lifecycle 契约；ReleaseEvidence 是 Runtime 汇聚的内部证据，不能作为第二个 Piko Session API。

本批不是完整 AgentTaskRequest/Result、资源分配、接受事件或 Context 预算契约；其余类型及操作继续补齐，G1 仅部分交付。真实执行前仍须完整契约、生产实现和组合证据。

## 2. 编码与类型

Schema 使用 Draft 2020-12，未知字段拒绝；所有列出的字段必填，null 只用于显式未知/不适用。ID 为不透明、大小写敏感字符串；maxLength 是 Unicode 字符数；SHA-256 为 64 位小写 hex；版本为正整数；时间为 Unix UTC 毫秒。数组上限 256 是本批类型约束，超限拒绝，不能截断；不构成系统容量承诺。

Ref 是不可变对象身份/版本/hash。内容 hash 对 owner 保存的原始内容 bytes 计算；Ref 不含签名或授权能力，调用时须由 owner 解析、鉴权并验证内容。结构通过不证明引用真实。JSON 请求摘要由原操作幂等契约定义，不将对象内容 hash 误用为 transport digest。

Resolution 的 ref 指向 STD 持久原记录；其摘要计算排除自身 ref.hash，按后续 canonical record 编码条款落实。本批不以未冻结的摘要算法生成自证记录，生产 gate 继续开放。

## 3. 操作与语义守卫

| 原 owner / 操作 | 参数 / 返回类型 | 必需检查与错误 |
|---|---|---|
| STD Resolve / 解析结果发布 | 原 resolve_artifact_contract 参数 → Resolution | output/work/project、Standard/Template 的 slot/version/hash、policy、有效期；缺项 ContractInvalid，时间倒置 ResolutionInvalid |
| Knowledge / build Context | 原 Work/profile/std/inputs 与 Resolution[] → ContextManifest | bindings 的 output_key 唯一；每条与已授权 Work 对应；覆盖 expected outputs 精确集合；resolution 不过期/不失效；错误 ResolutionMismatch/ResolutionStale |
| Runtime/Artifact / 输入与接受核对 | ContextManifest、Plan/readiness 的 bindings、原 Resolution[]、evaluation time | 输入输出集合一致；强制 standard/template 资产 exact 引用且 required=true；主指令唯一；错误 MaterialMismatch |
| Runtime/PR/IR / release guard | ReleaseEvidence + 原派发 scope、当前 owner evidence | 原 Run 不可写、owner stop/隔离、write fence、cleanup 证据齐全且 scope/lease 匹配才可释放对应资源；不等待 Session Closed，不代替 Piko claim 或 Tier Seat release |

Context 中引用的 resolution、input、instruction 和 asset ID 集合不得重复；各个 Ref 必须按全部字段比较。standard/template entry 的 resolution_refs 必须包含产生它的解析记录；经验条目不能代替必需规范。准备时不要求实际读取已经发生；实际读取事实消费 Piko 已签署系统 outputs artifact，按接口总纲 §7.2 与冻结材料集合比较；内部材料映射和预算 DTO 留给下游设计，不另建提供方证据字段。

ReleaseEvidence.session.required 必须与原派发请求一致，不能由调用方为了释放改为 false。原请求无协作时，仅允许 NotApplicable 且其它 Session 字段全部 null；协作所需 Session ID 丢失应为 Unknown，不得当成无协作。release guard 不把 Result 成功或 Artifact 接受作为必要条件。

SessionClosure 是独立的通信义务投影，不是资源 release 的前置条件。Unknown/Closing/RecoveryRequired 可以与资源已释放并存，仍阻止 Session 严格关闭；Closed 必须核验 Slinky 当前生命周期 close_facts，不能只凭本投影的 archive/pending 摘要。close 原请求重放可能返回旧 Closing，不能据此覆盖当前 Session authority。原 project/attempt/run/resource/lease 必须匹配当前 owner，旧租约安全证据不能释放新租约。所有证据由原 owner 确认，不能通过提交一个符合 Schema 的 JSON 伪造停止。

## 4. 错误、幂等与版本

以上错误是内部验证结果代码：ContractInvalid、ResolutionInvalid、ResolutionMismatch、ResolutionStale、MaterialMismatch、ScopeMismatch、ReleaseBlocked。验证操作只读，不写状态、派发或清理；修复输入后重新校验，不自动换业务身份。结构/语义错误没有可重试副作用，等待外部证据与重新执行业务分开。

STD/Artifact 发布、Slinky Session close 的 mutation 继续复用原 identity/key、expected version 和 receipt。此文不新增重试 namespace；版本冲突保留旧记录，响应丢失查询原操作。运行消费者暂不接入本批类型；接线时以单一 cutover 替换旧类型，不建立兼容 fallback。

## 5. 可执行检查与余项

入口：`python3 -m pytest tests/unit/design_baseline/test_mechanism_core_contract.py -q`。测试检查 Schema、Session 状态映射和资源释放与通信关闭分离的独立反例；不访问生产代码，不构成 Runtime 第二实现路径。Resolution/ContextManifest 跨对象关联和 owner 证据真实性尚不由该测试证明。

V-B07 的通信关闭条件由 communication-lifecycle 的当前测试覆盖；本文件新增资源释放不等待 Session 关闭的反例。V-B08 的逐输出解析和材料关联仍需下游完整验证，不以 Schema 自检替代。owner 证据真实性、CAS/幂等/持久事务、完整操作签名、内部预算及跨服务故障测试仍未交付。当前 runtime_activation=false。
