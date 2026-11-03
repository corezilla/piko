import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import Ajv from "ajv/dist/2020.js";

import { buildRawResultRef, isExecutionFailure } from "../../src/test-evidence.js";
import type { ExecutionFact } from "../../src/execution-facts.js";

const AjvCtor: any = (Ajv as any).default ?? Ajv;
const schema = JSON.parse(
  readFileSync(new URL("../../interfaces/schemas/agent-runtime-v0.3.schema.json", import.meta.url), "utf8"),
);
// The root schema is a bag of $defs with no type of its own; compile the
// AgentResult sub-schema so the validator actually enforces it.
const validator = new AjvCtor({ strict: false, allErrors: true }).compile({
  $defs: schema.$defs,
  $ref: "#/$defs/AgentResult",
});

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

function agentResult(over: Record<string, unknown> = {}) {
  return {
    task_id: "t1",
    generation: 1,
    state: "Completed",
    partial: false,
    summary: "all good",
    outputs: [],
    stats: { model_calls: 1, tool_calls: 1, duration_ms: 10, outputs_count: 0, outputs_bytes: 0 },
    known_actions: [],
    usage: {
      source: "PiModelResponses",
      quality: "Partial",
      input_tokens: 10,
      output_tokens: 5,
      total_tokens: 15,
      cache_read_tokens: 0,
      cache_write_tokens: null,
      reasoning_tokens: 0,
      model_attempts: 1,
      usage_observed_attempts: 1,
      missing_fields: ["cache_write_tokens"],
    },
    failure: null,
    published_at: "2026-11-03T00:00:02Z",
    executions: [],
    ...over,
  };
}

describe("MECH-TESTEXEC · execution facts contract", () => {
  it("requires the executions field on AgentResult", () => {
    const without = agentResult();
    delete (without as Record<string, unknown>).executions;
    expect(validator.errors).toBeDefined();
    const result = validator(without);
    expect(result).toBe(false);
  });

  it("accepts an AgentResult carrying execution facts", () => {
    const result = validator(agentResult({ executions: [fact()] }));
    expect(result, JSON.stringify(validator.errors)).toBe(true);
  });

  it("rejects an execution fact with an unknown status", () => {
    const result = validator(agentResult({ executions: [fact({ status: "weird" as any })] }));
    expect(result).toBe(false);
  });

  it("rejects an execution fact missing the exit code", () => {
    const broken = fact();
    delete (broken as unknown as Record<string, unknown>).exit_code;
    const result = validator(agentResult({ executions: [broken] }));
    expect(result).toBe(false);
  });

  it("accepts a null exit code (timeout / aborted)", () => {
    const result = validator(
      agentResult({ executions: [fact({ exit_code: null, status: "timeout", timed_out: true })] }),
    );
    expect(result, JSON.stringify(validator.errors)).toBe(true);
  });

  it("keeps summary and executions independent — summary text never decides the outcome", () => {
    // The agent claims success; the facts say the command failed.
    const raw = buildRawResultRef({
      declaredOutputPaths: ["reports/result.json"],
      outputs: [{ path: "reports/result.json", sha256: "a".repeat(64), size_bytes: 10 }],
      executions: [fact({ exit_code: 3 })],
    });
    expect(isExecutionFailure(raw)).toBe(true);
    expect(raw.execution_failed).toBe(true);
  });

  it("treats a declared-but-missing report as a failure", () => {
    const raw = buildRawResultRef({
      declaredOutputPaths: ["reports/result.json"],
      outputs: [],
      executions: [fact()],
    });
    expect(raw.report_missing).toBe(true);
    expect(isExecutionFailure(raw)).toBe(true);
  });

  it("treats a clean run as a success", () => {
    const raw = buildRawResultRef({
      declaredOutputPaths: ["reports/result.json"],
      outputs: [{ path: "reports/result.json", sha256: "a".repeat(64), size_bytes: 10 }],
      executions: [fact()],
    });
    expect(isExecutionFailure(raw)).toBe(false);
  });

  it("treats a remote host that never answered as a failure even when the report exists", () => {
    // Regression: the agent wrote a well-formed report with empty stdout
    // after the remote host was unreachable, and the task was published
    // Completed. The report existing is not evidence the command ran.
    const raw = buildRawResultRef({
      declaredOutputPaths: ["reports/result.json"],
      outputs: [{ path: "reports/result.json", sha256: "a".repeat(64), size_bytes: 10 }],
      executions: [fact({ status: "spawn_error", exit_code: null, output: "connect to host: failure" })],
    });
    expect(raw.report_missing).toBe(false);
    expect(raw.execution_failed).toBe(true);
    expect(isExecutionFailure(raw)).toBe(true);
  });

  it("treats a timed-out remote as a failure", () => {
    const raw = buildRawResultRef({
      declaredOutputPaths: ["reports/result.json"],
      outputs: [{ path: "reports/result.json", sha256: "a".repeat(64), size_bytes: 10 }],
      executions: [fact({ status: "timeout", exit_code: null, timed_out: true })],
    });
    expect(raw.execution_failed).toBe(true);
    expect(isExecutionFailure(raw)).toBe(true);
  });

  it("treats a non-zero remote exit as a failure", () => {
    const raw = buildRawResultRef({
      declaredOutputPaths: ["reports/result.json"],
      outputs: [{ path: "reports/result.json", sha256: "a".repeat(64), size_bytes: 10 }],
      executions: [fact({ exit_code: 1 })],
    });
    expect(raw.execution_failed).toBe(true);
    expect(isExecutionFailure(raw)).toBe(true);
  });
});
