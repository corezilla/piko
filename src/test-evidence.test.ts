import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildRawResultRef, isExecutionFailure } from "./test-evidence.js";
import type { ExecutionFact } from "./execution-facts.js";
import type { OutputArtifact } from "./types.js";

function fact(over: Partial<ExecutionFact> = {}): ExecutionFact {
  return {
    tool_call_id: null,
    command: "pytest",
    exit_code: 0,
    status: "exited",
    output: "",
    truncated: false,
    timed_out: false,
    started_at: "2026-11-03T00:00:00Z",
    ended_at: "2026-11-03T00:00:01Z",
    duration_ms: 1000,
    ...over,
  };
}

const artifact: OutputArtifact = { path: "reports/result.json", sha256: "a".repeat(64), size_bytes: 42 };

describe("buildRawResultRef", () => {
  it("reports a missing report when declared outputs were not produced", () => {
    const raw = buildRawResultRef({
      declaredOutputPaths: ["reports/result.json"],
      outputs: [],
      executions: [fact()],
    });
    assert.equal(raw.report_missing, true);
    assert.equal(isExecutionFailure(raw), true);
  });

  it("does not report a missing report when outputs were produced", () => {
    const raw = buildRawResultRef({
      declaredOutputPaths: ["reports/result.json"],
      outputs: [artifact],
      executions: [fact()],
    });
    assert.equal(raw.report_missing, false);
    assert.equal(isExecutionFailure(raw), false);
  });

  it("does not report a missing report when no outputs were declared", () => {
    const raw = buildRawResultRef({
      declaredOutputPaths: [],
      outputs: [],
      executions: [fact()],
    });
    assert.equal(raw.report_missing, false);
  });

  it("marks a non-zero exit as an execution failure", () => {
    const raw = buildRawResultRef({
      declaredOutputPaths: ["reports/result.json"],
      outputs: [artifact],
      executions: [fact({ exit_code: 7 })],
    });
    assert.equal(raw.execution_failed, true);
    assert.equal(isExecutionFailure(raw), true);
  });

  it("marks a timeout as an execution failure", () => {
    const raw = buildRawResultRef({
      declaredOutputPaths: [],
      outputs: [],
      executions: [fact({ status: "timeout", timed_out: true, exit_code: null })],
    });
    assert.equal(raw.execution_failed, true);
  });

  it("marks a policy denial as an execution failure", () => {
    const raw = buildRawResultRef({
      declaredOutputPaths: [],
      outputs: [],
      executions: [fact({ status: "policy_denied", exit_code: null })],
    });
    assert.equal(raw.execution_failed, true);
  });

  it("keeps the outputs and executions it was given", () => {
    const raw = buildRawResultRef({
      declaredOutputPaths: ["reports/result.json"],
      outputs: [artifact],
      executions: [fact()],
    });
    assert.deepEqual(raw.outputs, [artifact]);
    assert.equal(raw.executions.length, 1);
    assert.equal(raw.executions[0]?.exit_code, 0);
  });
});

describe("isExecutionFailure", () => {
  it("is false for a clean run", () => {
    const raw = buildRawResultRef({
      declaredOutputPaths: ["reports/result.json"],
      outputs: [artifact],
      executions: [fact()],
    });
    assert.equal(isExecutionFailure(raw), false);
  });
});
