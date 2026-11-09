/**
 * Case ID: UT-WORKER-055  ·  STATUS: real
 *
 * 责任：状态写 L68 → `this.facts.length`（execution-facts.ts）
 * 维度坐标：`clear` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-055.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { ExecutionFactCollector, statusFromErrorCode } from "../../../src/execution-facts.js";
import { buildRawResultRef, isExecutionFailure } from "../../../src/test-evidence.js";
import { RunWorker, aggregateUsage } from "../../../src/worker.js";
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

describe("UT-WORKER-055 · clear · 状态分支 × 合法迁移", () => {
  it("empties the fact list", () => {
const fact = (over: Partial<ExecutionFact> = {}): ExecutionFact => ({
  tool_call_id: "call-1",
  command: "cat /etc/hostname",
  exit_code: 0,
  status: "exited",
  output: "a7048",
  truncated: false,
  timed_out: false,
  started_at: "2026-11-09T00:00:00.000Z",
  ended_at: "2026-11-09T00:00:01.000Z",
  duration_ms: 1000,
  ...over,
});
    const collector = new ExecutionFactCollector();
    collector.record(fact());

    // 步骤 2：调用 clear
    collector.clear();

    // 步骤 3：断言状态写生效——列表空了
    expect(collector.list()).toEqual([]);
    expect(collector.last()).toBeUndefined();
  });

});
