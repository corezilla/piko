<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko ↔ LLMTier 联调计划

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-llmtier-joint-test-plan-v0.1` |
| Document Version | `0.1.0-draft.10` |
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

> 本计划依据联调方案 `piko-llmtier-joint-test-specification-v0.1`（下称「规格」）制定，覆盖
> **从开始到结束**的全过程：启动检查 → 16 个 case 按序逐步执行 → 收敛 → 联合多维度测试 → 输出成果归档。
> 规格定义「测什么、怎么测、怎么判」；本计划定义「按什么顺序、每步产出什么、出现各种情况如何处置」。
> 执行原则：**只按本计划与规格执行，不引入计划外步骤；计划/规格有问题时先修订文档并提交，再继续执行。**
> **计划一经开始不得随意停止**：遇阻先修复、回归、直到调通（修复手段允许修改 Piko 与 LLMTier
> 双方的设计、代码与配置）；确实修不好的记 SKIP 并继续，最终报告说明原因。

## 1. 目标、范围与测试层级

- **目标**：完成 Piko ↔ 真实 LLMTier 的首次联合调试（规格 §3 全部 16 个 case，按 JT 编号递增
  一步一步执行，不分必做/可选）。**总体目的：调通所有功能、消灭所有已知 bug**——发现问题即
  修复（Piko/LLMTier 双侧代码、设计、配置均可改）并回归，直到调通；确实修不好的记 SKIP，
  最终报告说明原因与证据。全部 case 结束后进行联合多维度测试（S3）。
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
| 隔离红线 | 不触碰 8787（生产 Piko）、18999（他人实例）、m5air（192.168.1.9）、oMLX 进程（共享资源） |

**Entry criteria（S0 通过即开始执行）**：规格 §2.3 环境就绪证据 V1..V9 全过（已满足）；
`npm run check` 绿；两实例存活、probe `healthy`、`/v1/models` 含 `Worker`。

## 3. 执行总流程（从开始到结束）

```text
S0 启动检查 ──▶ S1 逐步执行 JT-01 → JT-16 ──▶ S2 缺陷修复与收敛 ──▶ S3 联合多维度测试 ──▶ S4 报告与归档
   (每阶段开始      (每 case 六个标准动作,           (FAIL 复测、       (中间+最终成果,
    重复 S0)         见 §3.2)                         缺陷清单)          见 §5)
