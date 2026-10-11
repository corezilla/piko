<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Case ST-SEC-001

> STD 使用入口：[项目采用说明与标准导航](../../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `ST-SEC-001` |
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
| Canonical Path | `docs/70_verification/system/cases/ST-SEC-001.md` |
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

- **测试代码实现状态**：`Implemented` / `Implemented`——唯一权威：本文档 §7；禁止：计划中的测试函数冒充可执行入口。
- **执行状态**：`NOT_RUN` / `BLOCKED` / `INVALID`——唯一权威：Run 报告；禁止：在本文档预填执行或判定。
- **实际判定 Verdict**：`PASS` / `FAIL`——唯一权威：仅 Run 报告；禁止：在本文档预填 Actual 或 Verdict。

> **完成条件**：本 Case 能报出实现状态，且沿 Case ID 可追到方案清单行与 Run 报告。

## 1. Case 概述与责任

**Case ID**：`ST-SEC-001`

**标题**：鉴权失败与内部错误收口

**被测入口**：M001 `ApiServer.mapError`（HTTP 边界）

**来源**：`system-test-scheme` §6（system-test-scheme §6.1.1（四项操作 + operator purge））

**设计验证项**：`VRC-ST-007`

**维度坐标**：`权限矩阵` × `本 Case：鉴权失败与内部错误收口，不外泄 fence 码`；本类型全维度格＝`有权`、`无权`、`跨主体`、`凭据失效`

**要测什么**：鉴权失败与内部错误收口，不外泄 fence 码

**明确不测什么**：不测模块内部算法（归 `unit-test-scheme`）、不测模块组装细节（归 `module-test-scheme`）、不测本 Case 所属 `权限矩阵` 之外的其他对象类型。

**失败含义**：本 Case 失败意味着「鉴权失败与内部错误收口，不外泄 fence 码」这一系统级保证被破坏，对应系统设计条目不满足。


### 1.1 维度对账（本 Case 在对象类型全维度中的位置）

> **本节目的**：把方案 §2.1 所属对象类型的维度行搬进本 Case 逐格对账——单 Case 不覆盖全维度是正常的，但**每个维度必须有明确归属**；类型全维度归零由 Case 集合完成，缺口在清单留痕。
>
> **必须写清楚**：从方案 §2.1 对应类型行逐维度列表；每格四选一：本 Case 覆盖／兄弟 Case 覆盖（写 Case ID）／不适用（仅标 optional 的维度可勾，给理由）／缺口（登记方案 §6 并给 Owner）。发现 §2.1 未列且本对象真实存在的维度，加行标"补充"——补充维度由评审回灌方案 §2.1 与 STD。
>
> **抽象示例**：见下表灰字。
>
> **完成条件**：所属类型行每个维度归属明确、无空白格；"缺口"格与方案 §6 登记一一对应。

#### 1.1.1 对账 · 对象类型维度格

**必测/optional**：`权限矩阵` 的必测格逐格对账；optional 类型（成本护栏/升级兼容）按 §7 裁决，不在本 Case 展开。

| 维度格 | 归属 | 说明 |
|---|---|---|
| `有权` | 本 Case | 鉴权失败与内部错误收口，不外泄 fence 码 |
| `无权` | 兄弟 Case `—` | 由同对象类型的兄弟 Case 承担 |
| `跨主体` | 兄弟 Case `—` | 由同对象类型的兄弟 Case 承担 |
| `凭据失效` | 兄弟 Case `—` | 由同对象类型的兄弟 Case 承担 |


## 2. 被测入口与前置

**入口**：M001 `ApiServer.mapError`（HTTP 边界）

**前置**：ENV-LOOPBACK 已就绪；`asset-design` 中被引用资产为 `Verified`；`npm run check` 绿


## 3. 输入构造

缺失凭据、错误凭据；以及可触发内部 fence（`FencedWrite`/`LeaseLost`）的路径

**约束**：输入不得依赖真实外部系统；每次使用独立 `task_id` 与 workspace


## 4. 执行步骤与观察点

1. 以四种坏凭据访问四项操作；2. 制造内部错误；3. 读状态码与 error envelope

**观察点**：HTTP 状态码与响应体；`TaskView`/`AgentResult` 字段；SQLite 权威事实（`runs`/`results`/`execution_slot`）


#### 4.1 步骤 · ⟨n⟩

**动作**：`经公开入口做什么`

**观察点**：`期望的外部事实`


## 5. 独立 Oracle 与预期结果

401 携带 `error.code="Unauthorized"` 与请求相关 `request_id`；内部错误统一映射为 503 `DependencyUnavailable`，**响应中不出现** `FencedWrite`/`LeaseLost` 等内部码

**Oracle 独立性**：判据来自契约 schema 与设计 VRC，不复用被测实现内部逻辑


## 6. 错误路径、副作用与清理

错误响应不得泄露内部细节；失败请求不改变持久状态

**残留**：临时 workspace/staging 按 Case 删除；不修改仓库其他路径与 `~/.ssh`


## 7. 自动化位置与状态

**脚本**：`tests/unit/server.test.ts`

**实现状态**：`Implemented`

**执行 Verdict**：只在本 Case 的 `*-test-report` 中给出；本文件不预填结果

