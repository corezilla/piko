/**
 * MECH-TESTEXEC §5.5 — raw result evidence.
 *
 * Slinky's TestExecution.raw_result_ref is an Artifact reference, so the raw
 * report comes back as a FILE (via output_paths), not as a field in the
 * result envelope. PTS-04 requires that a missing report is an execution
 * FAILURE fact, not a success:
 *
 *   "The report carries the actual end time, actual value, error (may be
 *    null) and known cleanup facts; timeout, non-zero exit and MISSING
 *    REPORT must all become execution failure facts."
 *
 * This module combines the two things a consumer needs to judge a run: the
 * recovered artifacts (with digests) and the execution facts (exit code,
 * timeout). collectOutputs is deliberately not touched -- it is a
 * HIGH-risk symbol on the worker.ts:run execution flow.
 */

import type { ExecutionFact } from "./execution-facts.js";
import type { OutputArtifact } from "./types.js";

export interface RawResultRef {
  /** Recovered artifacts with path + sha256 + size. */
  outputs: OutputArtifact[];
  /** Execution facts (exit code / timeout / timings). */
  executions: ExecutionFact[];
  /**
   * True when the task declared output_paths but none of them were
   * recovered. PTS-04: a missing report is an execution failure fact.
   */
  report_missing: boolean;
  /** True when at least one execution failed or was cut short. */
  execution_failed: boolean;
}

/**
 * Build the raw result reference for a terminal task.
 *
 * `declaredOutputPaths` is the task's output_paths (what was promised);
 * `outputs` is what was actually recovered.
 */
export function buildRawResultRef(input: {
  declaredOutputPaths: readonly string[];
  outputs: readonly OutputArtifact[];
  executions: readonly ExecutionFact[];
}): RawResultRef {
  const reportMissing = input.declaredOutputPaths.length > 0 && input.outputs.length === 0;
  const executionFailed = input.executions.some(
    (fact) => fact.status !== "exited" || (fact.exit_code !== null && fact.exit_code !== 0),
  );
  return {
    outputs: [...input.outputs],
    executions: [...input.executions],
    report_missing: reportMissing,
    execution_failed: executionFailed,
  };
}

/**
 * Whether the task should be treated as an execution failure.
 *
 * A missing report or a failed execution is a failure fact even if the agent
 * reported success in its summary.
 */
export function isExecutionFailure(raw: RawResultRef): boolean {
  return raw.report_missing || raw.execution_failed;
}
