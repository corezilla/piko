import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { execRemote } from "./remote-exec.js";
import { splitRemoteCommand } from "./remote-exec-tools.js";
import { PikoError, type RuntimeConfig } from "./types.js";

/**
 * A fake transfer that records the ssh argv it was asked for instead of
 * actually running ssh. Lets the tests assert on the credential skeleton and
 * the argv shape without a remote host.
 */
function fakeTransfer(argvLog: string[][]) {
  return {
    async sshCommandArgs(host: string, argv: readonly string[]) {
      argvLog.push([host, ...argv]);
      return ["-B", "-q", "-o", "BatchMode=yes", "--", host, ...argv];
    },
  };
}

const config = { transfer: { known_hosts: "/tmp/known_hosts" } } as unknown as RuntimeConfig;

describe("splitRemoteCommand", () => {
  it("splits on whitespace", () => {
    assert.deepEqual(splitRemoteCommand("pytest tests/unit"), ["pytest", "tests/unit"]);
  });

  it("collapses extra whitespace", () => {
    assert.deepEqual(splitRemoteCommand("  pytest   -q  "), ["pytest", "-q"]);
  });

  it("returns empty for a blank command", () => {
    assert.deepEqual(splitRemoteCommand("   "), []);
  });
});

describe("execRemote — policy enforcement", () => {
  it("rejects a host that is not on the remote_hosts allowlist", async () => {
    const argvLog: string[][] = [];
    await assert.rejects(
      () =>
        execRemote(
          { host: "evil", argv: ["ls"], remoteHosts: ["a7048"] },
          fakeTransfer(argvLog),
          config,
        ),
      (error: unknown) => {
        assert.ok(error instanceof PikoError);
        assert.equal(error.code, "ScopeDenied");
        return true;
      },
    );
    // The refusal happens BEFORE any ssh attempt.
    assert.equal(argvLog.length, 0);
  });

  it("rejects an executable that is not on the executables allowlist", async () => {
    const argvLog: string[][] = [];
    await assert.rejects(
      () =>
        execRemote(
          { host: "a7048", argv: ["rm", "-rf", "/"], executables: ["pytest"], remoteHosts: ["a7048"] },
          fakeTransfer(argvLog),
          config,
        ),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /executable not allowed/);
        return true;
      },
    );
    assert.equal(argvLog.length, 0);
  });

  it("rejects an empty argv", async () => {
    const argvLog: string[][] = [];
    await assert.rejects(
      () => execRemote({ host: "a7048", argv: [] }, fakeTransfer(argvLog), config),
      (error: unknown) => {
        assert.ok(error instanceof PikoError);
        assert.equal(error.code, "InvalidRequest");
        return true;
      },
    );
    assert.equal(argvLog.length, 0);
  });

  it("allows an empty allowlist (no restriction)", async () => {
    const argvLog: string[][] = [];
    // No remoteHosts / executables given — the call proceeds to ssh. The
    // command itself will fail (no real ssh to that host), which is fine:
    // the point is that it was not refused by policy.
    await execRemote({ host: "a7048", argv: ["ls"] }, fakeTransfer(argvLog), config).catch(() => undefined);
    assert.equal(argvLog.length, 1);
    assert.equal(argvLog[0]?.[0], "a7048");
  });
});

describe("execRemote — command construction", () => {
  it("passes the argv through without shell quoting", async () => {
    const argvLog: string[][] = [];
    await execRemote(
      { host: "a7048", argv: ["pytest", "-k", "foo bar"] },
      fakeTransfer(argvLog),
      config,
    ).catch(() => undefined);
    assert.deepEqual(argvLog[0], ["a7048", "pytest", "-k", "foo bar"]);
  });

  it("wraps the command in a cd when a cwd is given", async () => {
    const argvLog: string[][] = [];
    await execRemote(
      { host: "a7048", argv: ["pytest"], cwd: "/home/mlp/hifm" },
      fakeTransfer(argvLog),
      config,
    ).catch(() => undefined);
    assert.deepEqual(argvLog[0], ["a7048", "cd", "/home/mlp/hifm", "&&", "pytest"]);
  });

  it("does not wrap in a cd when no cwd is given", async () => {
    const argvLog: string[][] = [];
    await execRemote({ host: "a7048", argv: ["pytest"] }, fakeTransfer(argvLog), config).catch(() => undefined);
    assert.deepEqual(argvLog[0], ["a7048", "pytest"]);
  });
});
