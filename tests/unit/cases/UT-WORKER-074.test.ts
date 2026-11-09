/**
 * Case ID: UT-WORKER-074  ·  STATUS: real
 *
 * 责任：返回站点 L51 值 `{ outputs: [...input.outputs], executio…` 逐值断言（test-evidence.ts）
 * 维度坐标：`buildRawResultRef` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-074.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { ExecutionFactCollector, statusFromErrorCode } from "../../../src/execution-facts.js";
import { buildRawResultRef, isExecutionFailure } from "../../../src/test-evidence.js";
import { RunWorker, aggregateUsage } from "../../../src/worker.js";
import { applyToolRecoveryPolicy } from "../../../src/tool-recovery.js";
import { TaskStore } from "../../../src/store.js";
import type { ExecutionFact } from "../../../src/execution-facts.js";
import {
  config,
  fakeChannel,
  fakeMatrix,
  fakePi,
  fakeTransfer,
  rejectingChannel,
  task,
  workerFixture,
} from "./support/worker-fix.js";

describe("UT-WORKER-074 · buildRawResultRef · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the outputs and executions verbatim", () => {
const fact = (over: Partial<ExecutionFact> = {}): ExecutionFact => ({
  tool_call_id: "call-1",
  command: "cat /etc/hostname",
  exit_code: 0,
  status: "exited",
  output: "a7048",
  truncated: false,
  timed_out: false,
  started_at: "2026-11-09T00:00:00.000Z",
  ended_at: "2026-11-09T00:00:01.000Z",
  duration_ms: 1000,
  ...over,
});

const output = (path: string) => ({ path, sha256: "a".repeat(64), size_bytes: 4 });
    // 步骤 2：调用 buildRawResultRef
    const raw = buildRawResultRef({
      declaredOutputPaths: ["out/report.json"],
      outputs: [output("out/report.json")],
      executions: [fact()],
    });

    // 步骤 3：断言返回值逐值对账——四字段各一
    expect(raw.outputs).toHaveLength(1);
    expect(raw.outputs[0]?.path).toBe("out/report.json");
    expect(raw.executions).toHaveLength(1);
    expect(raw.report_missing).toBe(false);
    expect(raw.execution_failed).toBe(false);
  });

});
