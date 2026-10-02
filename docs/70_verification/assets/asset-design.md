<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko asset-design

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `asset-design` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode, corezilla |
| Created Date | `2026-10-03` |
| Last Modified Date | `2026-10-03` |
| Template ID | `tests.asset-design` |
| Template Version | `0.2.2` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/assets/asset-design.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

<span style="color:#1f6feb"><em>**编写建议**：本模板是测试资产设计——harness、替身/fake、受控时钟、向量生成器、注入框架、Run 编排等测试件（一资产一文档）。测试资产不是产品功能：它有自己的契约、实现与自检；契约（尤其是替身的证明边界与注入命中语义）以本文档为唯一 authority，方案、Case 文档与计划只引用不重复。</em></span>

> **格式说明**：蓝色斜体为编写建议（指导如何填写，生成实例后保留）；灰色文字为虚构教学示例（以 `STD_TEMPLATE_EXAMPLE` 标记包裹，`new-design` 生成实例时自动剥离，不得当作项目事实或运行证据）；`<!-- TODO -->` 为待填槽位。颜色在 GitHub 等严格渲染器中降级为斜体/普通字，语义不变。

> 本资产文档绑定：资产 ID 经 Document ID 固定；消费方（方案/Case/计划文档）在 §1 登记；所属测试 Owner 在 metadata 固定。本模板阶段无关——资产常跨单元/模块/子系统/系统层复用。

### 模板定位：资产、Case 与可测试性缺口的边界

<span style="color:#1f6feb"><em>**编写建议**：测试资产承接“有钩子之后的自动化”：产品已提供注入点/测试接口/可观察出口时，资产把它们自动化。产品没有钩子是可测试性缺口，回路是：方案 Gap 表登记 → 设计文档未决项/需求变更 → 钩子落地后资产才承接；禁止在资产里硬绕产品缺陷（如直接改内部状态伪造观察结果）。工具的自检 PASS 不是产品 PASS。</em></span>

- **契约 authority**：替身模拟什么/不模拟什么、注入命中语义、时钟精度、调用序断言范围，唯一登记在本文档 §2；Case 文档引用，不改写。
- **消费方索引**：§1 登记全部依赖方；资产变更须逐一评估影响，改资产知道炸谁。
- **不替产品补可测试性**：缺钩子走方案 Gap → 设计变更回路，不用工具绕。

### 状态语义：开发与自检

<span style="color:#1f6feb"><em>**编写建议**：资产有两层状态——开发状态（Planned/Implemented）与验证状态（Unverified/Verified）；Verified 的唯一依据是 §5 的自检 Run 引用。测试计划 Step 0 只接受 Verified 的资产进入执行。</em></span>

| 状态 | 取值 | 唯一权威记录处 | 禁止 |
|---|---|---|---|
| 开发状态 | `Planned` / `Implemented` | 本文档 §6 | 计划中的资产冒充可用 |
| 验证状态 | `Unverified` / `Verified`（自检 Run 引用） | 本文档 §5–§6 | 未自检宣称 Verified；用产品 Case 的 PASS 冒充自检 |

<span style="color:#1f6feb"><em>**完成条件**：任一资产能报出两层状态；Verified 可追到自检 Run；消费方能沿 §1 索引找到本文档。</em></span>


## 1. 用途与消费方


<span style="color:#1f6feb"><em>**本节目的**：固定资产解决什么问题、谁在用。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：资产的用途与形态（harness/替身/时钟/生成器/编排）；消费方索引——哪些方案、Case 文档、计划依赖它（Document ID + 版本）；无消费方的资产应退役而非闲置。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 CLK-DIR 受控时钟被 STS-DIR 方案的 3 个 Case 与 STP-DIR 计划 Step 0 依赖。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：用途清晰；消费方索引完整可反向追溯。</em></span>

- 资产 ID / 名称 / 形态：<!-- TODO -->
- 用途与解决的问题：<!-- TODO -->
| 消费方 | 类型 | 依赖点 |
|---|---|---|
| <!-- TODO --> | | |




## 2. 行为契约（唯一 authority）


<span style="color:#1f6feb"><em>**本节目的**：定义资产对外暴露的确切行为——这是替身证明边界的唯一出处。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：替身类资产：模拟什么、不模拟什么（真实协议/事务/时序不由它证明）、允许配置的行为集；注入类：注入点、命中语义（如注入计数）、撤销；时钟/调度类：精度、推进接口、与真实时间的边界；生成器类：输出分布、冻结与可复现规则；调用序断言范围；故障绑定具体产品步骤及副作用前后，预定义场景有独立 oracle，核对执行次数/操作 ID/持久内容与后续恢复。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 FAKE-REG 注册接口 fake 只代返回值与一次超时注入（计数=1 为命中），不证明真实注册协议。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：Case 作者不需要读资产源码就能正确使用并声明其不证明的性质。</em></span>

