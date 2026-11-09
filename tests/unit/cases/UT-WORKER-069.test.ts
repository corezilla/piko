/**
 * Case ID: UT-WORKER-069  ·  STATUS: real
 *
 * 责任：参数 `input: { declaredOutputPaths: readonly string[]; outputs: readonly ` 的 `超长` 类（test-evidence.ts:42）
 * 维度坐标：`buildRawResultRef` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-069.md（脚本的唯一依据）
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

describe("UT-WORKER-069 · buildRawResultRef · 字符串/路径/枚举输入 × 超长", () => {
  it("reports a missing report when a long declared path was not produced", () => {
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
    // 步骤 2：调用 buildRawResultRef（声明了一个超长路径，一个都没取到）
    const raw = buildRawResultRef({
      declaredOutputPaths: ["out/".repeat(2000) + "report.json"],
      outputs: [],
      executions: [],
    });

    // 步骤 3：断言返回逐值对账——声明了却没产出即缺报告
    expect(raw.report_missing).toBe(true);
    expect(raw.execution_failed).toBe(false);
  });

});
