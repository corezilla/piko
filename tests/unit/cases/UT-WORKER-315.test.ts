/**
 * Case ID: UT-WORKER-315  ·  STATUS: real
 *
 * 责任：分支 L327 `if (!(await matrix.isJoined(roomId)))`（if；worker.ts）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-315.md（脚本的唯一依据）
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

describe("UT-WORKER-315 · sendDiscussionReplyWithRetry · 状态分支 × 合法迁移", () => {
  it("checks the membership before sending", async () => {
    const matrix = fakeMatrix();
    await sendDiscussionReplyWithRetry(
      matrix as never,
      "t-1",
      "!room:test",
      "$e1",
      1,
      "hello",
    );

    // 步骤 3：断言先查成员资格再发送
    expect(matrix.isJoined).toHaveBeenCalledWith("!room:test");
    expect(matrix.isJoined.mock.invocationCallOrder[0]).toBeLessThan(
      matrix.sendDiscussionReply.mock.invocationCallOrder[0]!,
    );
  });

});
