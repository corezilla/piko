# LLMTier 第三轮 Piko 只读评审

覆盖原消息 ID：`S-20260917-af2176b2c66c`。

## 结论与基线

- Reviewer: `piko`
- Verdict: `AMENDMENT`
- Review scope: LLMTier current authority、需求/追踪、系统设计、Piko data plane、管理面、机器 OpenAPI/manifest/fixtures、V&V、operations/operational-store，以及固定 Pi adapter `9767ba275f3e9a5ee0f5c5342249b629ab1b2282` 的真实 Responses 请求和解析行为。
- LLMTier repository: `/Users/ben/work/LLMTier`
- Branch: `docs/std-draft21-upgrade`
- HEAD/base: `0398f5633edbef53cba29578ce1c592000ca8cd9`
- Worktree: clean at review time
- Machine candidate: `0.3-simplified-candidate.2`
- OpenAPI SHA-256: `f7f376de0721d7e2d4bbb594a09e2b4f087a2c87b8688042a363aaf1b6b0f5fc`
- Compatibility manifest SHA-256: `575b81f7fc8a6ba4b38eaf88e72fa375f69e0edd4c5729dff5452be94ee44561`
- Runtime activation: `false`

全文评审已完成。结论不是对实现或生产运行的验收。当前无状态网关、Piko 持有 Agent 上下文与工具循环、LLMTier 不执行工具、SourceInstance/Seat/Invocation/Cost 等退出外部契约的方向正确；下面是实际阻止机器契约闭合或会误导实现的发现。

## Findings

### LT-R3-PK-01 — P0 — 固定 Pi 的合法 Responses 请求会被当前 Schema 拒绝

- Evidence:
  - 固定 Pi `/Users/ben/work/piko/upstream/pi/packages/ai/src/api/openai-responses.ts:301-352` 每次发送 `stream:true` 和 `store:false`，并在适用时发送 `prompt_cache_key`、`prompt_cache_retention`、`prompt_cache_options`、`service_tier`、`reasoning`、`include`。
  - `/Users/ben/work/piko/upstream/pi/packages/ai/src/api/openai-responses-shared.ts:174-211` 产生不带 `type` 的 system/developer/user message；`:239-311` 会重放带 `id/status/phase/annotations` 的 assistant message、带 `id/namespace` 的 function call，以及可为 content array 的 `function_call_output.output`。
  - LLMTier `interfaces/openapi/llmtier-v0.3.openapi.json#/components/schemas/ResponsesRequest` 使用 `additionalProperties:false`，没有 `store` 等固定 Pi 字段；`MessageInput` 强制 `type=message`，`FunctionCallInput` 和 `FunctionCallOutputInput` 也缺上述标准形状。
  - 用当前 Draft 2020-12 Schema 对四个固定 Pi 形状实测，`pi_minimal`、assistant replay、function replay、image tool-result 四例全部 INVALID；仓库测试仍为 31 passed，说明现有 fixture 没覆盖真实 consumer shape。
- Impact: 首个 Piko 请求或第一轮 tool-result continuation 即可在 LLMTier validation 层失败，设计宣称的 fixed-Pi compatibility 不成立。
- Minimal fix: 以固定 Pi `buildParams` 和 `convertResponsesMessages` 实际输出作为唯一首版 subset，修正 OpenAPI input union；为确认不支持的 compat capability 在 Piko model profile 中固定 `false`，不要在 LLMTier 发明新字段或宽松 `additionalProperties:true`。加入逐字节合成 golden requests 和负例。

### LT-R3-PK-02 — P0 — SSE function-call item 缺少 Pi 必需的稳定 item `id`

- Evidence:
  - 固定 Pi parser `/Users/ben/work/piko/upstream/pi/packages/ai/src/api/openai-responses-shared.ts:485-499` 以 `${item.call_id}|${item.id}` 形成 tool-call identity，之后回传同一 item `id`。
  - LLMTier `OutputFunctionCall` 没有 `id`；`openai-surface-fixtures.json:49-60` 的 function-call added/done/terminal items 也都没有 `id`，仅 delta 事件单独使用 `item_id`。
  - `OutputMessage` 同样缺标准 `id/status`，无法支持固定 Pi 在 `output_item.done` 保存 text signature 并无状态重放。
