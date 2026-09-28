import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TaskStore } from "../../src/store.js";
import { RunWorker } from "../../src/worker.js";
import { Transfer } from "../../src/transfer.js";
import type { RuntimeConfig, TaskRequest } from "../../src/types.js";

const stores: TaskStore[] = [];
const roots: string[] = [];
afterEach(async () => {
  for (const store of stores.splice(0)) store.close();
  for (const root of roots.splice(0)) await rm(root, { recursive: true, force: true });
});

const task = (id: string): TaskRequest => ({
  task_id: id,
  instruction: "run",
  workspace_ref: "test",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [],
});

const config = (root: string): RuntimeConfig =>
  ({
    workspace: { roots: { test: root }, staging_root: join(root, "staging") },
    transfer: { method: "scp", target_allowlist: [], max_input_bytes: 1024, retry: { max_attempts: 1, base_delay_ms: 0 } },
  }) as unknown as RuntimeConfig;

async function fixture(id: string, execute: any, extra: Partial<TaskRequest> = {}) {
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  roots.push(root);
  const store = new TaskStore(":memory:", 1000);
  stores.push(store);
  const definition = { ...task(id), ...extra };
  store.createOrGet(definition, "slinky", 10);
  const claim = store.tryClaimSlot("worker", "boot") as any;
  const cfg = config(root);
  const worker = new RunWorker(cfg, store, { execute } as any, {} as any, new Transfer(cfg));
  return { store, claim, worker, definition, root };
}

describe("worker terminal semantics (v0.12: no limits)", () => {
  it("completes a run and publishes a stable result through the two-step commit", async () => {
    const x = await fixture("ok", async () => ({ status: "completed", summary: "done", startedAt: new Date().toISOString() }));
    await (x.worker as any).run("ok", x.claim.lease_epoch);
    const result = x.store.result("ok");
    expect(result.state).toBe("Completed");
    expect(result.failure).toBeNull();
    expect(result.stats).toMatchObject({ outputs_count: 0 });
  });

  it("gives an accepted cancellation precedence over a concurrent execution error", async () => {
    const x = await fixture("cancel", async () => {
      throw Object.assign(new Error("provider failed"), { pikoCode: "ModelUnavailable", cause: "Dependency" });
    });
    expect(x.store.cancel("cancel").outcome).toBe("StopRequested");
    await (x.worker as any).run("cancel", x.claim.lease_epoch);
    expect(x.store.result("cancel")).toMatchObject({ state: "Cancelled", failure: { code: "CancelledByRequest", cause_class: "Cancellation" } });
  });

  it("maps an unknown error to InternalError", async () => {
    const x = await fixture("boom", async () => {
      throw new Error("boom");
    });
    await (x.worker as any).run("boom", x.claim.lease_epoch);
    expect(x.store.result("boom")).toMatchObject({ state: "Failed", failure: { code: "InternalError", cause_class: "Internal" } });
  });

  it("fails closed before calling Pi when discussion access is already lost", async () => {
    let calls = 0;
    const x = await fixture(
      "lost",
      async () => {
        calls++;
        return { status: "completed", summary: "bad" };
      },
      { discussion: { room_id: "!room:test", trigger_event_id: "$e" } },
    );
    x.store.markDiscussionAccessLost("!room:test");
    await (x.worker as any).run("lost", x.claim.lease_epoch);
    expect(calls).toBe(0);
    expect(x.store.result("lost")).toMatchObject({ state: "Failed", failure: { code: "DiscussionAccessLost", cause_class: "Authorization" } });
  });

  it("reclassifies a provider-unavailable protocol failure as ModelUnavailable/Dependency", async () => {
    const x = await fixture("dep", async () => ({
      status: "failed",
      summary: "OpenAI API error (503): provider_unavailable",
      failure: { code: "ModelResponseInvalid", cause_class: "ModelProtocol", message: "OpenAI API error (503): provider_unavailable" },
    }));
    await (x.worker as any).run("dep", x.claim.lease_epoch);
    expect(x.store.result("dep")).toMatchObject({ state: "Failed", failure: { code: "ModelUnavailable", cause_class: "Dependency" } });
  });
});
