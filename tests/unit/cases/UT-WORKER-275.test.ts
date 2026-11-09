/**
 * Case ID: UT-WORKER-275  ·  STATUS: real
 *
 * 责任：返回站点 L289 值 `{ model_calls: view.progress.model_call…` 逐值断言（worker.ts）
 * 维度坐标：`buildStats` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-275.md（脚本的唯一依据）
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

describe("UT-WORKER-275 · buildStats · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the five stats fields", () => {
const view = (over: Record<string, unknown> = {}) => ({
  progress: { model_calls: 2, tool_calls: 3 },
  started_at: "2026-11-09T00:00:00.000Z",
  finished_at: "2026-11-09T00:00:05.000Z",
  ...over,
}) as never;

const output = (size: number) => ({ path: "out/report.json", sha256: "a".repeat(64), size_bytes: size });
    // 步骤 2：调用 buildStats
    const stats = buildStats(view(), [output(7)]);

    // 步骤 3：断言返回值逐值对账——五个字段各一
    expect(stats).toEqual({
      model_calls: 2,
      tool_calls: 3,
      duration_ms: 5000,
      outputs_count: 1,
      outputs_bytes: 7,
    });
  });

});
