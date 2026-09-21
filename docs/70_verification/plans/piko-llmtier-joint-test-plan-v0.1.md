<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko ↔ LLMTier 联调计划

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-llmtier-joint-test-plan-v0.1` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-21` |
| Last Modified Date | `2026-09-21` |
| Template ID | `assurance.test-plan` |
| Template Version | `0.1.1` |
| Template Conformance | `native` |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/plans/piko-llmtier-joint-test-plan-v0.1.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

> 测试层级：**integration / cross-service joint commissioning**（真实 Piko 进程 × 真实 LLMTier
> 进程 × 真实 oMLX，经 Piko 四项任务 API 与 LLMTier Data Plane/OpenAPI 驱动）。
> 环境部署与首次拉起的方案与证据见 `piko-llmtier-joint-installation-deployment-guide-v0.1`（§8）。

## 1. 目标、范围与测试层级

- **目标**：验证 Piko 与真实 LLMTier 服务在 Data Plane 契约（`llmtier-piko-data-plane-control`
  v0.3.2-draft.3）下的端到端行为：wire 形状、SSE 语义、模型解析、usage 对账、错误映射、
  故障恢复，以及 Piko 任务语义（deadline/budget/cancel/工具环）在真实依赖下的保持。
- **范围**：Piko 联调实例（8788）→ LLMTier 联调实例（8180）→ oMLX（9000）全链路。
- **排除**：m5air 生产部署与 TLS 激活、embeddings、admin API 的完整 CRUD（仅联调所需 probe）、
  Slinky capacity/observation、mock-LLMTier 单测（PK-T41..T54 已单独覆盖，联调中仅作对照基线）。

## 2. 被测基线、排除项与依赖

| 项 | 值 |
|---|---|
| Piko 联调实例 | `127.0.0.1:8788`，`config/runtime.llmtier.json`，`agent.model="Worker"`，matrix 关闭 |
| LLMTier 联调实例 | `192.168.1.8:8180`（0.0.0.0），`state/llmtier-piko-joint.sqlite3`，V0.3 candidate（wire 基线 candidate.7） |
| 模型后端 | oMLX `127.0.0.1:9000`，`Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed` |
| 契约 authority | `llmtier-piko-data-plane-control` v0.3.2-draft.3 + LLMTier V0.3 OpenAPI |
| 排除 | m5air 生产、production TLS/auth、embeddings、他人 18999 实例 |

**Entry criteria**：联调方案 §8 V1..V9 全过（已满足）；`npm run check` 绿；两个联调实例存活；
LLMTier probe `healthy` 且 `/v1/models` 含 `Worker`。

## 3. Test Strategy 与 Coverage Model

四层递进，上层复用下层结论；每层先 normal 后 fault：

- **L1 Wire 形状（对照 candidate.7 基线）**：Piko 发出的 `ResponsesRequest` 被 LLMTier 接受；
  SSE 事件序与 terminal 完整；请求形状覆盖首轮 easy message、assistant 历史、function call/output。
- **L2 Data Plane 语义**：模型解析（exact service-level ID、未知模型 404）、auth（401）、
  限流/不可用（429/502/503 → Piko 映射）、usage 账本与响应 usage 一致、
  `X-Request-ID`/`traceparent` 关联。
- **L3 Piko 任务语义穿透**：经真实 LLMTier 跑 Piko 场景用例切片（scenario suite 的 normal/negative
  代表 case），验证 Piko 的工具环、deadline、budget、cancel 在真实依赖下不回归。
- **L4 故障恢复与稳定性**：LLMTier 进程级故障注入下的 Piko 行为（fail-fast、不悬挂、错误码正确）、
  并发提交、恢复后继续服务。

**客观 Oracle 原则**：只断言机器可复核事实（HTTP 状态与错误码、SSE 事件序、usage 数值与账本、
Piko Result 状态码与 usage 字段、进程存活）；不评判文本质量。

