<!-- STD_DOCUMENT_COVER_BEGIN -->
# Piko direct-oMLX debug report — 2026-09-18

> STD 使用入口：[项目采用说明与标准导航](../../../README.md#std-entry)

| 文档字段 | 值 |
|---|---|
| Document ID | `piko-direct-omlx-debug-20260918` |
| Document Version | `0.1.0` |
| Status | `Approved` |
| Project | `piko` |
| Authority | `piko` |
| Document Owner | corezilla |
| Authors | corezilla, opencode |
| Reviewer | User / Piko Project Owner |
| Approver | User / Piko Project Owner |
| Approval Date | `2026-09-21` |
| Created Date | `2026-09-18` |
| Last Modified Date | `2026-09-21` |
| Template ID | `assurance.test-report` |
| Template Version | `0.1.1` |
| Template Conformance | `legacy-mapped` |
| Tailoring Reference | none |
| Migration Map Reference | docs/98_migration/piko-std-migration-map.md |
| Repository | `corezilla/piko` |
| Canonical Path | `tests/integration/reports/piko-direct-omlx-debug-20260918.md` |
| Supersedes | none |

> Reviewer、Approver、Approval Date 和 Release Tag 在进入相应状态时填写。Git commit/tag 是
> 外部不可变证据；不要在文档内容中伪造包含自身的 commit hash。
<!-- STD_DOCUMENT_COVER_END -->

## Scope

- Piko connects directly to the local oMLX OpenAI-compatible endpoint at loopback.
- Configured model: `Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed`.
- Matrix is disabled. Matrix-dependent code and persistence oracles were exercised locally, but end-to-end Matrix transport oracles remain `PARTIAL`.
- LLMTier is intentionally stopped and is not credited by this report.
- `PASS` means the current implementation has executable static/unit evidence or a recorded local direct-oMLX run for the complete oracle in this scope. `PARTIAL` is not a pass.

## Summary

| Status | Count |
|---|---:|
| PASS | 34 |
| PARTIAL | 6 |
| NOT_RUN | 0 |

## Test status

| ID | Status | Evidence / remaining work |
|---|---|---|
| PK-T01 | PASS | Contract validator fixes the four HTTP paths. |
| PK-T02 | PASS | Schema scan plus live rejection of an external `model` selector with HTTP 400. |
| PK-T03 | PASS | Unit tests plus live repeat returning the original Run and changed definition returning `TaskConflict` 409. |
| PK-T04 | PASS | Live running cancellation returned 202 `StopRequested`, exposed `Cancelling`, then reached `Cancelled`. |
| PK-T05 | PASS | Forced process death during Responses streaming preserved attempt 1 as unknown and created a separately numbered durable Harness attempt 2; provider retry remains zero. |
| PK-T06 | PASS | A dedicated `replay=never` profile was process-killed after `effect_pending`; restart did not replay the edit and failed `UnsafeRetryBlocked`/`ExecutionUnknown` with an Unknown ToolCall (`run-5e0f0f6e-e0c2-431c-adfd-8ba622fd5996`). |
| PK-T07 | PASS | Provider-effect, completed-initial-operation, safe edit-effect, and never-replay unknown-effect restart recovery passed; session/lease and deterministic operation probes are executable, while unverifiable effects fail explicitly. |
| PK-T08 | PASS | Live BudgetExceeded output and a worker exception-path regression test both publish existing hashed outputs with `partial=true`, failure, known actions, and usage. |
| PK-T09 | PASS | Result Schema rejects Completed with non-null failure. |
| PK-T10 | PASS | Attempt-key overwrite/dedup tests, aggregate tests, and the raw provider-usage hook prove one record per Pi attempt; missing values remain null rather than lower bounds. |
| PK-T11 | PARTIAL | Native Matrix text/reply/media routing and idle-room no-Run behavior are implemented and persistence-tested; no live Matrix identity/room is configured for transport acceptance. |
| PK-T12 | PASS | Direct-oMLX Memory proposal Run `run-71d12a70-ee61-42d9-8dda-1ee7674be8c7` created only a proposal; the Slinky authority file hash was unchanged. |
| PK-T13 | PASS | The pinned Pi Harness path, `Models.streamSimple`, `stream:true/store:false`, SSE fixture subset, zero provider retry, and absence of a non-streaming fallback are statically/integration verified; direct oMLX exercised the same Responses path. |
| PK-T14 | PASS | Contract scan rejects the removed legacy surfaces. |
| PK-T15 | PASS | Store singleton test plus live observation of one Running Run while the second stayed Queued. |
| PK-T16 | PASS | Two direct-oMLX Runs used distinct Pi JSONL sessions; each session contained its own unique marker and zero occurrences of the other Run's marker, and each returned independent usage. |
| PK-T17 | PARTIAL | Atomic event/turn/cursor batch commit, event dedup, and stable send transaction retry are covered by store/Matrix tests; live homeserver restart acceptance is unavailable. |
| PK-T18 | PARTIAL | Workspace/path authorization and symlink escape tests pass; Matrix code fails closed on membership, room, URL, MIME, declared/actual size, and staging-path checks, but live Matrix membership/media transport is unavailable. |
| PK-T19 | PASS | Forced-crash run completed successfully with all usage fields null, `quality=Unknown`, and `usage_observed_attempts=1`. |
| PK-T20 | PASS | Run `run-8eab302e-5254-4b26-a7ed-47b5df20ef00` was SIGKILLed after Pi durably committed `pi.result` while SQLite still held `Running` and no AgentResult. Restart completed the same Run with the same generation and one model attempt, without another oMLX call. |
| PK-T21 | PASS | Executable OpenAPI/error-catalog equality check passes. |
| PK-T22 | PASS | RelativePath static negatives plus lexical traversal and read/write symlink escape unit tests pass. |
| PK-T23 | PASS | Queued atomic cancel is unit-tested; running cancellation passed against oMLX. |
| PK-T24 | PASS | Stable `before_request` step IDs and pre-normalization raw usage are wired through Pi's simple-stream layer. Live Run `run-9a3c2f4d-a808-4752-a34b-83a9d28cfc51` reported exact raw arithmetic (847+4=851), preserved absent cache-write as null/Partial, and observed one of one attempts. Published Results remain immutable to late usage. |
| PK-T25 | PARTIAL | The single matrix-js-sdk path atomically advances cursor after durable turns, records self echoes without turns, deduplicates events, and reuses stable txn IDs; no live homeserver restart was available. |
| PK-T26 | PASS | Models-only preflight makes no Responses request, prompt-cache identity is disabled, and an opaque reasoning item is byte-structure-preserved alongside its tool output in the next Responses input. |
| PK-T27 | PASS | Unit tests and the forced-crash live run verify one missing attempt makes all six aggregate fields null and Unknown. |
| PK-T28 | PARTIAL | Pending/QueuedInPi/Consumed/Abandoned persistence, idempotent Closing recovery, and terminal intake guards are tested; a live Matrix-to-Harness crash injection is unavailable. |
| PK-T29 | PASS | Migration-map/current-history static checks pass. |
| PK-T30 | PASS | Integration recovery closes immediately after initial operation accept, reopens the same JSONL session, probes the operation, and completes with one typed user message and one provider call; no parallel Piko agent loop exists. |
| PK-T31 | PASS | Live expired-deadline test returned the existing cancelled Run for an old task ID, while a new task ID was rejected with 422. |
| PK-T32 | PASS | Unit test purges details and verifies the permanent Gone tombstone rejects reuse. |
| PK-T33 | PASS | Config/static tests and live missing/wrong bearer requests pass. |
| PK-T34 | PASS | Tool profile validation and safe/never store behavior tests pass. Piko now propagates the policy into Pi's `AgentHarnessTool.replay`; the workspace-write contract persists pre/post fingerprints and fails closed on ambiguous drift. |
| PK-T35 | PASS | `pi_session_id=run_id`, lane `main`, deterministic operation IDs, and probe-before-accept recovery are verified by the accept-boundary integration test and live result-commit recovery. |
| PK-T36 | PASS | Pi commit/manifest/hash/patch markers and durable step-ID integration test pass. |
| PK-T37 | PASS | Live tool-budget-zero and model-budget-one cases both fail with `BudgetExceeded`; logical tool budget CAS is unit-tested. |
| PK-T38 | PARTIAL | Initial discussion construction atomically supplies the typed task instruction plus one custom Piko discussion message without copying trigger text into the instruction; live Matrix accept-boundary recovery is unavailable. |
| PK-T39 | PASS | SQLite writer-order tests cover turn-before-close and close-before-turn races; Failed/Cancelled transitions abandon Pending/QueuedInPi turns, and Completed is rejected until Closing with no pending turns. |
| PK-T40 | PASS | Startup rejects missing, unknown, or inapplicable recovery bindings; usage semantic negatives, control-character/path negatives, and Failed-result `started_at` constraints are executable checks. |

## Direct-oMLX live evidence

| Scenario | Run | Result |
|---|---|---|
| Basic Responses | `run-2b8736b9-9712-4e0e-a7dd-4c87b0030a66` | Completed, complete usage |
| Read tool | `run-2fb1aa54-521d-48dc-bcb9-a8d924dbbec8` | Completed, one read tool call |
| Write and output collection | `run-184f109d-33e9-4dd4-bf6b-0cbb8b2192f3` | Completed, hashed output |
| Edit tool | `run-33f3dee2-aec5-4d66-a88d-bc9abde501e6` | Completed, file changed and hashed |
| Running cancellation | `run-cc2177ee-8778-4ba2-9c4c-d30f5453eebf` | Cancelled after `Cancelling` |
| Forced process crash | `run-cec355f5-29fa-44ab-8fc1-ceefae46b321` | Completed after durable attempt 2; attempt 1 and aggregate usage Unknown |
| Failed partial output | `run-1ad2697c-e687-4f42-b2fc-4fb0da163c9e` | Failed/BudgetExceeded with partial output |
| Tool budget | `run-7988459b-4240-4694-9f3b-a1f418b5a815` | Failed/BudgetExceeded, tool not executed |
| Model budget | `run-b5241bd0-b72f-47bb-8bae-6ed292d3cb65` | Failed/BudgetExceeded after first model/tool cycle |
| Scope denial | `run-7ff89736-81ff-403b-9645-641b29af2bd3` | Failed/ToolFailure, outside path not executed |
| Running deadline | `run-26394763-08d7-41d6-9c53-3c886514761c` | Failed/DeadlineExceeded |
| Recovery-aware write | `run-c989023e-5fa0-4ae6-9ef3-055fcaecfcf7` | Completed through direct oMLX with one write, hashed output, and complete usage |
| Session isolation A/B | `run-4624d239-5ad6-4be6-80f2-4f2d4f44bed8`, `run-649ab67f-b408-441c-a7ad-5d506304e1fc` | Separate session files, own marker present, cross marker absent |
| Result-commit crash | `run-8eab302e-5254-4b26-a7ed-47b5df20ef00` | Killed after Pi result/before Piko result; restart completed with one model attempt |
| Safe edit-effect crash | `run-2538e2e8-abdb-4685-a2b2-27661053f667` | Killed after durable recovery memo while file remained at pre-state; restart replayed once, completed, and kept logical tool count at one |
| Never-replay edit crash | `run-5e0f0f6e-e0c2-431c-adfd-8ba622fd5996` | Killed after effect intent; restart did not replay and failed closed with Unknown action |
| Memory proposal | `run-71d12a70-ee61-42d9-8dda-1ee7674be8c7` | Completed proposal only; Slinky authority hash unchanged |
| Raw usage through Pi | `run-9a3c2f4d-a808-4752-a34b-83a9d28cfc51` | Completed; input 847, output 4, total 851, one observed attempt; absent optional cache-write remained null |

## Defects found and corrected

1. File-backed SQLite startup did not create its parent directory.
2. Pi default prompt-cache identity fields violated the configured provider contract; Piko now sets `cacheRetention: "none"`.
3. A blocked tool budget could be misreported as Completed.
4. Usage aggregation could publish an invalid Partial lower bound when one durable attempt had no usage.
5. A blocked path/tool request could be misreported as Completed.
6. The system prompt exposed the absolute workspace path and did not require workspace-relative tool paths.
7. Provider preflight accepted a models list that did not contain the configured model.
8. Tool profiles declared safe replay only in Piko's ledger; the policy was not attached to Pi tools and `workspace-atomic-write` had no executable recovery behavior. Piko now uses Pi's durable invocation memo with pre/post fingerprints: an unapplied effect is replayed, an already-applied effect is acknowledged without repetition, and a divergent state fails closed.
9. The first recovery memo implementation included an edit's potentially large diff/patch. It now stores only fixed-size fingerprints and a bounded success receipt; a 2 MB-file unit test keeps the memo below 1 KB.
10. Worker fallback error handling could serialize an `Error.cause` object into `failure.cause_class`. Non-string causes now map to the legal `Internal` value.
11. Non-replay Pi recovery bypassed `after_tool`, so Piko could miss an unknown tool outcome. Recovery `tool_end` events now mark the logical call Unknown and fail with `UnsafeRetryBlocked`.
12. Initial discussion acceptance did not atomically include both the typed task instruction and custom discussion message. Initial operation construction now supplies both without copying the trigger body into the instruction.
13. Discussion Closing recovery could loop and failed terminal states could leave queued turns behind. Closing is now idempotent; terminal failures/cancellation mark remaining turns `Abandoned`; Completed requires Closing with no pending turn. The SQLite schema is version 2.
14. Matrix cursor advancement was separate from durable event/turn insertion. Each sync batch now commits dedup records, turns, and cursor atomically; failed preparation leaves the cursor unchanged.
15. The first raw-usage implementation attached the observer below Pi normalization but `streamSimple` dropped it while building base options. The observer is now forwarded end-to-end, covered at parser and simple-stream boundaries, and confirmed against live oMLX.
16. Worker exception finalization discarded files already produced before the failure. It now collects authorized outputs in the catch path and marks the Result partial; a regression test covers this path.

## Remaining gates

All 40 fixed PK-T01..PK-T40 oracles have now been exercised at least statically or locally. The six `PARTIAL` items are all Matrix end-to-end acceptance gaps (PK-T11/17/18/25/28/38) and require a configured test identity/room. LLMTier compatibility remains a separate deferred deployment gate by operator direction and is not needed for the direct-oMLX result above.
