<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Case UT-MATRIX-001

> STD 使用入口：[项目采用说明与标准导航](../../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `UT-MATRIX-001` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode |
| Created Date | `2026-10-11` |
| Last Modified Date | `2026-10-11` |
| Template ID | `tests.unit-case` |
| Template Version | `3.0.9` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/unit/cases/UT-MATRIX-001.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->
> **编写建议**：本文档是**单个模块的单元测试用例集**：一模块一集，本模块全部 UT Case 以固定段落块组织在 §3（Document ID＝`UT-COL-⟨模块短名⟩-⟨NNN⟩`，单集超过 40 条拆 `-002`）；段内 Case ID 仍为 `UT-⟨对象⟩-⟨NNN⟩`，与本模块单测方案（`tests.unit-test-scheme`，同样一模块一份）的清单行一一对应；测试脚本一段一文件、文件名＝Case ID。LLM/智能体组件的输入构造、独立判据、统计口径与预算安全方法见 LLM 测试方法（见 `docs/std.lock.json` 所锁 STD 的 `docs/ai-guides/llm-testing.md`）。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。

> 本文档对设计验证项（VRC/V-xxx）的引用规则：只引用 ID 与状态，不复制定义/判据；Case 段落若需细化执行断言需在变更时回溯设计修订并记录。

> 本集合文档绑定：模块对象 ID 经 `--design-object-id`、所属方案经 `--parent-document-id` 写入 metadata；Document ID＝`UT-COL-<模块短名>-<NNN>`。"Document ID＝Case ID"的一 Case 一文档规则适用于 IT/ST 层，不适用于本层。

### 模板定位：方案、用例集与计划的边界

> **编写建议**：单元层用例集；方案清单行持有设计状态，本集持有实现状态；模块组装层用例集归 `tests.module-case`；系统层黑盒 Case 维持一 Case 一文档（`tests.system-case`）。

- **Case＝固定段落块**：§3 按被测对象分组，每 Case 一个 `#### <Case ID>` 段落，七字段与顺序固定（可写"不适用"，不可删字段）。
- **测试脚本的唯一依据**：编码者按段落写测试代码，不需要回读方案或设计正文猜测意图；段落锚点＝脚本名。
- **不预填结果**：本集持有实现状态；执行状态与 Verdict 只在 Run 报告。

### 状态语义：实现状态

> **编写建议**：本文档只持有实现状态；用例状态在方案清单，执行状态与 Verdict 只在 Run 报告；三层混用即违例。

- **测试代码实现状态**：`Planned` / `Implemented`——唯一权威：本文档 §1 总账与 §4；禁止：计划中的测试函数冒充可执行入口。
- **执行状态**：`NOT_RUN` / `BLOCKED` / `INVALID`——唯一权威：Run 报告；禁止：在本文档预填执行或判定。
- **实际判定 Verdict**：`PASS` / `FAIL`——唯一权威：仅 Run 报告；禁止：在本文档预填 Actual 或 Verdict。

> - **完成条件**：本集能报出逐 Case 实现状态，且沿 Case ID 可追到方案清单行与 Run 报告。

## 1. 集合概览与维度总账

> **本节目的**：让本集绑定的模块与函数范围明确，并把维度格清零——总量与缺口由总账表一眼数出。
>
> **必须写清楚**：绑定模块对象 ID 与方案路径/版本；覆盖的 ISD 函数清单；总账每 Case 一行（Case ID｜对象函数｜方案 §2.3 维度行×格｜实现状态）；**未覆盖格必须成 Gap 行**（格＋Owner＋最晚关闭 Gate），不允许"不在表里＝没有缺口"。
>
> **抽象示例**：见下表灰字。
>
> **完成条件**：总账格集合与方案 §2.3 本模块函数的格集合差集为零（覆盖＋Gap 合并计算）；新增 Case 先入总账再建段落。

每条 Case 一格登记记录（缺口也必须是记录）：

#### 1.1 总账 · UT-MATRIX-001

对象函数：`MatrixRuntime`（MATRIX 模块）

维度格（方案 §2.3 行×格）：`并发/可重入` × `并发对偶/交错`、`容量 N−1/N/N+1`、`可重入幂等`

实现状态：`Implemented`

## 2. 公共前提与替身矩阵

> **本节目的**：把集合内共享的 fixture、冻结向量、替身与受控时钟统一声明，供段落引用，不逐 Case 重复。
>
> **必须写清楚**：每前提一行＝名称｜版本/来源（`tests.asset-design` 文档 ID 或向量集版本，唯一 authority）｜影响哪些 Case（或"全部"）；替身行为集与注入计数规则；fixture 隔离策略（共享只读/逐例克隆）。
>
> **抽象示例**：见下表灰字。
>
> **完成条件**：集合内不存在"隐含环境约定"——一切非参数输入可追到本表某行。

每个前提一条记录：

#### 2.1 前提 · ⟨名称⟩

版本 / 来源：

影响 Case：

（或"全部"）


## 3. 用例（固定段落块，按对象分组）

#### 3.1 UT-MATRIX-001 · `auditMembership` 在 `时间域行为` 类型下的完整维度

**责任 / 明确不测**：被测符号 `auditMembership`（`src/` 中真实存在），对象类型 `时间域行为`；必须覆盖本类型全部维度格 `超时边界 ±1 tick`、`定时器触发序`。只测该符号在该类型下的行为，不测同符号其他类型（兄弟 Case 承担）、不测模块整体行为。

**维度坐标（方案 §2.3 行×格）**：`auditMembership` × `时间域行为`；展开维度格＝`超时边界 ±1 tick`、`定时器触发序`。

**输入构造**：按 `时间域行为` 的展开规则逐格构造——`超时边界 ±1 tick`、`定时器触发序`；替身与受控时钟（`FAKE-CLK`）见本集 §2。

**步骤与观察点**：建立 `ENV-UNIT` → 调用 `auditMembership` → 逐格观察返回值、typed 错误码、持久化副作用与资源释放。

**Oracle 与预期**：以 `docs/40_module_design/piko-matrix-adapter-design.md` 中对应 `VRC` 为唯一权威；本段只细化执行断言，冲突回溯设计修订。

**错误路径 / 清理**：失败必须 typed 化；内存 SQLite 与替身每例重置；临时密钥与 staging 用后删除且不触碰 `~/.ssh`。

**脚本 / 实现状态**：`tests/unit/matrix / matrix-membership.test.ts` · `Implemented`



#### 3.1 UT-MATRIX-001 · `MatrixRuntime` 在 `并发/可重入` 类型下的完整维度

**责任 / 明确不测**：被测函数 `MatrixRuntime`，对象类型 `并发/可重入`；必须覆盖本类型全部维度格 `并发对偶/交错`、`容量 N−1/N/N+1`、`可重入幂等`。只测该函数在该类型下的行为，不测同函数的其他类型（由兄弟 Case 承担）、不测模块整体行为。

**维度坐标（方案 §2.3 行×格）**：`MatrixRuntime` × `并发/可重入`；展开维度格＝`并发对偶/交错`、`容量 N−1/N/N+1`、`可重入幂等`。

**输入构造**：按 `并发/可重入` 的展开规则逐格构造——`并发对偶/交错`、`容量 N−1/N/N+1`、`可重入幂等`；替身与受控时钟见本集 §2。

**步骤与观察点**：建立 `ENV-UNIT` → 调用 `MatrixRuntime` → 逐格观察返回值、typed 错误码、持久化副作用与资源释放。

**Oracle 与预期**：以 `docs/40_module_design/piko-matrix-adapter-design.md` 中对应 `VRC` 为唯一权威；本段只细化执行断言，冲突回溯设计修订。

**错误路径 / 清理**：失败必须 typed 化；内存 SQLite 与替身每例重置；临时密钥与 staging 用后删除且不触碰 `~/.ssh`。

**脚本 / 实现状态**：`tests/unit/matrix.test.ts` · `Implemented`



> **本节目的**：承载本模块全部 Case；段落七字段即本层 Case 的组织方式，评审、脚本与报告都按此对齐。
>
> **必须写清楚**：`### 3.N ⟨对象函数/路由⟩` 分组；每 Case 一个 `#### ⟨Case ID⟩ · ⟨一句话责任⟩` 段落，字段固定：责任/明确不测、维度坐标、输入构造（含规模（数量、分页、复杂度）与时间域观测开销）、步骤与观察点、Oracle 与预期（独立来源逐值判据；判据语义以设计验证项（VRC）为唯一权威，本段细化不改写，冲突回溯设计修订；数值/模型输出给分项判据——重复性、真实输入回放、整体比较分别判定）、错误路径/清理、脚本/实现状态。一格一 Case；维度扩展加格加 Case，不在段内塞多格。
>
> **抽象示例**：见 example 围栏完整段。
>
> **完成条件**：段落与 §1 总账一一对应；每段可独立读懂并直接支撑编码。

每个对象分组重复一个 `### 3.N ⟨对象函数/路由⟩` 小节；组内每 Case 重复以下固定段落块——`#### ⟨Case ID⟩ · ⟨一句话责任⟩`，八字段名行以冒号结尾、各带独立正文段（灰色示例即成品样子）：

#### 3.1 ⟨Case ID⟩ · ⟨一句话责任⟩

责任 / 明确不测：

维度坐标（方案 §2.3 行×格）：

输入构造：

步骤与观察点：

Oracle 与预期：

（独立来源逐值判据；判据语义以设计验证项（VRC）为唯一权威，本段细化不改写，冲突回溯设计修订；数值/模型输出给分项判据）

错误路径 / 清理：

脚本 / 实现状态：

`tests/unit/cases/<Case ID>.py` · `Planned` / `Implemented`


## 4. 集合状态汇总与缺口

> **本节目的**：把集合的实现状态分布与缺口交给 Run 报告覆盖复算。
>
> **必须写清楚**：分布统计＝§1 总账逐行汇总；缺口清单（格＋Owner＋最晚关闭 Gate）——报告缺口行由本节复制，禁止两处各说各话。
>
> **抽象示例**：Planned 6 / Implemented 21 / Gap 3（G-UT-1..3）。
>
> **完成条件**：汇总与总账一致；每缺口有 Owner 与期限。

- ****实现状态分布****：
- ****缺口清单（格＋Owner＋最晚关闭 Gate）****：

> **交付自查**：总账与方案 §2.3 格集合差集为零；每段落七字段完整；脚本文件名与段落锚点一致；无预填执行结果。
