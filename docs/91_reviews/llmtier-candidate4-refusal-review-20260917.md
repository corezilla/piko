<!-- STD_DOCUMENT_COVER_BEGIN -->
# LLMTier candidate.4 refusal 定向复审

> STD 使用入口：[项目采用说明与标准导航](../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `llmtier-candidate4-refusal-review-20260917` |
| Document Version | `0.1.0` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-17` |
| Last Modified Date | `2026-09-21` |
| Template ID | `review.packet` |
| Template Version | `0.1.1` |
| Template Conformance | `legacy-mapped` |
| Tailoring Reference | none |
| Migration Map Reference | docs/98_migration/piko-std-migration-map.md |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/91_reviews/llmtier-candidate4-refusal-review-20260917.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

覆盖原消息 ID：`L-20260917-fcc994a78c2d`。

结论：**AMENDMENT**。复审范围严格限定 `LT-R3-PK-01-R1` 的 refusal 消费，不涉及 Usage、Embedding、Admin、UI、内部存储、生产 capture 或 runtime activation。

## 基线核验

- manifest：`/Users/ben/work/LLMTier/docs/91_reviews/llmtier-candidate4-review-manifest-20260917.json`
- manifest SHA-256：`70baeec04489ed3a02a0e4cb213b68947d85585ed9e93bd578c511e9bd605787`，与请求一致。
- package：`0.3-simplified-candidate.4`；base/HEAD `0398f5633edbef53cba29578ce1c592000ca8cd9`；dirty uncommitted review snapshot；runtime_activation=false。
- manifest 所列 20/20 文件的 SHA-256 与字节数均独立复算一致。

OpenAPI 已正确增加 `OutputRefusalContent {type:"refusal", refusal:string}`，并在 `AssistantMessageInput.content` 与 `OutputMessage.content` 中和 `OutputTextContent` 构成互斥 oneOf。正例中的 `response.refusal.delta`、`response.output_item.done` 及 terminal `response.completed.response.output` 均使用 refusal 形状；固定 Pi 的 `processResponsesStream` 也确实把 `output_text` 与 `refusal` 两类内容映射到文本块。

## LT-R3-PK-01-R2 / P1：terminal refusal 与 done item 未被语义 oracle 绑定

位置：

- `/Users/ben/work/LLMTier/tools/contract_semantic_validator_v03.py::validate_sse_sequence`
- `/Users/ben/work/LLMTier/tests/test_contract_semantics_v03.py::test_standard_responses_sse_matches_pinned_pi_subset`
- `/Users/ben/work/LLMTier/interfaces/vectors/v0.3/openai-surface-fixtures.json`

证据：validator 在 refusal delta 后只检查 `response.output_item.done.item.content` 含相同 content kind；处理 terminal event 时只比较 terminal output 与 done item 的 index→id 映射。它没有比较同 ID item 的 content kind或内容。因此保持 `id=msg_03` 不变、只把 terminal output 的 content 从 `[{"type":"refusal","refusal":"Cannot comply"}]` 改成 `[{"type":"output_text","text":"Cannot comply","annotations":[]}]`，当前 `validate_sse_sequence` 仍返回 `(True, None)`。现有负例只改写 done item，未覆盖 terminal-only 改写。

此外，OpenAPI 虽允许 assistant history 中使用 `OutputRefusalContent`，但当前 fixture 没有 refusal assistant-history request，测试也没有把这种 request 交给 `ResponsesRequest` Schema；因此处置记录中“用于 assistant history”的声明缺少对应机器 oracle。

影响：同一 output item 在 done 与 terminal 中可改变内容种类却通过 semantic validator；消费者无法用当前 oracle证明 terminal output 没把标准 refusal 重新伪装成 output_text。assistant-history 分支也没有回归保护。

最小修订：

1. validator 保存每个 done item 的规范内容（至少 type/content kind，最好比较完整 item），terminal output 必须与同 index/id 的 done item一致；同 ID 但 refusal→output_text 的 terminal-only 改写必须拒绝。
2. 增加上述 terminal-only 负例并实际断言拒绝。
3. 增加一个 assistant-history refusal request fixture，并由测试验证 `ResponsesRequest` 接受 `OutputRefusalContent`；不需要新增 endpoint、事件或兼容分支。
4. 更新 `LT-R3-PK-01-R1` 处置证据和 candidate manifest/hash 后，按同一普通路径快照请求定向复审。

限制：本次只读；未修改 LLMTier 文件，未读取凭据、环境或生产数据。原正例和 Schema 形状通过不等于上述 terminal identity/content 语义已闭合。
