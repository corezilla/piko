import { afterEach, describe, expect, it } from "vitest";
import { Scheduler } from "../../src/scheduler.js";
import { TaskStore } from "../../src/store.js";
import type { RuntimeConfig, TaskRequest } from "../../src/types.js";

/**
 * Slot acquisition, renewal and fencing — the single-execution-slot contract.
 * Covers UT-SCHED-001..005: acquire uniqueness, renew CAS, stale-epoch fence,
 * release, and orphan recovery.
 */

const stores: TaskStore[] = [];
afterEach(() => {
  while (stores.length) stores.pop()!.close();
});

const config = { instance_id: "piko-test", queue: { capacity: 10 } } as unknown as RuntimeConfig;

function fixture(): { store: TaskStore; sched: Scheduler } {
  const store = new TaskStore(":memory:", 1000);
  stores.push(store);
  return { store, sched: new Scheduler(store, config) };
}

const task = (id: string): TaskRequest => ({
  task_id: id,
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: [],
});

describe("UT-SCHED · slot lifecycle", () => {
  it("UT-SCHED-001 · acquire grants the slot once and refuses a second claim", () => {
    const { store, sched } = fixture();
    store.createOrGet(task("s-1"), "slinky", 10, undefined);

    const first = sched.acquire("owner-a");
    expect(first).toMatchObject({ task_id: "s-1" });
    // Slot is held: a competing owner must get null, never a second grant.
    expect(sched.acquire("owner-b")).toBeNull();
    expect(sched.read()).toMatchObject({ task_id: "s-1", owner_id: "owner-a" });
  });

  it("UT-SCHED-002 · renew succeeds with the current epoch and fails with a stale one", () => {
    const { store, sched } = fixture();
    store.createOrGet(task("s-2"), "slinky", 10, undefined);
    const grant = sched.acquire("owner-a")!;

    expect(sched.renew(grant.task_id, grant.lease_epoch)).toBe(true);
    // Wrong epoch must be fenced out — this is the CAS guard.
    expect(sched.renew(grant.task_id, grant.lease_epoch - 1)).toBe(false);
    expect(sched.renew("other-task", grant.lease_epoch)).toBe(false);
  });

  it("UT-SCHED-003 · release frees the slot only for the matching epoch", () => {
    const { store, sched } = fixture();
    store.createOrGet(task("s-3"), "slinky", 10, undefined);
    const grant = sched.acquire("owner-a")!;

    expect(sched.release(grant.task_id, grant.lease_epoch - 1)).toBe(false);
    expect(sched.read().task_id).toBe("s-3");
    expect(sched.release(grant.task_id, grant.lease_epoch)).toBe(true);
    expect(sched.read().task_id).toBeNull();
  });

  it("UT-SCHED-004 · a released slot can be claimed again by the next oldest Run", () => {
    const { store, sched } = fixture();
    store.createOrGet(task("s-4a"), "slinky", 10, undefined);
    const first = sched.acquire("owner-a")!;
    sched.release(first.task_id, first.lease_epoch);

    store.createOrGet(task("s-4b"), "slinky", 10, undefined);
    const second = sched.acquire("owner-b");
    expect(second).toMatchObject({ task_id: "s-4b" });
  });

  it("UT-SCHED-005 · recover reclaims an orphaned Running task and advances the epoch", () => {
    const { store, sched } = fixture();
    store.createOrGet(task("s-5"), "slinky", 10, undefined);
    const grant = sched.acquire("owner-a")!;
    // Simulate a crashed process: the slot still points at the task.
    expect(sched.read()).toMatchObject({ task_id: "s-5" });

    const recovered = sched.recover("owner-b");
    expect(recovered).toMatchObject({ task_id: "s-5" });
    // Epoch must advance so the dead owner's writes are fenced.
    expect(recovered!.lease_epoch).toBeGreaterThan(grant.lease_epoch);
    expect(sched.renew(grant.task_id, grant.lease_epoch)).toBe(false);
    expect(sched.renew("s-5", recovered!.lease_epoch)).toBe(true);
  });

  it("UT-SCHED-005 · recover on an empty slot yields null", () => {
    const { sched } = fixture();
    expect(sched.recover("owner-b")).toBeNull();
  });
});