- 模拟的行为集：<!-- TODO -->
- 不模拟 / 不证明的性质：<!-- TODO -->
- 注入/命中语义（适用时）：<!-- TODO -->
- 精度 / 推进接口（时钟类适用）：<!-- TODO -->
- 预定义故障场景与副作用前后绑定：<!-- TODO -->


## 3. 可测试性依赖与缺口回路


<span style="color:#1f6feb"><em>**本节目的**：写清资产依赖产品的哪些钩子，缺钩子时走设计回路而非工具绕行。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：依赖的注入点/测试接口/可观察出口（引用设计文档章节）；当前缺失的钩子登记为消费方方案的 Gap，并给出向设计文档的移交记录；禁止的绕行手段（直改内部状态、伪造观察结果）明示为禁令。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 EX-MODULE 若无公开配置入口，CLK 类资产无法构造初态——登记 Gap 到 MTS-EXM §4 并移交模块设计，而非反射改私有字段。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：每个依赖钩子有设计出处；缺失项有 Gap 编号与移交记录；无绕行手段残留。</em></span>

- 依赖的产品钩子（设计出处）：<!-- TODO -->
- 缺失钩子的 Gap 与移交：<!-- TODO -->


## 4. 实现设计与版本耦合


<span style="color:#1f6feb"><em>**本节目的**：资产自己的实现方案与演进规则。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：实现位置（tests/ 下目录）、结构与关键接口；与被测版本/接口的耦合（绑哪个版本、产品变更时的适配规则）；并行使用时的隔离（实例/端口/命名空间）。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 CLK-DIR 位于 tests/subsystem/s01/assets/clk/，接口变更随 STS-DIR 版本重裁。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：另一位开发者能接手维护；版本耦合规则明确。</em></span>

- 实现位置与结构：<!-- TODO -->
- 版本耦合与适配规则：<!-- TODO -->
- 并行隔离：<!-- TODO -->


## 5. 自身验证（自检）


<span style="color:#1f6feb"><em>**本节目的**：资产怎么证明自己可用——Verified 的唯一来源。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：自检用例清单（区别于产品 Case：验证资产行为符合 §2 契约，如注入确实命中、时钟确实推进）；对拍方式（适用时，与真实依赖的对照样本）；自检 Run 的执行入口与证据位置；自检失败=消费方计划 Step 0 阻塞。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 CLK-DIR 自检：advance(5) 后读数=5 且单调；注入计数命中一次 +1；自检 Run 保存在 assets 自己的 reports/。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：每个 §2 契约条款有对应自检项；Verified 可追到自检 Run。</em></span>

| 自检项 | 验证的契约条款 | 判定 |
|---|---|---|
| <!-- TODO --> | | |

- 自检执行入口：<!-- TODO -->
- 自检 Run 证据位置：<!-- TODO -->




## 6. 状态与版本


<span style="color:#1f6feb"><em>**本节目的**：当前两层状态与变更影响。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：开发状态（Planned/Implemented）与验证状态（Unverified/Verified＋自检 Run 引用）；最近一次契约变更对消费方的影响评估。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 CLK-DIR：Implemented＋Verified（自检 Run clk-run-20260929-01，3/3 PASS）。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：状态双层可核验；变更影响有消费方逐一评估记录。</em></span>

- 开发状态 / 验证状态（自检 Run 引用）：<!-- TODO -->
- 最近契约变更与消费方影响：<!-- TODO -->


## 7. 未决项


<span style="color:#1f6feb"><em>**本节目的**：未决项有主、有期限。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：逐条登记（含 §3 移交设计侧的缺口跟踪）；无未决项时写经核对的“无”。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构（无未决项，经核对）。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：未决项全部有主有期限。</em></span>

| 未决项 / 关联 | Owner / 最晚 Gate | 关闭所需事实或决定 |
|---|---|---|
| <!-- TODO；无未决项时写经核对的"无" --> | | |



<!-- 交付自查：契约是否完整到 Case 作者无需读源码；每个消费方是否都能反向找到本文档；Verified 是否可追到自检 Run；有没有用工具绕产品缺陷的痕迹？ -->
