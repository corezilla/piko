/**
 * Case ID: UT-WORKER-067  ·  STATUS: real
 *
 * 责任：返回站点 L88 值 `"spawn_error"` 逐值断言（execution-facts.ts）
 * 维度坐标：`statusFromErrorCode` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-067.md（脚本的唯一依据）
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

describe("UT-WORKER-067 · statusFromErrorCode · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the spawn_error status for an unknown code", () => {
    // 步骤 2：调用 statusFromErrorCode
    // 步骤 3：断言返回值逐值对账
    expect(statusFromErrorCode("unknown")).toBe("spawn_error");
  });

});
