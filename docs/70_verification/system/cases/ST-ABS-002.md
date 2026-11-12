<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Case ST-ABS-002

> **本文件遵守 STD（工程文档标准），STD 为最高优先级；修改本文件之前必须先读 STD 入口。**
> STD 入口：[项目采用说明与标准导航](../../../../README.md#std-entry)。入口的**编写索引**已列出本类文档的全部硬性义务：不必通读规范，但**每一条都必须遵守**。

| 文档字段 | 值 |
|---|---|
| Document ID | `ST-ABS-002` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode, corezilla |
| Created Date | `2026-11-12` |
| Last Modified Date | `2026-11-12` |
| Template ID | `tests.system-case` |
| Template Version | `2.4.16` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/system/cases/ST-ABS-002.md` |
| Supersedes | none |
| Std Conformance Total | 0 |
| Std Conformance Passed | 0 |
| Checklist Total | 0 |
| Checklist Conformed | 0 |
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

## 1. 执行摘要

- **Case ID**：`ST-ABS-002`
- **对象类型**：`absence 红线`
- **维度格**：`未声明路径 404×1`
- **实现状态**：`Implemented`

## 2. 前提与替身

ENV-1（纯内存、本地 HTTP、无真实外部系统）；对真实 Matrix / 模型 / scp 的依赖按 §7.1 记为环境缺口。

## 3. 用例

#### 3.1 ST-ABS-002 · 未声明路径返回 404

**责任 / 明确不测**：未声明路径返回 404；对象类型 `absence 红线` 的维度格 `未声明路径 404×1`。只通过公开 HTTP 面观察，不读 store 内部（那是模块层）。

**输入构造**：按 `absence 红线` 的展开规则针对 `未声明路径 404×1` 构造；helper 与替身见本集 §2。

**步骤与观察点**：起真实 ApiServer（内存 SQLite）→ 通过 HTTP 触发本维度场景 → 观察状态码、错误 code 与诊断面。

**Oracle 与预期**：以 `system-design` §8/§9 的对外契约与 §12.5 验证项为唯一权威。

**错误路径 / 清理**：失败必须 typed 化；每例关闭 server、释放临时目录。

**脚本 / 实现状态**：`tests/system/st-dimension-cells.test.ts` · `Implemented`
