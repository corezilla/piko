# Piko 对 LLMTier V0.3 总体设计的评审记录

状态：Recovery、V0.3 Scope B 与 machine contract `ACCEPTED`；runtime activation=false  
日期：2026-09-06  
评审请求：Matrix `L-20260906-67d0abbc6ae7`  
Recovery 冻结答复：Matrix `L-20260906-12940a96e148`  
LLMTier 声明基线：`main@b452b63`

## 1. Piko 固定的 Pi 基线

- 上游源码：`https://github.com/earendil-works/pi.git`
- 源码提交：`9767ba275f3e9a5ee0f5c5342249b629ab1b2282`
- Agent SDK：`@earendil-works/pi-coding-agent@0.85.1`
- LLM SDK：`@earendil-works/pi-ai@0.85.1`
- OpenAI SDK 传递依赖：`openai@6.40.0`
- Piko provider 名称：`llmtier`
- Piko adapter 名称：`piko-llmtier-responses-v0.3`

上述版本用于 V0.3 adapter contract capture，不构成 production activation。Piko 不把
Pi 内建 `openai-responses` 直接作为 LLMTier V0.3 recovery adapter，因为该实现固定
发送 `stream: true`，且标准 OpenAI SDK 不理解 active `202`、Invocation 查询和
lost-response recovery。

## 2. 身份、幂等与恢复约束

Piko 接受 `client_id + canonical source_id` 作为认证、幂等 namespace 和 recovery
scope。`source_instance_id` 仅用于 observation、correlation 和审计，不作为重启后的
恢复隔离边界。

Piko 提议幂等 namespace 固定为：

```text
llmtier-responses/v0.3
  + canonical client_id
  + canonical source_id
  + Idempotency-Key
```

canonical request digest 必须至少覆盖 exact `service_level_id`、完整规范化请求体和
影响推理语义的 header；同 namespace/key 不同 digest 必须是不可重试的 typed
conflict。Piko 在首次 dispatch 前持久化 key、digest、invocation reference 和 recovery
obligation；任何 transport retry、agent-level retry 或 restart recovery 都复用同一 key，
不得生成新 key 后盲目重派。

M2-C 已接受：`W=168h`，从 Invocation terminal 起提供连续去重保证；`M=24h`，
其中 clock skew 不超过 5 分钟；Piko 接受产品值 `D=24h`。它满足
`D <= W - M = 144h`。active record 保留到 terminal；content-free digest/tombstone、
Invocation terminal view 和 canonical Response 从 terminal 起至少保留 168 小时。

## 3. 本地实际 capture

环境：macOS、Node `22.22.3`、上述固定 Pi/SDK 版本；使用本地 mock response，不使用
真实 credential，不访问 LLMTier 项目或生产服务。针对 Pi 内建
`openai-responses` 的结果如下：

| 场景 | 实际请求/结果 | 结论 |
|---|---|---|
| 首次 `200` | 请求固定为 `stream:true`；标准 SSE terminal event 得到 `stop` | 只证明 Pi 标准流式路径工作，不证明 LLMTier non-stream 路径 |
| active replay `202` | `onResponse=202`，随后 `OpenAI Responses stream ended before a terminal response event` | 内建 adapter 不识别 `InvocationAccepted` |
| terminal replay `200` | `onResponse=200`，同样报缺少 terminal event | 历史候选行为的 capture；该行为已由 Slinky Amendment 1 废除 |
| typed conflict `409` | 输出包含 `idempotency_conflict`，但被压成普通 provider error 文本 | Piko 必须保留 typed code、retryability 和 invocation identity |
| lost response | 输出 `Connection error.`；Pi agent-level retry 默认启用且最多 3 次 | Piko adapter 必须先做 recovery，禁止用新 key 自动重派 |

安装依赖时使用 `npm ci --ignore-scripts`；安装完成，无 audit vulnerability。依赖树报告
`@earendil-works/gondolin@0.12.0` 要求 Node `>=23.6.0`，但当前 Node 为 `22.22.3`；
本次只运行 `pi-ai` mock capture，未进入 Gondolin 路径。该 engine warning 需在完整
Piko runtime matrix 中单独处理。

## 4. 评审结论

1. 接受 authority 分离、exact `service_level_id`、canonical Client/Source scope、
   UnknownOutcome 不盲目重派及 M2-C 的原则方向。
2. V0.3 使用唯一自定义 adapter `piko-llmtier-responses-v0.3`；它通过 Pi
   `registerProvider(..., streamSimple)` 接入，但由 Piko 自己执行 non-stream POST、
   Invocation/Response GET、状态判定和 durable recovery。它不是第二 inference path，
   也不允许退回内建 adapter。
3. Recovery `NEEDS_INFO` 已关闭。Piko 接受 `W=168h`、`M=24h`、`D=24h`；接受
   Invocation 建立后的 `Location`、`X-Tier-Invocation-ID`，active `202` 的
   `Retry-After`，以及 Invocation GET 的 `recovery_ready`、`retry_after_ms` 和
   `recovery_disposition`。
