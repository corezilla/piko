/**
 * Case ID: UT-WORKER-287  ·  STATUS: real
 *
 * 责任：分支 L314 `? missing.length === fields.length :`（ternary；worker.ts）
 * 维度坐标：`aggregateUsage` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-287.md（脚本的唯一依据）
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

describe("UT-WORKER-287 · aggregateUsage · 状态分支 × 合法迁移", () => {
  it("reports unknown quality when every field is missing", () => {
const complete = (over: Record<string, unknown> = {}) => ({
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 2,
  cacheWrite: 0,
  reasoning: 1,
  ...over,
});
    // 步骤 2：调用 aggregateUsage（行数与尝试数不符 → 全部字段缺失）
    const usage = aggregateUsage([complete()], 2);

    // 步骤 3：断言返回值逐值对账——全部缺失即 Unknown
    expect(usage.quality).toBe("Unknown");
    expect(usage.missing_fields).toHaveLength(6);
  });

});
