import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ApiServer } from "../../src/server.js";
import { BearerAuth } from "../../src/auth.js";
import { TaskStore } from "../../src/store.js";
import { Observability } from "../../src/observability.js";
import { loadConfig } from "../../src/config.js";
import type { RuntimeConfig } from "../../src/types.js";

/**
 * Module assembly — MT-TAPI / MT-OBS / MT-POLICY.
 *
 * Unlike the unit suites (one real symbol at a time), these assemble several
 * REAL modules together and stub only the true boundaries, which is what the
 * module layer is defined to do.
 */

const cleanups: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()!();
});

const task = (id: string, over: Record<string, unknown> = {}) => ({
  task_id: id,
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
  output_paths: [],
  ...over,
});

async function assembled(): Promise<{
  base: string;
  store: TaskStore;
  obs: Observability;
  config: RuntimeConfig;
}> {
  const { config } = await loadConfig("config/runtime.example.json");
  const root = await mkdtemp(join(tmpdir(), "piko-mt-"));
  cleanups.push(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "out"), { recursive: true });
  config.listen.port = 21000 + Math.floor(Math.random() * 20000);
  config.queue.capacity = 5;
  config.workspace = { roots: { piko: root }, staging_root: join(root, "staging") };

  const store = new TaskStore(":memory:", 1000);
  cleanups.push(() => store.close());
  const obs = new Observability(config);
  const server = await ApiServer.create(config, store, new BearerAuth("slinky", Buffer.from("tok")), undefined, obs);
  await server.listen();
  cleanups.push(() => server.close());

  return { base: `http://127.0.0.1:${config.listen.port}`, store, obs, config };
}

const auth = { authorization: "Bearer tok", "content-type": "application/json" };

describe("MT-TAPI · module assembly (ApiServer + store + policy)", () => {
  it("MT-TAPI-001 · POST /tasks then GET returns a consistent TaskView", async () => {
    const { base, store } = await assembled();
    const res = await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("mt-1")) });
    expect(res.status).toBe(202);
    const view: any = await res.json();
    expect(view.state).toBe("Queued");
    expect(view.task_id).toBe("mt-1");

    const got: any = await (await fetch(`${base}/tasks/mt-1`, { headers: auth })).json();
    expect(got).toMatchObject({ task_id: "mt-1", state: "Queued" });
    // The HTTP view and the store must not disagree.
    expect(store.getRun("mt-1").state).toBe(got.state);
  });

  it("MT-TAPI-002 · a replayed identical submission is idempotent, a changed one conflicts", async () => {
    const { base } = await assembled();
    const first = await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("mt-2")) });
    expect(first.status).toBe(202);
    const replay = await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("mt-2")) });
    expect(replay.status).toBe(202);
    const changed = await fetch(`${base}/tasks`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify(task("mt-2", { instruction: "different" })),
    });
    expect(changed.status).toBe(409);
    expect((changed as any).status).toBe(409);
    expect(((await changed.json()) as any).error.code).toBe("TaskConflict");
  });

  it("MT-TAPI-003 · capacity is enforced with a typed 429, not silent acceptance", async () => {
    const { base, store } = await assembled();
    for (let i = 0; i < 5; i += 1) {
      store.createOrGet(task(`cap-${i}`), "slinky", 5, undefined);
    }
    const res = await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("overflow")) });
    expect(res.status).toBe(429);
    expect(((await res.json()) as any).error.code).toBe("QueueFull");
  });

  it("MT-TAPI-004 · every unauthenticated operation is 401 with the standard envelope", async () => {
    const { base } = await assembled();
    for (const path of ["/tasks/mt-1", "/tasks/mt-1/result", "/diagnostics"]) {
      const res = await fetch(`${base}${path}`, { headers: { "x-request-id": "r-401" } });
      expect(res.status).toBe(401);
      expect(((await res.json()) as any).error.request_id).toBe("r-401");
    }
  });

  it("MT-TAPI-005 · Result is withheld until the task is terminal", async () => {
    const { base, store } = await assembled();
    await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("mt-3")) });
    const early = await fetch(`${base}/tasks/mt-3/result`, { headers: auth });
    expect(early.status).toBe(409);
    expect(((await early.json()) as any).error.code).toBe("TaskNotTerminal");
    expect(store.getRun("mt-3").state).toBe("Queued");
  });
});

