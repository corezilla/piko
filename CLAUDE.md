<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **piko** (29109 symbols, 84850 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/piko/context` | Codebase overview, check index freshness |
| `gitnexus://repo/piko/clusters` | All functional areas |
| `gitnexus://repo/piko/processes` | All execution flows |
| `gitnexus://repo/piko/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

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
| 单元 | `docs/70_verification/unit/unit-test-scheme.md` | 131（含 104 私有成员） | **197** | 136 | **不达标** → `G-UT-DENOM-1` |
| 单元（维度格） | 同上 | 义务 24 格 | — | 已覆盖 **9** 格 | **不达标** → `G-UT-DIM-1` |

```bash
python3 /Users/ben/work/STD/scripts/validate-coverage --project-root .   # 覆盖门
python3 /Users/ben/work/STD/scripts/validate-checklist --project-root .  # checklist 结果门
python3 /Users/ben/work/STD/scripts/validate-design --project-root . --baseline docs/std-validation-baseline.json
```

**"每函数一条不算闭合"**（STD `templates/review/unit-test-review-checklist.md` §5）：
每函数 × 参数必测类（合法/边界/非法）+ 错误路径 + 资源释放，逐格一 Case。