## 4. Test Item、Feature 与 Requirement Matrix

| 联调 case | 层 | 输入/操作 | 独立 Oracle | 对照 |
|---|---|---|---|---|
| JT-01 wire/easy-message | L1 | `POST /runs` 纯文本指令 | `Completed`；LLMTier 账本出现 `model=Worker,measured` 记录 | PK-T42 |
| JT-02 wire/tool-loop | L1 | 允许 read 的最小任务（触发 read 工具环） | `Completed`；第二轮请求携带 `function_call_output`/历史且被接受 | PK-T44/45 |
| JT-03 reasoning 透传 | L1 | 触发 reasoning 输出的任务 | SSE 含 reasoning 事件；opaque reasoning item 可进入下一轮历史 | PK-T46/47 |
| JT-04 models/preflight | L2 | 启动 joint Piko；`GET /v1/models` | preflight 通过；`data[].id` 精确含 `Worker` | PK-T41 |
| JT-05 unknown model | L2 | `agent.model` 改为不存在 ID 重启 | Piko 启动失败（preflight 报 configured model not available） | ICD §6 |
| JT-06 auth 401 | L2 | 用错误 data token 调 `/v1/responses` | LLMTier 401；Piko 运行中遇到则映射失败而非悬挂 | PK-T51 |
| JT-07 provider 不可用 | L2 | 停 oMLX（仅暂停进程）后提交 run | LLMTier 502/503；Piko `Failed/ModelUnavailable`（`cause_class=Dependency`），不悬挂 | PK-T51/49 |
| JT-08 LLMTier 重启恢复 | L4 | run 执行中 SIGKILL LLMTier → 重启 | 在飞 run 以明确失败码终止（非 InternalError 悬挂）；重启后新 run 正常 | — |
| JT-09 并发与队列 | L4 | 同时提交 2 个 run（单执行槽） | 一 Running 一 Queued，均达终态；LLMTier 无 5xx | PK-T15 |
| JT-10 usage 对账 | L2 | JT-01 run 完成后查 `/tier/v1/usage` | 账本 tokens 与 Piko Result.usage 一致（同源）；`record_version` 单调 | PK-T53 |
| JT-11 场景切片回归 | L3 | scenario suite 指向 joint 实例跑 PTS-01/02/04/05 切片 | 切片全 PASS；usage=Partial（缺 cache_write_tokens）符合预期 | PTS 系列 |
| JT-12 全量回归 | L3 | scenario suite 35 case 全量指向 joint 实例 | 35/35 PASS（matrix 除外按门控） | PTS 系列 |

**合计：12 个联调 case（L1×3、L2×4、L3×2、L4×2、含 1 复合）**；正式编号与逐 case 种子/步骤在
执行前以 test-specification 或直接以自动化脚本固化（JT-01/04/07/08/10 为必做最小集）。

## 5. 环境、设备、拓扑、数据和工具

- 拓扑与凭据：见联调方案 §2/§6；joint Piko `127.0.0.1:8788`（bearer `piko-api-bearer`）。
- 驱动工具：`curl`/`jq`（LLMTier 面）、Piko HTTP API（run 驱动可复用
  `scripts/scenario-run.sh`，将其 `PIKO_URL` 指向 8788）、`tests/integration/scenario-e2e.test.ts`
  （经 env `PIKO_URL=http://127.0.0.1:8788` 指向 joint 实例）、sqlite3（两侧 store）。
- 故障注入：`kill -9` LLMTier/oMLX 进程（JT-07/08）；错误 token（JT-06）；改配置重启（JT-05）。

## 6. Test Types 与 Case Families

- normal：JT-01/02/03/04/09/10/11/12。
- negative：JT-05/06/07。
- recovery/fault-injection：JT-08（及 JT-07 的恢复段）。
- concurrency：JT-09。
- 安全/性能/容量：裁剪——无 SLA 基线；仅记录每 case wall-clock 与 LLMTier 账本 token 数作参考观测。

