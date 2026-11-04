<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Case UT-PI-010

> **本文件遵守 STD（工程文档标准），STD 为最高优先级；修改本文件之前必须先读 STD 入口。**
> STD 入口：[项目采用说明与标准导航](../../../../README.md#std-entry)。入口的**编写索引**已列出本类文档的全部硬性义务：不必通读规范，但**每一条都必须遵守**。

| 文档字段 | 值 |
|---|---|
| Document ID | `UT-PI-010` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | Claude |
| Created Date | `2026-11-04` |
| Last Modified Date | `2026-11-04` |
| Template ID | `tests.unit-case` |
| Template Version | `3.1.0` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/unit/cases/UT-PI-010.md` |
| Supersedes | none |
| Std Conformance Total | 0 |
| Std Conformance Passed | 0 |
| Checklist Total | 0 |
| Checklist Conformed | 0 |
<!-- STD_DOCUMENT_COVER_END -->
> **编写建议**：本文档是**单个模块的单元测试用例集**：本 Case 由 `scripts/derive-ut-cases.mjs` 从
> `docs/70_verification/unit/ut-denominator.md`（AST 枚举表，机器权威）派生登记；段落指向表内具体行。

### 模板定位：方案、用例集与计划的边界

- **Case＝固定段落块**：§3 一个 `#### UT-PI-010` 段落，七字段与顺序固定。
- **测试脚本的唯一依据**：编码者按本文档写测试代码；段落锚点＝脚本名（文件名＝Case ID）。
- **不预填结果**：本集持有实现状态；执行状态与 Verdict 只在 Run 报告。

### 状态语义：实现状态

- **测试代码实现状态**：`Planned`——唯一权威：本文档 §1 总账与 §4；禁止：计划中的测试函数冒充可执行入口。
- **执行状态**：`NOT_RUN` / `BLOCKED` / `INVALID`——唯一权威：Run 报告；禁止：在本文档预填执行或判定。
- **实际判定 Verdict**：`PASS` / `FAIL`——唯一权威：仅 Run 报告。

## 1. 集合概览与维度总账

#### 1.1 总账 · UT-PI-010

对象函数：`prefetchSkillContext`（PI 模块，`src/skill-prefetch.ts:137`）

维度格（方案 §2.3 行×格）：`字符串/路径/枚举输入` × `注入字符`

实现状态：`Planned`

## 2. 公共前提与替身矩阵

#### 2.1 前提 · ENV-UNIT

版本 / 来源：`tests.asset-design` §3.1（内存 SQLite＋受控时钟 `FAKE-CLK`）

影响 Case：全部

## 3. 用例（固定段落块，按对象分组）

#### 3.1 UT-PI-010 · `prefetchSkillContext` 在 `字符串/路径/枚举输入` 类型下的 `注入字符` 格

**责任 / 明确不测**：被测符号 `prefetchSkillContext`（`src/skill-prefetch.ts:137`，AST 枚举表行），对象类型 `字符串/路径/枚举输入`，本 Case 只登记维度格 `注入字符`（STD「一格一 Case」）；`prefetchSkillContext` × `字符串/路径/枚举输入` 格 `注入字符`（波次一：补齐 §2.3 未登记格；skill-prefetch.ts:137，分支 37 点）。不测同符号其他格（兄弟 Case 承担）、不测模块整体行为。

**维度坐标（方案 §2.3 行×格）**：`prefetchSkillContext` × `字符串/路径/枚举输入`；本 Case 登记格＝`注入字符`；枚举表该行分支 37 点、throw 0 处。

**输入构造**：按 `字符串/路径/枚举输入` 的展开规则构造 `注入字符` 格所需输入（取值冻结或给生成规则）；替身与受控时钟见本集 §2。

**步骤与观察点**：建立 `ENV-UNIT` → 调用 `prefetchSkillContext` → 观察本格对应的返回值、typed 错误码、持久化副作用与资源释放。

**Oracle 与预期**：以 `docs/40_module_design/piko-pi-adapter-design.md` 中对应 `VRC` 为唯一权威；本段只细化执行断言，冲突回溯设计修订。

**错误路径 / 清理**：失败必须 typed 化；内存 SQLite 与替身每例重置；临时密钥与 staging 用后删除且不触碰 `~/.ssh`。

**脚本 / 实现状态**：`待建（tests/unit/UT-PI-010.test.ts，文件名＝Case ID）` · `Planned`

## 4. 集合状态汇总与缺口

- **实现状态分布**：`Planned` 1 ／ `Implemented` 0（本集为波次一新登记，脚本待建）
- **缺口清单（格＋Owner＋最晚关闭 Gate）**：`UT-PI-010` 格 `字符串/路径/枚举输入`×`注入字符` 已登记、脚本未建；Owner＝测试工程；最晚关闭 Gate＝模块层 Gate（随 `G-EXEC-UT-3` 同批）

> **交付自查**：总账与方案 §6.1 登记行一致；段落七字段完整；脚本文件名与段落锚点一致；无预填执行结果。