```

### 3.1 S0 启动检查（每个执行会话开始时执行一次）

| # | 检查 | 通过标准 | 不通过处置 |
|---|---|---|---|
| S0-1 | LLMTier joint `GET /healthz` | 200 | 按「阻塞处置」B-1 恢复 |
| S0-2 | `GET /v1/models` 含 `Worker`（data token） | 含 | B-1 |
| S0-3 | Piko joint `GET /runs/none` | 404 | B-1 |
| S0-4 | oMLX `/v1/models` | 200/401 | B-1 |
| S0-5 | `git status` 干净、本地=远端 | 是 | 先提交/推送历史结果 |

### 3.2 S1 单个 case 的六个标准动作（每个 case 完全相同）

1. **开调试**：按规格 §3.1 该 case 行打开调试选项（已实现的；R-* 未实现项记录替代证据）；
2. **操作**：按规格 §3 该 case 的「输入/操作」列执行（含故障注入）；
3. **核对中间结果**：逐节点对照规格 §3.1「中间结果预期」（A:JSONL/SQLite、B:logs/usage/audit）；
4. **采集**：Piko `Result` JSON、LLMTier 账本记录、相关日志片段；
5. **判定**：对照该 case「独立 Oracle」，得出 PASS / FAIL / RERUN / INVALID / BLOCKED；
6. **不符即定位**：数据/统计/日志与预期不符 → 走规格 §3.1 定位预案 / §7.1 决策树（或 `joint-diagnose.sh`）；
7. **回填**：立即更新规格 §3 该行的「状态」与「Run/证据」两列；
8. **提交**：`git commit` + `push`（证据不落地不下一个）；
9. **流转**：PASS → 下一个 case；其余按 §4 情况处置后再流转。
4. **回填**：立即更新规格 §3 该行的「状态」与「Run/证据」两列；
5. **提交**：`git commit` + `push`（证据不落地不下一个）；
6. **流转**：PASS → 下一个 case；其余按 §4 情况处置后再流转。

### 3.3 S2 / S3 / S4 定义

- **S2 缺陷修复与收敛**：对每个 FAIL/BLOCKED 逐项定位并修复（Piko/LLMTier 双侧代码、设计、
  配置均可改）→ 回归该 case → 通过则改判 PASS；确实修不好的记 SKIP（原因+修复尝试+证据）。
- **S3 联合多维度测试**：全部 case 结束后，在 joint 实例上做全维度回归——scenario 套件 31/31
  （`SCENARIO_MATRIX=0`）、`npm run check`、`npm run test:live`（41/41，生产实例面），
  并汇总 wire/usage/错误映射/恢复/并发各维度观测。
- **S4 报告与归档**：输出联调报告，**必须列出所有未通过点（FAIL/SKIP）及原因与证据**。

执行顺序固定：**JT-01 → JT-02 → … → JT-16**（0.1.x 完成 JT-01..13；0.2.0 review 后增补 JT-14/15/16，均已执行）。
同一时刻只执行一个 case（Piko 单执行槽 + 共享 oMLX）；**禁止**并行运行 `npm run test:live`。

## 4. 情况与阻塞处置（判定 → 动作）

### 4.1 判定结果处置

| 判定 | 含义 | 动作 |
|---|---|---|
| PASS | Oracle 全满足 | 回填 → 提交 → 下一 case |
| FAIL | 步骤正确但 Oracle 不满足 | 保留现场（两侧日志）→ 复测 1 次（计 RERUN）→ 仍 FAIL 判 FAIL，进 S2 缺陷清单 → 继续下一 case |
| RERUN | 模型非确定性 / 注入时序未命中 | 重跑 1 次并记录两次运行；第 2 次为准 |
| INVALID | 步骤偏离规格 / 注入未命中（如 JT-08 出现 Completed）/ 环境问题污染样本 | 重置环境 → 重跑；不计入判定分母 |
| BLOCKED | 经 §4.2 修复循环后仍失败 | **不得停止计划**：记 BLOCKED + 原因与修复尝试记录 → 继续下一 case；S2 再攻；S4 报告说明 |

### 4.2 阻塞处置（按阻塞类型）

| 类型 | 识别 | 处置 |
|---|---|---|
| B-1 组件不可用（8180/8788/9000 任一不健康） | S0 或 case 中探活失败 | 按规格 §2.1 命令重建该组件（LLMTier 重启必带 `OMLX_API_KEY`+两 token）→ 重跑当前 case（计 RERUN）；恢复失败进入**修复循环**（改双侧代码/配置 → 回归），至多 3 轮；仍失败 → 该 case 记 BLOCKED 跳过并继续（**不停计划**），S2 再攻，S4 报告说明 |
| B-2 端口/资源被占 | 端口非预期监听 | 确认归属；属他人/生产资源（18999/8787/m5air）→ **不触碰**，修订规格换端口后再执行 |
| B-3 共享资源风险 | 步骤需要 kill 共享进程（如 oMLX） | **立即停止该步骤**，修订规格改用无副作用注入（JT-07 已改为 admin API patch），再继续 |
| B-4 计划/规格不可执行 | 步骤命令不存在、Oracle 与实测不符、文本歧义 | 暂停该 case → 修订计划/规格并提交 → 按新文档继续（本次已发生：`timeout(1)`、JT-06 401→403） |
| B-5 凭据失效/泄露 | 全部请求 401/403；或 token 入了日志/git | 重置 LLMTier 库 → 重新 bootstrap → 换 token → 重跑受影响 case |
| B-6 悬挂 | run 超 deadline 仍未终态 | 判 FAIL；保留两侧日志进 S2 |
| B-7 断言脚本自身错误 | 命令语法/路径错误 | 属执行器问题：修正脚本，case 记 INVALID 重跑 |
| B-8 失败原因不明（不知哪层出错） | case FAIL 且层位不清 | 运行 `scripts/joint-diagnose.sh <run_id>`（规格 §7.1 决策树）定位层位 → 按层位修复（双侧可改）→ 回归；观测缺口本身记为发现（F-4/F-5） |

## 5. 中间与最终输出成果（规范性）

### 5.1 中间成果（每 case 产生，随做随交）

| 成果 | 落点 |
|---|---|
| Case 判定 + 证据（run_id、账本记录、日志片段、观测值） | 规格 §3 该行「状态」「Run/证据」两列 |
| 两侧现场日志 | `LLMTier/state/llmtier-piko-joint.log`、`piko/var/piko-llmtier-joint.log`（保留至 Gate 关闭） |
| 代码/文档修订（如发生 B-3/B-4） | 独立 commit，注明触发 case |

每 case 完成即 `git commit`（**证据未提交不进入下一个 case**）；`push` 至少每 2 个 case 一次，阶段结束必须 push，异常随时 push。

### 5.2 最终成果（S3，Gate 关闭条件）

| 成果 | 落点 |
|---|---|
| 规格 §3 全部 16 case 状态为终态判定 | 规格文档 |
| 联调报告（STD test-report：结果汇总、缺陷清单、对 LLMTier ICD 的 review 发现、观测数据、**所有未通过点（FAIL/SKIP）及原因与证据**） | `tests/integration/reports/piko-llmtier-joint-report-*.md`（new-design 生成） |
| 缺陷/偏差记录（含已发生的 schema 放宽、403 vs 401） | 报告 §缺陷 + 计划 §9 |
| 证据保留 | 联调库、两侧日志保留至 Gate 签批；之后按规格 §10 清理 |

## 6. Test Types 与 Case Families

normal：JT-01/02/03/04/09/10/11/12/13/15/16；negative：JT-05/06/07/14；recovery/fault-injection：JT-08（及
JT-07 恢复段）；concurrency：JT-09；统计：JT-13/15；embeddings：JT-16；性能/容量：裁剪（规格 §6）。

## 7. Entry、Exit、Pass、Fail、Blocked 和 Invalid Criteria

- **Entry**：§2 Entry criteria（= S0 全过）。
- **Exit（联调 Gate）**：16 个 case 全部执行完毕且有终态判定 ∧ S3 联合多维度测试完成
  （scenario 31/31 + `npm run check` + `npm run test:live` 41/41）∧ 联调报告产出（含所有
  未通过点及原因）并送 Owner 签批。修不好的点以 SKIP+原因进入报告，不阻塞 Gate 评审。
- 单 case PASS/FAIL/RERUN/INVALID/BLOCKED 定义见 §4.1（与规格 §8 一致）。

## 8. 组织、职责、排期和资源

- 执行：opencode（主导：环境、驱动、判定、缺陷定位）；审批：Piko Project Owner。
- 资源：本机 8180/8788 端口、oMLX、`~/piko-secrets/` 联调凭据；不占用 8787/18999/8181。
- 当前进度（2026-09-22）：**JT-01..JT-16 16/16 全 PASS**（S2 修复缺陷 D-1/D-2；S3 回归全绿：
  scenario 31/31 joint、check 95、test:live 41/41；S4 报告已产出）。0.2.0 review 后：
  ① oMLX 已加载 embedding 模型，LLMTier 增配 embedding deployment 并挂 `Embedding-v1`（readyz=ready，F-2 关闭）；
  ② 增补并执行 JT-14/15/16（校验负向/快照稳定/embeddings）。
- **可观测性需求状态**：R-P-1/2/3（Piko）**已实现并实测**（provider 环回开关 + `provider_calls`
  持久化；x-request-id==账本 request_id 实测一致）；R-T-1..4（LLMTier）已正式提需求
  `llmtier-observability-debug-requirements-v0.1`（LT-OBS-1..4），由 LLMTier 实施，**完成后由本方
  review 并复核对应 case**（复核记录回填报告）。

## 9. Defect、Deviation、Rerun 与 Regression

- **修复优先**：联调期间发现的任何问题（任一侧）一律先修复并回归，直到调通；确实无法
  修复的记 SKIP，最终报告说明原因与证据。
- **LLMTier 侧缺陷**：直接修复（遵守 LLMTier 仓库规范：改动跑其全量测试），并记录于联调报告。
- **Piko 侧偏差**：必须「落文档、落测试、落回归」——已有先例：`llmtier.base_url` schema 放宽
  （Owner 批准 2026-09-21）。
- **已知预期（不判缺陷）**：usage `quality=Partial`（oMLX 无 `cache_write_tokens`）；LLMTier
  全局 `readyz=degraded`（`Embedding-v1` 占位）；认证拒绝返回 403（vs ICD 401，作 ICD review 发现）。
- 回归基线：`npm run check`（95 passed / 0 skipped）与 `npm run test:live`（41/41）保持绿。

## 10. Evidence、Traceability、Reporting 与 Gate

- Traceability：JT-xx ↔ PK-Txx ↔ ICD 条目（规格 §3 表）。
- 报告：S3 产出（§5.2），引用规格与本计划。
- Gate：§7 Exit 满足且 Owner 签批 → 「联调通过」；不等于 production activation。

## 11. 风险、安全与清理恢复

- **共享宿主红线**：8180/8788 为联调专用；所有 kill 按端口定位（`lsof -nP -iTCP:<port> -t`），
  禁止按进程名批量杀（规格 §10）。
- **凭据安全**：联调 token 仅存 `~/piko-secrets/`（0600）；不入 git/日志/报告；泄露按 §4.2 B-5。
- **清理**：联调结束按规格 §10 卸载（杀 8180/8788、删联调库/日志/token）；既有
  `piko-llm-key`/`piko-api-bearer` 等凭据不得删除或覆盖。
