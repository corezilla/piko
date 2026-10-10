<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Case ST-PROC-002

> STD 使用入口：[项目采用说明与标准导航](../../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `ST-PROC-002` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode, corezilla |
| Created Date | `2026-10-11` |
| Last Modified Date | `2026-10-11` |
| Template ID | `tests.system-case` |
| Template Version | `2.4.15` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/system/cases/ST-PROC-002.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

> **编写建议**：本文档是单个系统测试 Case 的完整设计，一 Case 一文档，与 design.software-system 阶段的测试方案（tests.system-test-scheme）清单一一对应；测试脚本按本文档编写；LLM/智能体组件的输入构造、独立判据、统计口径与预算安全方法见 LLM 测试方法（STD `docs/ai-guides/llm-testing.md`，见 `docs/std.lock.json`）。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。
> 本文档对设计验证项（VRC/V-xxx）的引用规则：只引用 ID 与状态，不复制定义/判据；Case 文档若需细化执行断言需在变更时回溯设计修订并记录。

> 本 Case 文档绑定：系统设计经 `--parent-document-id`、所属方案经方案清单行引用写入 metadata；Document ID＝Case ID。

### 模板定位：方案、用例与计划的边界

> **编写建议**：系统层 Case（整软件系统组装，子系统真实、外部依赖边界替身或真实环境）；方案清单行持有设计状态，本文档持有实现状态；不替代验收。

- **一 Case 一文档**：本文档只展开一个 Case；Document ID＝Case ID（ST-<对象>-<NNN>）；责任摘要、分类与优先级以 `tests.system-test-scheme` 清单行为准，不在本文档重复维护。
- **测试脚本的唯一依据**：编码者按本文档写测试代码，不需要回读方案或设计正文猜测意图。
- **不预填结果**：本文档持有实现状态；执行状态与 Verdict 只在 Run 报告。

### 状态语义：实现状态

> **编写建议**：本文档只持有实现状态；用例状态在方案清单，执行状态与 Verdict 只在 Run 报告；三层混用即违例。

- **测试代码实现状态**：`Planned` / `Implemented`——唯一权威：本文档 §7；禁止：计划中的测试函数冒充可执行入口。
- **执行状态**：`NOT_RUN` / `BLOCKED` / `INVALID`——唯一权威：Run 报告；禁止：在本文档预填执行或判定。
- **实际判定 Verdict**：`PASS` / `FAIL`——唯一权威：仅 Run 报告；禁止：在本文档预填 Actual 或 Verdict。

> **完成条件**：本 Case 能报出实现状态，且沿 Case ID 可追到方案清单行与 Run 报告。

## 1. Case 概述与责任

**Case ID**：`ST-PROC-002`

**标题**：取消经 P0→P1 abort 生效

**被测入口**：M001 取消 → P0 事实 → IPC `abort` → P1 `RunWorker.requestAbort`

**来源**：`system-test-scheme` §6（system-test-scheme §2.3.6）


### 1.1 维度对账（本 Case 在对象类型全维度中的位置）

> **本节目的**：把方案 §2.1 所属对象类型的维度行搬进本 Case 逐格对账——单 Case 不覆盖全维度是正常的，但**每个维度必须有明确归属**；类型全维度归零由 Case 集合完成，缺口在清单留痕。
>
> **必须写清楚**：从方案 §2.1 对应类型行逐维度列表；每格四选一：本 Case 覆盖／兄弟 Case 覆盖（写 Case ID）／不适用（仅标 optional 的维度可勾，给理由）／缺口（登记方案 §6 并给 Owner）。发现 §2.1 未列且本对象真实存在的维度，加行标"补充"——补充维度由评审回灌方案 §2.1 与 STD。
>
> **抽象示例**：见下表灰字。
>
> **完成条件**：所属类型行每个维度归属明确、无空白格；"缺口"格与方案 §6 登记一一对应。

#### 1.1.1 对账 · ⟨维度行×格⟩

**必测/optional**：`按方案 §2.3 该格标注`

**归属**：`本 Case / 兄弟 Case（写 ID）/ 不适用（仅 optional，给理由）/ 缺口（登记 §6）`

**说明**：`一句话`


## 2. 被测入口与前置

**入口**：M001 取消 → P0 事实 → IPC `abort` → P1 `RunWorker.requestAbort`

**前置**：ENV-LOOPBACK 已就绪；`asset-design` 中被引用资产为 `Verified`；`npm run check` 绿


## 3. 输入构造

一个正在执行的任务；**不依赖** P0 库中 cancel 标志被 P1 轮询到

**约束**：输入不得依赖真实外部系统；每次使用独立 `task_id` 与 workspace


## 4. 执行步骤与观察点

1. 提交任务；2. 触发取消；3. 观察 `state` 变化

**观察点**：HTTP 状态码与响应体；`TaskView`/`AgentResult` 字段；SQLite 权威事实（`runs`/`results`/`execution_slot`）


#### 4.1 步骤 · ⟨n⟩

**动作**：`经公开入口做什么`

**观察点**：`期望的外部事实`


## 5. 独立 Oracle 与预期结果

取消在有界时间内使任务转 `Cancelled`；`failure.code="CancelledByRequest"`；不需要等待库轮询周期

**Oracle 独立性**：判据来自契约 schema 与设计 VRC，不复用被测实现内部逻辑


## 6. 错误路径、副作用与清理

已终态任务 → `AlreadyTerminal`；abort 不得导致 P1 崩溃或重复终态

**残留**：临时 workspace/staging 按 Case 删除；不修改仓库其他路径与 `~/.ssh`


## 7. 自动化位置与状态

**脚本**：``tests/unit/p-input.test.ts`（abort 用例）`

**实现状态**：`Implemented`

**执行 Verdict**：只在本 Case 的 `*-test-report` 中给出；本文件不预填结果

