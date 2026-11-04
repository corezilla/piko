# Agent Guidelines for Piko

> Loaded automatically by OpenCode / Codex-style agents at session start.

## 1. STD Authority (mandatory)

This project follows **STD** (`/Users/ben/work/STD/`) for all documents and templates.

- **STD version used by this project**: pinned in `docs/std.lock.json`. Do not silently follow STD updates.
- **Templates**: `/Users/ben/work/STD/templates/` (path-policy in `templates/path-policy.json`).
- **Source manifest**: `docs/std-source-manifest.json` (artifacts + SHA256). Use `/Users/ben/work/STD/scripts/verify-source-manifest` to re-check.
- **Validator**: `/Users/ben/work/STD/scripts/validate-design --project-root .` — run before claiming a doc is ready.
- **Generator**: `/Users/ben/work/STD/scripts/new-design` — use it for any new `.md` document; do not hand-author without STD cover.
- **编写索引（必读）**: `/Users/ben/work/STD/docs/authoring-index.md` — 写或改任何文档前先读它。
  它按文档族列出该读哪些规范、哪些硬性义务必须满足、哪些 checklist 一定执行、结果怎么交。
  **不需要通读 STD 详细规范**，但**每一条都必须遵守**——与用哪个 agent、哪个模型、agent 怎么想**都无关**。
- **覆盖门**: `/Users/ben/work/STD/scripts/validate-coverage --project-root .` — 三层方案都查：义务维度格未登记、或单元层 Case 数低于公式下界（131 受辖符号 × 1.5 = 197，现有 136）就报红。
  当前实况（2026-11-04，数字取自各方案 §5.2.1，与门一致）：

  | 层 | 义务格 | 已登记格 | 缺口 |
  |---|---|---|---|
  | 单元 | 25 | 9 | `G-UT-DIM-1` |
  | 模块 | 26 | 7 | `G-MT-DIM-1` |
  | 系统 | 35 | 18 | `G-ST-DIM-1` |

  **登记的 Case 不等于可执行的 Case**：单元层 136 条中只有 45 条在 `tests/` 里有自己的入口
  （`G-EXEC-UT-3`），模块层 47 条中 10 条（`G-EXEC-MT-1`），系统层 21 条中 7 条（`G-EXEC-ST-1`）。
  四方对账（登记 ↔ 用例文档 ↔ 脚本 ↔ Run 报告）目前**不成立**，按缺口登记，不要当作已覆盖。
- **checklist 结果门**: `/Users/ben/work/STD/scripts/validate-checklist --project-root .` — 校验 `*.checklist-result.json`。

## 2. Template Selection

Before writing a new `.md` document, look it up in
`/Users/ben/work/STD/docs/template-selection.md`. Map delivery type to template id:

| Delivery | Template |
|---|---|
| Test report (this session produced one) | `assurance.test-report` |
| Acceptance report | `assurance.acceptance-report` |
| Test specification | `assurance.test-specification` |
| System design | `design.system` |
| Subsystem design | `design.subsystem` |
| Module definition | `design.definition` |
| Implementation design | `design.implementation` |
| API / Schema / Event contract | `contracts.specification` |
| Interface control document | `interfaces.control` |
| ADR | `decisions.adr` |
| Review packet | `review.packet` |

Other mappings are in `template-selection.md`.

## 3. Mandatory Workflow for New Documents

1. **Pick the template** (see §2).
2. **Generate with `new-design`** to get the cover and metadata file populated:
   ```
   /Users/ben/work/STD/scripts/new-design \
     --project piko \
     --template <template-id> \
     --name <doc-id> \
     --project-root /Users/ben/work/piko \
     --owner corezilla \
     --author corezilla \
     --author opencode \
     --repository corezilla/piko \
     [--status draft|review|accepted|released] \
     [--supersedes <prev-doc-id>] \
     [--parent-document-id <parent-doc-id>] \
     [--domain ...] [--level ...]
   ```
3. **Fill the body sections** the generator left as empty placeholders. Never remove a section; mark as `n/a` with reason if not applicable.
4. **Update `Last Modified Date` and bump `Document Version`** when revising.
5. **Run `validate-design`** and resolve every issue before claiming ready.
6. **Commit with the metadata sidecar** (`*.metadata.json`) — never commit the doc without it.

## 4. STD Validation Rules to Remember

- Every document MUST have a STD cover (the standard `STD_DOCUMENT_COVER` BEGIN/END marker pair, see `/Users/ben/work/STD/templates/_shared/document-cover.md`) and a matching sidecar `*.metadata.json`.
- `template_sha256` in metadata must match the locked template file.
- `source_path` must equal the actual repo-relative path.
- `Supersedes` should reference the previous doc by `Document ID`, not by path.
- Reviewer / Approver / Approval Date fields are filled only at the matching state transition, not at creation.

## 5. Where Things Live in Piko

| Path | Purpose |
|---|---|
| `docs/00_management/` | `management.*-plan` templates |
| `docs/10_requirements/` | `requirements.*` |
| `docs/20_system_design/` | `design.system` |
| `docs/30_subsystem_design/` | `design.subsystem` |
| `docs/50_implementation_design/` | `design.implementation` (ISD) |
| `docs/60_interfaces/contracts/` | `contracts.specification` |
| `docs/70_verification/plans/` | `assurance.vv-plan`, `assurance.test-plan` |
| `docs/70_verification/specifications/` | `assurance.test-specification` |
| `docs/70_verification/reports/` | `assurance.test-report` |
| `docs/70_verification/acceptance/` | `assurance.acceptance-plan`, `assurance.acceptance-report` |
| `docs/80_operations/` | `operations.*` |
| `docs/91_reviews/` | `review.packet` |
| `interfaces/openapi/`, `interfaces/schemas/`, `interfaces/error-codes/` | Contract artifacts (separate from STD docs) |

## 6. Hard Rules

1. **Never** hand-author a STD document without going through `new-design`. The cover fields are validated; hand-written covers fail silently or noisily. Every STD document carries the standard cover marker pair (see `/Users/ben/work/STD/templates/_shared/document-cover.md`) plus a matching sidecar `*.metadata.json`.
2. **Never** bump `docs/std.lock.json` without an explicit upgrade review per STD §2.1 ("项目升级模板必须显式执行并评审 diff"). State the upgrade intent, list the diff, then change the lock.
3. **Never** fabricate Reviewer / Approver / Approval Date / Git commit hash inside a doc body. Those go in sidecar metadata or are filled when the doc actually reaches that state.
4. **Never** skip running `validate-design` before commit. Resolve every `[new]` issue or document why it is inherited from a pre-STD era.
5. **Never** skip the STD chain: read `docs/authoring-index.md` → obey its obligations → write per the template → run the template's review checklist → **submit the checklist result** (document + `*.checklist-result.json`). **"每函数一条" does not close the matrix** (STD `templates/review/unit-test-review-checklist.md` §5): every function × its parameter classes (valid/boundary/invalid) + error paths + resource release, one Case per cell.
6. **Never** report a document task as done without the checklist result submitted. An unchecked checklist writes `0`/`0`; a fabricated "all green" is worse than an empty field.

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
