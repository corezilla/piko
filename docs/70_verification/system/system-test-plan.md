<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko system-test-plan

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `system-test-plan` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode, corezilla |
| Created Date | `2026-10-03` |
| Last Modified Date | `2026-10-03` |
| Template ID | `tests.system-test-plan` |
| Template Version | `0.9.2` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/system/system-test-plan.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

<span style="color:#1f6feb"><em>**编写建议**：本模板是系统层测试的**可执行作业指令**，与 design.software-system（系统设计阶段）一一对应：执行者（含 Agent）按本计划从执行前检（§3）经逐 Case 作业（§4）到报告产出（§7）从头做到尾。计划只做索引与流程，不复制 Case、不预填执行结果。</em></span>

> **格式说明**：蓝色斜体为编写建议（指导如何填写，生成实例后保留）；灰色文字为虚构教学示例（以 `STD_TEMPLATE_EXAMPLE` 标记包裹，`new-design` 生成实例时自动剥离，不得当作项目事实或运行证据）；`<!-- TODO -->` 为待填槽位。颜色在 GitHub 等严格渲染器中降级为斜体/普通字，语义不变。

> 本计划绑定软件系统

> 本文档对设计验证项（VRC/V-xxx）的引用规则：只引用 ID 与状态，不复制定义/判据；ENV 实例编号归 tests.asset-design，本计划编排 ENV 编号与 Case 分配时若变更设计须回溯修订并记录。：父设计 Document ID 经 `--parent-document-id` 写入 metadata；系统设计基线在 §2 固定。

### 模板定位：方案、用例、计划与报告的边界

<span style="color:#1f6feb"><em>**编写建议**：本计划对应系统设计阶段。构成＝系统方案×1（tests.system-test-scheme）＋Case 文档×N＋子系统计划×N 引用＋验收交接（tailoring 承接）；执行产出为 tests.system-test-report；子系统层组织归 tests.subsystem-test-plan。</em></span>

- **权威分工**：Case 清单归 `tests.system-test-scheme`；单 Case 展开归 `tests.system-case`（一 Case 一文档）；本计划是**可执行作业指令**——执行者（含 Agent）按它从执行前检做到报告产出；执行结果与 Verdict 权威在 `tests.system-test-report` 与 Run 证据。
- **只索引**：构成表引用方案版本与 Case ID 范围，不复制清单或 Case 细节。
- **测试资产**：工具/夹具/替身/受控时钟的契约与自检在 `tests.asset-design`（一资产一文档，阶段共享）；本计划 §4 Step 0 使其就位。
- **不是授权书**：按用户当前授权交付；计划到期不改判任何事实状态。

### 计划条目状态语义

<span style="color:#1f6feb"><em>**编写建议**：计划条目只有下列三种状态；执行状态（NOT_RUN/BLOCKED/INVALID）与 Verdict（PASS/FAIL）只存在于测试报告与 Run 证据，混入计划即违例。</em></span>

| 条目状态 | 含义 | 禁止 |
|---|---|---|
| `Planned` | 已排入计划，方案与责任已定位 | 用 Planned 冒充已执行或已通过 |
| `Deferred` | 经批准裁剪或延后，有 tailoring 依据与恢复条件 | 无依据的“暂不做” |
| `Blocked` | 依赖缺失（设计缺口、环境、上游合同） | 不登记缺口就长期挂起 |

<span style="color:#1f6feb"><em>**完成条件**：任一条目能报出状态、依据与下一步；计划里没有任何执行结论。</em></span>

## 1. 目标、范围与测试构成

<span style="color:#1f6feb"><em>**本节目的**：固定系统层测试活动的范围与构成清单。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：验证对象与不证明什么；构成＝系统方案×1＋Case 文档×N＋子系统计划引用＋验收交接。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 EX-APP：方案 TSS-APP v1.0 ＋ Case 文档 ST-APP-001…005 ＋ 子系统计划 STP-DIR。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：读者（含 Agent）能说清验证对象、构成清单和排除项；每个构成项指向方案、Case 文档或具名缺口。</em></span>

| 构成层 | 文档 / 入口（Document ID 或缺口） | 覆盖责任摘要 | 条目状态 |
|---|---|---|---|
| <!-- 系统方案 ×1 --> | | | |
| <!-- Case 文档 ×N（按方案清单） --> | | | |
| <!-- 测试资产 ×N（tests.asset-design，需开发时为工作项） --> | | | |
| <!-- 相邻层交接出口 --> | | | |

## 2. 被测基线与变更重跑范围

<span style="color:#1f6feb"><em>**本节目的**：固定系统层基线与变更→重跑映射。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：设计文档与源码、依赖、构建环境版本；哪些变化触发哪些 Case 重跑；重跑生成新 Run 与新报告，不覆盖旧失败。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 EX-APP：基线 EX-APP/v1；流程语义变化→方案重裁＋全部 Case 重跑，子系统内部变化→本层回归。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：基线可核验；任一类变更能映射到明确重跑范围。</em></span>

