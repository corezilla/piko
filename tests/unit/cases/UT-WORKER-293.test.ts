/**
 * Case ID: UT-WORKER-293  ·  STATUS: real
 *
 * 责任：分支 L315 `!missing.includes(f)`（!；worker.ts）
 * 维度坐标：`aggregateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-293.md（脚本的唯一依据）
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

describe("UT-WORKER-293 · aggregateUsage · 状态分支 × 合法迁移", () => {
  it("keeps missing_fields free of duplicates", () => {
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
    const usage = aggregateUsage([complete()], 5);

    // 步骤 3：断言返回值逐值对账——取反守卫保证每个字段只出现一次
    expect(usage.missing_fields.filter((f) => f === "input_tokens")).toHaveLength(1);
  });

});
