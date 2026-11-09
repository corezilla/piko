/**
 * Case ID: UT-WORKER-079  ·  STATUS: real
 *
 * 责任：返回站点 L66 值 `raw.report_missing || raw.execution_fai…` 逐值断言（test-evidence.ts）
 * 维度坐标：`isExecutionFailure` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-079.md（脚本的唯一依据）
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

describe("UT-WORKER-079 · isExecutionFailure · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns true when only an execution failed", () => {
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
    // 步骤 2：调用 isExecutionFailure（只有 execution_failed 为真）
    const failed = isExecutionFailure({
      outputs: [],
      executions: [],
      report_missing: false,
      execution_failed: true,
    });

    // 步骤 3：断言返回值逐值对账——|| 的后半段为真即失败
    expect(failed).toBe(true);
  });

});
