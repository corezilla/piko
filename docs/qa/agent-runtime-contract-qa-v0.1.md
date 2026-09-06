# Piko Agent Runtime Contract QA

Version: v0.1
Status: Open
Date: 2026-09-06

This is a Piko-owned, versioned QA record. Slinky reviews it read-only through an
explicit path. It is not a jointly edited shared QA list and does not freeze any
contract decision.

| ID | Topic | Current candidate / provisional assumption | Impact while open | Owner / next action | Status |
|---|---|---|---|---|---|
| QA-001 | Degraded admission | Permit only when `accepting_runs=true` and every exact requested scope is current and Ready; expose `degraded_scopes` and `admission_blockers` | Blocks final readiness Schema, not architecture drafting | Slinky review D1; escalate to user if disputed | Open |
| QA-002 | Terminal Result | Every externally visible terminal Run has strict Result; trusted runtime synthesizes failure Result | Blocks final Run/Result Schema | Slinky review D2 | Open |
| QA-003 | Unknown side effects after malformed output | Use `UnknownOutcome`, not `Failed`, whenever an execution side effect remains unresolved | Does not block architecture; affects conditional validation | Slinky confirm | Open |
| QA-004 | Error/blocker catalog | Separate API errors, terminal execution errors and planning blockers; remove `SlotVersionMismatch` alias | Blocks final code/HTTP mapping | Slinky review D3 | Open |
| QA-005 | UnknownOutcome convergence | Append immutable Result version; current ref advances; historical version remains queryable | Blocks historical Result API freeze | Slinky review D4 | Open |
| QA-006 | JSON canonicalization | RFC 8785 JCS + UTF-8; self digest field excluded | Blocks interoperable digest fixtures | Slinky provide/approve vectors | Open |
| QA-007 | SSE retention expiry | Return `410 EventHistoryExpired` with retention floor and current Run recovery refs | Blocks SSE negative fixtures | Slinky review D5 | Open |
| QA-008 | Descriptor ownership | Piko drafts envelope; Slinky supplies/approves minimum descriptors for owned references | Does not block envelope draft; blocks execution validation | Slinky provide or assign ownership | Open |
| QA-009 | Pi SDK contract | Package, pinned version and whether Pi requires Responses or Chat Completions are not selected | Does not block external API draft; blocks runtime adapter | Piko research after boundary review | Open |
| QA-010 | Tier credential/test material | No machine-readable credential-binding contract, endpoint or sanitized fixture is delivered | Does not block design; blocks integration evidence | Slinky/Tier provide fixture | Open |
| QA-011 | Retention durations | Event, idempotency, Result and audit retention periods remain deployment-policy parameters | Does not block append-only model | Cross-project review, then user if needed | Open |
| QA-012 | SLO benchmark profile | Payload, concurrency, store, host and cold/warm conditions are not frozen | Does not block functional draft; blocks performance claim | Slinky supply acceptance profile | Open |
| QA-013 | Shared-write team policy | Schema for explicit shared-write contract and serialization is missing | Single and isolated-team drafting continues; shared-write admission blocked | Slinky descriptor or explicit non-goal | Open |
| QA-014 | Result history endpoint | Candidate is `GET /runs/{id}/results/{result_version}` | Does not block current Result read | Slinky review | Open |
| QA-015 | Liveness authentication | OpenAPI v0.1 provisionally leaves liveness unauthenticated and all other endpoints authenticated; §8.2 says every request carries auth headers | Does not block architecture; blocks final security contract | Slinky confirm public-vs-authenticated liveness | Open |
| QA-016 | Planning blocker terminal status | A blocker discovered after acceptance provisionally produces `Failed` when all effects are known, otherwise `UnknownOutcome` | Does not block drafting; blocks Result fixture | Slinky review catalog mapping | Open |

## Decision rule

- Continue drafting when an open item has an explicit safe provisional assumption
  and cannot broaden authority, permission, resource use or side effects.
- Fail closed and send `NEEDS_INFO` when an item affects authorization, exact
  identity/version, irreversible side effects, a second path, or outcome truth.
- Record an unresolved cross-project disagreement here with both positions and a
  concrete user decision question. Do not conceal it in implementation defaults.
