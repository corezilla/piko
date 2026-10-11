<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Case ST-MX-001

> STD 使用入口：[项目采用说明与标准导航](../../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `ST-MX-001` |
| Document Version | `0.1.0-draft.1` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode |
| Created Date | `2026-10-11` |
| Last Modified Date | `2026-10-11` |
| Template ID | `tests.system-case` |
| Template Version | `2.4.15` |
| Template Conformance | `tailored` |
| Tailoring Reference | piko-std-tailoring-v0.1 |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/system/cases/ST-MX-001.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

> **编写建议**：本文档是单个系统测试 Case 的完整设计，一 Case 一文档，与 design.software-system 阶段的测试方案（tests.system-test-scheme）清单一一对应；测试脚本按本文档编写；LLM/智能体组件的输入构造、独立判据、统计口径与预算安全方法见 LLM 测试方法（见 `docs/std.lock.json` 所锁 STD 的 `docs/ai-guides/llm-testing.md`）。

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

- **测试代码实现状态**：`Planned` / `Implemented`——唯一权威：本文档 §7；禁止：计划中的测试函数冒充可执行入口。
- **执行状态**：`NOT_RUN` / `BLOCKED` / `INVALID`——唯一权威：Run 报告；禁止：在本文档预填执行或判定。
- **实际判定 Verdict**：`PASS` / `FAIL`——唯一权威：仅 Run 报告；禁止：在本文档预填 Actual 或 Verdict。

> **完成条件**：本 Case 能报出实现状态，且沿 Case ID 可追到方案清单行与 Run 报告。

## 1. Case 概述与责任

**Case ID**：`ST-MX-001`

**标题**：讨论事件进入 session 并可回发；membership 丢失→DiscussionAccessLost

**设计验证项 / 分类 / 优先级**：`VRC-ST-019` / `normal` / `P1`

**被测入口**：M002 `matrix-runtime` 的讨论摄入与回发；`src/store.ts` 的 `discussion_access_loss`

**来源**：`system-test-scheme` §6 对应清单行

**设计验证项**：`VRC-ST-019`

**维度坐标**：`E2E 业务流` × `本 Case：讨论事件进入 session 并可回发；membership 丢失→`DiscussionAccessLost``；本类型全维度格＝`受理`、`执行`、`终态`、`幂等重放`

**要测什么**：讨论事件进入 session 并可回发；membership 丢失→`DiscussionAccessLost`

**明确不测什么**：不测模块内部算法（归 `unit-test-scheme`）、不测模块组装细节（归 `module-test-scheme`）、不测本 Case 所属 `E2E 业务流` 之外的其他对象类型。

**失败含义**：本 Case 失败意味着「讨论事件进入 session 并可回发；membership 丢失→`DiscussionAccessLost`」这一系统级保证被破坏，对应系统设计条目不满足。

**要测什么**：讨论事件进入 session 并可回发；membership 丢失→DiscussionAccessLost

**明确不测什么**：不测模型质量、不测性能预算、不测非本 Case 列出的错误码路径

**失败含义**：本 Case 失败意味着「讨论事件进入 session 并可回发；membership 丢失→DiscussionAccessLost」这一系统级不变式被破坏，对应需求不满足

> **本节目的**：把方案清单里这行责任摘要展开成可实施的边界。
>
> **必须写清楚**：Case ID、来源 ID、设计验证项、分类与优先级引用方案清单行；要测什么、明确不测什么；本 Case 的失败意味着什么。
>
> **抽象示例**：虚构 ST-APP-002：停止清空。
>
> **完成条件**：读者不回读方案也知道本 Case 的责任与边界。

### 1.1 维度对账（本 Case 在对象类型全维度中的位置）

本 Case 命中的方案 §2.1 维度格以 `**` 标出；其余维度明确归属到兄弟 Case、不适用或本 Case 的其他断言。

| 维度 | 归属 | 说明 |
|---|---|---|
| `normal` | 本 Case 覆盖 | 见本 Case §4/§5 |
| `boundary` | 不适用 | 见本 Case §4/§5 |
| `negative` | 本 Case 覆盖：成员丢失 fail-closed | 见本 Case §4/§5 |
| `concurrency` | 不适用 | 见本 Case §4/§5 |
| `recovery` | 兄弟 Case（Matrix 重启由 `matrix-acceptance.test.ts` 覆盖） | 见本 Case §4/§5 |
| `security` | 不适用 | 见本 Case §4/§5 |


> **本节目的**：把方案 §2.1 所属对象类型的维度行搬进本 Case 逐格对账——单 Case 不覆盖全维度是正常的，但**每个维度必须有明确归属**；类型全维度归零由 Case 集合完成，缺口在清单留痕。
>
> **必须写清楚**：从方案 §2.1 对应类型行逐维度列表；每格四选一：本 Case 覆盖／兄弟 Case 覆盖（写 Case ID）／不适用（仅标 optional 的维度可勾，给理由）／缺口（登记方案 §6 并给 Owner）。发现 §2.1 未列且本对象真实存在的维度，加行标"补充"——补充维度由评审回灌方案 §2.1 与 STD。
>
> **抽象示例**：见下表灰字。
>
> **完成条件**：所属类型行每个维度归属明确、无空白格；"缺口"格与方案 §6 登记一一对应。

#### 1.1.1 对账 · 对象类型维度格

**必测/optional**：`E2E 业务流` 的必测格逐格对账；optional 类型（成本护栏/升级兼容）按 §7 裁决，不在本 Case 展开。

| 维度格 | 归属 | 说明 |
|---|---|---|
| `受理` | 本 Case | 讨论事件进入 session 并可回发；membership 丢失→`DiscussionAccessLost` |
| `执行` | 兄弟 Case `—` | 由同对象类型的兄弟 Case 承担 |
| `终态` | 兄弟 Case `—` | 由同对象类型的兄弟 Case 承担 |
| `幂等重放` | 兄弟 Case `—` | 由同对象类型的兄弟 Case 承担 |

## 2. 被测入口与前置

**入口**：M002 `matrix-runtime` 的讨论摄入与回发；`src/store.ts` 的 `discussion_access_loss`

**前置**：ENV-MATRIX 已就绪（Synapse + `matrix.enabled=true`）；harness token 齐备

**交互入口**：`POST /tasks`、`GET /tasks/{task_id}`、`GET /tasks/{task_id}/result`、`GET /diagnostics`（经公开 HTTP 面操作）

**黑盒边界**：布景只经公开入口与 operator 控制面；不直改 SQLite、不依赖进程内手段；替身与受控时钟引用 `tests.asset-design`

> **本节目的**：固定被测入口与前置状态。
>
> **必须写清楚**：被测入口完整声明；系统层黑盒纪律——布景只走公开入口/外部控制面，禁止以读内部状态、直改数据库或进程内手段布置场景；状态型初态必须经公开入口构造，不直改内部状态；fixture/向量引用其版本，不复制字节；替身/夹具/受控时钟等测试资产链接其 `tests.asset-design` 文档，契约以该文档为唯一 authority；难触发场景的合法路径是改变外部系统或编写外部模拟器资产，不是伸进被测内部。
>
> **抽象示例**：虚构 ST-APP-002：经公开入口构造在途请求。
>
> **完成条件**：另一位执行者能独立建立前置。

- ****被测入口声明与位置****：

- ****交互入口（适用时；浏览器控件 selector / CLI 命令与参数，含期望事件与可观察结果；无则写"不适用"）****：

```text
<真实公开入口签名>
```

- ****初态构造（经公开入口）****：

- ****环境类型 + ENV 实例编号（引用 tests.system-test-plan §4 分配）****：

- ****依赖的测试资产（tests.asset-design 文档）****：

- ****黑盒边界三清单（系统层红线）****：

## 3. 输入构造

**输入**：房间内一条事件；一次针对 Piko bot 的 kick

**约束**：讨论摄入为异步、有界（MECH-MATRIX）；成员关系丢失是 fail-closed 事实，不是可忽略告警

**规模 / 时间域**：单 task、最多一次重放；无并发负载；wall-clock 观测，不设性能预算判据

> **本节目的**：逐参数固定输入。
>
> **必须写清楚**：每个参数的类型、取值、构造方法; stream/time-domain mock 设置（流式/事件驱动/SSE 用例）：用例 §2 的 fake 须提供 advance(time_ms) / emit(event) / drain() 接口；测试代码 §4 用 advance 推进时间、用 emit 触发事件；用例 §5 用 drain() 后判断言 (避免 sleep 真实时钟)。；并发/负载/性能类 Case 另须给负载模型（并发数、到达率、持续时长、数据规模及其对应设计预算依据）、时序控制（固定交错种子或受控时钟，禁无种子随机时序）、判据分离（正确性判据与预算判据分列：交错/准入结果 vs 百分位、吞吐下限、错误率上限、资源预算——预算数字来自设计预算而非被测系统自证）与测量隔离（独占运行、预热、监控资产引用）；security 类给注入/敏感样本来源（资产引用＋冻结集）、逐样本期望拒绝或脱敏动作与零泄漏断言观察点，缺样本标 BLOCKED 不得跳过；recovery 类给故障构造入口（只走公开控制面，黑盒纪律）与恢复完成的分开判据（可观察状态 vs 修复证据）；以上均引用 scheme 对应家族行。；冻结值或生成规则；非法与边界值的取舍理由；规模（数量、分页、复杂度）与时间域（wall/CPU、观测开销）按目标预算写清。
>
> **抽象示例**：虚构 ST-APP-002：一个在途请求。
>
> **完成条件**：输入可复现，无隐含依赖。

- ****逐参数输入构造****：

- ****边界/非法取值及理由****：

- ****规模 / 时间域（数量、分页、复杂度、观测开销）****：

- ****并发/负载/性能类 Case 补充（适用时）****：

- ****security 类 Case 补充（适用时）****：

- ****recovery 类 Case 补充（适用时）****：

- ****大数据/批量输入（适用时）****：

## 4. 执行步骤与观察点

**步骤**：1. 在房间发言并等待摄入落库；2. 等待 Piko 回发到房间；3. kick Piko bot；4. 等待 `discussion_access_loss` 落库并观察该 task 不再被派发

**观察点**：步骤 1 后 `matrix_events` 有对应行；步骤 2 房间内出现 Piko 回复；步骤 4 后受影响 task 停留在非可派发状态

> **本节目的**：固定动作序列与观察点。
>
> **必须写清楚**：按序写动作与观察对象（公开返回、公开查询、权威记录、边界替身调用序）；替身调用序可断言但不证明真实协议。；执行超时与中断（单 Case 单线程超时（默认 30s，可调）+ 替身调用次数上限（默认 1000 次，超限视为 Invalid 而非 Pass）+ 观察点轮询间隔（默认 10ms，单点等待不超过 5s）；FAKE 注入未命中或超时视为该 Case 失败；Case 内中断不应改变被测全局状态、需用 RAII 风格恢复/或回滚到基线）。
>
> **抽象示例**：见下表灰字。
>
> **完成条件**：执行者不猜下一步。

#### 4.1 步骤 · ⟨n⟩

**动作**：`经公开入口做什么`

**观察点**：`期望的外部事实`

## 5. 独立 Oracle 与预期结果

**Oracle**：事件持久化 + 回发可见 + 成员丢失后不再派发（fail-closed）

**独立性**：判据来自 MECH-MATRIX 不变式与 VRC-ST-019，不读取 runtime 内部同步标志

> **本节目的**：固定独立 Oracle 与互斥预期。
>
> **必须写清楚**：Expected 由独立来源或可手算规则推导，不得调用被测实现复算；系统层断言只取外部可观察事实（协议结构/公开响应/权威存储记录），不得以进程内状态作 Oracle；输出互斥（成功/各错误分支无第三态）；允许误差或精确比较方法；数值/模型输出分项判据——reference 重复性、真实输入回放、整模型比较分别判定，误差门限来自目标算法要求而非统一常数；判据语义以设计验证项（VRC）为唯一权威，本文细化为可执行断言但不改写，冲突回溯设计修订。真实模型输出非确定时按系统测试指南（见 `docs/std.lock.json` 所锁 STD 的 `docs/ai-guides/system-testing.md`）的 Oracle 分层：L1 协议结构必断言，L2 统计/约束给口径，L3 语义评判器为最后手段。

> 同一 Case 不混多个负向条件或异常分支；每个条件/分支独立 Case（独立判定、独立复跑、独立 Run 记录）。需验证多条件同时非法的优先级时用专属 Case。
> **抽象示例**：虚构 ST-APP-002：按停止规则人工判定。
>
> **完成条件**：预期独立且互斥，可判定。

- ****独立 Oracle 来源与推导****：

- ****互斥预期（成功 / 各错误分支）****：

- ****断言的数据项（呈现类断言时必填；引用方案 §6.2 数据项 ID 与来源契约字段 ID，禁止字段名模糊匹配）****：

- ****呈现类 Case 补充（适用时）****：

## 6. 错误路径、副作用与清理

**错误路径**：同步失败按永久/暂时错误分流；永久错误必须停止 client 而非无限重试

**清理**：Case 结束时恢复 bot 的房间成员关系（invite + join），避免污染后续套件

> **本节目的**：固定错误路径、副作用与清理。
>
> **必须写清楚**：每个错误出口的触发与表现；副作用断言（输入不变、无半成品、资源释放）；清理与失败现场保留。
>
> **抽象示例**：虚构 ST-APP-002：迟到完成不复活。
>
> **完成条件**：失败可观察、清理可确认。

- ****错误出口与表现****：

- ****副作用断言与清理****：

## 7. 自动化位置与状态

> **本节目的**：固定自动化位置与实现状态。
>
> **必须写清楚**：测试文件（`tests/system/cases/ST-⟨对象⟩-⟨NNN⟩.py`，文件名＝Case ID＋语言后缀，与本文档 Document ID 同 stem）与测试函数名（描述性）；被本系统 Case 复用的辅助函数放可执行 cases 树的 `tests/system/cases/support/`（跨模块工具走 `tests/common/`）；单 Case 执行命令；实现状态 Planned/Implemented；执行与 Verdict 归 Run 报告。
>
> **抽象示例**：虚构 ST-APP-002：stop_drains_inflight。
>
> **完成条件**：可从本文档定位测试代码与命令。


**脚本**：`tests/integration/matrix-discussion-live.test.ts`
**实现状态**：`Implemented`

- ****测试文件 / 测试函数****：

- ****单 Case 执行命令****：

- ****实现状态****：

> **交付自查**：编码者能否只凭本文档写出测试脚本；预期是否独立推导（不调用被测实现复算）；失败出口与清理是否可观察？
