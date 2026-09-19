# LLMTier candidate.3 Piko 定向复审

覆盖原消息 ID：`L-20260917-19e11bfe0970`。

## 结论与基线

- Reviewer：`piko`
- Verdict：`AMENDMENT`
- Review scope：固定 Pi 0.85.1 的 Responses request、SSE output item/terminal、function call/result、reasoning/refusal、terminal Usage，以及 `/tier/v1/usage` 的 Piko 消费边界；同时扫描已退出的 SourceInstance、Seat/capacity、Invocation recovery、Cost、Agent session 和兼容 fallback 是否重新进入 current external contract。
- LLMTier repository：`/Users/ben/work/LLMTier`
- Branch：`docs/std-draft21-upgrade`
- Base/HEAD：`0398f5633edbef53cba29578ce1c592000ca8cd9`
- Worktree：dirty，提供方报告 42 个 tracked/untracked 条目；本复审未修改 LLMTier 文件。
- Machine candidate：`0.3-simplified-candidate.3`
- Runtime activation：`false`
- OpenAPI SHA-256：`dd3645b4db136ddd559de32c38841047cf80b81e0799ae832010d5c56013d0d0`
- Compatibility manifest SHA-256：`15dc0b671fb8137eed11ce09a1c9c2a20ced974c6994fc489d411f1f06124c60`
- OpenAI fixture SHA-256：`31f90bddc618b0b2546e3641759a5b2cc73560471f72bec5ea6c65bd5009b0fd`
- Usage fixture SHA-256：`be82e0725c0f50812e64d4f415b3ad2e5c4b3fa07afb9bc9016c188dc62cc5bc`
- Remediation record SHA-256：`38c293f49d4cea90225c018714f17fbd920749b92d65db4554d8e5a1d5de45d7`

LT-R3-PK-02..08 的原问题已按本轮固定字节关闭；LT-R3-PK-01 仍有一个标准 refusal 形状缺口。没有生产 capture 不影响本设计结论。

## Remaining finding

### LT-R3-PK-01-R1 — P1 — 标准 refusal 的最终 output item 被机器 Schema 排除

- 位置与证据：
  - LLMTier OpenAPI `OutputMessage.content` 只允许 `OutputTextContent`，后者固定为 `{type:"output_text", text, annotations}`（`interfaces/openapi/llmtier-v0.3.openapi.json:1474-1493,1784-1822`）。
  - 同一契约却支持 `response.refusal.delta`（`:2153-2182`），而正例 `responses-sse-reasoning-refusal` 在 delta 后把最终拒答伪装成 `output_text`（`interfaces/vectors/v0.3/openai-surface-fixtures.json:77-91`）。
  - 固定 Pi parser 在 `response.output_item.done` 明确按 `c.type === "output_text" ? c.text : c.refusal` 消费 refusal content（`upstream/pi/packages/ai/src/api/openai-responses-shared.ts:681-700`）。锁定 OpenAI SDK 的标准类型是 `{type:"refusal", refusal:string}`（`upstream/pi/node_modules/openai/resources/responses/responses.d.ts:4369-4380`）。
  - 独立 Draft 2020-12 定向验证：标准 `OutputMessage` content `[{"type":"refusal","refusal":"Cannot comply"}]` 被 candidate.3 拒绝；当前提供方 semantic validator 仍 exit 0，因为 fixture 使用了错误的 `output_text` 形状。
- 影响：真实 provider 的合法标准 refusal 流到达 `output_item.done` 或 terminal response 时，LLMTier 的机器契约与其自称的 fixed-Pi/OpenAI-compatible surface 不一致。实现若按 Schema 校验会拒绝合法响应；实现若透传，fixture/validator又无法证明契约覆盖。
- 最小修复：新增标准 `OutputRefusalContent {type:"refusal", refusal:string}`，让 assistant history/output message content 使用 `OutputTextContent | OutputRefusalContent` 中实际需要的方向；把 refusal 正例的 done/terminal item 改为标准形状，并增加“把 refusal 改写成 output_text 不算 refusal”的负例或语义 oracle。无需新增 endpoint、fallback、自定义事件或会话机制。

## 已关闭范围

- 固定 Pi request：`stream:true/store:false`、easy message、assistant history、opaque reasoning、标准 function call/output 及 image tool result 已与当前 Schema/fixture 对齐。
- SSE：message/function/reasoning item ID、added/done/terminal identity、单 terminal 和 status 对应已对齐；除上面的 refusal 最终 content 外未发现新的 consumer 差异。
- Usage：terminal nested token details、字段缺失保留 Unknown、每 principal+request 的高版本替换、稳定 snapshot/cursor、store 503 及 response/query 不重复相加已足以支持 Piko 当前消费。
- 范围收缩：未发现 SourceInstance、capacity/Seat/claim、custom Invocation/idempotency recovery、Cost、Agent conversation/session authority 或 runtime fallback 重新成为外部能力；manifest 中这些词只出现在明确的排除清单。
- `reasoning.effort=max` 未作为本轮 finding：固定 Pi 只有在 model `thinkingLevelMap.max` 明确存在时才会发送；Piko 当前首阶段没有冻结该能力。今后若配置需要 `max`，应走显式能力对齐，而不是现在加入未确认 optional surface。

## 独立验证

- 提供方 `tools/contract_semantic_validator_v03.py`：exit 0（只说明当前 oracle 自洽，不覆盖上述真实标准 refusal 反例）。
- Draft 2020-12 targeted validation：标准 refusal final item 被拒绝，重现 LT-R3-PK-01-R1。
- 上述 OpenAPI/manifest/fixture/remediation 字节 SHA-256 独立复算与提供方一致。

## 完成范围

Piko 对 candidate.3 的本轮定向复审已完成。结论是 `AMENDMENT`，仅剩 LT-R3-PK-01-R1；修复并给出更新字节后可做一次定向复验。实现、provider capture、部署和 runtime activation 仍是后续 Gate，不在本次设计接受范围。
