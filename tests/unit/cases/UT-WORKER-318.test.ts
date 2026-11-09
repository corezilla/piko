/**
 * Case ID: UT-WORKER-318  ·  STATUS: real
 *
 * 责任：分支 L337 `if (/M_FORBIDDEN|not in room|not joined/i.tes…`（if；worker.ts）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-318.md（脚本的唯一依据）
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

describe("UT-WORKER-318 · sendDiscussionReplyWithRetry · 状态分支 × 合法迁移", () => {
  it("treats a forbidden error as proof the membership was lost", async () => {
    const matrix = fakeMatrix({
      send: async () => {
        throw new Error("M_FORBIDDEN");
      },
    });
    await expect(
      sendDiscussionReplyWithRetry(matrix as never, "t-1", "!room:test", "$e1", 1, "hello"),
    ).rejects.toThrow(/lost access to the discussion room/);

    // 步骤 3：断言丢失被记下，且不重试——403 本身就是证据
    expect(matrix.lost).toEqual(["!room:test"]);
    expect(matrix.sendDiscussionReply.mock.calls.length).toBe(1);
  });

});
