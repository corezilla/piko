import { afterEach, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { Transfer } from "../../src/transfer.js";
import type { RuntimeConfig } from "../../src/types.js";

/**
 * Real data-plane end-to-end over the actual `scp` transport (loopback ssh).
 * Skipped automatically when passwordless localhost ssh is unavailable.
 */
function sshReady(): boolean {
  try {
    execFileSync("ssh", ["-o", "BatchMode=yes", "-o", "ConnectTimeout=3", "localhost", "true"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
const READY = sshReady();
const user = execFileSync("whoami").toString().trim();

const roots: string[] = [];
afterEach(async () => {
  for (const r of roots.splice(0)) await rm(r, { recursive: true, force: true });
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "piko-scp-"));
  roots.push(root);
  const staging = join(root, "staging");
  const remote = join(root, "remote");
  await mkdir(remote, { recursive: true });
  const cfg = {
    workspace: { roots: { t: join(root, "ws") }, staging_root: staging },
    transfer: {
      method: "scp",
      target_allowlist: [`${user}@localhost:`],
      max_input_bytes: 1 << 20,
      retry: { max_attempts: 1, base_delay_ms: 0 },
    },
  } as unknown as RuntimeConfig;
  await mkdir(join(root, "ws"), { recursive: true });
  return { transfer: new Transfer(cfg), root, staging, remote };
}

describe.skipIf(!READY)("data plane over real scp (loopback)", () => {
  it("P-INPUT pulls a remote file and verifies sha256", async () => {
    const { transfer, remote, root } = await fixture();
    const src = join(remote, "in.md");
    await writeFile(src, "hello input\n");
    const sha = createHash("sha256").update("hello input\n").digest("hex");
    const staging = await transfer.fetchInputs("t1", [{ source: `${user}@localhost:${src}`, dest: "in/in.md", sha256: sha }]);
    expect(staging.state).toBe("ready");
    expect(await readFile(join(root, "staging", "t1", "in", "in.md"), "utf8")).toBe("hello input\n");
  });

  it("P-INPUT fails closed on a sha256 mismatch", async () => {
    const { transfer, remote } = await fixture();
    const src = join(remote, "in.md");
    await writeFile(src, "hello input\n");
    const staging = await transfer.fetchInputs("t2", [{ source: `${user}@localhost:${src}`, dest: "in.md", sha256: "0".repeat(64) }]);
    expect(staging.state).toBe("failed");
    expect(staging.failed[0]!.source).toContain("in.md");
  });

  it("P-ARTIFACT pushes an output to the remote target with path/sha256/size", async () => {
    const { transfer, root, remote } = await fixture();
    await writeFile(join(root, "ws", "out.txt"), "artifact body\n");
    const target = `${user}@localhost:${remote}`;
    const r = await transfer.deliverArtifacts("t3", ["out.txt"], { method: "scp", target }, undefined, join(root, "ws"));
    expect(r.state).toBe("delivered");
    expect(r.delivered[0]).toMatchObject({ path: "out.txt", size_bytes: 14 });
    expect(existsSync(join(remote, "out.txt"))).toBe(true);
    expect(await readFile(join(remote, "out.txt"), "utf8")).toBe("artifact body\n");
  });

  it("rejects a target outside the allowlist before any transfer", async () => {
    const { transfer, root } = await fixture();
    await writeFile(join(root, "ws", "out.txt"), "x");
    await expect(
      transfer.deliverArtifacts("t4", ["out.txt"], { method: "scp", target: "attacker@evil.example:/tmp" }, undefined, join(root, "ws")),
    ).rejects.toThrow(/allowlist/);
  });
});
