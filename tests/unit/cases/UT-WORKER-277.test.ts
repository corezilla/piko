/**
 * Case ID: UT-WORKER-277  ·  STATUS: real
 *
 * 责任：参数 `rows: any[]` 的 `边界(上/下/零/空/满)` 类（worker.ts:299）
 * 维度坐标：`aggregateUsage` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-277.md（脚本的唯一依据）
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

describe("UT-WORKER-277 · aggregateUsage · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("returns zeros for an empty attempt list", () => {
const complete = (over: Record<string, unknown> = {}) => ({
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 2,
  cacheWrite: 0,
  reasoning: 1,
  ...over,
});
    // 步骤 2：调用 aggregateUsage（空 rows，attempts 为 0）
    const usage = aggregateUsage([], 0);

    // 步骤 3：断言返回值逐值对账——没有尝试就没有用量
    expect(usage.quality).toBe("Complete");
    expect(usage.input_tokens).toBe(0);
    expect(usage.output_tokens).toBe(0);
    expect(usage.model_attempts).toBe(0);
    expect(usage.missing_fields).toEqual([]);
  });

});
