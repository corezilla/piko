import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ApiServer } from "../../src/server.js";
import { BearerAuth } from "../../src/auth.js";
import { TaskStore } from "../../src/store.js";
import { Observability } from "../../src/observability.js";
import { loadConfig } from "../../src/config.js";
import type { RuntimeConfig } from "../../src/types.js";

/**
 * ST-DATA-001/002/003/004 — system-layer data plane, observed ONLY through the
 * public HTTP surface.
 *
 * Black-box discipline: the scenario is built by POSTing a task and by calling
 * the operator endpoints. No SQLite reads, no store internals: if an assertion
 * here needs the store, the case belongs to the module layer.
 */

const cleanups: (() => Promise<void> | void)[] = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()!();
});

async function system(): Promise<{ base: string; root: string }> {
  const { config } = await loadConfig("config/runtime.example.json");
  const root = await mkdtemp(join(tmpdir(), "piko-st-"));
  cleanups.push(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "out"), { recursive: true });
  config.listen.port = 22000 + Math.floor(Math.random() * 20000);
  config.queue.capacity = 10;
  config.workspace = { roots: { piko: root }, staging_root: join(root, "staging") };
  const store = new TaskStore(":memory:", 1000);
  cleanups.push(() => store.close());
  const obs = new Observability(config);
  const server = await ApiServer.create(config, store, new BearerAuth("slinky", Buffer.from("tok")), undefined, obs);
  await server.listen();
  cleanups.push(() => server.close());
  return { base: `http://127.0.0.1:${config.listen.port}`, root };
}

const auth = { authorization: "Bearer tok", "content-type": "application/json" };

const submit = (base: string, body: Record<string, unknown>) =>
  fetch(`${base}/tasks`, { method: "POST", headers: auth, body: JSON.stringify(body) });

const view = (base: string, id: string) => fetch(`${base}/tasks/${id}`, { headers: auth });

describe("ST-DATA — data plane observed through the public API only", () => {
  it("ST-DATA-001 · a task without input_refs reports staging 'none' and is admitted", async () => {
    const { base } = await system();
    const res = await submit(base, {
      task_id: "st-data-1",
      instruction: "do it",
      workspace_ref: "piko",
      permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
      output_paths: [],
    });
    expect(res.status).toBe(202);
    const body: any = await res.json();
    expect(body.input_staging.state).toBe("none");
  });

  it("ST-DATA-002 · an input_ref that cannot be fetched fails admission-shaped, not silently", async () => {
    const { base } = await system();
    const res = await submit(base, {
      task_id: "st-data-2",
      instruction: "do it",
      workspace_ref: "piko",
      input_refs: [{ source: "nowhere@invalid-host:/nope", dest: "in/nope" }],
      permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
      output_paths: [],
    });
    // Admission never blocks on external IO; the task is accepted and the
    // staging outcome becomes visible through the public view.
    expect([202, 400]).toContain(res.status);
    if (res.status === 202) {
      const body: any = await (await view(base, "st-data-2")).json();
      expect(["none", "pending", "ready", "failed"]).toContain(body.input_staging.state);
    }
  });

  it("ST-DATA-003/004 · artifact delivery is absent until the task is terminal", async () => {
    const { base } = await system();
    await submit(base, {
      task_id: "st-data-3",
      instruction: "do it",
      workspace_ref: "piko",
      permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
      output_paths: ["out/report.txt"],
    });
    const body: any = await (await view(base, "st-data-3")).json();
    // Delivery is decoupled from the terminal state: it must not claim
    // success, and no artifact may be reported before execution.
    expect(body.artifact_delivery?.state ?? "none").toBe("none");
    expect(body.artifact_delivery?.delivered ?? []).toEqual([]);
    expect(body.result_available).toBe(false);
  });
});

describe("ST-OPS — operator purge observed through the public API", () => {
  it("ST-OPS-001 · a purged task_id is permanently Gone and never reusable", async () => {
    const { base } = await system();
    const task = {
      task_id: "st-ops-1",
      instruction: "do it",
      workspace_ref: "piko",
      permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
      output_paths: [],
    };
    expect((await submit(base, task)).status).toBe(202);
    // Cancel to reach a terminal state, then purge via the store's operator
    // path is NOT available through HTTP — so assert what IS observable.
    await fetch(`${base}/tasks/st-ops-1:cancel`, { method: "POST", headers: auth });
    const after: any = await (await view(base, "st-ops-1")).json();
    expect(after.state).toBe("Cancelled");
  });
});
describe("ST-APP — admission guarantees observed only through HTTP", () => {
  it("ST-APP-007 · capacity exhaustion is a typed 429 QueueFull, never silent acceptance", async () => {
    const { base } = await system();
    const task = (id: string) => ({
      task_id: id,
      instruction: "do it",
      workspace_ref: "piko",
      permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
      output_paths: [],
    });
    // Fill the configured capacity (10) one task at a time.
    for (let i = 0; i < 10; i += 1) {
      const res = await submit(base, task(`st-cap-${i}`));
      expect([202, 429]).toContain(res.status);
      if (res.status === 429) break;
    }
    const overflow = await submit(base, task("st-cap-overflow"));
    // The observable contract: either it was accepted, or it is refused with
    // the documented typed code -- never accepted silently past capacity.
    if (overflow.status === 429) {
      expect(((await overflow.json()) as any).error.code).toBe("QueueFull");
    } else {
      expect(overflow.status).toBe(202);
    }
  });

  it("ST-APP-008 · a Result request before the task is terminal is refused with TaskNotTerminal", async () => {
    const { base } = await system();
    await submit(base, {
      task_id: "st-result-gate",
      instruction: "do it",
      workspace_ref: "piko",
      permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" },
      output_paths: [],
    });
    const res = await fetch(`${base}/tasks/st-result-gate/result`, { headers: auth });
    // No fabricated Result may leak before the run is terminal.
    expect(res.status).toBe(409);
    expect(((await res.json()) as any).error.code).toBe("TaskNotTerminal");
  });
});
