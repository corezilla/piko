/**
 * Case ID: UT-WORKER-299  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `空` 类（worker.ts:320）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-299.md（脚本的唯一依据）
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

describe("UT-WORKER-299 · sendDiscussionReplyWithRetry · 字符串/路径/枚举输入 × 空", () => {
  it("sends the reply with an empty task id", async () => {
    const matrix = fakeMatrix();
    await sendDiscussionReplyWithRetry(
      matrix as never,
      "",
      "!room:test",
      "$e1",
      1,
      "hello",
    );

    // 步骤 3：断言空任务 id 原样带过去——该参数不校验
    expect(matrix.sent[0]?.run).toBe("");
  });

});
