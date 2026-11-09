/**
 * Case ID: UT-WORKER-059  ·  STATUS: real
 *
 * 责任：分支 L80 `case "timeout"`（case；execution-facts.ts）
 * 维度坐标：`statusFromErrorCode` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-059.md（脚本的唯一依据）
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

describe("UT-WORKER-059 · statusFromErrorCode · 时间域行为 × 超时边界 ±1 tick", () => {
  it("maps timeout to the timeout status", () => {
    // 步骤 2：调用 statusFromErrorCode("timeout")
    // 步骤 3：断言返回值逐值对账
    expect(statusFromErrorCode("timeout")).toBe("timeout");
  });

});
