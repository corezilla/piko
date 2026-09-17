# Piko V0.3 Simplification Review Packet

| 字段 | 值 |
|---|---|
| Package ID | `piko-v0.3-simplification` |
| Package Version | `0.3.0-simplified.5` |
| Status | Review；runtime activation=false |
| Request | `S-20260917-23ec27fc9e7a`；覆盖第二轮三方 finding |
| Machine authority | OpenAPI + JSON Schema + error catalog + fixture |

## 结论

当前设计采用主流最小边界：一个 Piko 实例管理一个 Pi Agent；Slinky 管业务流程与 Memory；LLMTier 是无 Agent 会话状态的 OpenAI-compatible 模型服务。Piko 新增的外部面只有任务 submit/status/cancel/result。

Pi 原生 session/context/compaction/tool loop/abort/retry 被直接集成。Piko 只增加服务级任务持久化、授权、deadline/budget、结果与 token usage 汇总。最终失败包含部分结果、已知动作和原因；业务重派或升级由 Slinky PM 决定。

Matrix 使用原生 identity/invite/join/membership/sync/message/reply/media/leave；附件使用 Matrix media 和既有文件授权。正式 Memory 更新是普通任务，Piko 不拥有 Memory authority。

## 第二轮 finding disposition

- `PK-R2-PK-01 / PK-R2-SL-06`：删除外部任务 `model` 字段；model/profile 为实例内部配置。
- `PK-R2-PK-02 / PK-R2-SL-01 / PK-R2-LT-03`：Usage 改为 Complete/Partial/Unknown，保留字段存在性、attempt 数与 missing_fields，未知不填零。
- `PK-R2-PK-03 / PK-R2-LT-01`：增加单 Agent scheduler、每 Run session 隔离与 RunSessionRecord/lease/checkpoint/result crash 顺序。
- `PK-R2-PK-04 / PK-R2-SL-05 / PK-R2-LT-05..06`：机器约束状态/结果组合，增加500 ResultUnavailable并让OpenAPI error map与catalog双向一致；删除same-run resume暗示。
- `PK-R2-PK-05 / PK-R2-SL-02..03 / PK-R2-LT-02`：只在显式普通discussion Run内消费标准Matrix room/event/reply/media；idle消息不执行。
- `PK-R2-SL-04 / PK-R2-LT-04`：明确cancel不是停止事实，SSE首事件后不透明重放，未知副作用不盲重试。
- `PK-R2-PK-06 / PK-R2-SL-07`：退役CollaborationBridge current authority，更新tailoring、migration map与inventory。
- `PK-R2-PK-07 / PK-R2-LT-07..08`：扩大可执行validator覆盖，并强化相对路径与symlink语义；增加运维设计。

## 删除清单

从当前外部契约删除：执行容量观察和 claim；跨系统 Session binding/version/projection/close/drain/release；产品 Topic/SID/RID/envelope/outbox/ingress/trigger；Piko content store/token/retention；模型 Invocation/idempotent recovery；SourceInstance/Tier Seat；专用 readiness/compatibility；输入读取证据专用 artifact 协议。相关 mechanism 文档和 Matrix 机器工件已从当前树删除。

## 验证边界

本轮静态验证证明四个path、Schema正负例、typed-error映射、Usage语义、固定Pi SSE/retry源码顺序、retired-field scan、JSON/YAML解析、锁定STD定向一致性和diff consistency。Pi/Matrix/LLMTier真实集成、重启、工具副作用、安全、保留和性能仍属后续实现/联调门禁。

## Responses streaming 定向结论

固定 Pi `0.85.1` / `9767ba275f3e9a5ee0f5c5342249b629ab1b2282` 的真实调用链已经核对：Coding Agent 用 `streamSimple`，Agent loop `for await` 消费事件，OpenAI Responses adapter 固定 `stream:true` 并要求 terminal event。因此首个任务执行需要标准 Responses SSE；non-stream 不是共同基线或 fallback。

