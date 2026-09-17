<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Agent Runtime v0.3 测试规格
| 文档字段 | 值 |
|---|---|
| Document ID | `piko-agent-runtime-test-specification-v0.3` |
| Document Version | `0.4.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Verification Owner |
| Authors | corezilla |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | `2026-09-17` |
| Created Date | `2026-09-07` |
| Last Modified Date | `2026-09-17` |
| Template ID | `assurance.test-specification` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/specifications/piko-agent-runtime-test-specification-v0.3.md` |
| Supersedes | none |
<!-- STD_DOCUMENT_COVER_END -->

- Document ID: `piko-agent-runtime-test-specification-v0.3`
- Version: `0.4.0`
- Status: Approved

| Test ID | Oracle |
|---|---|
| PK-T01 | OpenAPI 只有 submit/status/cancel/result 四个 path |
| PK-T02 | AgentTaskRequest拒绝外部model selector及未知binding/trigger/capacity/model-recovery字段 |
| PK-T03 | 同 task key/body 返回原 Run；变 body 为 409；key 不传模型层 |
| PK-T04 | cancel 202 后仍为 Cancelling，不能当已停止 |
| PK-T05 | 建立SSE前瞬时错误只在deadline/budget内按Pi policy重试；首event后不透明重放 |
| PK-T06 | 工具副作用 Unknown 不重放并产生 UnsafeRetryBlocked/known_actions |
| PK-T07 | 重启按RunSessionRecord/lease/checkpoint恢复；不可核实动作时明确失败 |
| PK-T08 | 失败 Result 可含 partial output、failure、known_actions、usage |
| PK-T09 | Completed+非空 failure 被 Schema 拒绝 |
| PK-T10 | 同Pi attempt usage只计一次，迟到替换不相加，未知token为null/Partial或Unknown |
| PK-T11 | Matrix原生text/reply/media可参与显式discussion Run；idle房间消息不创建Run/调用/批准 |
| PK-T12 | Memory 更新任务只输出建议，不能写 Slinky authority |
| PK-T13 | 固定 Pi `sdk.ts` 选择 `streamSimple`，Responses payload 为 `stream:true/store:false`；LLMTier fixture覆盖文本、function call/output、terminal/failure与usage SSE子集，且不存在非流式fallback |
| PK-T14 | 当前机器契约不存在 SourceInstance、Seat、claim、drain、release、产品消息/content endpoint |
| PK-T15 | 同一实例最多一个Running/Cancelling Run，其他已受理Run保持Queued |
| PK-T16 | 两个Run的Pi session/checkpoint互不继承；实例profile稳定但请求无model字段 |
| PK-T17 | sync cursor/event dedup/稳定txn ID在重启后不重复消费或发送 |
| PK-T18 | membership撤销、跨room trigger、media ACL/size/path失败均fail closed |
| PK-T19 | 成功业务结果在usage缺失时仍可Completed，但usage必须Unknown且不得填零 |
| PK-T20 | Result已发布但终态提交前崩溃，恢复完成同generation且不重跑Pi |
| PK-T21 | OpenAPI每个operation/status的x-error-codes与catalog/schema完全一致，ResultUnavailable存在500映射 |
| PK-T22 | 相对路径拒绝绝对、反斜线、空segment、`.`/`..`，解析后拒绝symlink越界 |
| PK-T23 | Queued取消原子发布零调用Cancelled Result；Running cancel仍只确认stop intent |
| PK-T24 | fetch前登记attempt，raw usage规范化前捕获；Complete覆盖全部attempt并满足精确算术/子集；迟到不改Result |
| PK-T25 | matrix-js-sdk单一路径中cursor在turn durable后推进，event/self echo去重，txn重试稳定 |
| PK-T26 | read-only preflight不调用Responses；opaque reasoning完整重放；explicit prompt cache capability为false且三个字段缺席 |
| PK-T27 | 两个attempt中一个完全无usage时六项aggregate均null且Unknown可有observed=1；不同attempt分别缺字段时逐字段覆盖不足者null，不能返回已知下界 |
| PK-T28 | DiscussionTurn在Pi checkpoint前崩溃只追加一次，checkpoint后/Consumed前崩溃只补标记；Pi idle且无Pending turn时有限Run正常Completed，未来消息不重开 |
| PK-T29 | migration map把旧service design与旧STD基线明确标为历史，current/residual分类无矛盾且不升级STD锁 |

PK-T01/02/09/13/14/19/21/22/27/29中的机器可表达部分属于本轮静态验证；其余是实现或联调门禁，当前 `NOT_RUN`。
