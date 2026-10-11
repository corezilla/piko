import { afterEach, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync, readdirSync, statSync } from "node:fs";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { Transfer } from "../../src/transfer.js";
import type { RuntimeConfig } from "../../src/types.js";

/**
 * Data-plane tests. The mandatory invariants from the design are asserted
 * hermetically (no network): host keys are pinned via known_hosts, the private
 * key comes from the credential reference, targets are allowlisted, and a
 * sha256 mismatch fails closed. A real-scp run is opt-in via PIKO_SCP_E2E=1
 * against a user-provided target — it never touches the host ~/.ssh.
 */
const roots: string[] = [];
afterEach(async () => {
  for (const r of roots.splice(0)) await rm(r, { recursive: true, force: true });
});

async function fixture(over: Partial<NonNullable<RuntimeConfig["transfer"]>> = {}) {
  const root = await mkdtemp(join(tmpdir(), "piko-xfer-"));
  roots.push(root);
  const ws = join(root, "ws");
  await mkdir(ws, { recursive: true });
  const key = join(root, "id");
  await writeFile(key, "NOT-A-REAL-KEY\n");
  const kh = join(root, "known_hosts");
  await writeFile(kh, "example ssh-ed25519 AAAA\n");
  const cfg = {
    workspace: { roots: { t: ws }, staging_root: join(root, "staging") },
    transfer: {
      method: "scp",
      credential_ref: `file:${key}`,
      known_hosts: kh,
      target_allowlist: ["user@example:"],
      max_input_bytes: 1 << 20,
      retry: { max_attempts: 1, base_delay_ms: 0 },
      ...over,
    },
  } as unknown as RuntimeConfig;
  return { tf: new Transfer(cfg), root, ws, key, kh };
}

describe("data plane (design invariants, hermetic)", () => {
  it("fails closed when known_hosts is absent (host keys must be pinned)", async () => {
    const { tf } = await fixture({ known_hosts: undefined });
    const r = await tf.fetchInputs("t", [{ source: "user@example:/x" }]);
    expect(r.state).toBe("failed");
    expect(r.failed[0]!.error).toMatch(/known_hosts is required/);
  });

  it("materializes the credential to a 0600 temp file and removes it on close", async () => {
    const { tf, root, key } = await fixture();
    const r = await tf.fetchInputs("t", [{ source: "user@example:/x" }]);
    // The transfer fails (fake host), but the key must have been materialized
    // as a PATH, not passed as key material -- that was a real bug.
    expect(r.state).toBe("failed");
    const dir = join(root, "staging", ".keys");
    const files = existsSync(dir) ? readdirSync(dir) : [];
    expect(files).toHaveLength(1);
    const materialized = join(dir, files[0]!);
    expect(readFileSync(materialized, "utf8")).toBe(readFileSync(key, "utf8"));
    expect(statSync(materialized).mode & 0o777).toBe(0o600);
    // Not inside ~/.ssh, and gone once the transfer is closed.
    expect(materialized.includes(".ssh")).toBe(false);
    tf.close();
    expect(existsSync(materialized)).toBe(false);
  });

  it("fails closed when the credential reference cannot be resolved", async () => {
    const { tf } = await fixture({ credential_ref: "file:/nonexistent/key" });
    const r = await tf.fetchInputs("t", [{ source: "user@example:/x" }]);
    expect(r.state).toBe("failed");
  });

  it("refuses a target outside the allowlist before any transfer", async () => {
    const { tf } = await fixture();
    const r = await tf.fetchInputs("t", [{ source: "attacker@evil.example:/x" }]);
    expect(r.state).toBe("failed");
    expect(r.failed[0]!.error).toMatch(/allowlist/);
  });

  it("refuses a dest that escapes the staging root", async () => {
    const { tf } = await fixture();
    const r = await tf.fetchInputs("t", [{ source: "user@example:/x", dest: "../../etc/passwd" }]);
    expect(r.state).toBe("failed");
    expect(r.failed[0]!.error).toMatch(/escapes staging/);
  });

  it("does not deliver outputs to a non-allowlisted artifact target", async () => {
    const { tf, ws } = await fixture();
    await writeFile(join(ws, "out.txt"), "x");
    await expect(
      tf.deliverArtifacts("t", ["out.txt"], { method: "scp", target: "attacker@evil.example:/tmp" }, undefined, ws),
    ).rejects.toThrow(/allowlist/);
  });
});

// Opt-in real-scp smoke; requires PIKO_SCP_E2E=<user@host:> and a reachable
// sshd on that host with the configured key + known_hosts. Never touches ~/.ssh.
const E2E_TARGET = process.env.PIKO_SCP_E2E;
describe.skipIf(!E2E_TARGET)("data plane over real scp (opt-in)", () => {
  it("pulls with sha256 and pushes an artifact", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-scp-live-"));
    roots.push(root);
    const ws = join(root, "ws");
    await mkdir(ws, { recursive: true });
    const src = join(root, "in.md");
    await writeFile(src, "hello input\n");
    const cfg = {
      workspace: { roots: { t: ws }, staging_root: join(root, "staging") },
      transfer: {
        method: "scp",
        credential_ref: process.env.PIKO_SCP_KEY_REF ?? "env:PIKO_SCP_KEY",
        known_hosts: process.env.PIKO_SCP_KNOWN_HOSTS ?? join(root, "known_hosts"),
        target_allowlist: [E2E_TARGET!],
        max_input_bytes: 1 << 20,
        retry: { max_attempts: 1, base_delay_ms: 0 },
      },
    } as unknown as RuntimeConfig;
    const tf = new Transfer(cfg);
    const sha = createHash("sha256").update("hello input\n").digest("hex");
    const r = await tf.fetchInputs("t", [{ source: `${E2E_TARGET}${src}`, dest: "in.md", sha256: sha }]);
    expect(r.state).toBe("ready");
    expect(await readFile(join(root, "staging", "t", "in.md"), "utf8")).toBe("hello input\n");
  });
});
