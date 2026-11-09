/**
 * Case ID: UT-WORKER-270  ·  STATUS: real
 *
 * 责任：参数 `outputs: AgentResult["outputs"]` 的 `每等价类合法值` 类（worker.ts:288）
 * 维度坐标：`buildStats` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-270.md（脚本的唯一依据）
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

describe("UT-WORKER-270 · buildStats · 纯函数/无副作用 × 每等价类合法值", () => {
  it("counts the recovered outputs", () => {
const view = (over: Record<string, unknown> = {}) => ({
  progress: { model_calls: 2, tool_calls: 3 },
  started_at: "2026-11-09T00:00:00.000Z",
  finished_at: "2026-11-09T00:00:05.000Z",
  ...over,
}) as never;

const output = (size: number) => ({ path: "out/report.json", sha256: "a".repeat(64), size_bytes: size });
    // 步骤 2：调用 buildStats（两个产物）
    const stats = buildStats(view(), [output(10), output(20)]);

    // 步骤 3：断言返回值逐值对账——个数与字节数
    expect(stats.outputs_count).toBe(2);
    expect(stats.outputs_bytes).toBe(30);
  });

});
