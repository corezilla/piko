<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Agent Runtime v0.3 验证与确认计划
| 文档字段 | 值 |
|---|---|
| Document ID | `piko-agent-runtime-vv-plan-v0.3` |
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
| Template ID | `assurance.vv-plan` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/plans/piko-agent-runtime-vv-plan-v0.3.md` |
| Supersedes | none |
<!-- STD_DOCUMENT_COVER_END -->

- Document ID: `piko-agent-runtime-vv-plan-v0.3`
- Version: `0.4.0`

## 1. 设计阶段

静态验证 JSON/YAML、OpenAPI 引用、四操作集合、运行配置与工具策略 Schema 正负例、OpenAPI/status/typed-error双向一致性、usage语义、固定Pi AgentHarness intent/stream/replay代码顺序、禁止旧外部字段扫描和文档版本一致性。此阶段不声称生产能力存在。

## 2. 下游实现门禁

验证任务事务层只负责受理、Run 持久化、Pi 边界适配、恢复和 Result 封装，不实现平行 Agent loop；验证单Agent scheduler串行、每Run Harness session隔离、lease/operation crash points、compaction、tool loop、abort、Harness有界重试与effect不透明重放；`task_id` 全局唯一身份、重复提交返回原 Run、定义冲突不覆盖、永久tombstone不复用，以及 Result 原子发布；deadline/预算；未知工具副作用fail closed；usage字段存在性/迟到替换/不重复计数；workspace/path canonicalization/symlink/tool权限。

验证标准 Matrix invite/join/membership/sync cursor/event dedup/text/reply/txn/media/leave；验证只有显式活跃discussion Run可形成DiscussionTurn，idle event不执行，membership丢失停止。验证LLMTier `/v1/models`和Responses SSE/tool/usage的Pi兼容性；不验证旧产品envelope或Invocation recovery。

## 3. 联调与激活

联调注入模型不可用、stream中断、各Harness operation提交点崩溃、旧worker迟到写、工具未知结果、取消竞争、usage缺失/迟到、Matrix cursor重放/membership变化、附件权限失败。环境恢复后确认原Pi session能安全继续或明确失败。生产部署前还需完成capture、安全、保留与性能证据。

## 4. simplified.6 定向门禁

静态及实现验证必须覆盖：`task_id` 是唯一提交身份且一对一绑定 Run；相同任务定义重复提交返回原 Run；同一 `task_id` 的任意定义变化返回 `TaskConflict` 且保留原任务；tombstone 后不复用；接口中不存在额外提交身份 header、请求摘要或 `client_task_id`；Harness `before_request` 前 attempt/budget 原子登记、additive raw Usage hook、逐字段只有全部 durable provider-effect attempt 存在才求完整 sum、Partial/Unknown 及 observed-attempt 非零组合、Result 发布后迟到 Usage 不可变；`before_tool` 按稳定toolCallId执行逻辑调用预算CAS且replay不重复计数；Queued 原子取消且不取得 lease/session；唯一 `matrix-js-sdk` Client-Server 路径、trigger event首次单次注入、self echo/event 去重、cursor 后提交、DiscussionTurn 到 Harness queue/transcript/operation 的崩溃恢复、Open→Closing与ingestion并发串行化及有限 Run 正常结束；RelativePath尾空段和控制字符拒绝；只读preflight不调用Responses；完整input保留opaque reasoning item；`supportsExplicitPromptCacheMode=false`且三个prompt-cache字段缺席；recovery contract引用必须绑定已注册实现。
