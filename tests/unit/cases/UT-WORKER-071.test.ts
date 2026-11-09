/**
 * Case ID: UT-WORKER-071  ·  STATUS: real
 *
 * 责任：分支 L47 `input.declaredOutputPaths.length > 0 && input…`（&&；test-evidence.ts）
 * 维度坐标：`buildRawResultRef` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-071.md（脚本的唯一依据）
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

describe("UT-WORKER-071 · buildRawResultRef · 状态分支 × 合法迁移", () => {
  it("does not report a missing report when something was produced", () => {
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
    // 步骤 2：调用 buildRawResultRef（声明了路径，且取到了产物）
    const raw = buildRawResultRef({
      declaredOutputPaths: ["out/report.json"],
      outputs: [output("out/report.json")],
      executions: [],
    });

    // 步骤 3：断言返回值逐值对账——&& 的后半段为假即不报缺失
    expect(raw.report_missing).toBe(false);
    expect(raw.outputs).toHaveLength(1);
  });

});
