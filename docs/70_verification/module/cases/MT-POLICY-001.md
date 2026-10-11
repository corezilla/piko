<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Case MT-POLICY-001

> STD 使用入口：[项目采用说明与标准导航](../../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `MT-POLICY-001` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode, corezilla |
| Created Date | `2026-10-11` |
| Last Modified Date | `2026-10-11` |
| Template ID | `tests.module-case` |
| Template Version | `3.0.8` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/module/cases/MT-POLICY-001.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
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

- **绑定对象**：M002 `policy`（`design.definition`）；方案 `module-test-scheme`（v0.1.0-draft.1）。
- **覆盖的公开接口**：该模块设计 §9 全部公开接口；组装路径为 `tests/unit/<对应文件>`。
- **总账**：本集 1 条 Case 记录，覆盖 6 条设计验证项。

| Case ID | 接口/路径 | 方案 §2.1 维度行×格 | 实现状态 |
|---|---|---|---|
| `MT-POLICY-001` | M002 公开接口全量 | §2.1 `normal`×`/boundary`×`/negative`×`/concurrency`×`/recovery`×`/security` | `Implemented` |

**未覆盖格**：无——可执行入口：`tests/unit/workspace.test.ts`。执行状态与 Verdict 见 Run 报告。


#### 1.1 总账 · ⟨Case ID⟩

接口/路径：

维度格（方案 §2.1 行×格）：

实现状态：

`Implemented` / `Planned` / `Gap（编号／Owner／最晚关闭 Gate）`


## 2. 公共前提与替身矩阵

| 前提 | 版本 / 来源 | 影响 Case |
|---|---|---|
| `ENV-UNIT`（内存 SQLite + 临时 workspace） | `asset-design` §3.1 | `MT-POLICY-001` |
| `FAKE-LLM`（边界依赖替身） | `tests/common/mock-llmtier.ts` | 涉及外部模型调用的 Case |
| `FAKE-CLK`（受控时钟） | `src/clock.ts` | 时间/超时相关 Case |

**fixture 隔离**：每 Case 新建 store 与 workspace；共享只读向量不跨 Case 改写。


#### 2.1 前提 · ⟨名称⟩

版本 / 来源：

影响 Case：

（或"全部"）


## 3. 用例（固定段落块，按对象分组）

### 3.1 M002 公开接口

#### 3.1.1 `MT-POLICY-001` · M002 模块契约在正常/边界/拒绝路径下的可观察行为

责任 / 明确不测：验证 M002 对外契约（正常、边界、拒绝路径）；不测内部算法（归 UT）、不测跨模块端到端（归 ST）。

维度坐标（方案 §2.1 行×格）：`normal`×`/`boundary`×`/`negative`×`/`concurrency`×`/`recovery`×`/`security`。

输入构造：按该模块 VRC（VRC-POLICY-001 VRC-POLICY-002 VRC-POLICY-003 VRC-POLICY-004 VRC-POLICY-005…）构造输入；每条 Case 独立 `task_id`/workspace。

步骤与观察点：建立 `ENV-UNIT` → 逐条执行脚本 → 观察返回值/typed 码/权威存储行。

Oracle 与预期：逐条对 `design.definition` 的 VRC 判据；不复用模块内部实现作为判据。

错误路径 / 清理：拒绝用例断言 typed 码且不写额外持久行；临时 workspace 用后删除；不触碰 `~/.ssh`。

脚本 / 实现状态：`tests/unit/workspace.test.ts` · `Implemented`

