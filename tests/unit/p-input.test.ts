import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TaskStore } from "../../src/store.js";
import { RunWorker } from "../../src/worker.js";
import { Transfer } from "../../src/transfer.js";
import type { RuntimeConfig, TaskRequest } from "../../src/types.js";

const stores: TaskStore[] = [];
const roots: string[] = [];
afterEach(async () => {
  for (const s of stores.splice(0)) s.close();
  for (const r of roots.splice(0)) await rm(r, { recursive: true, force: true });
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "piko-pinput-"));
  roots.push(root);
  const store = new TaskStore(":memory:", 1000);
  stores.push(store);
  const cfg = { workspace: { roots: { t: root }, staging_root: join(root, "staging") }, transfer: { method: "mount", target_allowlist: [], max_input_bytes: 1024, retry: { max_attempts: 1, base_delay_ms: 0 } } } as unknown as RuntimeConfig;
  const transfer = new Transfer(cfg);
  const worker = new RunWorker(cfg, store, { execute: async () => ({ status: "completed", summary: "ok" }) } as any, {} as any, transfer);
  return { store, worker, root };
}

const task = (id: string, refs?: any[]): TaskRequest => ({
  task_id: id, instruction: "x", workspace_ref: "t",
  permissions: { read_paths: [], write_paths: [], tool_profile_ref: "workspace-standard" },
  output_paths: [], ...(refs ? { input_refs: refs } : {}),
});

describe("P-INPUT pre-slot gating", () => {
  it("a task with input_refs starts as pending and blocks slot claim until staged", async () => {
    const { store } = await fixture();
    store.createOrGet(task("with-input", [{ source: "/tmp/does-not-exist-xyz", dest: "in.txt" }]), "slinky", 10);
    expect(store.getRun("with-input").input_staging.state).toBe("pending");
    expect(store.tryClaimSlot("w", "b")).toBe("slot_busy");
  });

  it("a failed fetch yields a zero-call Failed(InputFetchFailed) without ever taking the slot", async () => {
    const { store, worker } = await fixture();
    store.createOrGet(task("bad-input", [{ source: "/tmp/does-not-exist-xyz", dest: "in.txt" }]), "slinky", 10);
    worker.start();
    try {
      for (let i = 0; i < 100 && !store.getRun("bad-input").result_available; i++) await new Promise((r) => setTimeout(r, 20));
      const result = store.result("bad-input");
      expect(result.state).toBe("Failed");
      expect(result.failure?.code).toBe("InputFetchFailed");
      expect(result.stats.model_calls).toBe(0);
      expect(store.readSlot().task_id).toBeNull();
    } finally {
      await worker.close();
    }
  });
});

describe("P-ARTIFACT delivery reads where execution wrote", () => {
  it("delivers a workspace output to a mount target and records path/sha256/size", async () => {
    const { store, worker, root } = await fixture();
    await writeFile(join(root, "out.txt"), "artifact body\n");
    const target = join(root, "target");
    const cfg = { workspace: { roots: { t: root }, staging_root: join(root, "staging") }, transfer: { method: "mount", target_allowlist: [target], max_input_bytes: 1024, retry: { max_attempts: 1, base_delay_ms: 0 } } } as unknown as RuntimeConfig;
    const transfer = new Transfer(cfg);
    store.createOrGet({ task_id: "art", instruction: "x", workspace_ref: "t", permissions: { read_paths: [], write_paths: ["out.txt"], tool_profile_ref: "workspace-standard" }, output_paths: ["out.txt"], artifact_target: { method: "mount", target } }, "slinky", 10);
    (worker as any).transfer = transfer;
    const r = await transfer.deliverArtifacts("art", ["out.txt"], { method: "mount", target }, undefined, root);
    expect(r.state).toBe("delivered");
    expect(r.delivered[0]).toMatchObject({ path: "out.txt", size_bytes: 14 });
    expect(r.delivered[0]!.sha256).toMatch(/^[0-9a-f]{64}$/);
  });
});