4. Piko 接受 terminal replay 使用 typed non-2xx `TerminalErrorEnvelope`：Failed 为
   `502 invocation_failed`、Cancelled 为 `409 invocation_cancelled`、UnknownOutcome
   为 `503 invocation_outcome_unknown`，三者均不重新 dispatch。adapter 必须以 typed
   `retryable=false` 覆盖 Pi 按 HTTP 5xx 进行重试的通用判断。
5. `replay_same_request` 只允许在 `D=24h` 内复用同一 Idempotency-Key、同一 digest
   和同一 Invocation obligation；它不是创建新 Invocation 的授权。
6. 按 Slinky 后续冻结的 Scope B，Piko V0.3 generation surface 仅包含 non-stream
   Responses、Models list/detail 与 Responses recovery；Embeddings 由 Knowledge/Memory
   consumer 独立验证；Chat Completions 与全部 SSE/streaming 延至 V0.4。V0.3 对
   `POST /v1/chat/completions` 返回 `404 unsupported_endpoint`，对
   `POST /v1/responses` 的 `stream:true` 返回 `400 unsupported_feature`，且不存在
   alias、第二 handler path 或 runtime fallback。
7. Piko 自定义 adapter 实现、冻结 surface 的 capture、crash/lost-response 零重复
   dispatch 证据全部通过前，compatibility manifest 不得激活。

## 5. OpenAI SDK 标准 surface capture 与 Scope B 取舍

环境仍为 OpenAI SDK `6.40.0`、Node `22.22.3`；使用 Piko 本地 mock transport，
不读取 LLMTier 项目文件、不使用真实 credential。以下只证明 stock SDK 的 request/
response 行为，不代表 LLMTier production route 已实现：

| 场景 | capture 结果 |
|---|---|
| Responses non-stream | `POST /v1/responses`，`stream:false`；解析标准 `response/completed` |
| Responses SSE | capture 已完成，但 V0.3 明确 fail closed，延至 V0.4 |
| Chat non-stream | capture 已完成，但 V0.3 endpoint 不实现，延至 V0.4 |
| Chat SSE | capture 已完成，但 V0.3 endpoint 不实现，延至 V0.4 |
| Embeddings | SDK 自动发送 `encoding_format:"base64"` 并解码向量；由 Knowledge/Memory consumer 验证，不属于 Piko generation surface |
| Models list/retrieve | 使用 `/v1/models` 与 exact-case `/v1/models/Worker` |
| active replay | HTTP `202` body 可读取；`Location`、Invocation ID、`Retry-After` 可读取 |
| terminal replay | `409/502/503` 均保留 typed code、`retryable=false`、Location 和 Invocation ID |
| Invocation GET | 自定义 GET 可读取 status、readiness、disposition、retry delay |
| Response GET | stock `responses.retrieve` 可解析 canonical `ResponsesResponse` |

Custom adapter 必须固定 SDK `maxRetries:0`，在 Piko durable obligation 层执行 recovery；
否则 OpenAI SDK/上层 Pi 的通用 retry 可能越过 typed `retryable=false`。

## 6. Machine contract 最终结论

LLMTier 已通过 Matrix bundle 1/5 至 5/5 提供 commit
`7607f55f249a2b63d2495566895fb598a5b4eaaa` 的 path、referenced components、正负
fixture、recovery fixture 与 Scope B fail-closed fixture。Piko 接受以下机器契约：

1. `Idempotency-Key` 是 durable logical invocation identity；
   `X-Tier-Client-Request-ID` 只用于调用关联；authenticated `client_id` 与 canonical
   `X-Tier-Source-ID` 构成 authorization、idempotency namespace 与 recovery scope；
   `X-Tier-Source-Instance-ID` 仅用于 observation、correlation 与 audit。
2. non-stream Responses 的首次/完成 replay 使用同一 `ResponsesResponse`；active replay
   仅允许 Pending/Queued/Running 并返回 202、Location、Invocation ID、Retry-After；
   terminal replay 返回 409/502/503 typed non-2xx，且不重复 dispatch。
3. Invocation/Response GET、exact-case Models list/detail 与 base64 Embeddings shape 可由
   pinned adapter/consumer 解析；Embeddings 不扩大 Piko generation authority。
4. Scope B fail closed：V0.3 没有 Chat/SSE schema、fixture、handler 或 fallback。

仍有两个实现期校验点，但不阻塞 design contract：LLMTier bundle 中
`InvocationView.endpoint` 当前固定为 `/v1/responses`，因此 Embeddings recovery 若需共用
Invocation GET，须由 Knowledge/Memory consumer 与 LLMTier另行冻结；
`replay_same_request` 未出现在当前 `InvocationView.recovery_disposition` 枚举，Piko V0.3
不依赖该值。所有 production implementation/capture gates 通过前 runtime activation
继续保持 false。
