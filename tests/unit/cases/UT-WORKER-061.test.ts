/**
 * Case ID: UT-WORKER-061  ·  STATUS: real
 *
 * 责任：分支 L84 `case "spawn_error"`（case；execution-facts.ts）
 * 维度坐标：`statusFromErrorCode` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-061.md（脚本的唯一依据）
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

describe("UT-WORKER-061 · statusFromErrorCode · 状态分支 × 合法迁移", () => {
  it("maps spawn_error to the spawn_error status", () => {
    // 步骤 2：调用 statusFromErrorCode("spawn_error")
    // 步骤 3：断言返回值逐值对账
    expect(statusFromErrorCode("spawn_error")).toBe("spawn_error");
  });

});
