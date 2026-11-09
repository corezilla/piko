/**
 * Case ID: UT-WORKER-285  ·  STATUS: real
 *
 * 责任：分支 L311 `sums[field] = rows.reduce((n, r) => n +…`（else；worker.ts）
 * 维度坐标：`aggregateUsage` × `状态分支` × `每个非法迁移拒绝`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-285.md（脚本的唯一依据）
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

describe("UT-WORKER-285 · aggregateUsage · 状态分支 × 每个非法迁移拒绝", () => {
  it("sums the field when every attempt carries it", () => {
const complete = (over: Record<string, unknown> = {}) => ({
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 2,
  cacheWrite: 0,
  reasoning: 1,
  ...over,
});
    // 步骤 2：调用 aggregateUsage（两次尝试都带 input）
    const usage = aggregateUsage([complete({ input: 3 }), complete({ input: 4 })], 2);

    // 步骤 3：断言返回值逐值对账——else 分支求和而不是置 null
    expect(usage.input_tokens).toBe(7);
    expect(usage.missing_fields).not.toContain("input_tokens");
  });

});
