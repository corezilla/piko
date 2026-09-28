import { afterEach, describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config.js";
import { TaskStore } from "../../src/store.js";
import { BearerAuth } from "../../src/auth.js";
import { ApiServer } from "../../src/server.js";
import { MatrixRuntime } from "../../src/matrix.js";

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

async function fixture(capacity = 10) {
  const { config } = await loadConfig("config/runtime.example.json");
  config.listen.port = 20000 + Math.floor(Math.random() * 20000);
  config.queue.capacity = capacity;
  const store = new TaskStore(":memory:", 1000);
  const matrix = new MatrixRuntime(config, store, undefined);
  const server = await ApiServer.create(config, store, new BearerAuth("slinky", Buffer.from("token")));
  await server.listen();
  cleanups.push(async () => {
    await server.close();
    store.close();
  });
  return { base: `http://127.0.0.1:${config.listen.port}`, store };
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
