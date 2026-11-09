/**
 * Case ID: UT-WORKER-078  ·  STATUS: real
 *
 * 责任：分支 L66 `raw.report_missing || raw.execution_failed`（||；test-evidence.ts）
 * 维度坐标：`isExecutionFailure` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-078.md（脚本的唯一依据）
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

describe("UT-WORKER-078 · isExecutionFailure · 状态分支 × 合法迁移", () => {
  it("returns true when only the report is missing", () => {
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
    // 步骤 2：调用 isExecutionFailure（只有 report_missing 为真）
    const failed = isExecutionFailure({
      outputs: [],
      executions: [],
      report_missing: true,
      execution_failed: false,
    });

    // 步骤 3：断言返回值逐值对账——|| 的前半段为真即失败
    expect(failed).toBe(true);
  });

});
