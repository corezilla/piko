<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko Case UT-MATRIX-137

| 文档字段 | 值 |
|---|---|
| Document ID | `UT-MATRIX-137` |
| Document Version | `0.1.0-draft.2` |
| Status | `Draft` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | Piko QA |
| Authors | opencode |
| Created Date | `2026-11-05` |
| Last Modified Date | `2026-11-05` |
| Template ID | `tests.unit-case` |
| Template Version | `3.3.0` |
| Template Conformance | `native` |
| Std Conformance Total | 0 |
| Std Conformance Passed | 0 |
| Checklist Total | 0 |
| Checklist Conformed | 0 |
| Tailoring Reference | none |
| Migration Map Reference | none |
| Repository | `corezilla/piko` |
| Canonical Path | `docs/70_verification/unit/cases/UT-MATRIX-137.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
>
> Std Conformance Total / Std Conformance Passed：STD 文档编写规范（索引 §3）检查了几条、遵守了几条。
> Checklist Total / Checklist Conformed：本篇模板的评审清单执行了几项、遵守了几项。两者是不同的检查，未执行填 0。
<!-- STD_DOCUMENT_COVER_END -->
### 模板定位：方案、用例集与计划的边界

- **一 Case 一文档**：本文档只承载**一个** Case；七字段固定顺序（可写"不适用"，不可删字段）。
- **一 Case 一脚本**：配套脚本文件名＝Case ID；公共 fixture/替身/断言调用公共脚本，不在本文件复制。
- **测试脚本的唯一依据**：编码者按本文档写测试代码，不需要回读方案或设计正文猜测意图；段落锚点＝脚本名。
- **不预填结果**：本文档持有实现状态；执行状态与 Verdict 只在 Run 报告。

### 状态语义：实现状态

- **测试代码实现状态**：`Planned` / `Implemented`——唯一权威：本文档 §1 总账与 §4；禁止：计划中的测试函数冒充可执行入口。
- **执行状态**：`NOT_RUN` / `BLOCKED` / `INVALID`——唯一权威：Run 报告；禁止：在本文档预填执行或判定。
- **实际判定 Verdict**：`PASS` / `FAIL`——唯一权威：仅 Run 报告；禁止：在本文档预填 Actual 或 Verdict。

## 1. 集合概览与维度总账

绑定方案：`unit-test-scheme`；本 Case 的唯一登记位置：方案 §6.1 清单行／§6.1A 分卷 `MATRIX` 登记行。

#### 1.1 总账 · UT-MATRIX-137

对象函数：`prepareEvent`（`matrix.ts:29`，method/private）

维度格（方案 §2.3 行×格）：`状态分支` × `合法迁移`

实现状态：`Planned`

## 2. 公共前提与替身矩阵

#### 2.1 前提 · ENV-UNIT

版本 / 来源：`docs/70_verification/assets/asset-design.md`（ENV-UNIT 装配；替身 `FAKE-LLM`/`FAKE-MATRIX`/`FAKE-SCP`、受控时钟 `FAKE-CLK`、种子 `SEEDS` 同册——本 Case 只引用，不复述）

影响 Case：本 Case

## 3. 用例（固定段落块）

#### 3.1 UT-MATRIX-137 · 分支 L32 `event.getUnsigned()?.transaction_id`（?.；matrix.ts）

**责任 / 明确不测**：

验证 `prepareEvent`（`matrix.ts:29`）在 `状态分支` × `合法迁移` 这一格上的行为与设计声明一致（分支 L32 `event.getUnsigned()?.transaction_id`（?.；matrix.ts））；不测同符号其余格（兄弟 Case 承担）、不测模块整体行为（归 MT）。

**维度坐标（方案 §2.3 行×格）**：

`prepareEvent` × `状态分支` × `合法迁移`。

**输入构造**：

见 §3.1 步骤 1——取值全部写死或给生成规则（含边界常量时给出具体数），无隐含依赖。

**步骤与观察点**：

**步骤 1**——动作：构造使 matrix.ts:32 的分支（?.：`event.getUnsigned()?.transaction_id`）取真的输入：`令 `event.getUnsigned()` 为有效值（非 undefined／null）——可选链不短路`

观察点：该分支的取真侧被走到（由断言证明，不靠日志）

**步骤 2**——动作：调用 prepareEvent(…) 并断言该侧可观测结果（返回值/状态/副作用）与设计一致

观察点：断言通过

**步骤 3**——动作：构造使该分支取假的输入：`令 `event.getUnsigned()` 为 undefined／null——可选链短路，取 undefined`（无显式 else：取假即跳过该块，断言块内副作用不发生）

观察点：该分支的取假侧被走到（由断言证明）

**步骤 4**——动作：再次调用 prepareEvent(…) 并断言取假侧结果；两侧都必须被观测到

观察点：断言通过；失败含义＝该分支语义失真

**Oracle 与预期**：

以 `docs/40_module_design/piko-matrix-adapter-design.md` 与其 ISD（`docs/50_implementation_design/piko-matrix-adapter-impl.isd.md`）中 `prepareEvent` 所属条目的 `VRC` 为唯一权威；逐值判据来自规格/手算规则/冻结向量，不引用被测实现自证；本段只细化执行断言，冲突回溯设计修订。

**错误路径 / 清理**：

失败必须 typed 化且保真传播；内存 SQLite 与替身每例重置；临时密钥与 staging 用后删除且不触碰 `~/.ssh`。

**脚本 / 实现状态**：

`tests/unit/cases/UT-MATRIX-137.test.ts` · `Planned`

## 4. 集合状态汇总与缺口

- **实现状态**：`Planned`（与 §1 一致）
- **本 Case 承担的缺口清单（格＋Owner＋最晚关闭 Gate）**：脚本待建 → `G-EXEC-UT-3`（Piko QA，波次二排期内）
