import { describe, expect, it } from "vitest";
import { execRemote, type RemoteSpawner } from "../../src/remote-exec.js";
import { PikoError, type RuntimeConfig } from "../../src/types.js";

/**
 * MECH-TESTEXEC · remote command execution.
 *
 * These are the fail-closed guarantees of the remote path:
 *   - a host outside remote_hosts is refused BEFORE any SSH attempt
 *   - an executable outside the allowlist is refused BEFORE any SSH attempt
 *   - a non-zero remote exit is a RESULT, not an exception
 *   - a timeout has no exit code and an UNKNOWN remote stop state
 *   - a transport failure is an exception (the caller must report failure)
 */

const cfg = {
  transfer: { known_hosts: "/tmp/kh", credential_ref: "file:/tmp/key" },
} as unknown as RuntimeConfig;

const transferStub = {
  async sshCommandArgs(host: string, argv: readonly string[]) {
    return ["-q", "--", host, ...argv];
  },
};

function spawner(behaviour: {
  exitCode?: number | null;
  stdout?: string;
  stderr?: string;
  killed?: boolean;
  throwOnSpawn?: Error;
}): RemoteSpawner {
  return (_args, _options, callback) => {
    if (behaviour.throwOnSpawn) {
      setImmediate(() => callback(behaviour.throwOnSpawn!, "", ""));
      return { on: () => {} };
    }
    const exitCode = behaviour.exitCode ?? 0;
    const error =
      exitCode === 0 && !behaviour.killed
        ? null
        : Object.assign(new Error("ssh failed"), {
            code: exitCode === 0 ? 255 : exitCode,
            killed: behaviour.killed ?? false,
          });
    setImmediate(() => callback(error, behaviour.stdout ?? "", behaviour.stderr ?? ""));
    return { on: () => {} };
  };
}

describe("MECH-TESTEXEC · execRemote policy guards", () => {
  it("refuses a host outside remote_hosts before spawning ssh", async () => {
    let spawned = false;
    await expect(
      execRemote(
        { host: "evil@host", argv: ["cat"], remoteHosts: ["good@host"] },
        { async sshCommandArgs() { spawned = true; return []; } },
        cfg,
        spawner({ exitCode: 0 }),
      ),
    ).rejects.toThrow(/remote host not allowed/);
    expect(spawned).toBe(false);
  });

  it("refuses an executable outside the allowlist before spawning ssh", async () => {
    let spawned = false;
    await expect(
      execRemote(
        { host: "good@host", argv: ["rm", "-rf", "/"], executables: ["cat"] },
        { async sshCommandArgs() { spawned = true; return []; } },
        cfg,
        spawner({ exitCode: 0 }),
      ),
    ).rejects.toThrow(/not allowed/);
    expect(spawned).toBe(false);
  });

  it("rejects an empty argv", async () => {
    await expect(
      execRemote({ host: "h", argv: [] }, transferStub, cfg, spawner({ exitCode: 0 })),
    ).rejects.toThrow(/must not be empty/);
  });

  it("does not join argv into a shell string", async () => {
    let seen: readonly string[] = [];
    await execRemote(
      { host: "h", argv: ["cat", "/etc/hostname; rm -rf /"] },
      {
        async sshCommandArgs(_host: string, argv: readonly string[]) {
          seen = argv;
          return ["-q", "--", "h", ...argv];
        },
      },
      cfg,
      spawner({ exitCode: 0 }),
    );
    // The dangerous text stays one argv element; it is never re-split.
    expect(seen).toEqual(["cat", "/etc/hostname; rm -rf /"]);
  });
});

describe("MECH-TESTEXEC · execRemote results", () => {
  it("returns a non-zero exit code as a normal result, not an exception", async () => {
    const result = await execRemote(
      { host: "h", argv: ["cat"] },
      transferStub,
      cfg,
      spawner({ exitCode: 7, stderr: "boom" }),
    );
    expect(result.exit_code).toBe(7);
    expect(result.stderr).toBe("boom");
    expect(result.timed_out).toBe(false);
  });

  it("reports a timeout with no exit code and an unknown remote stop state", async () => {
    const result = await execRemote(
      { host: "h", argv: ["sleep", "100"] },
      transferStub,
      cfg,
      spawner({ exitCode: 0, killed: true }),
    );
    expect(result.timed_out).toBe(true);
    expect(result.exit_code).toBeNull();
    // The SSH client exiting does NOT mean the remote process stopped.
    expect(result.remote_stop_state).toBe("unknown");
  });

  it("reports a normal completion as stopped", async () => {
    const result = await execRemote(
      { host: "h", argv: ["cat"] },
      transferStub,
      cfg,
      spawner({ exitCode: 0, stdout: "ok\n" }),
    );
    expect(result.exit_code).toBe(0);
    expect(result.stdout).toBe("ok\n");
    expect(result.remote_stop_state).toBe("stopped");
  });

  it("throws on a transport failure so the caller can report failure", async () => {
    await expect(
      execRemote(
        { host: "h", argv: ["cat"] },
        transferStub,
        cfg,
        spawner({ throwOnSpawn: new Error("connect to host: failure") }),
      ),
    ).rejects.toThrow(PikoError);
  });
});

describe("MECH-TESTEXEC · ssh client failure vs remote command failure", () => {
  it("reports an unreachable host as a transport failure with no exit code", async () => {
    // ssh exits 255 for its OWN errors. A dead host must not look like
    // "the command ran and returned 255".
    const result = await execRemote(
      { host: "h", argv: ["cat"] },
      transferStub,
      cfg,
      spawner({
        exitCode: 255,
        stderr: "ssh: connect to host h port 22: Connection refused\n",
      }),
    );
    expect(result.transport_failed).toBe(true);
    expect(result.exit_code).toBeNull();
  });

  it("treats an auth refusal as a transport failure", async () => {
    const result = await execRemote(
      { host: "h", argv: ["cat"] },
      transferStub,
      cfg,
      spawner({ exitCode: 255, stderr: "a7048@h: Permission denied (publickey,password).\n" }),
    );
    expect(result.transport_failed).toBe(true);
    expect(result.exit_code).toBeNull();
  });

  it("keeps a genuine remote exit of 255 as a command exit, not a transport failure", async () => {
    // The remote command really ran and really returned 255.
    const result = await execRemote(
      { host: "h", argv: ["cat"] },
      transferStub,
      cfg,
      spawner({ exitCode: 255, stderr: "some program output\n" }),
    );
    expect(result.transport_failed).toBe(false);
    expect(result.exit_code).toBe(255);
  });

  it("detects the connect timeout ssh reports on stderr", async () => {
    // The live failure mode on m5air: A7048 down -> ssh prints
    // "ssh: connect to host ... Operation timed out" and exits 255.
    const result = await execRemote(
      { host: "h", argv: ["cat"] },
      transferStub,
      cfg,
      spawner({
        exitCode: 255,
        stderr: "ssh: connect to host unreachable.invalid port 22: Operation timed out\n",
      }),
    );
    expect(result.transport_failed).toBe(true);
    expect(result.exit_code).toBeNull();
    expect(result.stderr).toContain("Operation timed out");
  });

  it("detects an auth refusal ssh reports on stderr", async () => {
    const result = await execRemote(
      { host: "h", argv: ["cat"] },
      transferStub,
      cfg,
      spawner({ exitCode: 255, stderr: "a7048@h: Permission denied (publickey,password).\n" }),
    );
    expect(result.transport_failed).toBe(true);
    expect(result.exit_code).toBeNull();
  });
});
