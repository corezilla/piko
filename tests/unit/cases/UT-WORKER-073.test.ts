/**
 * Case ID: UT-WORKER-073  ·  STATUS: real
 *
 * 责任：分支 L49 `fact.exit_code !== null && fact.exit_code !==…`（&&；test-evidence.ts）
 * 维度坐标：`buildRawResultRef` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-073.md（脚本的唯一依据）
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

describe("UT-WORKER-073 · buildRawResultRef · 状态分支 × 合法迁移", () => {
  it("reports an execution failure when a fact exited non-zero", () => {
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
    // 步骤 2：调用 buildRawResultRef（一条退出码非 0 的事实）
    const raw = buildRawResultRef({
      declaredOutputPaths: [],
      outputs: [],
      executions: [fact({ exit_code: 3 })],
    });

    // 步骤 3：断言返回值逐值对账——&& 两段都为真即失败
    expect(raw.execution_failed).toBe(true);
  });

});
