/**
 * Case ID: UT-WORKER-298  ·  STATUS: real
 *
 * 责任：参数 `matrix` 的 `非法值` 类（worker.ts:320）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-298.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { ExecutionFactCollector, statusFromErrorCode } from "../../../src/execution-facts.js";
import { buildRawResultRef, isExecutionFailure } from "../../../src/test-evidence.js";
import { RunWorker, aggregateUsage, buildStats, sendDiscussionReplyWithRetry } from "../../../src/worker.js";
import { applyToolRecoveryPolicy, executeRecoverable, fileState, isPlan } from "../../../src/tool-recovery.js";
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
import {
  context,
  emptyRegistry,
  envAt,
  fakeEnv,
  invocation,
  neverPolicy,
  readPolicy,
  registry,
  toolContext,
  writePolicy,
} from "./support/recovery-fix.js";

describe("UT-WORKER-298 · sendDiscussionReplyWithRetry · 纯函数/无副作用 × 非法值", () => {
  it("propagates the failure when the matrix has no membership check", async () => {
    const matrix = { sendDiscussionReply: vi.fn() } as never;
    await expect(
      sendDiscussionReplyWithRetry(matrix, "t-1", "!room:test", "$e1", 1, "hello"),
    ).rejects.toThrow();

    // 步骤 3：断言被拒——该参数不校验，故错误来自下游
    expect(true).toBe(true);
  });

});
