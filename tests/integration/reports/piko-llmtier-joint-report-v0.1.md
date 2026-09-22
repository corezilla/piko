<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko ↔ LLMTier 联调报告

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-llmtier-joint-report-v0.1` |
| Document Version | `0.1.0-draft.2` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-22` |
| Last Modified Date | `2026-09-22` |
| Template ID | `assurance.test-report` |
| Template Version | `0.1.1` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `tests/integration/reports/piko-llmtier-joint-report-v0.1.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## 1. 执行摘要与结论

- **结论：Piko ↔ LLMTier 首次联合调试通过。** 规格定义的 13 个联调 case 全部执行、全部 PASS
  （0 FAIL、0 SKIP、0 BLOCKED；JT-13 为 review 后增补的管理面统计检查）；S3 联合多维度回归全绿；
  过程中发现并修复 2 个 Piko 侧真实缺陷，新增失败定位工具 `scripts/joint-diagnose.sh`。
- **执行依据**：方案 `piko-llmtier-joint-test-specification-v0.1`（draft.3）+ 计划
  `piko-llmtier-joint-test-plan-v0.1`（draft.5，S0→S1→S2→S3→S4）。
- **多维度回归（S3）**：scenario 套件经 joint 实例 **31/31 PASS**（`SCENARIO_MATRIX=0`，Matrix 4 case
  已在生产实例套件覆盖）；`npm run check` **95 passed / 0 skipped**；`npm run test:live`（生产
  direct-oMLX 面）**41/41 PASS**。
- **未通过点**：无。SKIP：无。

## 2. 被测基线与实际环境

| 项 | 值 |
|---|---|
| Piko joint | `127.0.0.1:8788`，`config/runtime.llmtier.json`，`agent.model="Worker"`，matrix 关闭，branch `docs/piko-system-design-std26` |
| LLMTier joint | `192.168.1.8:8180`（0.0.0.0），`0.3.0-dev`，`state/llmtier-piko-joint.sqlite3`，wire 基线 candidate.7 |
| 模型后端 | oMLX `127.0.0.1:9000`，`Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed` |
| 契约 authority | `llmtier-piko-data-plane-control` v0.3.2-draft.3 + LLMTier V0.3 OpenAPI |
| 隔离 | 生产 Piko 8787、他人实例 18999、m5air 8181 全程未触碰 |

环境部署、bootstrap、凭据与就绪证据 V1..V9 见规格 §2；本次联调按 Owner 决定（2026-09-21）
使用明文 `http://` LAN endpoint（Piko schema 已放宽并带回归）。

## 3. 执行记录

| Case | 层 | 判定 | 证据摘要 |
|---|---|---|---|
| JT-01 wire/easy-message | L1 | **PASS** | `run-47311c90…` Completed；账本 `Worker/measured` 846/2/848 |
| JT-02 wire/tool-loop | L1 | **PASS** | `run-cdfe7fa5…` Completed；attempts=2（第二轮含工具结果历史被接受），账本 2 条 |
| JT-03 wire/reasoning | L1 | **PASS** | `run-d6b07de8…` Completed；`reasoning_tokens=2`；opaque reasoning 二轮接受由 JT-02 佐证 |
| JT-04 models/preflight | L2 | **PASS** | 启动 preflight 通过；`/v1/models` 精确含 `Worker` |
| JT-05 unknown model | L2 | **PASS** | 启动即失败：`configured model is not available: NoSuchModel`；8788 未监听；恢复后正常 |
| JT-06 auth 拒绝 | L2 | **PASS** | 错误 token → responses/models 均 **403**（见 §5 发现 F-1） |
| JT-07 provider 不可用 | L2 | **PASS**（修复后） | `run-fa5d604a…` `Failed/ModelUnavailable/Dependency`（6s，无悬挂）；恢复后 `run-edff2ce3…` Completed。注入方式：admin API PATCH provider endpoint → 死地址（不触碰共享 oMLX） |
| JT-08 LLMTier 重启恢复 | L4 | **PASS**（修复后） | `run-fceab2d8…` `Failed/ModelUnavailable/Dependency`；重启 LLMTier 后复跑 `run-5a4395f4…` Completed |
| JT-09 并发与队列 | L4 | **PASS** | 同时提交 → `Running`+`Queued` → 双 `Completed`，无 5xx |
| JT-10 usage 对账 | L2 | **PASS** | 账本 == Piko usage（846/2/848，input 含 cached）；`record_version=2` |
| JT-11 场景切片回归 | L3 | **PASS** | PTS-01/02/04/05 → joint 实例 15/15 |
| JT-12 全量回归 | L3 | **PASS** | scenario 套件经 joint 实例 **31/31**（`SCENARIO_MATRIX=0`） |
| JT-13 管理面统计变化 | L2 | **PASS** | 数据面 run（`run-e6cf0850…`）后 logs +4、usage +1（audit 不变属预期——audit 仅记管理动作）；admin probe 后 audit 8→9（`deployment.probe healthy`） |

