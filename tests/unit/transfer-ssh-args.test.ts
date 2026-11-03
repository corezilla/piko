import { describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Transfer } from "../../src/transfer.js";
import type { RuntimeConfig } from "../../src/types.js";

/**
 * UT-TRANSFER-004 · the outbound SSH/scp argv.
 *
 * Regression: the shared credential skeleton carried "-B", which in ssh(1)
 * means bind_interface and TAKES A VALUE. The next token ("-q") was consumed
 * as the interface name, so ssh failed with
 *   "getifaddrs: -q: no suitable addresses"
 * and every remote execution returned an empty stdout with exit 255.
 *
 * The general defect class is "a value-taking flag is followed by another
 * flag, so that flag is silently swallowed as the value". These tests pin the
 * argv so that class cannot come back unnoticed.
 */

/** Options that ssh(1)/scp(1) accept WITHOUT a value. */
const VALUELESS_FLAGS = new Set([
  "4", "6", "A", "a", "C", "f", "G", "g", "K", "k", "M", "N", "n", "q", "s",
  "T", "t", "V", "v", "X", "x", "X", "Y", "y",
  "B", "C", "O", "p", "R", "r", "s", "T", "v", "3", "4", "6",
]);

/** Options that take a value, per ssh(1)/scp(1) usage. */
const VALUE_TAKING_FLAGS = new Set([
  "B", "b", "c", "D", "E", "e", "F", "I", "i", "J", "L", "l", "m", "O", "p",
  "P", "R", "S", "W", "w",
]);

function cfg(root: string, over: Partial<RuntimeConfig["transfer"]> = {}): RuntimeConfig {
  return {
    workspace: { roots: { t: "/ws" }, staging_root: root },
    transfer: {
      method: "scp",
      credential_ref: `file:${join(root, "key")}`,
      known_hosts: join(root, "known_hosts"),
      target_allowlist: ["store@nas:/srv/piko"],
      max_input_bytes: 1 << 20,
      retry: { max_attempts: 1, base_delay_ms: 0 },
      ...over,
    },
  } as unknown as RuntimeConfig;
}

/**
 * Assert that no value-taking flag is immediately followed by another flag —
 * that is the shape that made "-B -q" bind to the interface "-q".
 */
function expectNoFlagSwallowed(args: readonly string[]) {
  for (let i = 0; i < args.length - 1; i++) {
    const arg = args[i]!;
    if (!arg.startsWith("-") || arg === "--") continue;
    if (arg.startsWith("-o")) continue; // -o's value is the next token by design
    const flag = arg.replace(/^-+/, "");
    if (!VALUE_TAKING_FLAGS.has(flag)) continue;
    const next = args[i + 1]!;
    if (next.startsWith("-") && next !== "--") {
      throw new Error(
        `value-taking flag ${arg} is followed by ${next}, which ssh would consume as its value`,
      );
    }
  }
}

describe("UT-TRANSFER-004 · outbound SSH argv", () => {
  it("does not pass -B (bind_interface) to ssh", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-sshargs-"));
    try {
      await writeFile(join(root, "key"), "-----BEGIN KEY-----\n");
      const tf = new Transfer(cfg(root));
      const args = await tf.sshCommandArgs("host", ["echo", "hi"]);
      expect(args).not.toContain("-B");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("does not pass -q (quiet), which would hide ssh's connection diagnostics", async () => {
    // ssh uses exit 255 for BOTH its own failures and a remote command that
    // exits 255. The stderr diagnostics ("ssh: connect to host ... Operation
    // timed out") are what tell them apart, and "-q" silences them.
    const root = await mkdtemp(join(tmpdir(), "piko-sshargs-"));
    try {
      await writeFile(join(root, "key"), "-----BEGIN KEY-----\n");
      const tf = new Transfer(cfg(root));
      const args = await tf.sshCommandArgs("host", ["echo", "hi"]);
      expect(args).not.toContain("-q");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("never lets a value-taking flag swallow the next flag", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-sshargs-"));
    try {
      await writeFile(join(root, "key"), "-----BEGIN KEY-----\n");
      const tf = new Transfer(cfg(root));
      const args = await tf.sshCommandArgs("host", ["echo", "hi"]);
      expectNoFlagSwallowed(args);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("keeps the credential skeleton: pinned host keys, batch mode, identities only", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-sshargs-"));
    try {
      await writeFile(join(root, "key"), "-----BEGIN KEY-----\n");
      const tf = new Transfer(cfg(root));
      const args = await tf.sshCommandArgs("host", ["echo", "hi"]);
      const joined = args.join(" ");
      expect(joined).toContain("BatchMode=yes");
      expect(joined).toContain("StrictHostKeyChecking=yes");
      expect(joined).toContain("IdentitiesOnly=yes");
      expect(joined).toContain(`UserKnownHostsFile=${join(root, "known_hosts")}`);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("places the host and remote argv after the options", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-sshargs-"));
    try {
      await writeFile(join(root, "key"), "-----BEGIN KEY-----\n");
      const tf = new Transfer(cfg(root));
      const args = await tf.sshCommandArgs("user@host", ["cat", "/etc/hostname"]);
      const hostIdx = args.indexOf("user@host");
      expect(hostIdx).toBeGreaterThan(0);
      expect(args.slice(hostIdx)).toEqual(["user@host", "cat", "/etc/hostname"]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("fails closed when the host key pin is missing", async () => {
    const root = await mkdtemp(join(tmpdir(), "piko-sshargs-"));
    try {
      await writeFile(join(root, "key"), "-----BEGIN KEY-----\n");
      const tf = new Transfer(cfg(root, { known_hosts: undefined }));
      await expect(tf.sshCommandArgs("host", ["echo"])).rejects.toThrow(/known_hosts/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
