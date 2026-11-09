/**
 * Case ID: UT-WORKER-294  ·  STATUS: real
 *
 * 责任：返回站点 L301 值 `{ source: "PiModelResponses", quality: …` 逐值断言（worker.ts）
 * 维度坐标：`aggregateUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-294.md（脚本的唯一依据）
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

describe("UT-WORKER-294 · aggregateUsage · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the zero-attempt usage verbatim", () => {
const complete = (over: Record<string, unknown> = {}) => ({
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 2,
  cacheWrite: 0,
  reasoning: 1,
  ...over,
});
    // 步骤 2：调用 aggregateUsage（attempts 为 0）
    const usage = aggregateUsage([], 0);

    // 步骤 3：断言返回值逐值对账——整个对象逐字段
    expect(usage).toEqual({
      source: "PiModelResponses",
      quality: "Complete",
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      cache_read_tokens: 0,
      cache_write_tokens: 0,
      reasoning_tokens: 0,
      model_attempts: 0,
      usage_observed_attempts: 0,
      missing_fields: [],
    });
  });

});
