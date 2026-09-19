# Agent Guidelines for Piko

> Loaded automatically by OpenCode / Codex-style agents at session start.

## 1. STD Authority (mandatory)

This project follows **STD** (`/Users/ben/work/STD/`) for all documents and templates.

- **STD version used by this project**: pinned in `docs/std.lock.json`. Do not silently follow STD updates.
- **Templates**: `/Users/ben/work/STD/templates/` (path-policy in `templates/path-policy.json`).
- **Source manifest**: `docs/std-source-manifest.json` (artifacts + SHA256). Use `/Users/ben/work/STD/scripts/verify-source-manifest` to re-check.
- **Validator**: `/Users/ben/work/STD/scripts/validate-design --project-root .` — run before claiming a doc is ready.
- **Generator**: `/Users/ben/work/STD/scripts/new-design` — use it for any new `.md` document; do not hand-author without STD cover.

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

- Every document MUST have a STD cover (`<!-- STD_DOCUMENT_COVER_BEGIN -->` ... `<!-- STD_DOCUMENT_COVER_END -->`) and a matching sidecar `*.metadata.json`.
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

1. **Never** hand-author a STD document without going through `new-design`. The cover fields are validated; hand-written covers fail silently or noisily.
2. **Never** bump `docs/std.lock.json` without an explicit upgrade review per STD §2.1 ("项目升级模板必须显式执行并评审 diff"). State the upgrade intent, list the diff, then change the lock.
3. **Never** fabricate Reviewer / Approver / Approval Date / Git commit hash inside a doc body. Those go in sidecar metadata or are filled when the doc actually reaches that state.
4. **Never** skip running `validate-design` before commit. Resolve every `[new]` issue or document why it is inherited from a pre-STD era.
