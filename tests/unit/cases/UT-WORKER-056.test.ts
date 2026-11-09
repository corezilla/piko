/**
 * Case ID: UT-WORKER-056  ·  STATUS: real
 *
 * 责任：参数 `code: string | undefined` 的 `空` 类（execution-facts.ts:78）
 * 维度坐标：`statusFromErrorCode` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-056.md（脚本的唯一依据）
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

describe("UT-WORKER-056 · statusFromErrorCode · 字符串/路径/枚举输入 × 空", () => {
  it("maps an undefined code to spawn_error", () => {
    // 步骤 2：调用 statusFromErrorCode(undefined)
    // 步骤 3：断言返回值逐值对账——未知即 spawn_error
    expect(statusFromErrorCode(undefined)).toBe("spawn_error");
  });

});