- 设计 / 源码 / 依赖基线：<!-- TODO -->
- 变更 → 重跑范围规则：<!-- TODO -->

## 3. 执行前检（Go / No-Go）

<span style="color:#1f6feb"><em>**本节目的**：开始执行前逐项 Go/No-Go，全部通过才进入 §4。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：方案就绪度（清单无未登记缺口且版本固定）；Case 实现状态盘点（未 Implemented 的 Case 明确处理）；环境与工具（构建可用、依赖齐、权限具备）；构建接线（干净全量交付构建通过、消费者链接实际交付库、导出/注册项同步）；代码 review 通过（tests.code-review-checklist 全部必查项通过；BLOCKED 项不得进入测试）；测试资产/数据版本对齐（与设计 §13 可冻结资产清单对账）。任一不满足记 Blocked 并登记缺口，不静默降级执行。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 ST-APP：预生产环境排期确认、存储测试实例就位。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：每一前检项有可判定事实；No-Go 有出口（Blocked＋缺口）。</em></span>

> ENV 状态统一字段：§3「环境与工具」前检与 §4 Step 0 共享同一个"ENV 状态"变量——§3 判定 Go/No-Go 后 ENV 状态置为 Ready/Blocked；§4 Step 0 按消费方索引构建 ENV 实例并跑 self-check（assets 的 Verified）；§8 报告产出读取此 ENV 状态字段；不要在 §3 与 §4 重复定义同义词。

| 前检项 | 判定事实 | 通过条件 | 不满足时 |
|---|---|---|---|
| <!-- 方案就绪度 --> | | | |
| <!-- Case 实现状态盘点 --> | | | |
| <!-- 环境与工具（引用 tests.asset-design 的 Verified 状态） --> | | | |
| <!-- 构建接线（全量交付构建 / 消费者链接实际库） --> | | | |

## 4. 环境实例分配（plan 编排）

<span style="color:#1f6feb"><em>**本节目相**：把方案 §1.7 的环境类型落实为具体的**实例编号**，并分配给具体 Case——同一类型可多套（如多 docker 用于并行），编号与分配是 plan 的责任，Case 只引用编号。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：列出本计划分配的全部 ENV 实例（编号 + 类型 + 具体配置/位置 + Owner + 分配给哪些 Case + 准备时限 + 状态）；ENV 实例类型与方案 §1.7 类型一致；准备失败标 Blocked 并登记缺口，不静默换其他实例。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：见下方灰字——系统层 ENV 实例分配（同一类型多套用于并行/隔离，多 Case 复用同一实例）。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：每个 §3.1 的 Case 在本表有 ENV 实例；类型一致；准备未完成标 Blocked 并登记缺口，不静默换实例。</em></span>

| ENV 实例编号 | 环境类型 | 具体配置/位置 | Owner | 分配给哪些 Case | 准备时限 | 状态 |
|---|---|---|---|---|---|---|
| <!-- TODO：如 ENV-1、ENV-2 --> | <!-- 类型（引用方案 §1.7） --> | <!-- TODO --> | <!-- TODO --> | <!-- Case ID 范围 --> | <!-- TODO --> | <!-- Blocked/Ready --> |

## 5. 执行流程（逐 Case 作业序列）

<span style="color:#1f6feb"><em>**本节目的**：给执行者（含 Agent）一条从头到尾的作业序列。</em></span>

> 失败处理与收口（在本流程图内统一）：FAIL → 保留首个失败现场 + 保留 Run 证据 + 禁止重跑覆盖原始失败 → 登记缺陷并关联 Case ID；BLOCKED → 标记环境性阻塞 + 整个 §4 流程停止 + 登记缺口 + 不静默换工具链；INVALID → 标记该 Case 注入未命中 + 复现状态与修复状态分开记录 → 不允许仅靠"重跑通过"掩盖；NOT_RUN → 标记未执行 + 登记原因（不在 §3 清单中静默消失）。
<span style="color:#1f6feb"><em>**必须写清楚**：按方案清单优先级逐 Case：定位 Case 文档→按其 §2–§7 前检与运行→判定分路（PASS/FAIL/BLOCKED/INVALID 各有明确出口与下一步）→记录 Run→继续；失败不阻断后续 Case，除非环境性阻塞；全部完成后按 §7 生成报告；阶段门——最小真实链→规模控制面→完整业务→恢复/全量回归，不等所有模块写完才集成；Step 0 资产就位——按消费索引构建全部依赖测试资产（tests.asset-design）并运行其自检，自检不过即环境性 Blocked，不进入 Case 执行。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 ST-APP：启动/停止组先行；机制端到端随后；验收场景不在本层执行。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：执行者不需要临场发明流程；每个分路有确定下一步。</em></span>

