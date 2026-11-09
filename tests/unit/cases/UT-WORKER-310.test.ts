/**
 * Case ID: UT-WORKER-310  ·  STATUS: real
 *
 * 责任：参数 `turn: number` 的 `−1 通过` 类（worker.ts:320）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-310.md（脚本的唯一依据）
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

describe("UT-WORKER-310 · sendDiscussionReplyWithRetry · 数值/长度上限参数 × −1 通过", () => {
  it("sends the reply for a negative turn number", async () => {
    const matrix = fakeMatrix();
    await sendDiscussionReplyWithRetry(
      matrix as never,
      "t-1",
      "!room:test",
      "$e1",
      -1,
      "hello",
    );

    // 步骤 3：断言轮次原样带过去——该参数不校验下界
    expect(matrix.sent[0]?.turn).toBe(-1);
  });

});
