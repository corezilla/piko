import { afterEach, describe, expect, it } from "vitest";
import { TaskStore } from "../../src/store.js";
import type { TaskRequest } from "../../src/types.js";

/**
 * Matrix ledger and intake bookkeeping inside the task store.
 * Covers UT-REPO-* items the HTTP layer cannot reach: event dedup, the
 * idempotent send ledger, the sync cursor, and intake closing.
 */

const stores: TaskStore[] = [];
afterEach(() => {
  while (stores.length) stores.pop()!.close();
});
function newStore(): TaskStore {
  const s = new TaskStore(":memory:", 1000);
  stores.push(s);
  return s;
}

const task = (id: string, extra: Partial<TaskRequest> = {}): TaskRequest => ({
  task_id: id,
  instruction: "reply",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...extra,
});

describe("UT-REPO · matrix ledger", () => {
  it("ingestMatrixEvent records an event once and dedups on redelivery", () => {
    const s = newStore();
    expect(s.recordMatrixEvent("!r:t", "$e1", "@u:t")).toBe(true);
    // Matrix re-delivers on reconnect; the same event must not be re-recorded.
    expect(s.recordMatrixEvent("!r:t", "$e1", "@u:t")).toBe(false);
    expect(s.hasMatrixEvent("!r:t", "$e1")).toBe(true);
    expect(s.hasMatrixEvent("!r:t", "$other")).toBe(false);
  });

  it("the sync cursor round-trips and defaults to null", () => {
    const s = newStore();
    expect(s.matrixCursor()).toBeNull();
    s.setMatrixCursor("cursor-1");
    expect(s.matrixCursor()).toBe("cursor-1");
    s.setMatrixCursor("cursor-2");
    expect(s.matrixCursor()).toBe("cursor-2");
  });

  it("ingestMatrixBatch records new events and tolerates a replayed batch", () => {
    const s = newStore();
    const batch = [{ room: "!r:t", event: "$b1", sender: "@u:t", txn: undefined, turns: [] }];
    // Returns the number of events in the batch and advances the cursor.
    expect(s.ingestMatrixBatch(batch, "c1")).toBe(1);
    expect(s.matrixCursor()).toBe("c1");
    expect(s.hasMatrixEvent("!r:t", "$b1")).toBe(true);
    // Same event again: must not throw and must not duplicate the row.
    expect(() => s.ingestMatrixBatch(batch, "c2")).not.toThrow();
    expect(s.hasMatrixEvent("!r:t", "$b1")).toBe(true);
  });

  it("prepareMatrixSend issues a send for an eligible task", () => {
    const s = newStore();
    s.createOrGet(task("t-1", { discussion: { room_id: "!r:t", trigger_event_id: "$ev" } }), "slinky", 10, "$ev");
    // matrix_sends references the discussion turn, so the turn must exist.
    expect(s.pendingTurns("t-1").length).toBeGreaterThan(0);
    // Signature is (txn, taskId, turn, payloadSha): the FIRST argument is the
    // transaction id, not the event id.
    const txn = "txn-1";
    const prepared = s.prepareMatrixSend(txn, "t-1", 1, "sha-answer");
    expect(prepared).toMatchObject({ state: "Pending" });
    // Replaying the same txn and payload must return the existing ledger row.
    expect(s.prepareMatrixSend(txn, "t-1", 1, "sha-answer")).toMatchObject({ state: "Pending" });
    // Reusing a txn with a DIFFERENT payload is a conflict, not an overwrite.
    expect(() => s.prepareMatrixSend(txn, "t-1", 1, "sha-other")).toThrow(/payload changed/);
  });

  it("finishMatrixSend records the reply and marks the send Sent", () => {
    const s = newStore();
    s.createOrGet(task("t-2", { discussion: { room_id: "!r:t", trigger_event_id: "$ev" } }), "slinky", 10, "$ev");
    s.prepareMatrixSend("txn-2", "t-2", 1, "sha-reply");
    // finishMatrixSend(txn, event): two arguments.
    s.finishMatrixSend("txn-2", "$reply-event");
    expect(s.prepareMatrixSend("txn-2", "t-2", 1, "sha-reply")).toMatchObject({ state: "Sent", event_id: "$reply-event" });
  });

  it("unknownMatrixSend tolerates a txn that was never sent", () => {
    const s = newStore();
    // A lost reply must not crash the run finaliser.
    expect(() => s.unknownMatrixSend("txn-never-seen")).not.toThrow();
  });
});

describe("UT-REPO · intake closing", () => {
  it("tryCloseIntake refuses while turns are still pending", () => {
    const s = newStore();
    s.createOrGet(task("t-3", { discussion: { room_id: "!r:t", trigger_event_id: "$e" } }), "slinky", 10, "$e");
    // The trigger turn is Pending, so intake must not close.
    expect(s.tryCloseIntake("t-3", 1)).toBe(false);
  });

  it("tryCloseIntake moves Open -> Closing once turns are consumed and a lease exists", () => {
    const s = newStore();
    s.createOrGet(task("t-4", { discussion: { room_id: "!r:t", trigger_event_id: "$e" } }), "slinky", 10, "$e");
    s.markTurn("t-4", "$e", "Consumed");
    // Closing requires a run_sessions row for this lease epoch.
    const grant = s.tryClaimSlot("w", "b") as { lease_epoch: number };
    expect(s.tryCloseIntake("t-4", grant.lease_epoch)).toBe(true);
    expect(s.getRun("t-4").discussion_intake_state).toBe("Closing");
    // A second call is idempotent while Closing.
    expect(s.tryCloseIntake("t-4", grant.lease_epoch)).toBe(true);
  });

  it("tryCloseIntake rejects an unknown task instead of creating one", () => {
    const s = newStore();
    expect(s.tryCloseIntake("ghost", 1)).toBe(false);
  });
});

describe("UT-REPO · tool call terminal", () => {
  it("terminalTool on an unknown call is a no-op rather than an error", () => {
    const s = newStore();
    s.createOrGet(task("t-5"), "slinky", 10, undefined);
    expect(() => s.terminalTool("t-5", "op", "call-1", true)).not.toThrow();
  });
});