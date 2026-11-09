/**
 * Case ID: UT-WORKER-077  ·  STATUS: real
 *
 * 责任：参数 `raw: RawResultRef` 的 `非法值` 类（test-evidence.ts:65）
 * 维度坐标：`isExecutionFailure` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-077.md（脚本的唯一依据）
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

describe("UT-WORKER-077 · isExecutionFailure · 纯函数/无副作用 × 非法值", () => {
  it("returns the first truthy flag verbatim", () => {
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

const output = (path: string) => ({ path, sha256: "a".repeat(64), size_bytes: 4 });
    // 步骤 2：调用 isExecutionFailure（标记是字符串而非布尔）
    const failed = isExecutionFailure({
      outputs: [],
      executions: [],
      report_missing: "yes" as never,
      execution_failed: "" as never,
    });

    // 步骤 3：断言返回值逐值对账——`||` 返回第一个真值操作数，
    //         故非布尔的 "yes" 原样透出（该参数不校验）
    expect(failed).toBe("yes");
  });

});
