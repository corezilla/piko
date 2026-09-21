<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko LLMTier 契约离线验收 — 2026-09-20 mock + Matrix 复验

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-llmtier-contract-20260920` |
| Document Version | `0.1.0` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-20` |
| Last Modified Date | `2026-09-20` |
| Template ID | `assurance.test-report` |
| Template Version | `0.1.1` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `tests/integration/reports/piko-llmtier-contract-20260920.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 执行摘要与结论

在真实 LLMTier 联调解锁之前，对 Piko v0.3 (`0.3.0-simplified.6`) 的 LLMTier 消费契约面完成了
**离线验收**：以 wire 兼容的 mock LLMTier（OpenAI Responses SSE）执行测试规格 v0.5.0 新增的
PK-T41..T54 共 13 项自动化 oracle（PK-T52 由既有 UT-USG-01 validator 承担），全部通过；
随后在重建的 Matrix sandbox 上复验 PK-T11/17/18/25/28/38 六项真实身份/注入 oracle，全部通过。

| 状态 | Count |
|---|---:|
| PASS | 19（含 refusal 消费与 LLMTier candidate.7 双向 wire conformance） |
| PARTIAL | 0 |
| NOT_RUN | 0 |

**关键结论**：oMLX 上打磨出的 Piko 实现在 mock 暴露的全部故障路径（请求钉扎、SSE 截断、
超时、畸形响应、HTTP 4xx/5xx、usage 缺失/迟到）下行为均符合契约，本轮**未发现 Piko 运行时
缺陷**；mock 首轮 5 个失败经定位全部为测试夹具问题。

## 2. 被测基线与实际环境

| Component | Version / Endpoint |
|---|---|
| Piko | v0.3.0-simplified.6, branch `docs/piko-system-design-std26` @ `8472598` 之前的工作树 |
| Pi AgentHarness | v0.85.1 / `9767ba27`（pinned + patched，启动时校验） |
| mock LLMTier | `tests/common/mock-llmtier.ts`（Node http，OpenAI Responses SSE wire 兼容） |
| Matrix homeserver | Synapse 1.161.0 @ `https://127.0.0.1:8448`（自签 TLS，`NODE_EXTRA_CA_CERTS` 注入） |
| LLM（全链路用例） | oMLX `Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed` @ `127.0.0.1:9000/v1/` |
| Piko HTTP API | `127.0.0.1:8787`（bearer，file-backed secrets） |
| STD | `0.1.0-draft.26` @ `4bec18d2`（本日 re-pin） |
| LLMTier | **未接触**——保持 operator 推迟状态 |

## 3. 执行记录

### 3.1 mock LLMTier 契约套件 `tests/integration/llmtier-contract.test.ts`（17 tests, 31s）

| Case ID | Result | Evidence |
|---|---|---|
| PK-T41 请求子集 | PASS | `stream:true`/`store:false`；无 `prompt_cache_*`/`previous_response_id`/task 字段；input 为完整数组 |
| PK-T43 最小事件集 | PASS | 仅必需 SSE 事件即 Completed；usage 精确透传 120/8/128，quality=Complete |
| PK-T42 工具循环 | PASS | `function_call` 驱动 read 工具；第 2 请求 input 含 `function_call_output{call_id}` 且工具输出含文件字节 |
| PK-T44 incomplete | PASS | `content_filter` → Failed，非 Completed |
| PK-T45 response.failed | PASS | `ModelResponseInvalid`/`ModelProtocol`，非 InternalError；message 含上游错误 |
| PK-T46 reasoning 重放 | PASS | 第 2 请求 input 含 `reasoning{id:"rs_9", encrypted_content:"enc-bytes-46"}` 字节一致 |
| PK-T47 usage 缺失 | PASS | minimal usage → Partial + 3 字段 null + missing_fields 精确匹配 |
| PK-T48 SSE 截断 | PASS | attempt1 无 usage/attempt2 UsageObserved；provider retry=0，Harness 新 durable attempt |
| PK-T49 超时 | PASS | hang>timeout → Failed（ModelUnavailable/ModelResponseInvalid），model_calls ≤ budget |
| PK-T50 畸形响应 | PASS | 200 + text/html → 干净契约失败，不挂起 |
| PK-T51 HTTP 状态 | PASS | 401/429/500/503 均映射契约失败；preflight 模型名缺失 reject、匹配 resolve |
| PK-T53 迟到 usage | PASS | Result 发布后 `observeUsage` 不改已发布字节 |
| PK-T54 Slinky 位全链 | PASS | submit→result→幂等重交同 run→409 conflict→cancel→404 全链 |

### 3.2 Matrix sandbox 复验 `tests/integration/matrix-acceptance.test.ts`（6/6, 32.8s，SKIP_SLOW=0）

