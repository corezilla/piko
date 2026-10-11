import { afterAll, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { Transfer } from "../../src/transfer.js";
import type { RuntimeConfig } from "../../src/types.js";

/**
 * Real scp data-plane e2e against a live remote host, opt-in via
 * PIKO_SCP_REMOTE (e.g. "mlp@192.168.1.9:"). Uses a hermetic home with a pinned
 * known_hosts and the private key via credential_ref — never touches ~/.ssh.
 * Skipped when PIKO_SCP_REMOTE is unset (default CI/local run).
 */
const REMOTE = process.env.PIKO_SCP_REMOTE;
const KEY_REF = process.env.PIKO_SCP_KEY_REF ?? `file:${process.env.HOME}/.ssh/id_ed25519`;
const REMOTE_DIR = process.env.PIKO_SCP_DIR ?? "/tmp/piko-dn-test";
// Non-default SSH port (hermetic datanode sshd); omit for 22.
const PORT = process.env.PIKO_SCP_PORT;

const KEY_PATH = KEY_REF.startsWith("file:") ? KEY_REF.slice("file:".length) : null;

/** ssh argv prefix: port, pinned known_hosts and the credential key. */
function sshBase(host: string): string[] {
  const known = process.env.PIKO_SCP_KNOWN_HOSTS;
  return [
    "-o", "BatchMode=yes",
    ...(PORT ? ["-p", PORT] : []),
    ...(known ? ["-o", `UserKnownHostsFile=${known}`, "-o", "StrictHostKeyChecking=yes"] : []),
    ...(KEY_PATH ? ["-i", KEY_PATH, "-o", "IdentitiesOnly=yes"] : []),
    host,
  ];
}

function sshReady(remote: string): boolean {
  try {
    execFileSync("ssh", [...sshBase(remote.replace(/:$/, "")), "-o", "ConnectTimeout=4", "true"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
const READY = !!REMOTE && sshReady(REMOTE!);
const root = mkdtempSync(join(tmpdir(), "piko-scp-live-"));
const HOME = join(root, "home");

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe.skipIf(!READY)("data plane over real scp (live remote)", () => {
  // describe.skipIf still evaluates this callback body at collection time, so
  // REMOTE may be undefined here; derive the host defensively.
  const hostOnly = (REMOTE ?? "").replace(/:$/, "");
  const host = hostOnly.includes("@") ? (hostOnly.split("@")[1] ?? hostOnly) : hostOnly;
  const port = PORT ?? null;
  function env() {
    mkdirSync(join(HOME, ".ssh"), { recursive: true });
    const known = join(HOME, ".ssh", "known_hosts");
    if (!readFileSync(known, { flag: "a+" }).toString().includes(host)) {
      const scan = execFileSync(
        "ssh-keyscan",
        port ? ["-p", String(port), "-t", "ed25519", host] : ["-t", "ed25519", host],
        { stdio: ["ignore", "pipe", "pipe"] },
      ).toString();
      writeFileSync(known, scan);
    }
    const ws = join(root, "ws");
    mkdirSync(ws, { recursive: true });
    const cfg = {
      workspace: { roots: { t: ws }, staging_root: join(root, "staging") },
      transfer: {
        method: "scp",
        credential_ref: KEY_REF,
        ...(PORT ? { port: Number(PORT) } : {}),
        known_hosts: known,
        target_allowlist: [REMOTE!],
        max_input_bytes: 1 << 20,
        retry: { max_attempts: 1, base_delay_ms: 0 },
      },
    } as unknown as RuntimeConfig;
    return { tf: new Transfer(cfg), ws };
  }

  it("P-INPUT pulls a remote file and verifies sha256", async () => {
    execFileSync("ssh", [...sshBase(hostOnly), `mkdir -p ${REMOTE_DIR}/in && printf 'hello from remote input\\n' > ${REMOTE_DIR}/in/seed.md`]);
    const { tf } = env();
    const sha = createHash("sha256").update("hello from remote input\n").digest("hex");
    const st = await tf.fetchInputs("live", [{ source: `${REMOTE}${REMOTE_DIR}/in/seed.md`, dest: "in/seed.md", sha256: sha }]);
    expect(st.state).toBe("ready");
    expect(readFileSync(join(root, "staging", "live", "in", "seed.md"), "utf8")).toBe("hello from remote input\n");
  });

  it("P-ARTIFACT pushes an output to the remote target", async () => {
    execFileSync("ssh", [...sshBase(hostOnly), `mkdir -p ${REMOTE_DIR}/out`]);
    const { tf, ws } = env();
    writeFileSync(join(ws, "report.txt"), "artifact body from piko\n");
    const d = await tf.deliverArtifacts("live", ["report.txt"], { method: "scp", target: `${REMOTE}${REMOTE_DIR}/out` }, undefined, ws);
    expect(d.state).toBe("delivered");
    expect(d.delivered[0]).toMatchObject({ path: "report.txt", size_bytes: 24 });
    const roundtrip = execFileSync("ssh", [...sshBase(hostOnly), `cat ${REMOTE_DIR}/out/report.txt`]).toString();
    expect(roundtrip).toBe("artifact body from piko\n");
  });
});
