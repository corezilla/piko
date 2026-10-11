# [ARCHIVED] unit_UT-POLICY-001

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

- **测试代码实现状态**：`Implemented` / `Implemented`——唯一权威：本文档 §1 总账与 §4；禁止：计划中的测试函数冒充可执行入口。
- **执行状态**：`NOT_RUN` / `BLOCKED` / `INVALID`——唯一权威：Run 报告；禁止：在本文档预填执行或判定。
- **实际判定 Verdict**：`PASS` / `FAIL`——唯一权威：仅 Run 报告；禁止：在本文档预填 Actual 或 Verdict。

> - **完成条件**：本集能报出逐 Case 实现状态，且沿 Case ID 可追到方案清单行与 Run 报告。

## 1. 集合概览与维度总账

- **绑定对象**：M002 `policy` 内部函数（`design.implementation`，ISD §5/§6）；方案 `unit-test-scheme`。
- **覆盖范围**：ISD 声明的实现层验证项 `VRC-POLICY-001` `VRC-POLICY-002` `VRC-POLICY-003` `VRC-POLICY-004` `VRC-POLICY-005` `VRC-POLICY-006`
- **总账**：本集 1 条 Case 记录（模块内部函数集合）。

| Case ID | 函数/算法 | 方案 §2.1 维度行×格 | 实现状态 |
|---|---|---|---|
| `UT-POLICY-001` | `VRC-POLICY-001` 绑定通过/未注册 ref/不一致 | §2.1 `normal` | `Implemented` |

**未覆盖格**：无——可执行入口：`tests/unit/workspace.test.ts`。执行状态与 Verdict 见 Run 报告。


#### 1.1 总账 · UT-POLICY-001

对象函数：`VRC-POLICY-001`（绑定通过/未注册 ref/不一致）

维度格（方案 §2.3 行×格）：`normal`

实现状态：`Implemented`



## 2. 公共前提与替身矩阵

| 前提 | 版本 / 来源 | 影响 Case |
|---|---|---|
| `ENV-UNIT`（纯内存 + 全替身） | `asset-design` §3.1 | 全部 |
| `FAKE-CLK`（受控时钟，`ManualClock`） | `src/clock.ts` | 时间/超时相关 |
| `FAKE-LLM` | `tests/common/mock-llmtier.ts` | 涉及模型调用的函数 |

**fixture 隔离**：每 Case 独立内存库；替身与时钟每例重置。


#### 2.1 前提 · ⟨名称⟩

版本 / 来源：

影响 Case：

（或"全部"）


## 3. 用例（固定段落块，按对象分组）

#### 3.1 UT-POLICY-001 · 绑定通过/未注册 ref/不一致

**责任 / 明确不测**：验证 VRC-POLICY-001（绑定通过/未注册 ref/不一致）；只测本条设计验证项声明的判据，不测同模块其他验证项、不测模块整体行为。

**维度坐标（方案 §2.3 行×格）**：`normal` × 本条 `UT` 对象分组。

**输入构造**：按 `VRC-POLICY-001` 的适用条件构造最小输入；非法与边界取值取设计判据列出的端点；替身边界见 §2。

**步骤与观察点**：建立 `ENV-UNIT` → 直接调用被测函数 → 观察返回值、typed 错误码与持久化副作用。

**Oracle 与预期**：以 `VRC-POLICY-001` 为唯一权威（`docs/40_module_design/` 对应模块设计 §14 / ISD §14）；本段只细化执行断言，冲突回溯设计修订。

**错误路径 / 清理**：非法输入必须抛 typed 码且不吞错；内存库与替身每例重置；临时 workspace 用后删除。

**脚本 / 实现状态**：`tests/unit/workspace.test.ts` · `Implemented`



### 3.1 M002 内部函数/算法

#### 3.1.1 `UT-POLICY-001` · M002 内部函数在正常/边界/错误路径下的行为

责任 / 明确不测：白盒验证 M002 内部逻辑；不测模块整体（归 MT）、不测端到端（归 ST）。

维度坐标（方案 §2.1 行×格）：`normal`×`/`boundary`×`/`negative`×`/`concurrency`×`/`recovery`×`/`security`。

输入构造：等价类+边界值+反例（按 ISD VRC `VRC-POLICY-001` `VRC-POLICY-002` `VRC-POLICY-003` `VRC-POLICY-004`…）；时间用 `ManualClock` 注入。

步骤与观察点：建立 `ENV-UNIT` → 直接调用被测函数 → 断言返回值/抛错码/状态。

Oracle 与预期：对 ISD 的 VRC 判据；期望值独立来自 schema/设计常量。

错误路径 / 清理：非法输入必须抛 typed 码，不吞错；替身与内存库每例重置。

脚本 / 实现状态：`tests/unit/workspace.test.ts` · `Implemented`

## 4. 集合状态汇总与缺口

- **覆盖**：6 条实现层 VRC 由本集 `UT-POLICY-001` 分担。
- **缺口**：无——本集按 `VRC-POLICY-001` 一条 Case 登记，分母与设计 VRC 清单逐条对账。