- Impact: Pi 会生成 `call_id|undefined`，下一次完整请求无法保持标准 Responses item identity，tool loop/reasoning replay 可损坏。
- Minimal fix: 对齐 OpenAI Responses 标准 output item 的 `id/status` 及 Pi 实际读取字段；SSE added/done/terminal 中同一 item identity 必须一致。加入完整 text + function call + function result roundtrip fixture，并让 fixture 经过固定 Pi parser 测试。

### LT-R3-PK-03 — P0 — terminal Usage 形状和 unknown 语义与固定 Pi 不兼容

- Evidence:
  - Pi `/Users/ben/work/piko/upstream/pi/packages/ai/src/api/openai-responses-shared.ts:559-574` 读取标准 `input_tokens_details.cached_tokens/cache_write_tokens` 和 `output_tokens_details.reasoning_tokens`；LLMTier `TokenUsage` 改用顶层 `cached_input_tokens`，并禁止标准 details 字段。
  - LLMTier 允许 `ResponsesResponse.usage=null` 表示 unknown；Pi 只有 `response.usage` 存在才覆盖初始 Usage，否则任务结果保留零值，恰好违反 `unknown不得填零`。
- Impact: cache/reasoning token 会漏计或误归入 input；unknown 会在 Piko 任务级汇总中被当成 0。
- Minimal fix: Piko Data Plane terminal response 使用固定 Pi 能直接解析的标准 numeric Usage shape；若 provider 不能给可信计数，明确该调用在 Piko consumer 上的 typed failure/unknown处理，不以 `null` 静默通过。`measured|estimated|unknown` 质量可以保留在 `/tier/v1/usage`，但不能靠 Pi 不读取的扩展字段改变任务结果语义。

### LT-R3-PK-04 — P1 — 统一 Usage 查询没有可执行的去重、迟到修正和完整性规则

- Evidence:
  - `UsageRecord` 只有 `request_id` 与 `recorded_at`，没有 record revision/supersedes/completeness watermark；`UsagePage` 只有 cursor。
  - `piko-data-plane-control.md:39,51` 声称 Piko 可按 request ID 汇总任务用量，`vv-plan.md:42` 又要求“不重复计数”，但 contract 没定义同一 request 的 estimated→measured、重复记录、迟到记录、分页期间新增记录和 unknown 后补的合并规则。
  - 若响应丢失，Piko未必取得服务端 `X-Request-ID`，因此当前文档也不能把该查询描述为丢响应后的任务关联机制。
- Impact: Piko把 terminal usage 与查询结果相加可能重复；晚到修正可能被追加而非替换；分页快照无法证明汇总完整。
- Minimal fix: 固定 `request_id` 的唯一性/版本替换规则、迟到修正、稳定 pagination snapshot 或 completeness watermark；明确 Piko只在已取得同一 request identity 时做 reconcile，网络未知不恢复自定义 Invocation。若本轮不需要 Piko任务级查询，应删除相应消费承诺，把该接口限定为 operator token facts。

### LT-R3-PK-05 — P1 — Admin 并发与鉴权规则仍停留在 prose，机器 API 不可实现

- Evidence:
  - `llmtier-management-control.md:50-54` 要求 401、resource version/409 和防覆盖编辑，但称具体字段“实现阶段补充”。
  - OpenAPI view 有 `version`，write/patch/delete 没有 `expected_version` 或 `If-Match`；PATCH 及 DELETE 无可执行 compare-and-swap 输入。
  - 多数 item GET/PATCH/DELETE、deployment/service-level collection、admin Usage/Audit 的 response map 缺 401；PATCH 缺 409。列表也没有已冻结的分页形状。
