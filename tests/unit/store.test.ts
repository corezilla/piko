import { afterEach, describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TaskStore } from "../../src/store.js";
import type { AgentResult } from "../../src/types.js";
import { emptyUsage, task, discussionTask } from "../common/fixtures.js";

const stores: TaskStore[] = [];
const tempRoots: string[] = [];
const make = () => {
  const s = new TaskStore(":memory:", 1000);
  stores.push(s);
  return s;
};

const result = (task_id: string, state: AgentResult["state"], over: Partial<AgentResult> = {}): AgentResult => ({
  task_id,
  generation: 1,
  state,
  partial: false,
  summary: "ok",
  outputs: [],
  stats: { model_calls: 0, tool_calls: 0, duration_ms: 0, outputs_count: 0, outputs_bytes: 0 },
  known_actions: [],
  usage: emptyUsage(),
  failure: state === "Completed" ? null : { code: "InternalError", cause_class: "Internal", message: "x" },
  published_at: new Date().toISOString(),
  ...over,
});

afterEach(() => {
  for (const s of stores.splice(0)) s.close();
  for (const root of tempRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("TaskStore", () => {
  it("creates a missing parent directory for a file-backed database", () => {
    const root = mkdtempSync(join(tmpdir(), "piko-store-"));
    tempRoots.push(root);
    const path = join(root, "nested", "task.sqlite");
    const s = new TaskStore(path, 1000);
    stores.push(s);
    expect(existsSync(path)).toBe(true);
  });

  it("returns one run for the same task_id and rejects a conflicting definition", () => {
    const s = make();
    const a = task();
    const first = s.createOrGet(a, "slinky", 10);
    expect(first.kind).toBe("created");
    expect(s.createOrGet(a, "slinky", 10).kind).toBe("existing");
    expect(s.createOrGet({ ...a, instruction: "other" }, "slinky", 10).kind).toBe("conflict");
  });

  it("acquires the singleton slot and fences finalization", () => {
    const s = make();
    s.createOrGet(task(), "slinky", 10);
    const view = s.getRun("task-1");
    const claim = s.tryClaimSlot("w", "b")!;
    expect(claim).not.toBe("slot_busy");
    expect((claim as any).task_id).toBe(view.task_id);
    expect(s.tryClaimSlot("w2", "b2")).toBe("slot_busy");
    expect(() => s.finish(result(view.task_id, "Completed"), (claim as any).lease_epoch + 1)).toThrowError(/lease/);
  });

  it("cancels queued work atomically with a stable result", () => {
    const s = make();
    s.createOrGet(task(), "slinky", 10);
    expect(s.cancel("task-1").outcome).toBe("CancelledBeforeStart");
    expect(s.result("task-1").state).toBe("Cancelled");
  });

  it("keeps a permanent Gone tombstone after detailed records are purged", () => {
    const s = make();
    s.createOrGet(task("purged-task"), "slinky", 10);
    s.cancel("purged-task");
    expect(s.purge("all").removed).toBe(0); // not yet past retention window
    expect(s.purge({ task_id: "purged-task" }).tombstones).toBe(1);
    expect(() => s.getTask("purged-task")).toThrowError(/not found/);
    expect(s.createOrGet(task("purged-task"), "slinky", 10).kind).toBe("tombstone");
    expect(() => s.getRun("purged-task")).toThrowError(/purged/);
  });

  it("counts each admitted provider and tool effect once", () => {
    const s = make();
    s.createOrGet(task(), "slinky", 10);
    expect(s.reserveModel("task-1", "op", "step", 1)).toBe(true);
    expect(s.reserveModel("task-1", "op", "step", 1)).toBe(true);
    expect(s.reserveTool("task-1", "op", "call", "read", "read_only", "safe")).toBe("Admitted");
    expect(s.reserveTool("task-1", "op", "call", "read", "read_only", "safe")).toBe("Admitted");
    expect(s.getRun("task-1").progress).toMatchObject({ model_calls: 1, tool_calls: 1 });
  });

  it("fails closed when a never-replay tool effect is encountered again", () => {
    const s = make();
    s.createOrGet(task(), "slinky", 10);
    expect(s.reserveTool("task-1", "op", "call", "external", "external", "never")).toBe("Admitted");
    expect(s.reserveTool("task-1", "op", "call", "external", "external", "never")).toBe("UnsafeRetryBlocked");
  });

  it("freezes the published result when usage arrives late", () => {
    const s = make();
    s.createOrGet(task(), "slinky", 10);
    const claim = s.tryClaimSlot("w", "b") as any;
    s.reserveModel("task-1", "op", "step", 1);
    s.observeUsage("task-1", "op", "step", 1, { input: 10, output: 5, totalTokens: 15, cacheRead: 0, cacheWrite: 0, reasoning: 0 });
    s.terminalModel("task-1", "op", "step", 1);
    const usage = { source: "PiModelResponses" as const, quality: "Complete" as const, input_tokens: 10, output_tokens: 5, total_tokens: 15, cache_read_tokens: 0, cache_write_tokens: 0, reasoning_tokens: 0, model_attempts: 1, usage_observed_attempts: 1, missing_fields: [] };
    const r = result("task-1", "Completed", { usage });
    s.publishResult(r, claim.lease_epoch);
    s.finish(r, claim.lease_epoch);
    const before = JSON.stringify(s.result("task-1"));
    s.observeUsage("task-1", "op", "step", 1, { input: 20, output: 10, totalTokens: 30, cacheRead: 0, cacheWrite: 0, reasoning: 0 });
    expect(JSON.stringify(s.result("task-1"))).toBe(before);
  });

  it("keeps queued work ordered FIFO under task_id keys", () => {
    const s = make();
    s.createOrGet(task("a"), "slinky", 10);
    s.createOrGet(task("b"), "slinky", 10);
    expect(s.scanNonTerminal()).toEqual(["a", "b"]);
  });

  it("tracks discussion intake open state", () => {
    const s = make();
    s.createOrGet(discussionTask(), "slinky", 10);
    expect(s.getRun("discussion-1").discussion_intake_state).toBe("Open");
    expect(s.pendingTurns("discussion-1").length).toBe(1);
  });
});