## 7. Entry、Exit、Pass、Fail、Blocked 和 Invalid Criteria

- **Pass**：该 case Oracle 全部满足（错误映射类 case 以「Piko 侧得到明确失败码且及时终态」为 Pass，
  不要求 Completed）。
- **Fail**：任一 Oracle 不满足，或出现悬挂/误码/账本与响应不一致。
- **Rerun**：模型非确定性允许 1 次重跑并记录两次；fault-injection 类时序敏感允许 1 次重跑。
- **Blocked**：联调实例不可用、oMLX 不可用（此时 JT-01.. 全部 Blocked，不计 Fail）。
- **Invalid**：步骤偏离本计划（重置后重跑，不计分母）。
- **Exit（联调 Gate）**：JT-01/04/05/06/07/08/10 必做集全 Pass，且 JT-12 全量回归 PASS；
  结果沉淀为 STD test-report。

## 8. 组织、职责、排期和资源

- 执行：opencode（主导：环境、驱动、判定、缺陷定位）；审批：Piko Project Owner。
- 排期（同一工作日内的四个阶段）：
  - **P0 环境就绪**（已完成，见联调方案 §8 V1..V9）；
  - **P1 最小必做集**（JT-01/04/05/06/07/08/10）；
  - **P2 穿透回归**（JT-02/03/09/11 → JT-12）；
  - **P3 收敛**（缺陷修复复测、证据汇总、test-report）。
- 资源：本机 8180/8788 端口、oMLX、`~/piko-secrets/` 联调凭据；不占用 8787/18999/8181。

## 9. Defect、Deviation、Rerun 与 Regression

- **LLMTier 侧缺陷**：记录于联调报告并同步 LLMTier 仓库（以其 review packet 流程处理）；
  Piko 侧不修改 LLMTier 源码。
- **Piko 侧偏差**：如本计划的 schema 放宽（Owner 批准，2026-09-21）即为一例——偏差必须落文档、
  落测试、落回归。
- 已知预期（不判缺陷）：usage `quality=Partial`（oMLX 无 `cache_write_tokens`）；
  LLMTier 全局 `readyz=degraded`（Embedding-v1 占位）。
- 回归基线：`npm run check`（93 passed）与 scenario suite（41/41 via `npm run test:live`）保持绿。

## 10. Evidence、Traceability、Reporting 与 Gate

- 每 case 记录：run_id（两侧）、HTTP/SSE 证据、Piko `Result`（state/usage/failure）、LLMTier 账本
  记录（request_id/record_version/tokens）、wall-clock。
- Traceability：JT-xx ↔ PK-Txx ↔ ICD 条目（§4 表）。
- 报告：执行完成后产出 `tests/integration/reports/piko-llmtier-joint-report-*.md`（STD test-report，
  经 new-design 生成）。
- **Gate**：Exit criteria（§7）满足并由 Owner 签批后，方可宣称「Piko↔LLMTier 联调通过」；
  该结论仍不等于 production activation（`overall.runtime_activation=false` 不因联调改变）。

## 11. 风险、安全与清理恢复

- **共享宿主风险**：8180/8788 为联调专用端口；**严禁**触碰 18999（他人实例）、8787（生产 Piko）、
  m5air（192.168.1.9）。所有 kill 操作必须以端口定位进程，禁止按进程名批量杀。
- **凭据安全**：联调 token 仅存 `~/piko-secrets/`（0600），不入 git/日志/报告正文；泄露即重置库并
  换 token（§方案 9 重置步骤）。
- **模型行为不确定性**：以客观 Oracle 兜底；文本质量偏差记录为观察项不判 FAIL；允许 1 次 RERUN。
- **清理**：联调结束按联调方案 §10 卸载（杀进程、删联调库/日志、删联调 token）；`~/piko-secrets/piko-llm-key`
  等既有凭据不得删除或覆盖。
