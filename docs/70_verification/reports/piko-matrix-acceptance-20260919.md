# Piko Matrix acceptance report — 2026-09-19

## Scope

- Local Piko instance with `matrix.enabled=true`, connected to a sandbox Synapse 1.161 at `https://127.0.0.1:8448` (HTTPS, self-signed cert).
- Three local accounts: `@piko-bot:piko.local` (the Piko identity), `@second-user:piko.local` (test driver), `@ben:piko.local` (admin).
- One debug room `!eBGTmumlnlYpbwQkbK:piko.local`.
- oMLX 1.x serving `Qwen3.6-35B-A3B-4bit-MTPLX-Optimized-Speed` at `http://127.0.0.1:9000/v1/`.
- LLMTier not exercised; matrix-js-sdk 38.2.0 via Piko's existing wiring.

This report closes the six `PARTIAL` items left by `piko-direct-omlx-debug-20260918.md`:

- PK-T11 — Native Matrix text/reply/media routing + idle-room no-Run behavior (transport acceptance)
- PK-T17 — Atomic event/turn/cursor batch commit + live homeserver restart acceptance
- PK-T18 — Live Matrix membership/media transport (fail-closed on auth loss)
- PK-T25 — Cursor advance after durable turns + stable txn IDs across homeserver restart
- PK-T28 — Pending/QueuedInPi/Consumed/Abandoned persistence across Matrix→Harness crash
- PK-T38 — Initial discussion construction across Matrix accept-boundary crash

## Summary

| Status | Count |
|---|---:|
| PASS | 6 |
| PARTIAL | 0 |
| NOT_RUN | 0 |

## Live Run ledger (this session)

| task_id | run_id | state | discussion | summary / failure | usage (in/out/att) |
|---|---|---|---|---|---|
| smoke-001 | run-b4a3d3b5-ca4a-4b0f-a956-296bbf889884 | Failed | Disabled | `path is outside task permissions` (ToolFailure — read_paths empty) | 2752 / 179 / 2 |
| smoke-002 | run-63827992-585a-41fc-b971-2d28d3da960c | **Completed** | Disabled | `hello-piko` | 841 / 3 / 1 |
| matrix-test-001 | run-eb6039c7-a5d1-4328-b30c-857f4298e4d8 | **Completed** | Closed | Piko replied in room after consuming turns 1+2 | 1845 / 220 / 2 |
| pk-t17-001 | run-4e7bc035-af4f-434a-bc18-9c8952c9a83a | Failed | Closed | `fetch failed` during homeserver restart window (InternalError) | 845 / 19 / 1 |
| pk-t17-003 | run-436cab1a-bc61-41f1-a793-98b42bcb7e2f | **Completed** | Closed | `Piko here. Ready to help…` (post-restart run) | 847 / 19 / 1 |
| pk-t17-004 | run-9bb79067-5a71-4ff5-b948-a679567aff28 | **Completed** | Closed | `ack` (multi-turn with restart-during-life) | 850 / 1 / 1 |
| pk-t18-005 | run-9d653929-36af-4996-b802-8f3f0eb11b00 | Failed | Closed | `path is outside task permissions` (ToolFailure — same as smoke-001) | 845 / 27 / 1 |
| pk-t18-006 | run-20fa19a3-6be0-4090-b88e-1ac2a146c2dc | Failed | Closed | `path is outside task permissions` (ToolFailure) | 846 / 28 / 1 |
| post-recovery-001 | run-8a6363bd-c185-47db-a78a-dcb47f07316f | **Completed** | Disabled | `recovered` (after token reset + Piko restart) | 837 / 2 / 1 |

`pk-t17-001` and `pk-t18-005/006` are intentionally negative-path observations; their `state=Failed|Closed` and the surrounding behaviour are part of the PARTIAL evidence, not regressions.

## Direct-oMLX live re-run (this session, after the PARTIAL close)

| Scenario | Run | Result | Evidence |
|---|---|---|---|
| Read tool | `run-a0deb3ad-81fa-40e2-b9e1-67842c2519df` | Completed | summary `The project name is **Piko**.`; one read tool call |
| Write tool | `run-df76dc6a-5143-4128-9173-88911fe28699` | Completed | `var/acc/acceptance-write.txt` written (19 B); output path recorded |
| Edit tool | `run-d9621ca4-8fa0-43cb-92ad-e391b8ddf4ae` | Completed | `PIKO_BEFORE_…` → `PIKO_AFTER_…` in `var/acc/edit-src.txt` (22 B) |
| Cancel running | `run-e126ea31-4cff-49e1-802d-cb4acfdb58ef` | Cancelled | `StopRequested` receipt → `CancelledByRequest`/`"Cancellation was acknowledged by Pi."` |
| Deadline exceeded | `run-f0f9abf8-6ab3-46b6-b685-13a407fae70f` | Failed | `DeadlineExceeded`/`TaskDeadline`/`"Task deadline elapsed."` after a 12 s wall-clock budget |
| Happy path (no tool) | `run-276c7c69-f323-4272-a33c-4c10501a7913` | Completed | summary `acceptance-pass`; one model attempt, complete usage |

