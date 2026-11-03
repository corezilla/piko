import { describe, expect, it } from "vitest";
import { createRemoteBashTool } from "../../src/remote-exec-tools.js";
import { ExecutionFactCollector } from "../../src/execution-facts.js";
import type { RemoteSpawner } from "../../src/remote-exec.js";
import { PikoError, type RuntimeConfig } from "../../src/types.js";

/**
 * MECH-TESTEXEC · remote executions must produce execution facts.
 *
 * Regression: `remote_bash` ran the SSH command but recorded NOTHING in the
 * execution-fact list, so a dead remote host produced an empty `executions`
 * array and an agent-authored report with empty stdout -- and the task was
 * published Completed. The consumer had nothing machine-judgeable to read.
 *
 * These tests pin the three paths that matter:
 *   - the remote command ran and failed   -> fact with the exit code
 *   - the remote never answered           -> fact with status spawn_error
 *   - the host was not allowlisted        -> fact with status policy_denied
 */

const cfg = {
  transfer: { known_hosts: "/tmp/kh", credential_ref: "file:/tmp/key" },
} as unknown as RuntimeConfig;

/** A spawner that reports a finished remote command with the given exit code. */
function spawnerWith(result: {
  exitCode: number | null;
  stdout?: string;
  stderr?: string;
  killed?: boolean;
}): RemoteSpawner {
  return (_args, _options, callback) => {
    const error =
      result.exitCode === 0 && !result.killed
        ? null
        : Object.assign(new Error("ssh failed"), {
            code: result.exitCode ?? 255,
            killed: result.killed ?? false,
          });
    setImmediate(() => callback(error, result.stdout ?? "", result.stderr ?? ""));
    return { on: () => {} };
  };
}

const transferStub = {
  async sshCommandArgs(host: string, argv: readonly string[]) {
    return ["-q", "--", host, ...argv];
  },
};

describe("MECH-TESTEXEC · remote_bash records execution facts", () => {
  it("records a fact with the remote exit code when the command ran", async () => {
    const collector = new ExecutionFactCollector();
    const tool = createRemoteBashTool({
      transfer: transferStub,
      config: cfg,
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawnerWith({ exitCode: 7, stderr: "cat: /etc/hostname: No such file" }),
    });
    await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" },
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    const facts = collector.list();
    expect(facts.length).toBe(1);
    expect(facts[0]!.command).toContain("host");
    expect(facts[0]!.command).toContain("cat /etc/hostname");
    expect(facts[0]!.status).toBe("exited");
    expect(facts[0]!.exit_code).toBe(7);
    expect(facts[0]!.output).toContain("No such file");
  });

  it("records a successful remote command with exit code 0", async () => {
    const collector = new ExecutionFactCollector();
    const tool = createRemoteBashTool({
      transfer: transferStub,
      config: cfg,
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawnerWith({ exitCode: 0, stdout: "a7048-Super-Server\n" }),
    });
    await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" },
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    const facts = collector.list();
    expect(facts.length).toBe(1);
    expect(facts[0]!.exit_code).toBe(0);
    expect(facts[0]!.status).toBe("exited");
    expect(facts[0]!.output).toContain("a7048-Super-Server");
  });

  it("records a timeout as a timeout fact with no exit code", async () => {
    const collector = new ExecutionFactCollector();
    const tool = createRemoteBashTool({
      transfer: transferStub,
      config: cfg,
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawnerWith({ exitCode: null, killed: true }),
    });
    await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" },
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    const facts = collector.list();
    expect(facts.length).toBe(1);
    expect(facts[0]!.status).toBe("timeout");
    expect(facts[0]!.timed_out).toBe(true);
    expect(facts[0]!.exit_code).toBeNull();
  });

  it("records an unreachable host as a spawn_error, not a command that exited 255", async () => {
    const collector = new ExecutionFactCollector();
    const tool = createRemoteBashTool({
      transfer: transferStub,
      config: cfg,
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawnerWith({
        exitCode: 255,
        stderr: "ssh: connect to host host port 22: Connection refused\n",
      }),
    });
    await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" },
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    const facts = collector.list();
    expect(facts.length).toBe(1);
    expect(facts[0]!.status).toBe("spawn_error");
    expect(facts[0]!.exit_code).toBeNull();
  });

  it("records a policy-denied fact without attempting the remote call", async () => {
    const collector = new ExecutionFactCollector();
    let attempted = false;
    const tool = createRemoteBashTool({
      transfer: {
        async sshCommandArgs() {
          attempted = true;
          return [];
        },
      },
      config: cfg,
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawnerWith({ exitCode: 0 }),
    });
    await tool.execute(
      "call-1",
      { host: "not-allowed", command: "cat /etc/hostname" },
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    expect(attempted).toBe(false);
    const facts = collector.list();
    expect(facts.length).toBe(1);
    expect(facts[0]!.status).toBe("policy_denied");
    expect(facts[0]!.exit_code).toBeNull();
  });

  it("records a fact when the transport fails before the command runs", async () => {
    const collector = new ExecutionFactCollector();
    const tool = createRemoteBashTool({
      transfer: {
        async sshCommandArgs(): Promise<string[]> {
          throw new PikoError("InputFetchFailed", 422, "connect to host: failure");
        },
      },
      config: cfg,
      remoteHosts: ["host"],
      executables: ["cat"],
      executionFacts: collector,
      spawn: spawnerWith({ exitCode: 0 }),
    });
    await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" },
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    const facts = collector.list();
    expect(facts.length).toBe(1);
    expect(facts[0]!.status).toBe("spawn_error");
    expect(facts[0]!.exit_code).toBeNull();
    expect(facts[0]!.output).toContain("connect to host: failure");
  });

  it("still works when no collector is supplied (backwards compatible)", async () => {
    const tool = createRemoteBashTool({
      transfer: transferStub,
      config: cfg,
      remoteHosts: ["host"],
      executables: ["cat"],
      spawn: spawnerWith({ exitCode: 0, stdout: "ok" }),
    });
    const result = await tool.execute(
      "call-1",
      { host: "host", command: "cat /etc/hostname" },
      () => {},
      {} as never,
      {} as never,
      {} as never,
    );
    expect(result.content).toBeDefined();
  });
});
