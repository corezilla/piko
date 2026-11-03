/**
 * MECH-TESTEXEC §4 — remote command execution over SSH.
 *
 * Piko runs on m5air; HIFM test execution happens on A7048. This module
 * executes a command on a remote host and returns machine-judgeable facts.
 *
 * Credential handling is NOT re-implemented here: the SSH argument skeleton
 * (private-key materialization, known_hosts pinning, BatchMode, IdentitiesOnly)
 * lives in Transfer.sshCommandArgs() and is reused verbatim, so remote
 * execution has exactly the same fail-closed posture as scp.
 *
 * Key semantic: **the SSH client exiting does not mean the remote process
 * stopped.** On timeout/abort the remote stop state is reported as "unknown",
 * never as "stopped". See
 * docs/20_system_design/mechanisms/piko-test-execution.md §4.5.
 */

import { execFile } from "node:child_process";
import { PikoError, type RuntimeConfig } from "./types.js";
import { assertRemoteExecutableAllowed } from "./tool-exec-policy.js";

export type RemoteStopState = "stopped" | "unknown";

export interface RemoteExecResult {
  exit_code: number | null;
  stdout: string;
  stderr: string;
  truncated: boolean;
  timed_out: boolean;
  duration_ms: number;
  /** Whether the remote process is known to have stopped. */
  remote_stop_state: RemoteStopState;
}

export interface RemoteExecOptions {
  /** Target host as understood by ssh (e.g. "a7048" or "user@host"). */
  host: string;
  /** argv passed to the remote shell. Never joined into a string. */
  argv: readonly string[];
  /** Working directory on the remote host. */
  cwd?: string;
  /** Wall-clock limit for the remote command. */
  timeoutMs?: number;
  /** Allowed executables (argv[0] must match one). Empty = no restriction. */
  executables?: readonly string[];
  /** Allowed remote hosts. Empty = no restriction. */
  remoteHosts?: readonly string[];
}

const DEFAULT_TIMEOUT_MS = 300_000;
const MAX_OUTPUT_BYTES = 1 << 20; // 1 MiB per stream, mirroring Pi's capture bound.

/**
 * Execute a command on a remote host over SSH.
 *
 * Throws PikoError for policy violations and for a failed transport. A command
 * that ran but exited non-zero is NOT an error here — it is returned as a
 * result with a non-zero exit_code, because the caller (and slinky's Oracle
 * comparison) needs to judge it.
 */
export async function execRemote(
  options: RemoteExecOptions,
  transfer: { sshCommandArgs(host: string, argv: readonly string[]): Promise<string[]> },
  config: RuntimeConfig,
): Promise<RemoteExecResult> {
  const { host, argv } = options;

  if (argv.length === 0) {
    throw new PikoError("InvalidRequest", 400, "remote command argv must not be empty");
  }

  // Host allowlist. remote_hosts is a SEPARATE allowlist from network_hosts:
  // the remote execution target host is not the same concept as an outbound
  // network destination.
  const allowedHosts = options.remoteHosts ?? [];
  if (allowedHosts.length > 0 && !allowedHosts.includes(host)) {
    throw new PikoError(
      "ScopeDenied",
      403,
      `remote host not allowed: ${host} (allowed: ${allowedHosts.join(", ")})`,
    );
  }

  // Executable allowlist (same policy as the local bash tool).
  assertRemoteExecutableAllowed(argv, options.executables ?? []);

  // Build the remote argv: cd into cwd (if any), then run the command.
  const remoteArgv = options.cwd ? ["cd", options.cwd, "&&", ...argv] : [...argv];

  const sshArgs = await transfer.sshCommandArgs(host, remoteArgv);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const startedAt = Date.now();

  return await new Promise<RemoteExecResult>((resolve, reject) => {
    let settled = false;
    const child = execFile(
      "ssh",
      sshArgs,
      { timeout: timeoutMs, maxBuffer: MAX_OUTPUT_BYTES * 2, encoding: "utf8" },
      (error, stdout, stderr) => {
        if (settled) return;
        settled = true;
        const durationMs = Date.now() - startedAt;

        // execFile's error carries the exit code for a non-zero remote exit.
        // A timeout is signalled by error.killed / error.signal === "SIGTERM".
        const killed = Boolean((error as { killed?: boolean } | undefined)?.killed);
        const timedOut = killed || (error as { signal?: string } | undefined)?.signal === "SIGTERM";

        let exitCode: number | null = null;
        if (!error) {
          exitCode = 0;
        } else {
          const code = (error as { code?: unknown }).code;
          if (typeof code === "number") exitCode = code;
          else if (typeof code === "string" && /^\d+$/.test(code)) exitCode = Number(code);
        }

        if (error && exitCode === null && !timedOut) {
          // Transport-level failure (host unreachable, auth refused, ...).
          reject(
            new PikoError(
              "InputFetchFailed",
              422,
              `remote execution failed: ${(error as Error).message}`,
            ),
          );
          return;
        }

        resolve({
          exit_code: exitCode,
          stdout: truncate(stdout ?? ""),
          stderr: truncate(stderr ?? ""),
          truncated: (stdout?.length ?? 0) > MAX_OUTPUT_BYTES || (stderr?.length ?? 0) > MAX_OUTPUT_BYTES,
          timed_out: timedOut,
          duration_ms: durationMs,
          // The SSH client exiting says nothing about the remote process.
          remote_stop_state: timedOut ? "unknown" : "stopped",
        });
      },
    );

    // Never leave the client running past the timeout.
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      reject(new PikoError("InputFetchFailed", 422, `remote execution failed: ${error.message}`));
    });
  });
}

function truncate(value: string): string {
  return value.length > MAX_OUTPUT_BYTES ? value.slice(0, MAX_OUTPUT_BYTES) : value;
}
