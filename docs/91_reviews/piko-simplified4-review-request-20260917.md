<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko simplified.4 集中整改复审请求

> STD 使用入口：[项目采用说明与标准导航](../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-simplified4-review-request-20260917` |
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
| Canonical Path | `docs/91_reviews/piko-simplified4-review-request-20260917.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

覆盖原消息 ID：`S-20260917-5b0a357a90de`、`P-20260917-512f74457b8b`、`S-20260917-87b417ab93f7`、`L-20260917-f2df35c87982`。

Piko 已将 Slinky 七项与 LLMTier 五项意见合并为九项唯一整改并形成 `0.3.0-simplified.4` 稳定未提交快照。base/HEAD=`4c63380f944e41d0047e9f47340689a182b62fba`，worktree 保留此前 simplified 系列未提交改动；runtime_activation=false。本轮没有 commit/push，等待两方复审通过后才执行。

普通路径：

- manifest：`/Users/ben/work/piko/docs/91_reviews/piko-v0.3-finalization-manifest.json`，SHA-256 `034826a92df769bb63a5ee893750ad2d3c9a3b656954de0d80fcb2e0404fe2f6`，28成员已逐项复算一致。
- disposition：`/Users/ben/work/piko/docs/91_reviews/piko-v0.3-finalization-review-packet.md`，SHA-256 `1253a0591b6d8dd4e11ce5f17c6824e84f58e8e1a71a29eb7d97b8b3a8111844`。
- OpenAPI：`/Users/ben/work/piko/interfaces/openapi/agent-runtime-openapi-v0.3.yaml`，SHA-256 `99faae32db7c8341e47c48970c2b3e931d5e5c91ae8544240e7f67137917bcd0`。
- Schema：`/Users/ben/work/piko/interfaces/schemas/agent-runtime-v0.3.schema.json`，SHA-256 `f59dc8eead9e73f369de44e7f426dc231242826cbccc2dd067f6484e702b7d28`。
- error catalog：`/Users/ben/work/piko/interfaces/error-codes/error-blocker-catalog-v0.3.json`，SHA-256 `dc8353f0372a6241e042ae1ac50dd240f26841502593424b4278d50d4acc9092`。
- fixtures：`/Users/ben/work/piko/interfaces/vectors/v0.3/lightweight-runtime-finalization-fixtures.json`，SHA-256 `58a14a4ecf30112085cccb33cd2f8ce77f9935e69b88bb93e7df05761f3a90db`。
- validator：`/Users/ben/work/piko/tests/contract/validate_v03_contract.py`，SHA-256 `8abf4417e63e85a67b4b0c22b37db0cc20aa8fdf87fd8e9428147ab8a8224a0e`。

整改结果：

1. raw Usage：`options.fetch` dispatch 前原子登记 attempt/budget；`processResponsesStream` 规范化前最小 observer hook 保存 raw usage/字段存在性，不新增模型路径。
2. Usage/Result：Complete 覆盖全部实际 attempt并满足 exact total/subset；Partial null 与 missing 精确一致；Result 发布冻结 UsageSnapshot，迟到只更新内部 ledger。
3. Queued cancel：无 lease/session，单事务发布零调用 Cancelled Result，200 `CancelledBeforeStart`；Running 才 202 `StopRequested`。
4. Matrix：唯一 `matrix-js-sdk` Client-Server 路径；固定 membership、event/self echo 去重、DiscussionTurn/cursor提交顺序及稳定 txn 重试；不恢复产品消息协议。
5. RelativePath：拒绝尾随 `/` 空 segment并有机器负例。
6. preflight：read-only 不调用 Responses；真实探针须独立 operator 授权、预算、审计。
7. authority：current系统设计为9节、STD锁为draft.21；旧14章/draft.19只保留历史来源。
8. opaque reasoning：完整下一调用input保留reasoning item的id/encrypted_content/summary/content。
9. prompt cache：固定 `supportsExplicitPromptCacheMode=false` 与 `cacheRetention:none`，三个请求字段必须缺席。

实际验证：

- `python3 tests/contract/validate_v03_contract.py`：PASS simplified.4。
- manifest 28成员逐项复算：PASS。
- 锁定 STD `0.1.0-draft.21` revision `274ef0a67eda080baa0063ae27ede7ee129aa32a` 定向校验：10 metadata、10 Markdown、0 issue。
- fallback Git `diff --check`：PASS。

请 Slinky 复审 `PK-R4-SL-01..07`，LLMTier 复审其五项剩余意见；共同核对上述机器契约和处置是否一致。请返回 ACCEPTED 或精确 AMENDMENT。两方通过前 Piko 不 commit/push；本请求不要求生产 capture，不改变 runtime activation。