## 4. 偏差、无效执行与重测

| 偏差/无效 | 处置 |
|---|---|
| Owner 决定：模型 endpoint 允许明文 `http://`（trusted-LAN） | Piko schema `llmtier.base_url` 放宽为 `^https?://`；单测与契约校验负面样例同步更新；已纳入回归 |
| JT-05 首次执行使用 macOS 不存在的 `timeout(1)` | 判 INVALID；修订规格步骤（nohup 方式）后按序重做，PASS |
| 执行顺序说明 | 计划修订（去必做集）前已完成 JT-01/04/06/10；其余按 JT 编号序执行 |

## 5. 缺陷、逃逸问题与风险

### 5.1 已修复缺陷（Piko 侧，均有单测+实测回归）

| ID | 缺陷 | 根因 | 修复 | 回归 |
|---|---|---|---|---|
| D-1 | provider 不可用（502/503、`provider_unavailable`）被分类为 `ModelResponseInvalid/ModelProtocol` | Pi 将 HTTP 状态折叠进错误文本，Piko 仅识别 Pi 内部 `model_unavailable` 码 | 新增 `isProviderUnavailableMessage` 并用于 pi-runtime 失败分类 + worker 终诊兜底（outcome/catch 双路） | JT-07：`run-fa5d604a…` → `ModelUnavailable/Dependency`；单测 2 例 |
| D-2 | 连接中断（`Connection error.`）同样被误分类 | 分类器未覆盖连接类关键词 | 分类器扩展（connection error/refused、fetch failed、socket 等） | JT-08：`run-fceab2d8…` → `ModelUnavailable/Dependency`；单测 1 例 |

### 5.2 发现（不判缺陷，交相关方评审）

| ID | 发现 | 影响 | 建议 |
|---|---|---|---|
| F-1 | 认证拒绝实测返回 **403**，ICD §6 写 `401 auth` | consumer 兼容性语义（401 应触发重认证，403 不应） | LLMTier 侧评审：统一为 401 或在 ICD 明示 403 |
| F-2 | 全局 `readyz=degraded`（内置 `Embedding-v1` 占位无部署） | 不影响 chat 数据面（`Worker=available`） | LLMTier 侧考虑默认剔除占位 service level |
| F-3 | oMLX 不回报 `cache_write_tokens` → Piko `usage.quality=Partial` | 契约允许；与 direct-oMLX 路径一致 | 无需动作；升级 oMLX 后可转 Complete |
| F-4 | LLMTier `audit` 仅覆盖管理面动作，数据面请求不产生审计事件 | 联调中无法用 audit 追踪数据面；是否补数据面审计由 LLMTier 设计决定 | LLMTier 侧确认语义；若需数据面审计则扩展（本联调按 logs+usage 承担数据面统计） |
| F-5 | Piko↔LLMTier 无端到端 request_id 关联、无逐跳时延统计；`logs` 仅 HTTP 访问日志（无上游细节） | 失败定位需依赖 Pi 会话 JSONL + 时间窗关联（已工具化：`scripts/joint-diagnose.sh`） | 后续：Piko 发送 `traceparent`/记录 LLMTier request_id（需 adapter patch），LLMTier logs 增加上游调用明细 |

## 6. 覆盖与 traceability

- JT-xx ↔ PK-Txx ↔ ICD：见规格 §3 表（wire 形状 PK-T41..47、错误面 PK-T51、usage PK-T53、
  队列 PK-T15、场景回归 PTS 系列）。
- 真实链路覆盖维度：wire 形状（easy message/工具环/reasoning）、模型解析、认证、依赖失败映射、
  进程级故障恢复、并发排队、usage 双侧对账、全量场景回归。
- 未覆盖（计划排除项）：m5air 部署、TLS、embeddings、Slinky capacity。

## 7. 测量结果、不确定度与限制

| 观测 | 值 |
|---|---|
| 纯文本任务（单次调用） | input 846 / output 2 / total 848 tokens（账本与 Piko 一致） |
| provider 断链失败时延 | ~6s 到终态（重试窗口内耗尽），无悬挂 |
| `usage.quality` | `Partial`（`missing_fields=["cache_write_tokens"]`，oMLX 不回报） |
| 限制 | 单机 loopback+LAN；单执行槽；无并发压测阈值；模型输出质量不做判定 |

## 8. Release/Review Gate 建议

- 联调 Gate：**建议判定通过**（12/12 PASS + 多维度回归全绿 + 缺陷已修复带回归），提请 Owner 签批。
- 该结论**不构成** LLMTier `runtime_activation` 或 production TLS/auth 激活；m5air 部署联调
  （跨主机）建议作为下一步，复用本方案 §5 步骤（端口/数据库/凭据独立）。
