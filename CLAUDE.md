<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **piko** (59689 symbols, 97642 relationships, 181 execution flows).

> Index stale? Run `node .gitnexus/run.cjs analyze --index-only` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? Bootstrap with `npx`, `bunx`, or `pnpm dlx` — e.g. `bunx gitnexus@latest analyze` (npm 11 npx crash; #1939).

## Always Do

- **MUST run impact before editing.** Use `impact({target: "symbolName", direction: "upstream"})` or `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`; report callers, processes, and risk. Never substitute grep for graph analysis.
- **MUST analyze graph changes before committing.** Use `detect_changes({scope: "all"})` (MCP) or `node .gitnexus/run.cjs detect-changes --scope all --repo .` (CLI fallback). `partial: true` or `truncated: true` is not a clean check — a zero means unseen, not unaffected; re-run it. For regression review: `detect_changes({scope: "compare", base_ref: "main"})` or `node .gitnexus/run.cjs detect-changes --scope compare --base-ref "main" --repo .`.
- MUST warn on HIGH/CRITICAL `risk` pre-edit; never use `riskSharedAxes` to waive a HIGH/CRITICAL `risk` warning. Compare File/symbol: MCP File omits axes; Graph-RAG expands File.
- **MUST treat `risk: UNKNOWN` as unresolved, not as low.** An empty caller set is not evidence the symbol is unused — it can also mean the callers are not resolvable by the index (plain-object property access, dynamic dispatch, cross-language calls). `impact` pairs `UNKNOWN` with a `riskNote` saying so. Confirm with a text search before treating the symbol as safe to change or delete; do not proceed on the strength of a zero.
- **MUST use `query({search_query: "concept"})` for concepts/flows, `context({name: "symbolName"})` for a named symbol, or `impact` for blast radius, on read-only callers, dependencies, imports, or execution flow.** Graph first; text search only for empty/`UNKNOWN`/literals.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method before MCP/CLI impact analysis.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis, and never read `UNKNOWN` as an all-clear — it means the walk could not answer, which is the one verdict that requires confirming by other means.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit before MCP/CLI graph change analysis.

## Resources

| Resource | Use for |
| --- | --- |
| `gitnexus://repo/piko/context` | Codebase overview, check index freshness |
| `gitnexus://repo/piko/clusters` | All functional areas |
| `gitnexus://repo/piko/processes` | All execution flows |
| `gitnexus://repo/piko/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
| --- | --- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

# STD 强制链（看到就要照做）

**本项目所有文档工作（`docs/` 下的一切）必须走这条链。**

1. **看到封面 → 读 STD 编写索引**：`/Users/ben/work/STD/docs/authoring-index.md`。
   **不需要通读 STD 详细规范**——索引已按文档族摘出硬性义务并注明出处，照做即可。
2. **读到即照做。** 与用哪个 agent、哪个模型、agent 怎么想**都无关**。
3. **按模版的编写建议与 `example` 示例写。**
4. **checklist 一定执行**，逐项填结果。
5. **checklist 结果必须提交**：`docs/70_verification/<layer>/checklist-result-<id>.json` ＋ 文档内填写。
   **没交结果 = 任务没完成。**

## 本项目的具体数字（别自己猜，跑门）

| 层 | 方案 | 受辖符号 | UT 分母下界（×1.5） | 实际 Case | 状态 |
|---|---|---|---|---|---|
| 单元 | `unit-test-scheme.md` | 136（AST 枚举全集 241，见 `ut-denominator.md`） | 204（粗粒度）/ **3,117**（逐站点） | 152＋分卷 3,208＝**3,360** | 粗粒度达标；分卷全部待实现 |

三层方案各自的**维度格**分母（每格一条 Case；数字取自各方案 §5.2.1，与覆盖门一致）：

| 层 | 方案 | 义务格 | 已登记格 | 缺口 |
|---|---|---|---|---|
| 单元 | `unit-test-scheme.md` | 25 | 25（100%；粗粒度 16＋分卷 3,208 条全部待实现） | 脚本 → `G-EXEC-UT-3` |
| 模块 | `module-test-scheme.md` | 26 | 7 | 19 → `G-MT-DIM-1` |
| 系统 | `system-test-scheme.md` | 35 | 18 | 17 → `G-ST-DIM-1` |

**"每函数一条不算闭合"**（STD `templates/review/unit-test-review-checklist.md` §5）：
每函数 × 参数必测类（合法/边界/非法）+ 错误路径 + 资源释放，逐格一 Case。

**Case 与脚本不是一回事**：登记的 Case 若在 `tests/` 里找不到自己的入口，就是占位。
单元层粗粒度 152 条中只有 45 条带 Case ID，分卷 3,208 条全部待建（`G-EXEC-UT-3`），模块层 47 条中 10 条（`G-EXEC-MT-1`），
系统层 21 条中 7 条（`G-EXEC-ST-1`）——四方对账（登记 ↔ 用例文档 ↔ 脚本 ↔ Run 报告）不成立。
四方对账的机器权威源是 `docs/70_verification/unit/case-index.json`（生成，勿手改；`draft.128` 起大分量层义务）。

```bash
python3 /Users/ben/work/STD/scripts/validate-coverage --project-root .   # 覆盖门
python3 /Users/ben/work/STD/scripts/validate-checklist --project-root .  # checklist 结果门
python3 /Users/ben/work/STD/scripts/validate-design --project-root . --baseline docs/std-validation-baseline.json
```
