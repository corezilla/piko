<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko ↔ LLMTier 联调计划

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-llmtier-joint-test-plan-v0.1` |
| Document Version | `0.1.0-draft.3` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Created Date | `2026-09-21` |
| Last Modified Date | `2026-09-22` |
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

> 本计划依据联调方案 `piko-llmtier-joint-test-specification-v0.1`（下称「规格」）制定：
> 规格定义**测什么、怎么测、怎么判**（环境、JT-01..JT-12 case 与 Oracle）；本计划定义**由谁、
> 何时、按什么顺序组织执行与收敛**。测试层级：integration / cross-service joint commissioning。

## 1. 目标、范围与测试层级

- **目标**：按规格完成 Piko ↔ 真实 LLMTier 的首次联合调试并收敛缺陷，产出可签批的联调报告。
- **范围**：规格 §3 的 12 个 case（必做最小集 JT-01/04/05/06/07/08/10）。
- **排除**：m5air 生产部署与 TLS 激活、embeddings、admin API 完整 CRUD、Slinky capacity、
  mock 契约单测（PK-T41..T54 已独立覆盖）。
- **不改变**：`overall.runtime_activation=false`；联调通过 ≠ production activation。

## 2. 被测基线、排除项与依赖

| 项 | 值 |
|---|---|
| Piko joint | `127.0.0.1:8788`，`config/runtime.llmtier.json`（gitignored），matrix 关闭 |
| LLMTier joint | `192.168.1.8:8180`，`state/llmtier-piko-joint.sqlite3`（V0.3 candidate；wire 基线 candidate.7） |
| 模型后端 | oMLX `127.0.0.1:9000`，Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed |
| 契约 authority | `llmtier-piko-data-plane-control` v0.3.2-draft.3 + LLMTier V0.3 OpenAPI |
| Owner 决定 | 2026-09-21 允许模型 endpoint 明文 `http://`（trusted-LAN）；Piko schema 已放宽并有回归覆盖 |

**Entry criteria**：规格 §2.3 环境就绪证据 V1..V9 全过（已满足）；`npm run check` 绿；
两实例存活、probe `healthy`、`/v1/models` 含 `Worker`。

## 3. Test Strategy 与 Coverage Model

按规格的四层递进策略执行，上层复用下层结论，每层先 normal 后 fault：

1. **L1 wire**：请求形状与 SSE 语义（JT-01/02/03）；
2. **L2 data-plane 语义**：模型解析、auth、依赖失败映射、usage 对账（JT-04/05/06/07/10）；
3. **L3 Piko 任务语义穿透**：scenario 套件切片与全量指向 joint 实例（JT-11/12）；
4. **L4 故障恢复与稳定性**：LLMTier 进程级注入、并发（JT-08/09）。

客观 Oracle 原则、判定规则见规格 §3/§8。

## 4. Test Item、Feature 与 Requirement Matrix

12 个 case 的完整矩阵（输入/操作、独立 Oracle、对照 PK-Txx/ICD 条目）见规格 §3，此处不复制。
本计划的执行分母与顺序：

| 阶段 | case | 退出条件 |
|---|---|---|
| P1 最小必做集 | JT-01、JT-04、JT-05、JT-06、JT-07、JT-08、JT-10 | 全 PASS |
| P2 穿透与回归 | JT-02、JT-03、JT-09、JT-11 → JT-12 | 全 PASS（JT-12 为 31/31，除 Matrix×4） |
| P3 收敛 | 缺陷复测、证据汇总、报告 | 报告产出并送审 |

## 5. 环境、设备、拓扑、数据和工具

- 拓扑、实例、Secret 与重建命令：见规格 §2（不再复制）。
- 驱动工具：`curl`/`jq`（LLMTier 面）；Piko 四项任务 API 与
  `tests/integration/scenario-e2e.test.ts`（经 env `PIKO_URL=http://127.0.0.1:8788` 指向 joint 实例）；
  `sqlite3`（两侧 store）。
- **联调运行 env 契约（必须整体携带，缺一即串实例）**：`PIKO_URL=http://127.0.0.1:8788`、
  `PIKO_SQLITE_PATH=…/var/piko-llmtier-joint.sqlite`、
  `PIKO_RUNTIME_CONFIG=…/config/runtime.llmtier.json`、`SCENARIO_MATRIX=0`（规格 §2.1.1）。
  harness 的 kill/restart 已按 `PIKO_URL` 端口定位（review 修正项）。
