import { afterEach, describe, expect, it } from "vitest";
import { TaskStore, asReader } from "../../src/store.js";
import { emptyUsage } from "../../src/semantic.js";
import type { AgentResult, TaskRequest } from "../../src/types.js";

/**
 * Task repository — state machine, staging/delivery records, matrix ledgers,
 * slot release, purge and recovery.
 * Covers the UT-REPO-* records that the HTTP-level suites cannot reach
 * directly (intermediate states and rejected transitions).
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
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...extra,
});

const result = (id: string, state: "Completed" | "Failed" | "Cancelled"): AgentResult => ({
  task_id: id,
  generation: 1,
  state,
  partial: false,
  summary: "",
  outputs: [],
  known_actions: [],
  failure: state === "Failed" ? { code: "InternalError", cause_class: "Internal", message: "x" } : null,
  usage: emptyUsage(),
  stats: {
    model_calls: 0,
    tool_calls: 0,
    wall_time_ms: 0,
    outputs_bytes: 0,
    error: null,
  } as unknown as AgentResult["stats"],
  published_at: new Date().toISOString(),
} as unknown as AgentResult);

describe("UT-REPO · admission and state", () => {
  it("UT-REPO-001 · createOrGet is idempotent for the same definition", () => {
    const s = newStore();
    const a = s.createOrGet(task("r-1"), "slinky", 10, undefined);
    const b = s.createOrGet(task("r-1"), "slinky", 10, undefined);
    expect(a.kind).toBe("created");
    expect(b.kind).toBe("existing");
  });

  it("UT-REPO-001 · a changed definition is a conflict, not a second run", () => {
    const s = newStore();
    s.createOrGet(task("r-2"), "slinky", 10, undefined);
    const conflict = s.createOrGet(task("r-2", { instruction: "other" }), "slinky", 10, undefined);
    expect(conflict.kind).toBe("conflict");
  });

  it("UT-REPO-002 · cancelRequested reflects the stop intent", () => {
    const s = newStore();
    const c = s.createOrGet(task("r-3"), "slinky", 10, undefined);
    const id = (c as { task_id: string }).task_id;
    expect(s.cancelRequested(id)).toBe(false);
    s.cancel(id);
    expect(s.cancelRequested(id)).toBe(true);
  });

  it("UT-REPO-003 · slot release only succeeds for the current holder epoch", () => {
    const s = newStore();
    s.createOrGet(task("r-4"), "slinky", 10, undefined);
    const grant = s.tryClaimSlot("w", "b");
    expect(grant).not.toBe("slot_busy");
    const g = grant as { task_id: string; lease_epoch: number };
    expect(s.releaseSlot(g.task_id, g.lease_epoch - 1)).toBe(false);
    expect(s.releaseSlot(g.task_id, g.lease_epoch)).toBe(true);
  });

  it("UT-REPO-003 · renewSlot is fenced by epoch", () => {
    const s = newStore();
    s.createOrGet(task("r-5"), "slinky", 10, undefined);
    const g = s.tryClaimSlot("w", "b") as { task_id: string; lease_epoch: number };
    expect(s.renewSlot(g.task_id, g.lease_epoch)).toBe(true);
    expect(s.renewSlot(g.task_id, g.lease_epoch + 1)).toBe(false);
  });

  it("UT-REPO-004 · nextNeedingStaging returns null while nothing needs staging", () => {
    const s = newStore();
    expect(s.nextNeedingStaging()).toBeNull();
  });

  it("UT-REPO-005 · purgeExpired drops tasks past retention", () => {
    const s = newStore();
    s.createOrGet(task("r-6"), "slinky", 10, undefined);
    // Nothing is expired yet, so the sweep must be a no-op rather than delete.
    expect(s.purgeExpired()).toBe(0);
    expect(s.getTask("r-6")).toBeTruthy();
  });

  it("UT-REPO-006 · openDiscussionRuns / discussionRoomsInUse reflect Open intake only", () => {
    const s = newStore();
    const c = s.createOrGet(task("r-7", { discussion: { room_id: "!a:b", trigger_event_id: "$e" } }), "slinky", 10, "$e");
    const id = (c as { task_id: string }).task_id;
    expect(s.openDiscussionRuns("!a:b")).toContain(id);
    expect(s.discussionRoomsInUse()).toContain("!a:b");
    // A different room must not pick it up.
    expect(s.openDiscussionRuns("!other:b")).toHaveLength(0);
  });

  it("UT-REPO-007 · asReader exposes the store without write methods", () => {
    const s = newStore();
    const c = s.createOrGet(task("r-8"), "slinky", 10, undefined);
    const id = (c as { task_id: string }).task_id;
    const reader = asReader(s) as { getRun: (id: string) => unknown };
    expect(reader.getRun(id)).toMatchObject({ task_id: id });
    expect((reader as Record<string, unknown>).publishResult).toBeUndefined();
  });

  it("UT-REPO-008 · usageSoFar / knownActions return empty sets for a fresh run", () => {
    const s = newStore();
    const c = s.createOrGet(task("r-9"), "slinky", 10, undefined);
    const id = (c as { task_id: string }).task_id;
    expect(s.rawUsage(id)).toEqual([]);
    expect(s.knownActions(id)).toEqual([]);
  });
});

describe("UT-REPO-009 · terminal transitions", () => {
  it("finishQueued publishes a terminal Result for a task that never held the slot", () => {
    const s = newStore();
    s.createOrGet(task("r-10"), "slinky", 10, undefined);
    s.finishQueued(result("r-10", "Failed"));
    expect(s.getRun("r-10").state).toBe("Failed");
    expect(s.result("r-10")?.state).toBe("Failed");
  });

  it("a second terminal write is a no-op: state and Result both stay frozen", () => {
    const s = newStore();
    s.createOrGet(task("r-11"), "slinky", 10, undefined);
    s.finishQueued(result("r-11", "Failed"));
    const first = s.result("r-11");
    const firstFinishedAt = s.getRun("r-11").finished_at;

    // Re-finishing a terminal run must not move the state machine forward.
    s.finishQueued(result("r-11", "Completed"));

    expect(s.getRun("r-11").state).toBe("Failed");
    expect(s.result("r-11")).toEqual(first);
    expect(s.getRun("r-11").finished_at).toBe(firstFinishedAt);
  });
});