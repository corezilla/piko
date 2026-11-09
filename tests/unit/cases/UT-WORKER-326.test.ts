/**
 * Case ID: UT-WORKER-326  ·  STATUS: real
 *
 * 责任：分支 L348 `!transient`（!；worker.ts）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-326.md（脚本的唯一依据）
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

describe("UT-WORKER-326 · sendDiscussionReplyWithRetry · 状态分支 × 合法迁移", () => {
  it("retries a transient error until the ladder is exhausted", async () => {
    const matrix = fakeMatrix({
      send: async () => {
        throw new Error("ECONNREFUSED");
      },
    });
    await expect(
      sendDiscussionReplyWithRetry(matrix as never, "t-1", "!room:test", "$e1", 1, "hello"),
    ).rejects.toThrow(/ECONNREFUSED/);

    // 步骤 3：断言试满了阶梯——3 个退避 ＋ 1 次首发
    expect(matrix.sendDiscussionReply.mock.calls.length).toBe(4);
  });

});
