/**
 * ST-MX-001 — Matrix discussion end to end (gap `G-MATRIX-001`).
 *
 * The transport/restart/auth acceptance cases already live in
 * matrix-acceptance.test.ts; what was missing is the *discussion flow*:
 *
 *   C1 normal  — a room event reaches the Piko session store and Piko
 *                republishes into the room; the intake state is visible.
 *   C2 negative— losing room membership is fail-closed:
 *                `discussion_intake_state` becomes `DiscussionAccessLost`
 *                and a later intake cannot silently proceed.
 *
 * Live/opt-in — requires Synapse + a Piko with matrix.enabled=true:
 *   SCENARIO_E2E=1 npx vitest run --config vitest.live.config.ts \
 *     tests/integration/matrix-discussion-live.test.ts
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import * as H from "../common/scenario-harness.js";

const matrixReady = H.LIVE && process.env.SCENARIO_MATRIX !== "0" && H.matrixReachableSync() && !!H.loadMatrixTokens().roomId;
const d = matrixReady ? describe : describe.skip;

d("ST-MX-001 discussion events enter the session and membership loss fails closed", () => {
  beforeAll(() => {
    vi.setConfig({ testTimeout: 180_000, hookTimeout: 180_000 });
  });

  it("C1 normal: a sent event is ingested and Piko republishes into the room", async () => {
    const tokens = H.loadMatrixTokens();
    const room = tokens.roomId;
    const marker = `st-mx-001-${Date.now()}`;

    const sent = await H.matrixSend(tokens.ben, room, `discussion probe ${marker}`);

    // The event is durably ingested by Piko (not merely echoed by Synapse).
    const ingested = await H.waitMatrixEventIngested(sent, 60_000);
    expect(ingested).toBeGreaterThanOrEqual(1);

    // Piko republishes into the same room: its own reply becomes visible.
    const replies = await H.waitMatrixReply(room, tokens.pikoBot, marker, 120_000);
    const botMxid = await H.matrixWhoAmI(tokens.pikoBot);
    expect(replies.length).toBeGreaterThan(0);
    expect(replies.every((e) => e.sender === botMxid)).toBe(true);
  });

  it("C2 negative: losing room membership is recorded as DiscussionAccessLost, not silently ignored", async () => {
    const tokens = H.loadMatrixTokens();
    const room = tokens.roomId;

    // A task bound to this discussion must exist for access loss to be
    // attributable. DiscussionContext requires a REAL trigger event id.
    const caseName = "exec-lifecycle";
    H.resetSeeds();
    const params = H.readParams(caseName);
    const taskId = `st-mx-001-kick-${Date.now()}`;
    const trigger = await H.matrixSend(tokens.ben, room, `trigger for ${taskId}`);
    const created = await H.postRun({
      task_id: taskId,
      instruction: "Reply briefly: ack.",
      workspace_ref: "piko",
      discussion: { room_id: room, trigger_event_id: trigger },
      permissions: { read_paths: params.read, write_paths: params.write, tool_profile_ref: "workspace-exec" },
      output_paths: params.output,
    });
    expect(created.status).toBe(202);

    // Piko is removed from the room; the runtime must detect and record the loss.
    const botMxid = await H.matrixWhoAmI(tokens.pikoBot);
    await H.matrixKick(tokens.ben, room, botMxid);
    try {
      // Wait for THIS task to be marked lost (a stale row for an earlier task
      // in the same room would otherwise pass the check spuriously).
      const lost = await H.waitTaskAccessLost(taskId, 90_000);
      expect(lost).toBe(true);

      // Fail-closed: the task must reach a terminal Failed state rather than
      // sitting in Queued or occupying the slot again.
      const deadline = Date.now() + 30_000;
      let state = "";
      for (;;) {
        state = await H.sqliteScalar(`SELECT state FROM runs WHERE task_id='${taskId}';`);
        if (["Queued", "Running", "Cancelling"].includes(state) === false) break;
        if (Date.now() > deadline) break;
        await new Promise((r) => setTimeout(r, 2_000));
      }
      expect(state).toBe("Failed");
      const failure: string = await H.sqliteScalar(
        `SELECT json_extract(result_json,'$.failure.code') FROM results WHERE task_id='${taskId}';`,
      );
      expect(failure).toBe("DiscussionAccessLost");
    } finally {
      // Restore the room so later suites are not poisoned.
      await H.matrixInvite(tokens.ben, room, botMxid).catch(() => undefined);
      await H.matrixJoin(tokens.pikoBot, room).catch(() => undefined);
    }
  });
});