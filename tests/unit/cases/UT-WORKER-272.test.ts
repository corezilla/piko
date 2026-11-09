/**
 * Case ID: UT-WORKER-272  ·  STATUS: real
 *
 * 责任：参数 `outputs: AgentResult["outputs"]` 的 `非法值` 类（worker.ts:288）
 * 维度坐标：`buildStats` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-272.md（脚本的唯一依据）
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

describe("UT-WORKER-272 · buildStats · 纯函数/无副作用 × 非法值", () => {
  it("sums the sizes without validating them", () => {
const view = (over: Record<string, unknown> = {}) => ({
  progress: { model_calls: 2, tool_calls: 3 },
  started_at: "2026-11-09T00:00:00.000Z",
  finished_at: "2026-11-09T00:00:05.000Z",
  ...over,
}) as never;

const output = (size: number) => ({ path: "out/report.json", sha256: "a".repeat(64), size_bytes: size });
    // 步骤 2：调用 buildStats（产物的 size_bytes 是字符串）
    const stats = buildStats(view(), [{ path: "out/x", sha256: "a", size_bytes: "12" } as never]);

    // 步骤 3：断言返回值逐值对账——累加从 0 起，0 + "12" 即字符串拼接 "012"
    expect(stats.outputs_count).toBe(1);
    expect(stats.outputs_bytes).toBe("012" as never);
  });

});