| Case ID | Result | Evidence |
|---|---|---|
| PK-T11 transport | PASS | trigger+followup 入 turn（Consumed），两条 reply 事件回房 |
| PK-T17/T25 homeserver 重启 | PASS | Synapse SIGKILL+restart 后 followup 入库（轮询窗口内），cursor 推进 |
| PK-T28/T38 Piko 重启恢复 | PASS | SIGKILL 期间事件重启后补齐，无重复 |
| PK-T18 auth-loss fail-closed | PASS | reset_password → 事件计数冻结；final in-flight batch 仅推进 cursor（dedup 丢弃，合法） |
| 全链路（手动） | PASS | Matrix trigger→oMLX→2 turn Consumed→2 条房间回复，Run Completed（run-ff304572、clean-chain-001） |

## 4. 偏差、无效执行与重测

- 首轮 mock 套件 5 失败均为夹具问题：fixture 未授权 `read_paths`（Piko 正确拦截越权读）、
  usage merge 策略、固定脚本被 Harness retry 耗尽。修正夹具后 17/17。
- Matrix 慢套件在重建 sandbox 上暴露 3 个**测试基建缺陷**（详见 §5），修复后 6/6。
- 沙箱账号在本轮多次轮换（T18 注入 + beforeEach 自愈），套件结束时状态健康
  （whoami 200，单 Piko 进程）。

## 5. 缺陷、逃逸问题与风险

本轮发现的缺陷全部位于**测试基建**，Piko 运行时零缺陷：

| # | 缺陷 | 修复 |
|---|---|---|
| 1 | `sqliteScalar` 经 shell 执行 SQL，Matrix 事件 ID 以 `$` 开头被展开为空串 → 事件查询恒 0（T17/T28 假阴性根因） | `execFileSync("sqlite3",[db,sql])` 绕过 shell（commit `8472598`） |
| 2 | PK-T18 repair 仅在断言通过后执行，中途失败即投毒后续全部用例（401 级联） | repair 移入 `finally` + `beforeEach` 自愈（whoami 探测→admin 重置→重登→kill-then-spawn 重启 Piko） |
| 3 | PK-T18 断言 cursor 字符串精确相等；final in-flight batch 合法推进 cursor（dedup 丢弃已见事件，计数冻结） | 改为断言事件计数冻结（真正的 fail-closed 不变量） |
| 4 | 重启后单次查库即断言（SDK long-poll 最长 30s） | `waitUntilEventIngested` 轮询 ≤60s |

边界说明：mock 对 LLMTier 的假设完全来自 `piko-llmtier-consumption-v0.3`；真实依赖
不属于本报告范围（operator 推迟，见消费契约与 README 的部署 Gate 定义）。

## 6. 覆盖与 traceability

- 规格来源：`piko-agent-runtime-test-specification-v0.3` v0.5.0（本日新增 PK-T41..T54）。
- 契约来源：`piko-llmtier-consumption-v0.3` §2.1/§2.2/§3/§4。
- PK-T01..T40：`tests/integration/reports/piko-matrix-acceptance-20260919.md` 与
  `tests/integration/reports/piko-direct-omlx-debug-20260918.md` 维持原判。
- `npm run check`：19 文件 / 79 passed + 4 skipped + 机器契约 PASS simplified.6。

## 7. 测量结果、不确定度与限制

- mock 套件耗时 ~31s；Matrix 慢套件 ~33s；全套 `npm run check` ~32s。
- SSE 断流→重试路径受 Harness retry 节奏（baseDelay 1s）影响，实测 5–15s 完成。
- 限制：mock 不模拟 TLS/网络抖动/限流窗口语义（retry-after 仅透传断言）；多房间规模、
  媒体上传全链路维持单元/静态证据。

## 8. Release/Review Gate 建议

- **本报告结论**：LLMTier 消费契约的离线验收面（PK-T41..T54）全部 PASS。真实 LLMTier
  兼容维持既有定位——独立部署 Gate，由 operator 方向决定，不在本报告与当前工作范围内。
- Runtime Activation：`false`（本报告不授权任何运行时变更）。

## 9. 追加（同日第二轮）：对齐 LLMTier candidate.7 实际 OpenAPI 的字节级 conformance

第一轮 mock 是按 `piko-llmtier-consumption-v0.3` 的**语义**实现的。本轮追加读取
LLMTier 仓库本地 checkout 的稳定候选 `interfaces/openapi/llmtier-v0.3.openapi.json`
（`0.3-simplified-candidate.7`，只读，未触碰 LLMTier 项目），把 mock 升级为字节级一致，
并新增**双向 conformance 测试**：

| 项 | 结果 | 证据 |
|---|---|---|
| Piko 请求 ↔ `ResponsesRequest`（additionalProperties:false 白名单） | PASS | ajv 校验全部录制请求体，0 违例——确认 `prompt_cache_*` 三字段缺席、`reasoning:{effort:"none"}` 在枚举内、tools 形状匹配 `FunctionTool` |
| mock 事件 ↔ `ResponseStreamEvent` union | PASS | ajv 校验全部发出事件（含 sequence_number），0 违例 |
| 线封装 | PASS | `event: <type>` 行 + `data: [DONE]` 终结符 + 单调 sequence_number，与 LLMTier 自家 `tests/fixtures/v03_fake_provider.py` 同构 |
| `stream=true required`（非流式 400） | PASS | mock 强制 stream 语义，Piko 恒满足 |
| refusal 消费 | PASS | `response.refusal.delta` → Run Completed 且 summary 含 refusal 文本 |