- Impact: 两个 operator 可静默覆盖；生成客户端看不到认证/冲突分支；UI无法按设计处理 stale edit。
- Minimal fix: 在 current candidate 内冻结唯一强条件更新机制（优先标准 `If-Match`/ETag，或单一 expected_version）、所有 operation 的 401/403/404/409 矩阵及分页；不要留到实现时另选。

### LT-R3-PK-06 — P1 — 配置 authority 在 `settings.json` 与 SQLite Operational Store 之间矛盾

- Evidence:
  - `README.md:30`、system design `:168`、operations `:70-80` 仍把 Git-ignored `config/settings.json` 定义为默认配置及覆盖入口。
  - operational-store ADR `:51-53,59-65,76-80` 明确选择 SQLite 为版本化配置事实来源，并拒绝 JSON/多数据库并列 authority。
  - 当前没有 bootstrap/import 后谁为唯一 authority、重启优先级、迁移失败/回滚和 Admin 写入后 settings 文件处置规则。
- Impact: 重启可能覆盖 Admin API 修改，或两个配置源漂移；审计/版本和 readiness 无法确定读取哪一份事实。
- Minimal fix: 明确 `settings.json` 仅为一次性 bootstrap/import（或彻底取消），定义导入事务、已初始化检测、后续唯一 SQLite authority、失败回滚和 Secret reference 迁移；不得双写/按环境静默切换。

### LT-R3-PK-07 — P1 — 静态验证没有验证其声称的固定 Pi 契约，且基线文档陈旧

- Evidence:
  - 当前测试 `31 passed`，但 LT-R3-PK-01 的四个真实 Pi 形状全部被机器 Schema 拒绝，LT-R3-PK-02 的 fixture 还把缺 item id 的事件标为正例。
  - contract test spec `docs/70_verification/specifications/llmtier-v0.3-contract-test-specification.md:34` 仍写 candidate.1，current machine 是 candidate.2。
  - `docs/98_migration/current-document-inventory.md:3-7` 仍标 2026-09-09/draft.21 基线，而 README/lock 已是 draft.26；其旧 consumer ACCEPTED 记录不能证明 simplified candidate.2。
- Impact: static PASS 给出错误安全感，评审者可能引用过期 inventory/consumer verdict。
- Minimal fix: 增加固定 Pi request+SSE parser 的 executable conformance vectors；修正 candidate.2 测试基线；把 inventory 更新为当前 authority，历史 verdict 明确只作历史证据。

### LT-R3-PK-08 — P2 / 下游设计 — Admin Web UI 仍只有页面清单，没有可实现的交互状态契约

- Evidence: system design `11.2` 只有五页和一张导航图；没有 create/edit/delete/probe 的 loading、validation、stale-version conflict、unknown-result、empty/error/permission-denied、Secret replacement、键盘/可访问性和 destructive confirmation 状态。管理 control 又把并发/分页留到实现前。
- Impact: UI与API可能分别发明状态和安全行为，尤其会误把保存成功显示为 probe/ready 成功。
- Minimal fix: 在 LLMTier 内部下游 UI design 冻结页面/组件状态、字段映射、权限、确认和错误恢复；复用修正后的 Admin API，不新增浏览器直读配置、Secret或第二管理路径。该项不阻塞 Piko Data Plane wire，但在 Admin UI 实现前必须完成。

## Validation performed

- `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=src python3 -m pytest -q` → `31 passed`。
- Draft 2020-12 targeted validation of four fixed-Pi request shapes → all four rejected by current `ResponsesRequest`.
- OpenAPI/manifest/current vectors were read as bytes and hashed; no LLMTier files were modified and no package content was executed beyond the repository's existing static tests.

## Completion scope

Piko 对第三轮固定 LLMTier snapshot 的全文只读评审已完成。必须先关闭 LT-R3-PK-01..03 才能声称 fixed Pi Responses surface 可实现；LT-R3-PK-04..07 是 current candidate 的一致性/可执行性修订；LT-R3-PK-08 是 LLMTier 内部下游 UI 设计。未要求恢复 SourceInstance、Seat、Invocation、Cost、capacity 或兼容协商，也未要求生产 capture 作为本轮设计意见前提。
