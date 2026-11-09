/**
 * Case ID: UT-WORKER-301  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（worker.ts:320）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-301.md（脚本的唯一依据）
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

describe("UT-WORKER-301 · sendDiscussionReplyWithRetry · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected task id as data", async () => {
    const matrix = fakeMatrix();
    await sendDiscussionReplyWithRetry(
      matrix as never,
      "t-1'; DROP TABLE x;--",
      "!room:test",
      "$e1",
      1,
      "hello",
    );

    // 步骤 3：断言注入串原样带过去——不被解释
    expect(matrix.sent[0]?.run).toBe("t-1'; DROP TABLE x;--");
  });

});
