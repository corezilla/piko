/**
 * Case ID: UT-WORKER-278  ·  STATUS: real
 *
 * 责任：参数 `rows: any[]` 的 `非法值` 类（worker.ts:299）
 * 维度坐标：`aggregateUsage` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-278.md（脚本的唯一依据）
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

describe("UT-WORKER-278 · aggregateUsage · 纯函数/无副作用 × 非法值", () => {
  it("treats non-numeric usage values as missing", () => {
const complete = (over: Record<string, unknown> = {}) => ({
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 2,
  cacheWrite: 0,
  reasoning: 1,
  ...over,
});
    // 步骤 2：调用 aggregateUsage（input 是字符串而非数字）
    const usage = aggregateUsage([complete({ input: "ten" })], 1);

    // 步骤 3：断言返回值逐值对账——非数字字段进 missing_fields
    expect(usage.input_tokens).toBeNull();
    expect(usage.missing_fields).toContain("input_tokens");
    expect(usage.quality).toBe("Partial");
  });

});