- **串行要求**：联调执行期间禁止并行运行 `npm run test:live`（目标是 8787 生产实例，共享 oMLX）。
- 故障注入：按端口定位进程 `kill -9`（JT-07/08）；错误 token（JT-06）；改配置重启（JT-05）。

## 6. Test Types 与 Case Families

- **normal**：JT-01/02/03/04/09/10/11/12；**negative**：JT-05/06/07；
- **recovery/fault-injection**：JT-08 及 JT-07 恢复段；**concurrency**：JT-09；
- 性能/容量：裁剪（规格 §6，仅记录观测值）。

## 7. Entry、Exit、Pass、Fail、Blocked 和 Invalid Criteria

- 单 case 判定沿用规格 §8（PASS/FAIL/RERUN/BLOCKED/INVALID）。
- **Exit（联调 Gate）**：P1 必做集全 PASS ∧ JT-12 全量回归 PASS ∧ 无未收敛 BLOCKED；
  产出联调报告并送 Owner 签批后，方可宣称「Piko↔LLMTier 联调通过」。

## 8. 组织、职责、排期和资源

- 执行：opencode（主导：环境、驱动、判定、缺陷定位）；审批：Piko Project Owner。
- 排期（同一工作日内四阶段，见 §4 表）：P0 环境就绪（**已完成**，规格 §2.3）→ P1 → P2 → P3。
- 资源：本机 8180/8788 端口、oMLX、`~/piko-secrets/` 联调凭据；不占用 8787/18999/8181。

## 9. Defect、Deviation、Rerun 与 Regression

- **LLMTier 侧缺陷**：记录于联调报告，经 LLMTier 仓库自身流程处理；Piko 侧不改 LLMTier 源码。
- **Piko 侧偏差**：必须「落文档、落测试、落回归」——本联调已有一例：`llmtier.base_url` schema
  放宽（Owner 批准 2026-09-21，`config-schema.test.ts` 与契约校验器同步更新）。
- **已知预期（不判缺陷）**：usage `quality=Partial`（oMLX 无 `cache_write_tokens`）；
  LLMTier 全局 `readyz=degraded`（`Embedding-v1` 占位）。
- 回归基线：`npm run check`（93 passed / 0 skipped）与 `npm run test:live`（41/41）保持绿。
- **Review 修正（2026-09-22，执行前）**：harness `killPiko/restartPiko` 由进程名匹配改为按
  `PIKO_URL` 端口定位（否则 PTS-10-C4 会误杀 8787 生产实例）；scenario 套件增加
  `SCENARIO_MATRIX` 门控；JT-07 注入方式由「kill oMLX」改为「admin API patch provider endpoint」
  （oMLX 为共享资源）；JT-08 oracle 增加「Completed=注入未命中→INVALID」。

## 10. Evidence、Traceability、Reporting 与 Gate

- 每 case 证据清单见规格 §9（两侧 run/请求证据、账本记录、注入时间点、wall-clock）。
- Traceability：JT-xx ↔ PK-Txx ↔ ICD 条目（规格 §3 表）。
- 报告：P3 产出 `tests/integration/reports/piko-llmtier-joint-report-*.md`（STD test-report，
  经 new-design 生成），引用本计划与规格。
- Gate：§7 Exit 满足且 Owner 签批 → 「联调通过」；不等于 production activation。

## 11. 风险、安全与清理恢复

- **共享宿主红线**：8180/8788 为联调专用；严禁触碰 18999（他人实例）、8787（生产 Piko）、
  m5air。所有 kill 按端口定位（规格 §10）。
- **凭据安全**：联调 token 仅存 `~/piko-secrets/`（0600）；不入 git/日志/报告；泄露即
  「删库→重新 bootstrap→换 token」。
- **模型非确定性**：客观 Oracle 兜底，允许 1 次 RERUN；文本质量偏差记观察项。
- **清理**：联调结束按规格 §10 卸载（杀 8180/8788、删联调库/日志/token）；既有
  `piko-llm-key`/`piko-api-bearer` 等凭据不得删除或覆盖。
