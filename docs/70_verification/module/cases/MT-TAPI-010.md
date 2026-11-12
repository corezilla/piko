<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Case MT-TAPI-010

> **本文件遵守 STD（工程文档标准），STD 为最高优先级；修改本文件之前必须先读 STD 入口。**
> STD 入口：[项目采用说明与标准导航](../../../../README.md#std-entry)。入口的**编写索引**已列出本类文档的全部硬性义务：不必通读规范，但**每一条都必须遵守**。

| 文档字段 | 值 |
|---|---|
| Document ID | `MT-TAPI-010` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode |
| Created Date | `2026-11-12` |
| Last Modified Date | `2026-11-12` |
| Template ID | `tests.module-case` |
| Template Version | `3.0.9` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/module/cases/MT-TAPI-010.md` |
| Supersedes | none |
| Std Conformance Total | 0 |
| Std Conformance Passed | 0 |
| Checklist Total | 0 |
| Checklist Conformed | 0 |
<!-- STD_DOCUMENT_COVER_END -->
> **编写建议**：本文档是**单个模块的模块测试用例集**：一模块一集，本模块全部 MT Case 以固定段落块组织在 §3（Document ID＝`MT-COL-⟨模块短名⟩-⟨NNN⟩`，单集超过 40 条拆 `-002`）；段内 Case ID 仍为 `MT-⟨对象⟩-⟨NNN⟩`，与本模块模块测试方案（`tests.module-test-scheme`，同样一模块一份）的清单行一一对应；测试脚本一段一文件、文件名＝Case ID。LLM/智能体组件的输入构造、独立判据、统计口径与预算安全方法见 LLM 测试方法（见 `docs/std.lock.json` 所锁 STD 的 `docs/ai-guides/llm-testing.md`）。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。

> 本文档对设计验证项（VRC/V-xxx）的引用规则：只引用 ID 与状态，不复制定义/判据；Case 段落若需细化执行断言需在变更时回溯设计修订并记录。

> 本集合文档绑定：模块对象 ID 经 `--design-object-id`、所属方案经 `--parent-document-id` 写入 metadata；Document ID＝`MT-COL-<模块短名>-<NNN>`。"Document ID＝Case ID"的一 Case 一文档规则适用于 IT/ST 层，不适用于本层。

### 模板定位：方案、用例集与计划的边界

> **编写建议**：模块层用例集（灰盒：内部单元真实、替身只在模块边界）；方案清单行持有设计状态，本集持有实现状态；模块组装层用例集归 `tests.unit-case`；系统层黑盒 Case 维持一 Case 一文档（`tests.system-case`）。

- **Case＝固定段落块**：§3 按被测对象分组，每 Case 一个 `#### <Case ID>` 段落，七字段与顺序固定（可写"不适用"，不可删字段）。
- **测试脚本的唯一依据**：编码者按段落写测试代码，不需要回读方案或设计正文猜测意图；段落锚点＝脚本名。
- **不预填结果**：本集持有实现状态；执行状态与 Verdict 只在 Run 报告。

### 状态语义：实现状态

> **编写建议**：本文档只持有实现状态；用例状态在方案清单，执行状态与 Verdict 只在 Run 报告；三层混用即违例。

- **测试代码实现状态**：`Implemented` / `Implemented`——唯一权威：本文档 §1 总账与 §4；禁止：计划中的测试函数冒充可执行入口。
- **执行状态**：`NOT_RUN` / `BLOCKED` / `INVALID`——唯一权威：Run 报告；禁止：在本文档预填执行或判定。
- **实际判定 Verdict**：`PASS` / `FAIL`——唯一权威：仅 Run 报告；禁止：在本文档预填 Actual 或 Verdict。

> - **完成条件**：本集能报出逐 Case 实现状态，且沿 Case ID 可追到方案清单行与 Run 报告。

## 1. 集合概览与维度总账

#### 1.1 总账 · MT-TAPI-010

接口/路径：`写型端点/命令` · POST /tasks · 空 task_id 与缺 instruction

维度格（方案 §2.3 行×格）：`写型端点/命令` × `未知字段/非法值`

实现状态：`Implemented`

## 2. 公共前提与替身矩阵

#### 2.1 前提 · 内存 SQLite + 临时工作区

版本 / 来源：`tests.asset-design` · ENV-1（纯内存、无外部系统）

影响 Case：全部

## 3. 用例（固定段落块，按对象分组）

#### 3.1 MT-TAPI-010 · POST /tasks · 空 task_id 与缺 instruction

**责任 / 明确不测**：模块公开接口在对象类型 `写型端点/命令` 下的行为（POST /tasks · 空 task_id 与缺 instruction）；本 Case 只登记维度格 `未知字段/非法值` 一格。只测模块公开面，不测内部算法（归 `unit-test-scheme`）、不测跨模块端到端（归 `system-test-scheme`）。

**维度坐标（方案 §2.3 行×格）**：对象类型 `写型端点/命令` 的维度格 `未知字段/非法值`（该 Case 只登记本行 1 格）。

**输入构造**：按 `写型端点/命令` 的展开规则针对 `未知字段/非法值` 构造；替身与受控时钟见本集 §2。

**步骤与观察点**：装配真实模块 ＋ 边界替身 → 触发本维度场景 → 观察模块公开返回、typed 错误码与持久化副作用。

**Oracle 与预期**：以模块设计 §9 公开接口合同与 §14 验证项为唯一权威。

**错误路径 / 清理**：失败必须 typed 化且不反向控制其他模块；每例重置内存 SQLite、释放临时目录。

**脚本 / 实现状态**：`tests/integration/module-dimension-cells.test.ts` · `Implemented`