| Step | 动作 | 输入 / 依据 | 产出 |
|---|---|---|---|
| <!-- 0 --> | 资产就位：按消费索引构建全部依赖测试资产并跑自检 | tests.asset-design 文档 | 就绪清单（Verified） |
| <!-- 1 --> | 读取方案清单并按优先级排序 | 方案 v__ | 执行队列 |
| <!-- 2 --> | 逐 Case：定位 Case 文档 | Case ID | 实施依据 |
| <!-- 3 --> | 按 Case 文档执行前检与运行 | Case 文档 §2–§7 | Run 记录 |
| <!-- 4 --> | 判定并分路（PASS/FAIL/BLOCKED/INVALID） | 断言与环境事实 | Verdict 归报告 |
| <!-- 5 --> | 全部完成后生成测试报告 | 本计划 §7 | tests.system-test-report |

| 阶段门 | 目的 | 进入条件 |
|---|---|---|
| <!-- 1 最小真实链 --> | | |
| <!-- 2 规模控制面 --> | | |
| <!-- 3 完整业务 --> | | |
| <!-- 4 恢复 / 全量回归 --> | | |

- 失败（FAIL）处理路径：<!-- TODO -->
- 阻塞/无效（BLOCKED/INVALID）处理路径：<!-- TODO -->

## 6. 环境操作（搭建 / 复位 / 隔离 / 清理）

<span style="color:#1f6feb"><em>**本节目的**：环境操作可复现。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：搭建、每 Case 复位、并行隔离键、清理的具体命令或入口；环境不可重建即 Blocked；单环境串行时写清 case 前检查、软复位/重启/驱动恢复阶梯与时限，失败后确认回到基线，不能只 kill 后继续。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 ST-APP：每轮重建系统实例与存储测试实例。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：另一位执行者能独立搭建、复位与清理。</em></span>

- 环境搭建与复位操作：<!-- TODO -->
- 隔离键与清理：<!-- TODO -->
- 复位阶梯与时限（软复位→重启→驱动恢复）：<!-- TODO -->

## 7. 证据与 Run 记录规则

<span style="color:#1f6feb"><em>**本节目的**：Run 证据规则固定。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：Run ID 命名（对象-时间或序号）、每次 Run 保存的命令/版本/stdout/退出码/种子、保存位置与保留期、脱敏要求；重跑生成新 Run 不覆盖。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 ST-APP：run-<日期>-<序号>。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：从报告任一 Verdict 能定位唯一 Run 与原始证据。</em></span>

- Run ID 规则与证据位置：<!-- TODO -->
- 保存内容与脱敏要求：<!-- TODO -->

## 8. 报告产出与 Gate 规则

<span style="color:#1f6feb"><em>**本节目的**：定义报告产出与 Gate 规则。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：全部 Case 走完后（或按出口准则提前结束）生成 `tests.system-test-report` 实例；Gate 建议规则（覆盖闭合或缺口有主、失败分级）在此固定，报告只按规则给建议不越权批准。> 失败降级路径：plan 整体 BLOCKED（环境性）→ 该轮不生成 report 实例，只记缺口与原因；plan 部分 Case 失败 → 仍生成 report（含 FAIL/INVALID 完整记录），后续报告生成失败（new-design 等）→ 不掩盖 FAIL，复现状态与修复状态分开记录。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：虚构 ST-APP：全部走完后生成报告；Gate＝分母闭合且 G-EX-3 有主。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：报告的生成时机、模板与 Gate 规则确定。</em></span>

- 报告生成时机与模板：<!-- TODO -->
- Gate 建议规则：<!-- TODO -->

## 9. 责任、排期与风险

<span style="color:#1f6feb"><em>**本节目的**：责任到人、风险有触发与缓解出口。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：方案维护、Case 编写、执行、评审的责任人与时间窗；风险写触发条件、影响与缓解，不写“重试即可”。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：设计＝系统 Owner、执行＝QA 或 Agent、评审＝系统设计评审。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：每个构成项有责任人与时间窗；关键风险有可判定触发。</em></span>

| 构成项 / 风险 | Owner | 时间窗 / 最晚 Gate | 冲突或缓解出口 |
|---|---|---|---|
| <!-- TODO --> | | | |

## 10. 未决项

<span style="color:#1f6feb"><em>**本节目的**：未决项有主、有期限、有关闭条件。</em></span>
<span style="color:#1f6feb"><em>**必须写清楚**：逐条登记；无未决项时写经核对的“无”。</em></span>
<span style="color:#1f6feb"><em>**抽象示例**：G-EX-3 真实生产环境不可得。</em></span>
<span style="color:#1f6feb"><em>**完成条件**：未决项全部有主有期限。</em></span>

| 未决项 / 关联 | Owner / 最晚 Gate | 关闭所需事实或决定 |
|---|---|---|
| <!-- TODO；无未决项时写经核对的“无” --> | | |

<!-- 交付自查：执行者能否只凭本计划从 Go/No-Go 走到报告产出；计划里是否出现任何执行结论或 Verdict；到期条目是否被偷偷改判？ -->