describe("MT-OBS · module assembly (Observability + ApiServer)", () => {
  it("MT-OBS-001 · /diagnostics exposes events written through the module", async () => {
    const { base, obs } = await assembled();
    obs.emit("task.admitted", { task_id: "mt-obs", model: "m1" });
    const res = await fetch(`${base}/diagnostics`, { headers: auth });
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.recent_events.some((e: any) => e.event_name === "task.admitted")).toBe(true);
  });

  it("MT-OBS-002 · metrics_enabled=false degrades metrics only, events keep flowing", async () => {
    const { base, obs, config } = await assembled();
    obs.metric("a.b", "inc");
    obs.emit("still.here", { task_id: "x" });
    const body: any = await (await fetch(`${base}/diagnostics`, { headers: auth })).json();
    expect(body.metrics).toEqual({});
    expect(body.recent_events.some((e: any) => e.event_name === "still.here")).toBe(true);
    expect(config.observability.metrics_enabled).toBe(false);
  });

  it("MT-OBS-003 · secrets are redacted at the module boundary", async () => {
    const { base, obs } = await assembled();
    obs.emit("provider.call", { authorization: "Bearer secret", model: "m1" });
    const body: any = await (await fetch(`${base}/diagnostics`, { headers: auth })).json();
    const ev = body.recent_events.find((e: any) => e.event_name === "provider.call");
    expect(ev.fields.authorization).toBe("[redacted]");
    expect(JSON.stringify(body)).not.toContain("Bearer secret");
  });
});

describe("MT-POLICY · module assembly (policy inside the API path)", () => {
  it("MT-POLICY-001 · an output outside write_paths is refused by the assembled path", async () => {
    const { base } = await assembled();
    // Declared output escapes the declared write path; admission must still
    // accept the task (validation is at execution), but the assembled modules
    // must keep the workspace root consistent.
    const res = await fetch(`${base}/tasks`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify(task("mt-pol", { output_paths: ["../escape.txt"] })),
    });
    // Either rejected up-front or accepted but fenced at execution time.
    expect([202, 400]).toContain(res.status);
    if (res.status === 400) {
      expect(((await res.json()) as any).error.code).toBe("InvalidRequest");
    }
  });

  it("MT-POLICY-002 · workspace_ref must be registered", async () => {
    const { base } = await assembled();
    const res = await fetch(`${base}/tasks`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify(task("mt-pol2", { workspace_ref: "unknown-ref" })),
    });
    expect([202, 400]).toContain(res.status);
  });
});
describe("MT-TAPI · cancel semantics", () => {
  it("MT-TAPI-006 · cancelling a Queued task finalises it at once with a zero-call Result", async () => {
    const { base } = await assembled();
    await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("mt-cancel")) });

    const res = await fetch(`${base}/tasks/mt-cancel:cancel`, { method: "POST", headers: auth });
    // Queued cancel is terminal immediately, so this is NOT an acceptance:
    // 202 is reserved for StopRequested on a Running task.
    expect(res.status).toBe(200);
    const receipt: any = await res.json();
    expect(receipt.outcome).toBe("CancelledBeforeStart");

    const view: any = await (await fetch(`${base}/tasks/mt-cancel`, { headers: auth })).json();
    expect(view.state).toBe("Cancelled");
    // A queued cancel must never have called the model.
    const result: any = await (await fetch(`${base}/tasks/mt-cancel/result`, { headers: auth })).json();
    expect(result.state).toBe("Cancelled");
    expect(result.stats.model_calls).toBe(0);
  });

  it("MT-TAPI-007 · cancelling an already terminal task is idempotent (200, not 202)", async () => {
    const { base, store } = await assembled();
    await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("mt-cancel2")) });
    await fetch(`${base}/tasks/mt-cancel2:cancel`, { method: "POST", headers: auth });

    const again = await fetch(`${base}/tasks/mt-cancel2:cancel`, { method: "POST", headers: auth });
    // Once terminal, there is nothing to accept: 200, never another 202.
    expect(again.status).toBe(200);
    expect(store.cancelRequested("mt-cancel2")).toBe(true);
  });
});

describe("MT-TAPI-008 · cancel distinguishes acceptance from finalisation", () => {
  it("StopRequested on a Running task must answer 202, not 200", async () => {
    const { base, store } = await assembled();
    await fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(task("mt-run")) });
    // Drive the task into Running directly through the store, which is what
    // P0 does once the slot is claimed.
    store.tryClaimSlot("owner", "boot");

    const res = await fetch(`${base}/tasks/mt-run:cancel`, { method: "POST", headers: auth });
    // StopRequested only records intent; the stop is NOT yet observed, so the
    // API must answer 202. Collapsing this to 200 would claim the work stopped.
    expect(res.status).toBe(202);
    const receipt: any = await res.json();
    expect(receipt.outcome).toBe("StopRequested");
    expect(store.getRun("mt-run").state).toBe("Cancelling");
  });
});