第一版 conformance 校验器抓到并修正的 mock 偏差（均为 mock 侧，非 Piko）：

1. `output_text` content 缺 LLMTier 必填的 `annotations: []`；
2. `response.function_call_arguments.done` 缺必填 `output_index`。

**结论**：Piko 的真实请求字节落在 LLMTier candidate.7 的请求白名单内；mock 事件字节
落在其事件 union 内。两侧离线对齐完成，剩余差异只可能来自 LLMTier 实现 divergence，
属真实联调 Gate。

`npm run check`：19 契约测试全绿；全套 81 passed + 4 skipped。

## 10. 追加（同日第三轮）：gap review 与 09-18 场景全覆盖闭环

对照 09-18 报告的 16 个 live 场景逐项盘点，识别 9 个未在 mock/Matrix 套件覆盖的缺口，
全部以离线方式关闭：

| # | 缺口 | 关闭方式 | 结果 |
|---|---|---|---|
| 1 | write 工具 + outputs(sha256/size) 契约路径 | mock gap-1 | PASS（13 B 输出，hash/size 落 Result） |
| 2 | Running 中 cancel → Cancelled | mock gap-2 | PASS（StopRequested → CancelledByRequest） |
| 3 | tool budget 耗尽 | mock gap-3 | PASS（BudgetExceeded/Budget） |
| 4 | model budget 耗尽 | mock gap-4 | PASS（BudgetExceeded/Budget） |
| 5 | scope-denial 正式用例 | mock gap-5 | PASS（ToolFailure/Tool，越权字节不泄漏进 Result） |
| 6 | deadline 执行中过期 | mock gap-6 | PASS（DeadlineExceeded/TaskDeadline） |
| 7 | session isolation A/B | mock gap-7 | PASS（两 Run JSONL transcript 各含己方 marker、零交叉） |
| 8 | Matrix media 附件全链路 | live | PASS（upload→downloadMedia→staging 字节一致（cmp）→turn `Consumed`（可见内容含 `[Matrix attachment: …]`）→Run Completed；sanitize 文件名生效） |
| 9a | 同房间双 Open Run 收同一 turn | live | PASS（turn 2 双双 Consumed，双 Completed） |
| 9b | PK-T12 Memory proposal 复验 | live | PASS（authority sha256 不变 + proposal 落盘 + outputs 记录） |

接受性残余（有 09-18 live 证据 + 单元覆盖，本轮不在 mock 复现）：强制进程死亡流中
（PK-T05）、result-commit 崩溃（PK-T20）、safe/never edit-effect 崩溃恢复（PK-T06/07）——
需对真实 oMLX 做 SIGKILL 时序注入，保持 09-18 证据有效。

`npm run check` 最终态：**20 文件 / 88 passed + 4 skipped**，机器契约 PASS simplified.6。

## 11. 追加（同日第四轮）：对接 LLMTier 自家 fixture 服务器（authentic wire bytes）

LLMTier 仓库自带契约 fixture 服务器 `tests/fixtures/v03_fake_provider.py`（其契约测试
所用、候选语义的最小真实实现，默认 9191，模型 `synthetic-chat`）。将其在本机启动，
Piko 以 `config/runtime.synthetic.json`（gitignored）直连，preflight 一次通过，
从调用者视角执行三条流（全程离线，未接触 m5air）：

| 流 | 结果 | 发现 |
|---|---|---|
| 基础完成 | **Completed**，usage `Complete`（76/4 + cache/reasoning 全 0 精确透传，missing_fields=[]） | ⚠️ summary 为兜底文案：fixture 只发单个 `response.completed`（携带完整 output 数组、**无** `output_item.added/done` 与 `output_text.delta` 事件），Pi 从 item 事件物化文本 → 空文本走兜底 |
| REFUSE | **Completed**，无崩溃 | 同上 degenerate 流 |
| CALL_TOOL | function_call 真实分发：Pi 收 `fc_fake/call_01/read` 后**实际执行了 read 工具**（fixture 的 `args:{}` 不满足 read schema → ENOENT → `ToolFailure`） | ✅ 工具循环线协议（envelope/call_id/工具分派）对 LLMTier 真实字节全通 |

### 判定

- **工具循环线协议**：对 LLMTier 自家 fixture 字节验证通过——离线证据的最强形态。
- **fixture 局限记录**：该 fixture 只发单个 `response.completed` 而无 item/delta 事件
  序列，此形态下 Piko 的 Result summary 为空文本兜底（usage/状态仍正确）。LLMTier 的
  OpenAPI 与消费契约 §2.2 声明的是完整事件集，pinned Pi 按标准事件流消费；此局限属
  fixture 自身的简化，不影响本报告任何 PASS 判定。

另：`.gitignore` 增加 `config/runtime*.json` 模式（本地多配置变体不入库）；
LLMTier fixture 服务器保留运行在 9191 供后续复验。
