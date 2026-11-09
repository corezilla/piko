/**
 * Case ID: UT-WORKER-327  ·  STATUS: real
 *
 * 责任：分支 L350 `if (attempt < DISCUSSION_RETRY_DELAYS_MS.leng…`（if；worker.ts）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-327.md（脚本的唯一依据）
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

describe("UT-WORKER-327 · sendDiscussionReplyWithRetry · 状态分支 × 合法迁移", () => {
  it("stops retrying on the last attempt", async () => {
    const matrix = fakeMatrix({
      send: async () => {
        throw new Error("ETIMEDOUT");
      },
    });
    await expect(
      sendDiscussionReplyWithRetry(matrix as never, "t-1", "!room:test", "$e1", 1, "hello"),
    ).rejects.toThrow(/ETIMEDOUT/);

    // 步骤 3：断言最后一次不再退避——重试阶梯走完即停
    expect(matrix.sendDiscussionReply.mock.calls.length).toBe(4);
  });

});
