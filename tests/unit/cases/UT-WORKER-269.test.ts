/**
 * Case ID: UT-WORKER-269  ·  STATUS: real
 *
 * 责任：参数 `view: ReturnType<TaskStore["getRun"]>` 的 `非法值` 类（worker.ts:288）
 * 维度坐标：`buildStats` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-269.md（脚本的唯一依据）
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

describe("UT-WORKER-269 · buildStats · 纯函数/无副作用 × 非法值", () => {
  it("reads the counters without validating them", () => {
const view = (over: Record<string, unknown> = {}) => ({
  progress: { model_calls: 2, tool_calls: 3 },
  started_at: "2026-11-09T00:00:00.000Z",
  finished_at: "2026-11-09T00:00:05.000Z",
  ...over,
}) as never;

const output = (size: number) => ({ path: "out/report.json", sha256: "a".repeat(64), size_bytes: size });
    // 步骤 2：调用 buildStats（进度计数是字符串）
    const stats = buildStats(view({ progress: { model_calls: "two", tool_calls: null } }), []);

    // 步骤 3：断言返回值逐值对账——该参数不校验，原样带出
    expect(stats.model_calls).toBe("two" as never);
    expect(stats.tool_calls).toBeNull();
  });

});