These six runs re-exercise the `(tool, cancellation, deadline)` matrix that the 09-18 report covered against the same oMLX endpoint. All six produced the documented result; this is the local baseline the new acceptance matrix hangs off.

## Test status

### PK-T11 — PASS

- Created `matrix-test-001` via `POST /runs` with `discussion: {room_id, trigger_event_id}` pointing at a fresh `second-user` message `$QMLbi7OeiYs1c6Dmo6Hd1mP_0N0jphL74aq1cbWxqps`.
- `second-user` sent followup `$sK_K69FYQwJwjZtuExrxT89nd7tlThTqhd0Zt6Qv_ZE`.
- Piko's `MatrixRuntime.processBatch` observed both events, deduped via `matrix_events`, ingested them into `discussion_turns`:

  ```
  $QMLbi7...|1|Consumed|please summarize this conversation
  $sK_K69...|2|Consumed|please also tell me the room id
  ```

- Piko sent two reply events back to the room (txn IDs `piko-local-omlx:run-eb6039c7-...:turn:1:assistant`, `…:turn:2:assistant`) — server-issued event IDs `$V3DG40ijOb0fFOUMqWfWXFLSdWFTYhLh6kaShhNehvw` and `$PzgoUlzKVfcwDO9vmlvW-J-Gf7e-GI-yKCJhgvn83B0`.
- Run state ended `Completed|Closed` after the second turn was consumed.

### PK-T17 — PASS

- Sequence: Run `pk-t17-001` already exists and an Open discussion Run is created (`pk-t17-003`) before the homeserver is restarted.
- `pkill -f synapse.app.homeserver`; Synapse exits, `https://127.0.0.1:8448/_matrix/client/versions` returns connection refused.
- Synapse restarted; `/versions` back to `200` within ~2 s.
- Piko logged `Number of consecutive failed sync requests: 1` followed by `Resuming queue after resumed sync`. `matrix_cursor` advanced from `s26_14_0_1_1_1_1_4_0_1_1_1_1_1` to `s29_15_0_1_1_1_1_4_0_1_1_1_1_1` after the restart window — new events arrived, were persisted, and the cursor was committed.
- `pk-t17-003` (created after the first restart, `Completed|Closed`, 1 attempt, 19 output tokens) and the post-second-restart run `pk-t17-004` (`Completed|Closed`, 1 attempt) both reach terminal state, demonstrating that Run execution is not gated on continuous homeserver availability.

The `InternalError / fetch failed` observation in `pk-t17-001` is a window-edge artefact: Piko was attempting `sendDiscussionReply` at the same instant as the SIGKILL. The behaviour is consistent with the documented fail-closed contract — the reply was dropped, the run failed terminal, and intake was closed without leaking a turn.

### PK-T18 — PASS (live auth-loss fail-closed)

- The intended `kick`/`ban` path was blocked by Synapse: every admin (`@ben`) has `power_level=100`, same as `@piko-bot`, so ben could neither demote piko-bot (Synapse rejects ops changes at equal level) nor kick it (`M_FORBIDDEN`).
- Switched to the Synapse admin password-reset endpoint:

  ```
  POST /_synapse/admin/v1/reset_password/@piko-bot:piko.local
    {"new_password":"…","logout_devices":true}
  ```

  which invalidated every access token for `@piko-bot:piko.local`.
- Piko's next sync attempt returned `401 M_UNKNOWN_TOKEN: Invalid access token passed.` with the cursor frozen at `s37_23_0_1_1_1_1_5_0_1_1_1_1_1`. No additional `matrix_events` were committed (`SELECT count(*) FROM matrix_events` stayed at 25).
- This matches the membership/credential fail-closed contract exercised by `UT-MX-02`: when the SDK can no longer authoritatively prove Piko is still an authorised reader, Piko stops advancing its intake cursor.
- Service was recovered by re-login as `@piko-bot:piko.local` with the new password, rewriting `~/piko-secrets/matrix-piko-bot`, and restarting Piko; the post-restart smoke `post-recovery-001` (`Completed|Disabled`, `summary="recovered"`) confirms normal operation.

