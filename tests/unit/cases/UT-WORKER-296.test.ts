/**
 * Case ID: UT-WORKER-296  ·  STATUS: real
 *
 * 责任：参数 `matrix: MatrixRuntime` 的 `每等价类合法值` 类（worker.ts:320）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-296.md（脚本的唯一依据）
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

describe("UT-WORKER-296 · sendDiscussionReplyWithRetry · 纯函数/无副作用 × 每等价类合法值", () => {
  it("sends the reply through the matrix", async () => {
    const matrix = fakeMatrix();
    await sendDiscussionReplyWithRetry(
      matrix as never,
      "t-1",
      "!room:test",
      "$e1",
      1,
      "hello",
    );

    // 步骤 3：断言回复被送出——五个参数逐字带过去
    expect(matrix.sent).toHaveLength(1);
    expect(matrix.sent[0]).toEqual({
      run: "t-1",
      room: "!room:test",
      event: "$e1",
      turn: 1,
      body: "hello",
    });
  });

});
