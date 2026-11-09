/**
 * Case ID: UT-WORKER-306  ·  STATUS: real
 *
 * 责任：参数 `eventId: string` 的 `超长` 类（worker.ts:320）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-306.md（脚本的唯一依据）
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

describe("UT-WORKER-306 · sendDiscussionReplyWithRetry · 字符串/路径/枚举输入 × 超长", () => {
  it("sends the reply with an over-long event id", async () => {
    const matrix = fakeMatrix();
    await sendDiscussionReplyWithRetry(
      matrix as never,
      "t-1",
      "!room:test",
      "$" + "e".repeat(5000),
      1,
      "hello",
    );

    // 步骤 3：断言超长事件 id 原样带过去——该参数不校验
    expect(matrix.sent[0]?.event).toHaveLength(5001);
  });

});
