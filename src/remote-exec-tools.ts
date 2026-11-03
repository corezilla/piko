/**
 * MECH-TESTEXEC §4 — the `remote_bash` tool.
 *
 * Executes a command on a remote host over SSH. Separate from the local
 * `bash` tool by name and by semantics: different target, different
 * authorization (remote_hosts instead of a local workspace), different
 * outcome reporting (remote stop state is not implied by client exit).
 *
 * The tool exists so an agent can run a test checker on the machine that
 * hosts the code under test. The instruction (from slinky) decides WHICH
 * command to run; the tool profile decides WHICH host and WHICH executable
 * are permitted.
 *
 * Per design: docs/20_system_design/mechanisms/piko-test-execution.md §4
 */

import { Type, type Static } from "typebox";
import type { AgentHarnessTool } from "../upstream/pi/packages/agent/src/harness/types.ts";
import type { ExecutionToolContext } from "../upstream/pi/packages/agent/src/harness/tools/tool-context.ts";
import { execRemote, type RemoteExecResult, type RemoteSpawner } from "./remote-exec.js";
import type { ExecutionFact, ExecutionFactCollector } from "./execution-facts.js";
import { PikoError, type RuntimeConfig } from "./types.js";

export const RemoteBashSchema = Type.Object({
  host: Type.String({
    description: "Remote host to execute on, as understood by ssh (e.g. 'a7048' or 'user@host').",
    minLength: 1,
    maxLength: 256,
  }),
  command: Type.String({
    description:
      "Command to run on the remote host. The remote executable is checked against " +
      "the tool profile's executables allowlist before the call is made.",
    minLength: 1,
    maxLength: 8192,
  }),
  cwd: Type.Optional(
    Type.String({
      description: "Working directory on the remote host.",
      maxLength: 1024,
    }),
  ),
  timeout_ms: Type.Optional(
    Type.Number({
      description: "Wall-clock limit for the remote command, in milliseconds.",
      minimum: 1000,
      maximum: 3_600_000,
    }),
  ),
});

export type RemoteBashParams = Static<typeof RemoteBashSchema>;

export interface RemoteBashDetails {
  host: string;
  exit_code: number | null;
  timed_out: boolean;
  truncated: boolean;
  remote_stop_state: "stopped" | "unknown";
  duration_ms: number;
  /** Present when the call was refused before any SSH attempt. */
  error?: string;
}

export interface RemoteExecToolDeps {
  /** Credential skeleton provider — Transfer in production. */
  transfer: { sshCommandArgs(host: string, argv: readonly string[]): Promise<string[]> };
  config: RuntimeConfig;
  /** Allowed remote hosts (from the tool profile). Empty = no restriction. */
  remoteHosts: readonly string[];
  /** Allowed executables (from the tool profile). Empty = no restriction. */
  executables: readonly string[];
  /**
   * Collector for execution facts. Optional so existing callers are
   * unaffected; when present, every remote invocation -- including one that
   * fails to connect -- is recorded, so a dead remote host produces a
   * machine-judgeable failure fact instead of an empty report.
   */
  executionFacts?: ExecutionFactCollector;
  /** Spawn seam; defaults to execFile("ssh", ...). Tests inject a fake. */
  spawn?: RemoteSpawner;
}

const REMOTE_BASH_DESCRIPTION =
  "Execute a command on a remote host over SSH. Use this to run a test checker or " +
  "build step on the machine that hosts the code under test. The remote executable " +
  "is checked against the profile's executables allowlist and the host against the " +
  "profile's remote_hosts allowlist before the call is made. Returns the exit code " +
  "and combined output. A non-zero exit code is a normal result, not a tool failure; " +
  "judge success from exit_code, not from the text.";

/**
 * Split a command string into argv for the remote host.
 *
 * The remote side runs the command through a shell, but the local side never
 * builds a shell string for the SSH invocation itself — the argv array is what
 * gets passed through, and the executable allowlist check happens on argv[0].
 */
export function splitRemoteCommand(command: string): string[] {
  return command
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

export function createRemoteBashTool(
  deps: RemoteExecToolDeps,
): AgentHarnessTool<ExecutionToolContext, typeof RemoteBashSchema, RemoteBashDetails | undefined> {
  return {
    name: "remote_bash",
    label: "Remote bash",
    description: REMOTE_BASH_DESCRIPTION,
    parameters: RemoteBashSchema,
    async execute(_toolCallId, params, _onUpdate, _toolContext, _invocation, _context) {
      const argv = splitRemoteCommand(params.command);
      const startedAt = new Date().toISOString();
      const startedMs = Date.now();
      const fact = (over: Partial<ExecutionFact>): ExecutionFact => ({
        tool_call_id: null,
        command: `${params.host}: ${params.command}`,
        exit_code: null,
        status: "exited",
        output: "",
        truncated: false,
        timed_out: false,
        started_at: startedAt,
        ended_at: new Date().toISOString(),
        duration_ms: Date.now() - startedMs,
        ...over,
      });
      try {
        const result: RemoteExecResult = await execRemote(
          {
            host: params.host,
            argv,
            cwd: params.cwd,
            timeoutMs: params.timeout_ms,
            executables: deps.executables,
            remoteHosts: deps.remoteHosts,
          },
          deps.transfer,
          deps.config,
          deps.spawn,
        );
        deps.executionFacts?.record(
          fact({
            exit_code: result.exit_code,
            // A transport failure means the remote command never ran, so it is
            // a spawn_error, not an "exited" command that happened to return
            // ssh's own 255.
            status: result.timed_out
              ? "timeout"
              : result.transport_failed
                ? "spawn_error"
                : "exited",
            output: `${result.stdout}${result.stderr}`,
            truncated: result.truncated,
            timed_out: result.timed_out,
          }),
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                exit_code: result.exit_code,
                stdout: result.stdout,
                stderr: result.stderr,
                timed_out: result.timed_out,
                truncated: result.truncated,
                transport_failed: result.transport_failed,
                remote_stop_state: result.remote_stop_state,
                duration_ms: result.duration_ms,
              }),
            },
          ],
          details: {
            host: params.host,
            exit_code: result.exit_code,
            timed_out: result.timed_out,
            truncated: result.truncated,
            remote_stop_state: result.remote_stop_state,
            duration_ms: result.duration_ms,
          },
        };
      } catch (e) {
        // Policy refusals and transport failures are reported as a structured
        // error result so the agent can react, rather than aborting the task.
        const message = e instanceof Error ? e.message : String(e);
        const code = e instanceof PikoError ? e.code : "RemoteExecFailed";
        // A remote host that is down (or refused) is a real execution fact:
        // the command did not run, so it is not a success. Recording it here
        // is what lets slinky's Oracle see "the remote never ran" instead of
        // an agent-authored report with empty output.
        deps.executionFacts?.record(
          fact({
            status: code === "ScopeDenied" ? "policy_denied" : "spawn_error",
            output: message,
          }),
        );
        return {
          content: [{ type: "text", text: `remote execution unavailable: ${code}: ${message}` }],
          details: {
            host: params.host,
            exit_code: null,
            timed_out: false,
            truncated: false,
            remote_stop_state: "unknown",
            duration_ms: 0,
            error: code,
          },
        };
      }
    },
  };
}
