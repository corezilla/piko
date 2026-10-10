import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config.js";
import { TaskStore } from "../../src/store.js";
import { BearerAuth } from "../../src/auth.js";
import { ApiServer } from "../../src/server.js";
import { MatrixRuntime } from "../../src/matrix.js";
import { Observability } from "../../src/observability.js";

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});

const task = (id = "unit-http") => ({
  task_id: id,
  instruction: "do it",
  workspace_ref: "piko",
  permissions: { read_paths: ["src"], write_paths: ["var"], tool_profile_ref: "workspace-standard" },
  output_paths: [],
});

async function fixture(capacity = 10, metricsEnabled = false) {
  const { config } = await loadConfig("config/runtime.example.json");
  config.listen.port = 20000 + Math.floor(Math.random() * 20000);
  config.queue.capacity = capacity;
  config.observability.metrics_enabled = metricsEnabled;
  const store = new TaskStore(":memory:", 1000);
  const matrix = new MatrixRuntime(config, store, undefined);
  const obs = new Observability(config);
  const server = await ApiServer.create(config, store, new BearerAuth("slinky", Buffer.from("token")), undefined, obs);
  await server.listen();
  cleanups.push(async () => {
    await server.close();
    store.close();
  });
  return { base: `http://127.0.0.1:${config.listen.port}`, store, obs, instanceId: config.instance_id };
}

const authHeaders = { authorization: "Bearer token", "content-type": "application/json" };

describe("HTTP API (v0.12): /tasks", () => {
  it("rejects missing and wrong bearer credentials with a stable error envelope", async () => {
    const { base } = await fixture();
    for (const authorization of [undefined, "Basic token", "Bearer wrong"]) {
      const headers: Record<string, string> = { "x-request-id": "req-auth" };
      if (authorization) headers.authorization = authorization;
      const response = await fetch(`${base}/tasks/missing`, { headers });
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: { code: "Unauthorized", message: expect.any(String), request_id: "req-auth" } });
    }
  });

  it("rejects invalid JSON and unknown fields", async () => {
    const { base } = await fixture();
    let response = await fetch(`${base}/tasks`, { method: "POST", headers: authHeaders, body: "{" });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "InvalidRequest" } });
    response = await fetch(`${base}/tasks`, { method: "POST", headers: authHeaders, body: JSON.stringify({ ...task(), unknown: true }) });
    expect(response.status).toBe(400);
  });

  it("returns the original Run, rejects a changed definition, and withholds a nonterminal result", async () => {
    const { base } = await fixture();
    const submit = (body: unknown) => fetch(`${base}/tasks`, { method: "POST", headers: authHeaders, body: JSON.stringify(body) });
    const definition = task();
    const accepted: any = await (await submit(definition)).json();
    expect(accepted.task_id).toBe("unit-http");
    const repeat: any = await (await submit(definition)).json();
    expect(repeat.task_id).toBe(accepted.task_id);
    const conflict = await submit({ ...definition, instruction: "changed" });
    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toMatchObject({ error: { code: "TaskConflict" } });
    const result = await fetch(`${base}/tasks/${accepted.task_id}/result`, { headers: authHeaders });
    expect(result.status).toBe(409);
    expect(await result.json()).toMatchObject({ error: { code: "TaskNotTerminal" } });
  });

  it("marks admission failure retryable when the queue is full", async () => {
    const x = await fixture(1);
    await fetch(`${x.base}/tasks`, { method: "POST", headers: authHeaders, body: JSON.stringify(task("queued")) });
    const response = await fetch(`${x.base}/tasks`, { method: "POST", headers: authHeaders, body: JSON.stringify(task("overflow")) });
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("5");
    expect(await response.json()).toMatchObject({ error: { code: "QueueFull" } });
  });

  it("cancels a queued task with a stable zero-call result", async () => {
    const { base, store } = await fixture();
    await fetch(`${base}/tasks`, { method: "POST", headers: authHeaders, body: JSON.stringify(task("c")) });
    const response = await fetch(`${base}/tasks/c:cancel`, { method: "POST", headers: authHeaders });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ task_id: "c", outcome: "CancelledBeforeStart" });
    expect(store.result("c").state).toBe("Cancelled");
  });
});

describe("error containment", () => {
  it("never leaks an internal fence code as an HTTP client error", async () => {
    const { base, store } = await fixture();
    // Force an internal error path: reading a Result for a task that does not exist
    // still resolves through the store, but a tombstoned task yields Gone (public).
    await fetch(`${base}/tasks`, { method: "POST", headers: authHeaders, body: JSON.stringify(task("gone-http")) });
    store.cancel("gone-http");
    store.purge({ task_id: "gone-http" });
    const res = await fetch(`${base}/tasks/gone-http`, { headers: authHeaders });
    expect([410, 404]).toContain(res.status);
    const body: any = await res.json();
    expect(["Gone", "NotFound"]).toContain(body.error.code);
  });
});

describe("GET /diagnostics (M009 observability)", () => {
  it("requires the same bearer credential as the task API", async () => {
    const { base } = await fixture();
    expect((await fetch(`${base}/diagnostics`)).status).toBe(401);
  });

  it("returns a redacted read-only snapshot and counts the served metric", async () => {
    const { base, obs, instanceId } = await fixture();
    obs.emit("provider.request", { task_id: "diag-1", credential: "secret-value", model: "m1" });
    obs.audit({ event_name: "event.audit.forced-purge", task_id: "diag-1", detail: { scope: "task" } });
    const response = await fetch(`${base}/diagnostics`, { headers: authHeaders });
    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.instance_id).toBe(instanceId);
    expect(body.recent_events[0].fields.credential).toBe("[redacted]");
    expect(body.audit_tail[0].event_name).toBe("event.audit.forced-purge");
    // Shipped example config disables metrics: the endpoint still serves, metrics degrade only.
    expect(body.metrics).toEqual({});
    const taskState = await (await fetch(`${base}/tasks/diag-1`, { headers: authHeaders })).status;
    expect(taskState).toBe(404);
  });

  it("counts served snapshots when metrics are enabled, without mutating task state", async () => {
    const { base } = await fixture(10, true);
    await fetch(`${base}/diagnostics`, { headers: authHeaders });
    const body: any = await (await fetch(`${base}/diagnostics`, { headers: authHeaders })).json();
    // The counter is incremented before serializing, so the serving read sees itself.
    expect(body.metrics["diagnostics.served"].value).toBe(2);
    expect((await fetch(`${base}/tasks/never-created`, { headers: authHeaders })).status).toBe(404);
  });

  it("is not exposed when observability is not wired", async () => {
    const { config } = await loadConfig("config/runtime.example.json");
    config.listen.port = 20000 + Math.floor(Math.random() * 20000);
    const store = new TaskStore(":memory:", 1000);
    const server = await ApiServer.create(config, store, new BearerAuth("slinky", Buffer.from("token")));
    await server.listen();
    cleanups.push(async () => {
      await server.close();
      store.close();
    });
    const res = await fetch(`http://127.0.0.1:${config.listen.port}/diagnostics`, { headers: authHeaders });
    expect(res.status).toBe(404);
  });
});

