/**
 * Case ID: UT-WORKER-053  ·  STATUS: real
 *
 * 责任：返回站点 L59 值 `[...this.facts]` 逐值断言（execution-facts.ts）
 * 维度坐标：`list` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-053.md（脚本的唯一依据）
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

describe("UT-WORKER-053 · list · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the facts in execution order", () => {
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
    collector.record(fact({ command: "first" }));
    collector.record(fact({ command: "second" }));

    // 步骤 2：调用 list
    const facts = collector.list();

    // 步骤 3：断言返回值逐值对账——顺序即记录顺序
    expect(facts.map((f) => f.command)).toEqual(["first", "second"]);
  });

});
