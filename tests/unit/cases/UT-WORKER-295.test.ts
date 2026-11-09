/**
 * Case ID: UT-WORKER-295  ·  STATUS: real
 *
 * 责任：返回站点 L316 值 `{ source: "PiModelResponses", quality, …` 逐值断言（worker.ts）
 * 维度坐标：`aggregateUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-295.md（脚本的唯一依据）
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

describe("UT-WORKER-295 · aggregateUsage · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the aggregated usage with its source and quality", () => {
const complete = (over: Record<string, unknown> = {}) => ({
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 2,
  cacheWrite: 0,
  reasoning: 1,
  ...over,
});
    // 步骤 2：调用 aggregateUsage
    const usage = aggregateUsage([complete(), complete()], 2);

    // 步骤 3：断言返回值逐值对账——source 与 quality 加上六个字段
    expect(usage.source).toBe("PiModelResponses");
    expect(usage.quality).toBe("Complete");
    expect(usage.input_tokens).toBe(20);
    expect(usage.output_tokens).toBe(10);
    expect(usage.total_tokens).toBe(30);
    expect(usage.cache_read_tokens).toBe(4);
    expect(usage.cache_write_tokens).toBe(0);
    expect(usage.reasoning_tokens).toBe(2);
  });

});
