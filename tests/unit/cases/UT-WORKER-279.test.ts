/**
 * Case ID: UT-WORKER-279  ·  STATUS: real
 *
 * 责任：参数 `attempts: number` 的 `恰好通过` 类（worker.ts:299）
 * 维度坐标：`aggregateUsage` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-279.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { ExecutionFactCollector, statusFromErrorCode } from "../../../src/execution-facts.js";
import { buildRawResultRef, isExecutionFailure } from "../../../src/test-evidence.js";
import { RunWorker, aggregateUsage, buildStats, sendDiscussionReplyWithRetry } from "../../../src/worker.js";
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

describe("UT-WORKER-279 · aggregateUsage · 数值/长度上限参数 × 恰好通过", () => {
  it("reports complete quality when the row count equals the attempts", () => {
const complete = (over: Record<string, unknown> = {}) => ({
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 2,
  cacheWrite: 0,
  reasoning: 1,
  ...over,
});
    // 步骤 2：调用 aggregateUsage（1 条记录，1 次尝试）
    const usage = aggregateUsage([complete()], 1);

    // 步骤 3：断言返回值逐值对账——恰好相等即 Complete
    expect(usage.quality).toBe("Complete");
    expect(usage.usage_observed_attempts).toBe(1);
    expect(usage.model_attempts).toBe(1);
  });

});
