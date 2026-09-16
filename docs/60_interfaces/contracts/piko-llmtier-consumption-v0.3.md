<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko 对 LLMTier V0.3 的消费契约

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-llmtier-consumption-v0.3` |
| Document Version | `0.3.0-finalization.4` |
| Status | `In Review` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko Adapter Owner |
| Authors | corezilla |
| Created Date | `2026-09-16` |
| Last Modified Date | `2026-09-16` |
| Template ID | `interfaces.control` |
| Template Version | `0.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | `piko-std-tailoring-v0.1` |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/60_interfaces/contracts/piko-llmtier-consumption-v0.3.md` |
| Supersedes | none |
<!-- STD_DOCUMENT_COVER_END -->

> 已完成语义审查的 Consumer baseline 为 LLMTier OpenAPI `0.3-candidate-amendment-8`、review commit
> `60959c2f59e6b3ef0bae18ba4caa1eda3ae97bf4`。目标升级版本为
> `0.3-finalization-candidate.1`、commit `a4dd5d2b1465b6643f4bf3c2c051bbd061366e50`，其OpenAPI
> 目标SHA-256为`5b3ceb7593b06c3401af25031a08d15a3c230063bae06b45b1ba779c7d25df3f`。
> 这些值由Slinky消息`S-20260916-8b8805ad1d84`转交，来源为LLMTier
> `L-20260916-847f93ed9cb0`；Piko未取得目标机器工件字节，尚未独立复算或完成差异审查。因此状态是
> “目标hash已知、机器内容待提供”，不是字节级消费签署。runtime activation=false。

## 1. 唯一消费面

Piko V0.3 只消费 `GET /v1/models[/...]`、`POST /v1/responses` non-stream、
`GET /v1/invocations/{id}` 与 `GET /v1/responses/{id}`。`service_level_id` 原样作为 exact-case
`model`；不得 lowercase、alias、跨等级替换、Provider-direct、Chat 或 SSE fallback。

Pi adapter 名称固定为 `piko-llmtier-responses-v0.3`。OpenAI SDK 自动 transport retry 必须关闭；
Piko 自己的 durable obligation/recovery adapter 是唯一重试编排者。

## 2. Deadline 与 digest

每个新的 logical model call 生成且持久化 `X-Tier-Deadline-At`，格式唯一为 RFC3339 UTC 三位毫秒
`YYYY-MM-DDTHH:mm:ss.SSSZ`。它必须不晚于 Piko Run 的 `limits.deadline_at`，可以更早；恢复必须逐
字节重放，不能延长。该 header 属于 LLMTier canonical digest；同 key 改 header 是 409
`idempotency_conflict`。缺失/非法分别是 400 `missing_required_header`/`invalid_deadline`。

LLMTier 的 `effective_deadline_at=min(request_deadline_at,catalog_deadline_at)` 只报告一次模型调用事实；
Piko 按唯一停止规则决定 Run：

- Piko task deadline 先到：Run=`Failed`、reason=`DeadlineExceeded`、detail=`TaskDeadlineExceeded`；
- request deadline 先到：Run=`Failed`、reason=`ExecutionError`、detail=`ModelRequestDeadlineExceeded`；
- catalog effective deadline 早于 request deadline：Run=`Failed`、reason=`ExecutionError`、
  detail=`ServiceEffectiveDeadlineExceeded`。

任何一类到期都停止该 Run 的新 Agent、模型和工具业务步骤；不得以新 key/new logical call 继续任务，
也不得换 Service Level。原 Invocation obligation 继续按原 key/digest 安全收口；Unknown 不重派。
若 LLMTier 晚到 canonical 200，Piko只把它记录为 late evidence，不恢复 Agent 步骤、不改写已经固定的
Run result，并永久保留 `ExceededAfterDispatch/deadline_exceeded_at` 事实。

## 3. 幂等、429/408 与无 ID 恢复

Piko 在每次新 logical model call 前持久化 endpoint、exact model、canonical body、semantic headers、
idempotency key、client request ID 与 Run call index。LLMTier判定优先级固定为：

1. 同 key digest conflict；
2. existing Invocation recovery；
3. request deadline reached；
4. cached 429 rejection decision expiry/re-evaluation。

因此，无既有 Invocation 且deadline已到返回408，优先于缓存429；已有Invocation即使deadline已到也
恢复原义务。429表示未建立Invocation；Piko不增加logical call计数，保留同key/body/header，在deadline
前按Retry-After重试。无Invocation ID时同样重放原POST；有ID后用Invocation GET。任何恢复都不创建新
key、Agent Attempt或dispatch。UnknownOutcome不盲重派。

## 4. 响应与 tool loop

| LLMTier结果 | Piko动作 |
|---|---|
| 200 canonical ResponsesResponse | 固定该logical call结果；解析message/function_call输出 |
| 202 InvocationAccepted | 保存Invocation ID、deadline事实与Retry-After，GET/同POST恢复；不增加call计数 |
| 408 无Invocation | 固定相应调用到期事实并按§2终止Run；不产生新key/new logical call |
| 409 invocation_cancelled / digest conflict | 前者固定terminal；后者为adapter invariant violation，不换key |
| 502 invocation_failed | 固定terminal error；不重派 |
| 503 invocation_outcome_unknown | Run进入RecoveryRequired；manual reconcile；不释放/重派 |
| 410 | 停止自动恢复，Run进入RecoveryRequired并报告保留窗口已过 |

多轮工具调用中，每个新的 Responses POST 是一个新的 logical model call，使用新key并计入
`max_model_calls`；tool result以`function_call_output`进入下一请求。一次调用的POST replay、Invocation
GET、Response GET不增加model_calls。只有Piko Tool Broker可执行工具；LLMTier function_call本身不授予
权限。工具副作用未知时先对账，不能靠再次模型调用掩盖。

## 5. 保留与证据边界

Piko自动模型调用恢复期限最多24h；LLMTier resolved terminal去重/Invocation/canonical Response窗口
至少168h，从`resolved_terminal_at`起算。活动或Unknown义务不能因168h计时自动删除。Piko Run自身
Piko已受理Run的`max(request.deadline_at,Run.accepted_at)+7d`与pre-admission rejection的
`max(request.deadline_at,decision_first_created_at)+7d`是Piko任务窗口，不改变LLMTier M2-C。

本文件确认Piko的设计消费；不声明真实SDK capture、production实现或runtime activation。对
`0.3-finalization-candidate.1` 的最终字节级绑定仍需LLMTier通过Matrix提供实际OpenAPI机器正文；Piko将
复算上述SHA-256并做字段差异审查。工件到齐后只关闭baseline evidence gate，不重新打开上述语义，也不
保留并行解释。
