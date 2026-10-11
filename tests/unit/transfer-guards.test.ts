import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Transfer } from "../../src/transfer.js";
import type { RuntimeConfig } from "../../src/types.js";

/**
 * Data plane guards — target allowlist and staging cleanup.
 * Covers UT-TRANSFER-* items independent of a live remote: the allowlist is
 * checked before any IO, and clearStaging must be safe to call twice.
 */

const dirs: string[] = [];
afterEach(async () => {
  while (dirs.length) await rm(dirs.pop()!, { recursive: true, force: true });
});

function cfg(over: Partial<RuntimeConfig["transfer"]> = {}, stagingRoot?: string): RuntimeConfig {
  return {
    workspace: { roots: { t: "/ws" }, staging_root: stagingRoot ?? join(tmpdir(), "piko-xfer-staging") },
    transfer: {
      method: "scp",
      credential_ref: "env:PIKO_SCP_KEY",
      target_allowlist: ["store@nas:/srv/piko"],
      max_input_bytes: 1 << 20,
      retry: { max_attempts: 1, base_delay_ms: 0 },
      ...over,
    },
  } as unknown as RuntimeConfig;
}

describe("UT-TRANSFER-002 · target allowlist", () => {
  it("refuses a target outside the allowlist before any transfer", async () => {
    const tf = new Transfer(cfg());
    const r = await tf.fetchInputs("t-1", [{ source: "evil@host:/etc/passwd", dest: "x" }]);
    expect(r.state).toBe("failed");
    expect(r.failed[0]!.error).toMatch(/not allowlisted/);
  });

  it("names the offending target in the failure so operators can see what was blocked", async () => {
    const tf = new Transfer(cfg());
    const r = await tf.fetchInputs("t-1", [{ source: "evil@host:/etc/passwd", dest: "x" }]);
    expect(r.failed[0]!.error).toContain("evil@host");
  });

  it("does not raise for an allowlisted target: the failure is transport-level, not policy", async () => {
    const tf = new Transfer(cfg());
    const r = await tf.fetchInputs("t-1", [{ source: "store@nas:/srv/piko/a", dest: "a" }]);
    // Unreachable remote in CI: still a failure, but NOT an allowlist rejection.
    if (r.state === "failed") {
      expect(r.failed[0]!.error).not.toMatch(/not allowlisted/);
    }
  });
});

describe("UT-TRANSFER-003 · clearStaging", () => {
  it("removes the task staging directory", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-xfer-"));
    dirs.push(root);
    const tf = new Transfer(cfg({}, root));

    await mkdir(join(root, "t-1", "in"), { recursive: true });
    await writeFile(join(root, "t-1", "in", "seed.md"), "x");
    expect(existsSync(join(root, "t-1"))).toBe(true);

    tf.clearStaging("t-1");
    expect(existsSync(join(root, "t-1"))).toBe(false);
  });

  it("is idempotent: clearing an absent staging dir is a no-op", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-xfer-"));
    dirs.push(root);
    const tf = new Transfer(cfg({}, root));
    expect(() => tf.clearStaging("never-existed")).not.toThrow();
    expect(() => tf.clearStaging("never-existed")).not.toThrow();
  });

  it("leaves another task's staging untouched", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-xfer-"));
    dirs.push(root);
    const tf = new Transfer(cfg({}, root));
    await mkdir(join(root, "t-2"), { recursive: true });
    tf.clearStaging("t-1");
    expect(existsSync(join(root, "t-2"))).toBe(true);
  });
});