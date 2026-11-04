---
name: ut-denominator
description: 从实现代码 AST 枚举 UT 分母——每个函数的参数、分支路径、throw、状态写、资源操作逐条登记成机器权威表，并据此派生 Case 清单。当用户要求"枚举函数/分支""建分母表""按分支表补 Case"时使用。
---

# UT 分母枚举（代码 → 分支路径表 → Case 清单）

## 为什么存在

STD `docs/test-standard.md` §4 把 UT 分母写死为「ISD 受辖函数＝实现侧函数与方法全集（含私有成员）」，
并要求可 AST 枚举。**分母不许从已写的 Case 反推**——那是循环论证（少登记就少义务）。
本技能把「代码里到底有多少条路径」变成可复算的机器权威表，Case 清单从表派生，不是从记忆挑选。

## 步骤（顺序不可倒）

1. **枚举**：在项目根运行
   ```bash
   node scripts/enumerate-ut-denominator.mjs \
     --md docs/70_verification/unit/ut-denominator.md \
     --json /tmp/ut-denominator.json
   ```
   脚本用 vendored 的 TypeScript 编译器 API 解析 `src/`（不含 `*.test.ts`），逐单元登记：
   参数数、**全部内部分支点**（if/else、三元、switch case、循环、catch、`&&||??.`、取反——
   每行带行号与条件原文）、throw/reject 数、`this.*`/db 状态写数、fs/子进程/定时器/env 资源操作数。
   嵌套闭包计入本单元；嵌套类成员算独立单元。

2. **对账**：把表与 `unit-test-scheme.md` §1.1/§5.2/§6.1 对账并如实登记差集：
   - 表内符号数 vs 方案「受辖符号」数（当前 241 vs 131——差集是缺口，不是噪声）
   - 每条已登记 Case 的「维度坐标」必须能指到表内某行的一个分支路径；指不到的按虚标记
   - 差集写进方案 §7.1 的 Gap（有 Owner、有恢复条件），不许静默缩小分母

3. **派生 Case**：按表的「公式格数」列逐行展开——每参数×必测类（合法/边界/非法）、
   每个 throw 的 typed 错误格、每个状态写/资源操作对应的状态分支与释放格。
   一格一条 Case（STD「一格一 Case」）；Case 的责任摘要写明指向表内哪一行哪个分支。
   派生脚本同时产出**机器可读 Case 索引** `docs/70_verification/unit/case-index.json`
   （全层逐条一行，含四方对账字段 design/script/report/scheme 与汇总计数；STD `test-standard` §5
   大分量层义务，`validate-coverage` 查 `total` 与登记数一致）——计划前检与四方对账按它复算，不手数表格。

4. **复跑门**：`python3 /Users/ben/work/STD/scripts/validate-coverage --project-root .`
   与 `npm run check:checklist`；门报的缺口与第 2 步登记的差集必须一致，不一致先修文档。

## 红线

- 表是**生成物**：不许手改 `ut-denominator.md`；要改口径就改脚本再重跑。
- 分支计数是**保守下界**（不展开 `&&` 链的全部 2^n 组合、不展开默认参数与可选链的隐式分支）；
  写 Case 时按语义路径展开，只许比表多、不许比表少。
- 覆盖率（`@vitest/coverage-v8`，`npx vitest run --coverage`）是**事后证据**，
  不能替代本表作为分母——它只证明登记的格被走到，不证明没登记的格不存在。
