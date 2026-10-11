import { afterEach, describe, expect, it } from "vitest";
import { EventEmitter } from "node:events";
import { FactHandler, LocalChannel, ProcessChannel, attachChildToHandler } from "../../src/ipc.js";
import { TaskStore } from "../../src/store.js";
import type { TaskRequest } from "../../src/types.js";

/**
 * IPC channel + fact handler — the P0/P1 boundary.
 * Covers UT-IPC-001..006: FactHandler dispatch, LocalChannel, ProcessChannel
 * correlation, child attachment, and the typed-error containment path.
 */

const stores: TaskStore[] = [];
function newStore(): TaskStore {
  const s = new TaskStore(":memory:", 1000);
  stores.push(s);
  return s;
}
afterEach(() => {
  while (stores.length) stores.pop()!.close();
});

const task = (id = "t-1", discussion?: TaskRequest["discussion"]): TaskRequest => ({
  task_id: id,
  instruction: "do it",
  workspace_ref: "piko",
  discussion,
  permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: [],
});

describe("FactHandler (P0 single-writer dispatcher)", () => {
  it("UT-IPC-001 · staging / delivery / turn facts commit to the store", () => {
    const store = newStore();
    const created = store.createOrGet(task(), "slinky", 10, undefined);
    const id = (created as { task_id: string }).task_id;
    const h = new FactHandler(store);

    expect(h.apply({ kind: "staging", task_id: id, staging: { state: "ready", fetched: [], failed: [] } })).toEqual({ ok: true });
    expect(store.inputStaging(id).state).toBe("ready");

    expect(h.apply({ kind: "delivery", task_id: id, delivery: { state: "failed", delivered: [], failed: [] } })).toEqual({ ok: true });
    expect(store.getRun(id).artifact_delivery?.state).toBe("failed");
  });

  it("UT-IPC-001 · unknown fact kind is reported, not thrown", () => {
    const h = new FactHandler(newStore());
    const out = h.apply({ kind: "nope" } as never);
    expect(out.ok).toBe(false);
    expect(out.error).toMatch(/unknown fact/);
  });

  it("UT-IPC-002 · a store failure becomes {ok:false}, never an exception escaping to P1", () => {
    const store = newStore();
    const h = new FactHandler(store);
    // No such run: staging write must be contained, not crash the handler.
    const out = h.apply({ kind: "staging", task_id: "ghost", staging: { state: "ready", fetched: [], failed: [] } });
    expect(out.ok).toBe(false);
    expect(typeof out.error).toBe("string");
  });

  it("UT-IPC-003 · claim returns a grant or null when the slot is busy", () => {
    const store = newStore();
    const h = new FactHandler(store);
    const created = store.createOrGet(task("claim-1"), "slinky", 10, undefined);
    const id = (created as { task_id: string }).task_id;

    expect(h.apply({ kind: "stagingClaim" })).toEqual({ ok: true, value: null });
    const first = h.apply({ kind: "claim", owner: "w1", boot: "b1" });
    expect(first.ok).toBe(true);
    expect(first.value).toMatchObject({ task_id: id });
    // Second claim while the slot is held must be refused, not a second grant.
    expect(h.apply({ kind: "claim", owner: "w2", boot: "b2" })).toEqual({ ok: true, value: null });
  });

  it("UT-IPC-004 · LocalChannel resolves report() through the handler", async () => {
    const store = newStore();
    const created = store.createOrGet(task("local-1"), "slinky", 10, undefined);
    const id = (created as { task_id: string }).task_id;
    const channel = new LocalChannel(new FactHandler(store));
    const out = await channel.report({ kind: "staging", task_id: id, staging: { state: "in_progress", fetched: [], failed: [] } });
    expect(out.ok).toBe(true);
    expect(store.inputStaging(id).state).toBe("in_progress");
  });

  it("UT-IPC-005 · ProcessChannel correlates replies by id and dispatches commands", async () => {
    const sent: unknown[] = [];
    const commands: unknown[] = [];
    const channel = new ProcessChannel((m) => sent.push(m), (c) => commands.push(c));

    const p = channel.report({ kind: "stagingClaim" });
    // The fact was framed with a correlation id before any reply arrives.
    await Promise.resolve();
    expect(sent).toHaveLength(1);
    const framed = sent[0] as { ipc: string; id: number; fact: { kind: string } };
    expect(framed.ipc).toBe("fact");
    expect(framed.fact.kind).toBe("stagingClaim");

    // ProcessChannel listens on process "message"; the typed overload of
    // process.emit only accepts signal names, so cast for this transport event.
    (process as unknown as { emit: (e: string, m: unknown) => boolean }).emit("message", {
      ipc: "outcome",
      id: framed.id,
      outcome: { ok: true, value: { task_id: "x" } },
    });
    await expect(p).resolves.toEqual({ ok: true, value: { task_id: "x" } });

    (process as unknown as { emit: (e: string, m: unknown) => boolean }).emit("message", {
      ipc: "command",
      command: { kind: "abort", task_id: "t" },
    });
    expect(commands).toHaveLength(1);
  });

  it("UT-IPC-006 · attachChildToHandler answers child facts and forwards commands", () => {
    const store = newStore();
    const handler = new FactHandler(store);
    const child = new EventEmitter() as EventEmitter & { send: (m: unknown) => void };
    const replies: unknown[] = [];
    child.send = (m) => replies.push(m);
    const commands: unknown[] = [];
    attachChildToHandler(child, handler, (c) => commands.push(c));

    child.emit("message", { ipc: "fact", id: 7, fact: { kind: "stagingClaim" } });
    expect(replies).toHaveLength(1);
    expect(replies[0]).toMatchObject({ ipc: "outcome", id: 7 });

    child.emit("message", { ipc: "command", command: { kind: "abort", task_id: "t" } });
    expect(commands).toHaveLength(1);

    // Unrelated traffic must not be answered.
    child.emit("message", { hello: "world" });
    expect(replies).toHaveLength(1);
  });
});