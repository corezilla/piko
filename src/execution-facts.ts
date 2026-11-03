/**
 * MECH-TESTEXEC §5 — execution facts.
 *
 * Pi's bash tool converts a non-zero exit code into an Error string
 * ("Command exited with code N") and throws before returning, so the numeric
 * exit code never reaches Piko. The `prepare` hook runs before env.exec and
 * cannot see it either. Capturing it at the env boundary (see
 * DurableNodeExecutionEnv.exec) is the only place it survives without
 * modifying vendored Pi.
 *
 * The facts are machine-judgeable and deliberately separate from `summary`,
 * which is the model's own natural-language account. Slinky's Oracle
 * comparison must use these, not the summary.
 *
 * Per design: docs/20_system_design/mechanisms/piko-test-execution.md §5
 */

export type ExecutionStatus =
  | "exited"      // finished; exit_code is set
  | "timeout"     // exceeded the caller's time limit
  | "aborted"     // cancelled by the caller
  | "spawn_error" // the process could not be started
  | "policy_denied"; // refused before execution (allowlist)

export interface ExecutionFact {
  /** Tool call this fact belongs to; null when the call could not be identified. */
  tool_call_id: string | null;
  /** The command as issued. */
  command: string;
  /** Process exit code; null when the process never produced one. */
  exit_code: number | null;
  status: ExecutionStatus;
  /**
   * Captured output.
   *
   * NOTE: Pi's NodeExecutionEnv merges stdout and stderr into a single
   * stream, so they cannot be separated here. This is a limitation of the Pi
   * layer, not a choice made here -- separating them would require an
   * upstream change to ShellExecResult.
   */
  output: string;
  truncated: boolean;
  timed_out: boolean;
  started_at: string;
  ended_at: string;
  duration_ms: number;
}

/** Collects execution facts across the lifetime of one env instance. */
export class ExecutionFactCollector {
  private readonly facts: ExecutionFact[] = [];

  record(fact: ExecutionFact): void {
    this.facts.push(fact);
  }

  /** Facts in execution order. */
  list(): ExecutionFact[] {
    return [...this.facts];
  }

  /** Most recent fact, if any. */
  last(): ExecutionFact | undefined {
    return this.facts[this.facts.length - 1];
  }

  clear(): void {
    this.facts.length = 0;
  }
}

/**
 * Map a Pi ExecutionError code to an execution status.
 *
 * Pi's ExecutionError codes are "aborted" | "timeout" | "shell_unavailable" |
 * "spawn_error" | "callback_error" | "unknown".
 */
export function statusFromErrorCode(code: string | undefined): ExecutionStatus {
  switch (code) {
    case "timeout":
      return "timeout";
    case "aborted":
      return "aborted";
    case "spawn_error":
    case "shell_unavailable":
      return "spawn_error";
    default:
      return "spawn_error";
  }
}