`piko-llmtier-consumption-v0.3` simplified.4 固定请求、文本、function call/output、terminal/failure与usage事件子集；reasoning/refusal只在所选模型产生时要求。grammar/custom/deferred tool扩展不进入第一阶段，provider continuation不作optional预留。LLMTier仍需以实际稳定机器字节对齐同一标准子集；这不引入自定义会话或调用恢复协议。

## simplified.4 复审处置

- `PK-R4-SL-01 / PK-R4-LT-03`：实际网络 attempt 在 Pi `options.fetch` wrapper dispatch 前登记；在 `processResponsesStream` 规范化前由最小 Piko observer hook 捕获 raw Usage 与字段存在性，禁止把 Pi cache-subtracted display input 当标准 input。
- `PK-R4-SL-02`：Complete 覆盖全部实际 attempt 并满足精确算术/子集；Partial 的 null 与 missing 精确一致；Result 发布冻结 UsageSnapshot，迟到事实只更新内部 ledger。
- `PK-R4-SL-03`：Queued 取消以单事务发布零调用 Cancelled Result并返回 `CancelledBeforeStart`；Running 才返回 `StopRequested`。
- `PK-R4-SL-04 / PK-R4-LT-02`：唯一 Matrix 路径为 `matrix-js-sdk` Client-Server；定义 membership、event/self echo 去重、DiscussionTurn 与 cursor 提交顺序及稳定 txn 重试。
- `PK-R4-SL-05`：RelativePath 明确拒绝尾随 `/` 形成的空 segment，并加入机器负例。
- `PK-R4-SL-06 / PK-R4-LT-08`：read-only preflight 只到网络/TLS/auth/Models；真实 Responses 探针需单独 operator 授权、预算和审计。
- `PK-R4-SL-07`：current authority 修正为 9 节系统设计、锁定 STD draft.21；旧14章/draft.19只保留历史来源。
- `PK-R4-LT-09`：完整下一调用 input 保留 opaque reasoning item 的 id/encrypted_content/summary/content。
- `PK-R4-LT-10`：配置显式固定 `supportsExplicitPromptCacheMode=false`；与 `cacheRetention:none` 一起强制三个 cache 请求字段缺席。

本候选仅进入两方普通路径复审；复审通过前不 commit/push，runtime activation 仍为 false。

## simplified.5 收尾处置

- `PK-R4-SL-02-R1`：Usage 改为逐字段全 attempt 覆盖语义；字段缺任一 attempt 即 null/missing，Unknown 允许 observed attempts 非零；加入两类可执行聚合 oracle。
- `PK-R4-SL-04-R1`：在既有 task loop 内定义 DiscussionTurn Pending、确定性 Pi entry、checkpoint 后 Consumed 的提交顺序和两处崩溃恢复；Pi idle 且无 Pending turn 时有限讨论 Run 正常结束，后续消息不重开。
- `PK-R4-SL-07-R1`：migration map 将旧 service design/STD 基线标为历史审计来源，删除已经结束的 residual authority 表述并指向 current authority；STD 锁未升级。

`L-20260917-5f660a9d497c` 对 simplified.4 的接受保留为历史复审结果；simplified.5 的上述差异仍需 Slinky 与 LLMTier 对同一新快照复审。复审通过前不 commit/push，runtime activation 仍为 false。

## simplified.5 最终复审结果

- Slinky：`S-20260917-a875f9c9e85e`，ACCEPTED；独立复算 manifest 28/28，并确认 `PK-R4-SL-02-R1`、`PK-R4-SL-04-R1`、`PK-R4-SL-07-R1` 关闭。
- LLMTier：`L-20260917-5ac3904f2c00`，ACCEPTED；独立复算 manifest 28/28，并确认 Usage/Matrix delta 未破坏 simplified.4 消费边界。

两方接受均限定设计与机器契约，不代表生产实现、联调或 runtime activation。固定被接受的 manifest SHA-256 为 `e54bc8fb6815a3c9a2619c7be95d88f450431cdef3c77d66b2a8904ce37ded55`；提交只记录该已接受快照及其评审证据，不修改 manifest 成员字节。
