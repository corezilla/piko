/**
 * Case ID: UT-WORKER-282  ·  STATUS: real
 *
 * 责任：分支 L300 `if (attempts === 0)`（if；worker.ts）
 * 维度坐标：`aggregateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-282.md（脚本的唯一依据）
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

describe("UT-WORKER-282 · aggregateUsage · 状态分支 × 合法迁移", () => {
  it("short-circuits when there were no attempts", () => {
const complete = (over: Record<string, unknown> = {}) => ({
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 2,
  cacheWrite: 0,
  reasoning: 1,
  ...over,
});
    // 步骤 2：调用 aggregateUsage（attempts 为 0，但 rows 非空）
    const usage = aggregateUsage([complete()], 0);

    // 步骤 3：断言返回值逐值对账——零次尝试直接返回全零
    expect(usage.input_tokens).toBe(0);
    expect(usage.quality).toBe("Complete");
    expect(usage.usage_observed_attempts).toBe(0);
  });

});
