/**
 * Case ID: UT-WORKER-268  ·  STATUS: real
 *
 * 责任：参数 `view: ReturnType<TaskStore["getRun"]>` 的 `边界(上/下/零/空/满)` 类（worker.ts:288）
 * 维度坐标：`buildStats` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-268.md（脚本的唯一依据）
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

describe("UT-WORKER-268 · buildStats · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("handles a view with zero counters and no timestamps", () => {
const view = (over: Record<string, unknown> = {}) => ({
  progress: { model_calls: 2, tool_calls: 3 },
  started_at: "2026-11-09T00:00:00.000Z",
  finished_at: "2026-11-09T00:00:05.000Z",
  ...over,
}) as never;

const output = (size: number) => ({ path: "out/report.json", sha256: "a".repeat(64), size_bytes: size });
    // 步骤 2：调用 buildStats（计数为零、时间戳为空）
    const stats = buildStats(
      view({ progress: { model_calls: 0, tool_calls: 0 }, started_at: null, finished_at: null }),
      [],
    );

    // 步骤 3：断言返回值逐值对账——没有起止时间即耗时为零
    expect(stats.model_calls).toBe(0);
    expect(stats.tool_calls).toBe(0);
    expect(stats.duration_ms).toBe(0);
  });

});
