/**
 * Case ID: UT-WORKER-289  ·  STATUS: real
 *
 * 责任：分支 L314 `missing.length === 0 && observed === attempts`（&&；worker.ts）
 * 维度坐标：`aggregateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-289.md（脚本的唯一依据）
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

describe("UT-WORKER-289 · aggregateUsage · 状态分支 × 合法迁移", () => {
  it("reports complete quality when nothing is missing and the counts agree", () => {
const complete = (over: Record<string, unknown> = {}) => ({
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 2,
  cacheWrite: 0,
  reasoning: 1,
  ...over,
});
    // 步骤 2：调用 aggregateUsage（行数等于尝试数且字段齐全）
    const usage = aggregateUsage([complete(), complete()], 2);

    // 步骤 3：断言返回值逐值对账——&& 两段都为真即 Complete
    expect(usage.quality).toBe("Complete");
    expect(usage.missing_fields).toEqual([]);
  });

});
