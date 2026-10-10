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
    expect(replies.length).toBeGreaterThan(0);
    expect(replies.some((e) => e.sender === tokens.pikoBot)).toBe(true);
  });

  it("C2 negative: losing room membership is recorded as DiscussionAccessLost, not silently ignored", async () => {
    const tokens = H.loadMatrixTokens();
    const room = tokens.roomId;

    // A task bound to this discussion must exist for access loss to be attributable.
    const caseName = "exec-lifecycle";
    H.resetSeeds();
    const params = H.readParams(caseName);
    const taskId = `st-mx-001-kick-${Date.now()}`;
    const created = await H.postRun({
      task_id: taskId,
      instruction: "Reply briefly: ack.",
      workspace_ref: "piko",
      discussion: { room_id: room, trigger: "Message" },
      permissions: { read_paths: params.read, write_paths: params.write, tool_profile_ref: "workspace-exec" },
      output_paths: params.output,
    });
    expect(created.status).toBe(202);
    await H.waitMatrixEventIngested(`seed-${taskId}`, 5_000).catch(() => undefined);

    // Piko is removed from the room; the runtime must detect and record the loss.
    await H.matrixKick(tokens.ben, room, tokens.pikoBot);
    try {
      const affected = await H.waitDiscussionAccessLoss(room, 90_000);
      expect(affected.length).toBeGreaterThan(0);

      // Fail-closed: an access-lost task is never dispatched again.
      const stuck: string = await H.sqliteScalar(
        `SELECT state FROM runs WHERE task_id='${taskId}';`,
      );
      expect(["Queued", "Running"]).not.toContain(stuck);
    } finally {
      // Restore the room so later suites are not poisoned.
      await H.matrixInvite(tokens.ben, room, tokens.pikoBot).catch(() => undefined);
      await H.matrixJoin(tokens.pikoBot, room).catch(() => undefined);
    }
  });
});