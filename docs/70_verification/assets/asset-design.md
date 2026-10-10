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
| Created Date | `2026-10-10` |
| Last Modified Date | `2026-10-10` |
| Template ID | `tests.asset-design` |
| Template Version | `0.3.8` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/assets/asset-design.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

> **编写建议**：本模板是测试资产设计——harness、替身/fake、受控时钟、向量生成器、注入框架、Run 编排、外部系统模拟器、数据构造工具、校验工具等测试件（一资产一文档）。测试资产不是产品功能：它有自己的契约、实现与自检；契约（尤其是替身的证明边界与注入命中语义）以本文档为唯一 authority，方案、Case 文档与计划只引用不重复。

> **格式说明**：`> ` 引用块为编写建议（指导如何填写，生成实例后保留，项目可按标签整体裁除）；```example 围栏为虚构教学示例（以源文本呈现成品形态，`new-design` 实例化时整块剥离，不得当作项目事实）；`⟨angle⟩` 为待填槽，反引号为照抄的短建议/示例值。

> 本资产文档绑定：资产 ID 经 Document ID 固定；消费方（方案/Case/计划文档）在 §1 登记；所属测试 Owner 在 metadata 固定。本模板阶段无关——资产常跨单元/模块/子系统/系统层复用。

### 模板定位：资产、Case 与可测试性缺口的边界

> **编写建议**：测试资产承接“有钩子之后的自动化”：产品已提供注入点/测试接口/可观察出口时，资产把它们自动化。产品没有钩子是可测试性缺口，回路是：方案 Gap 表登记 → 设计文档未决项/需求变更 → 钩子落地后资产才承接；禁止在资产里硬绕产品缺陷（如直接改内部状态伪造观察结果）。工具的自检 PASS 不是产品 PASS。

- **契约 authority**：替身模拟什么/不模拟什么、注入命中语义、时钟精度、调用序断言范围，唯一登记在本文档 §2；Case 文档引用，不改写。
- **消费方索引**：§1 登记全部依赖方；资产变更须逐一评估影响，改资产知道炸谁。
- **不替产品补可测试性**：缺钩子走方案 Gap → 设计变更回路，不用工具绕。

### 状态语义：开发与自检

> **编写建议**：资产有两层状态——开发状态（Planned/Implemented）与验证状态（Unverified/Verified）；Verified 的唯一依据是 §5 的自检 Run 引用。测试计划 Step 0 只接受 Verified 的资产进入执行。

- **开发状态**：`Planned` / `Implemented`——本文档 §6；禁止：计划中的资产冒充可用。

- **验证状态**：`Unverified` / `Verified`（自检 Run 引用）——本文档 §5–§6；禁止：未自检宣称 Verified；用产品 Case 的 PASS 冒充自检。

> **完成条件**：任一资产能报出两层状态；Verified 可追到自检 Run；消费方能沿 §1 索引找到本文档。

## 1. 用途与消费方

> **本节目的**：固定资产解决什么问题、谁在用。
>
> **必须写清楚**：资产的用途与形态（harness/替身/时钟/生成器/编排/外部系统模拟器/数据构造工具/校验工具）；消费方索引——哪些方案、Case 文档、计划依赖它（Document ID + 版本）；无消费方的资产应退役而非闲置。
>
> **抽象示例**：虚构 CLK-DIR 受控时钟被 STS-DIR 方案的 3 个 Case 与 STP-DIR 计划 Step 0 依赖。
>
> **完成条件**：用途清晰；消费方索引完整可反向追溯。

- **资产 ID / 名称 / 形态**：


- **用途与解决的问题**：


#### 1.1 消费方 · ⟨方案/计划/报告名⟩

**引用位置**：`system-test-scheme` / `system-test-plan`（§4 ENV 实例）、`module-test-scheme` / `module-test-plan`、`unit-test-scheme` / `unit-test-plan`

**约定**：方案与计划只引用本文的资产 ID，不复制资产行为。


## 2. 行为契约（唯一 authority）

**资产清单**

| 资产 ID | 实现 | 契约摘要 | 自检 |

|---|---|---|---|
| `FAKE-LLM` | `tests/common/mock-llmtier.ts` | 真 OpenAI-compatible Responses 协议 fake；按脚本返回事件流与 usage；不经真实网络 | `CHK-LLM-01` |
| `FAKE-CLOCK` | 单调/UTC 可注入时钟 | 提供 `monotonic()` 与 UTC instant；可注入偏移 | `CHK-CLK-01` |
| `FAKE-MATRIX` | 本地 Synapse + `scripts/scenario-env.sh` | 真 Client-Server 行为（membership / txn 幂等） | `CHK-MTX-01` |
| `FAKE-SCP` | `scripts/datanode-env.sh` + 真 sshd/远端 | 出站 `scp`；临时 HOME + 固定 `known_hosts`；不触碰 `~/.ssh` | `CHK-SCP-01` |
| `SEEDS` | `scripts/scenario-seeds.sh` | 幂等重建场景种子到 `var/scenario-seeds/` | `CHK-SEED-01` |

**边界**：资产自检 PASS **不等于**产品 PASS；只保证替身行为可复现。


## 3. 可测试性依赖与缺口回路

**可测试性依赖**：`TaskStore` 事务与 fenced write 可注入内存库；`PiRuntime` 的 `onRawUsage`/`before_request` 为 Pi 原生扩展点，可替换模型端；数据面 `Transfer` 的 `method` 可切 `mount` 以免依赖 ssh。

**缺口回路**：缺注入点/可观察出口 → 方案 §7 登记 Gap → 设计文档未决项 → 钩子落地后本资产才承接；**禁止**在测试件里硬绕产品缺陷。


## 4. 实现设计与版本耦合

**版本耦合**：资产与被测实现同仓同版本；契约权威为 `interfaces/schemas/agent-runtime-v0.3.schema.json` 与 `interfaces/openapi/agent-runtime-openapi-v0.3.yaml`；Pi 固定 `9767ba27`。

**变更纪律**：契约字段变更须先改 schema/openapi，再同步资产与用例。


## 5. 自身验证（自检）

> **本节目的**：资产怎么证明自己可用——Verified 的唯一来源。
>
> **必须写清楚**：自检用例清单（区别于产品 Case：验证资产行为符合 §2 契约，如注入确实命中、时钟确实推进）；对拍方式（适用时，与真实依赖的对照样本）；自检 Run 的执行入口与证据位置；自检失败=消费方计划 Step 0 阻塞。
>
> **抽象示例**：虚构 CLK-DIR 自检：advance(5) 后读数=5 且单调；注入计数命中一次 +1；自检 Run 保存在 assets 自己的 reports/。
>
> **完成条件**：每个 §2 契约条款有对应自检项；Verified 可追到自检 Run。

#### 5.1 自检 · ⟨CHK-ID⟩

**自检项**：`npm run build`；`npm test`；`python3 tests/contract/validate_v03_contract.py`；`npm run check` 全绿。

**判定**：`CHK-LLM-01` mock 事件流与 usage 透传正确；`CHK-CLK-01` 时钟单调；`CHK-SCP-01`（opt-in）真实传输 sha256 一致；未 opt-in 时 `FAKE-SCP` 相关 Case 记 `BLOCKED` 而非 PASS。


## 6. 状态与版本

**资产版本**：`v0.1.0`（对应 system-design v0.12.0-draft.1 / 契约 `0.3.0-simplified.6`）。

**状态**：`FAKE-LLM`、`FAKE-CLOCK`、`SEEDS` = `Verified`；`FAKE-MATRIX`、`FAKE-SCP` = `Verified`（opt-in 外部依赖）。


## 7. 未决项

> **本节目的**：未决项有主、有期限。
>
> **必须写清楚**：逐条登记（含 §3 移交设计侧的缺口跟踪）；无未决项时写经核对的“无”。
>
> **抽象示例**：虚构（无未决项，经核对）。
>
> **完成条件**：未决项全部有主有期限。

#### 7.1 未决 · ⟨条目；无未决项时写经核对的“无”⟩

- `G-ASSET-001`：受控时钟尚未独立成资产（当前依赖可注入时钟）；落地后补 `FAKE-CLOCK` 自检。

