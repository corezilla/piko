/**
 * Case ID: UT-WORKER-284  ·  STATUS: real
 *
 * 责任：分支 L308 `if (rows.length !== attempts || rows.some((r)…`（if；worker.ts）
 * 维度坐标：`aggregateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-284.md（脚本的唯一依据）
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

describe("UT-WORKER-284 · aggregateUsage · 状态分支 × 合法迁移", () => {
  it("marks a field missing when one row lacks it", () => {
const complete = (over: Record<string, unknown> = {}) => ({
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 2,
  cacheWrite: 0,
  reasoning: 1,
  ...over,
});
    // 步骤 2：调用 aggregateUsage（两条记录，缺的是 reasoning）
    const usage = aggregateUsage([complete(), complete({ reasoning: undefined })], 2);

    // 步骤 3：断言返回值逐值对账——只有 reasoning 缺，其余仍可求和
    expect(usage.reasoning_tokens).toBeNull();
    expect(usage.input_tokens).toBe(20);
    expect(usage.missing_fields).toEqual(["reasoning_tokens"]);
    expect(usage.quality).toBe("Partial");
  });

});
