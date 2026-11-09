/**
 * Case ID: UT-WORKER-331  ·  STATUS: real
 *
 * 责任：返回站点 L334 值 `（无值 return：提前退出）` 逐值断言（worker.ts）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-331.md（脚本的唯一依据）
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

describe("UT-WORKER-331 · sendDiscussionReplyWithRetry · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns nothing on a successful send", async () => {
    const matrix = fakeMatrix();
    // 步骤 2：调用 sendDiscussionReplyWithRetry
    const result = await sendDiscussionReplyWithRetry(
      matrix as never,
      "t-1",
      "!room:test",
      "$e1",
      1,
      "hello",
    );

    // 步骤 3：断言返回值逐值对账——成功即提前退出，无返回值
    expect(result).toBeUndefined();
    expect(matrix.sent).toHaveLength(1);
  });

});
