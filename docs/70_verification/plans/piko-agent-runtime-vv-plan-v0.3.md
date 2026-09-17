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
- Runtime activation: `false`

## 1. 设计阶段

静态验证 JSON/YAML、OpenAPI 引用、四操作集合、Schema 正负例、OpenAPI/status/typed-error双向一致性、usage语义、固定Pi SSE/retry代码顺序、禁止旧外部字段扫描和文档版本一致性。此阶段不声称生产能力存在。

## 2. 下游实现门禁

验证单Agent scheduler串行、每Run session隔离、RunSessionRecord/lease/checkpoint crash points、compaction、tool loop、abort、建流前有界重试与建流后不透明重放；任务提交幂等与Result原子发布；deadline/预算；未知工具副作用fail closed；usage字段存在性/迟到替换/不重复计数；workspace/path canonicalization/symlink/tool权限。

验证标准 Matrix invite/join/membership/sync cursor/event dedup/text/reply/txn/media/leave；验证只有显式活跃discussion Run可形成DiscussionTurn，idle event不执行，membership丢失停止。验证LLMTier `/v1/models`和Responses SSE/tool/usage的Pi兼容性；不验证旧产品envelope或Invocation recovery。

## 3. 联调与激活

联调注入模型不可用、首event前/后stream中断、各checkpoint崩溃、旧worker迟到写、工具未知结果、取消竞争、usage缺失/迟到、Matrix cursor重放/membership变化、附件权限失败。环境恢复后确认原Pi session能安全继续或明确失败。生产capture、安全、保留与性能证据在runtime activation前完成。

## 4. simplified.5 定向门禁

静态及实现验证必须覆盖：`options.fetch` dispatch 前 attempt/budget 原子登记、`processResponsesStream` 规范化前 raw Usage 捕获、逐字段只有全部 actual attempt 存在才求完整 sum、Partial/Unknown 及 observed-attempt 非零组合、Result 发布后迟到 Usage 不可变；Queued 原子取消且不取得 lease/session；唯一 `matrix-js-sdk` Client-Server 路径、self echo/event 去重、cursor 后提交、DiscussionTurn 到 Pi checkpoint 的两处崩溃恢复及 idle 时有限 Run 正常结束；RelativePath 尾空段拒绝；只读 preflight 不调用 Responses；完整 input 保留 opaque reasoning item；`supportsExplicitPromptCacheMode=false` 且三个 prompt-cache 字段缺席。
