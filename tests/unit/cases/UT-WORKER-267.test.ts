/**
 * Case ID: UT-WORKER-267  ·  STATUS: real
 *
 * 责任：参数 `view: ReturnType<TaskStore["getRun"]>` 的 `每等价类合法值` 类（worker.ts:288）
 * 维度坐标：`buildStats` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-267.md（脚本的唯一依据）
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

describe("UT-WORKER-267 · buildStats · 纯函数/无副作用 × 每等价类合法值", () => {
  it("copies the progress counters into the stats", () => {
const view = (over: Record<string, unknown> = {}) => ({
  progress: { model_calls: 2, tool_calls: 3 },
  started_at: "2026-11-09T00:00:00.000Z",
  finished_at: "2026-11-09T00:00:05.000Z",
  ...over,
}) as never;

const output = (size: number) => ({ path: "out/report.json", sha256: "a".repeat(64), size_bytes: size });
    // 步骤 2：调用 buildStats
    const stats = buildStats(view(), []);

    // 步骤 3：断言返回值逐值对账——模型调用与工具调用逐字复制
    expect(stats.model_calls).toBe(2);
    expect(stats.tool_calls).toBe(3);
  });

});