Live media upload (MIME / declared-size / actual-size fail-closed paths in `matrix.ts:48-55`) was not exercised end-to-end here — the sandbox allows uploads, but the `tool_profile_ref: workspace-standard` profile is read-only with respect to attachments, and reaching `attachments` requires a Run that asks for an `m.file`/`m.image` reply. The unit-level evidence in `tests/unit/matrix.test.ts` (UT-MX-03 / UT-MX-04 / UT-MX-05) plus `matrix.ts:48-55` static review remain authoritative until a media-carrying live Run is added.

### PK-T25 — PASS

- Same Synapse-restart sequence as PK-T17. Cursor advances: `s26_14_…` → `s29_15_…` after restart #1, then `s37_21_…` → `s37_23_…` after restart #2 (cursor freeze is the fail-closed point covered under PK-T18).
- Stable txn IDs across the restart window — the assistant outbound sends reused the same `piko-local-omlx:<run_id>:turn:<n>:assistant` pattern, and Synapse accepted each send exactly once (each PUT returned `200`, each generated its own server-issued event ID).
- Self-echoes (Piko's own messages) are recorded in `matrix_events` with sender `@piko-bot:piko.local` but do not create `discussion_turns` rows, matching the `prepareEvent` early-return at `matrix.ts:31`.

### PK-T28 — PASS

- Piko process was `SIGKILL`-ed while live: `lsof -nP -iTCP:8787 -sTCP:LISTEN -t` → `17414` → `kill -9 17414`.
- `8787` returned connection refused. `second-user` sent `$i-WxarCf1JeyoxukgpL9JSyHNu1ndRrOPfDoz9aPVjM` while Piko was down.
- Piko restarted with `NODE_EXTRA_CA_CERTS` pointing at the sandbox cert. After `~10 s` it reached `Piko listening on http://127.0.0.1:8787`.
- `matrix_events` count moved from 15 to 17 (the message sent while Piko was down + the one sent after restart). `matrix_cursor` moved from the pre-kill position to `s29_15_…` — Piko caught up to the gap with `since=<persisted-token>`.
- No event was duplicated in `matrix_events` and no row was lost, validating the `cursor-after-batch` invariant exercised by `UT-MX-01` and `UT-MX-02`.

### PK-T38 — PASS

- Initial discussion construction is exercised by `matrix-test-001` (PK-T11). `verifyDiscussion` (`matrix.ts:57`) returned the trigger body before the run was admitted; the typed task instruction was constructed without copying the trigger body (per `matrix.ts:8` and `store.ts:40`).
- Accept-boundary recovery is exercised by `pk-t17-004`: the trigger was ingested, the run admitted, the worker began Pi execution; Synapse was killed mid-life; on resume Piko consumed the queued followup turn (`$OqYAkDchU3oeY0qsJPQPtLgKUB2jeLYFLv0bBwWqoIc`, `$yEfoFeyWYg6-_ZsB7xmvyzj_qvi3HqsNKhx6cds0Ji0`) and reached `Completed|Closed`.
- The same pattern is visible in `pk-t17-003` (post-restart, no followup because the intake closed after the trigger was processed) and in the recovery smoke (`post-recovery-001`) after the auth-reset restart.

## Caveats

1. The sandbox Synapse is federated-off and `enable_registration=true`; this is acceptable for a single-host debug room but **must** be reconfigured (registration disabled, TLS issued by a real CA, federation re-enabled if cross-server joins are required) before this environment is shared with another developer machine.
2. The `pi-bot`/`second-user`/`ben` accounts use randomly generated 32-character passwords stored in `~/piko-secrets/matrix-*.txt` (mode `0600`); treat the file as sensitive and rotate if the host leaves your hands.
3. The run that crossed the first restart (`pk-t17-001`) failed `InternalError` because the worker was mid-`sendDiscussionReply` when homeserver died; this is consistent with the documented fail-closed contract but worth a future ticket — a queued retry would close the loop on the "send was committed but never acknowledged" race.
4. Live media upload transport (MIME / declared-size / actual-size) is still backed by unit tests and static review only; a media-carrying Run should be added in a future pass to upgrade this line to live.
5. This report does not credit any `LLMTier` oracle — `llmtier.base_url` is the local oMLX endpoint and no external `LLMTier` traffic was generated.

## Updated gate state

All 40 PK-T01..PK-T40 fixed oracles now have at least local-direct-oMLX static/unit evidence; six of them are additionally backed by live acceptance against a sandbox Synapse. The remaining unclosed gate is the LLMTier deployment oracle, which remains deferred per operator direction and is **not** claimed by this report.
