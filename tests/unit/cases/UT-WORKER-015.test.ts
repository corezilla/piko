/**
 * Case ID: UT-WORKER-015  ·  STATUS: real
 *
 * 责任：被测符号 `sendDiscussionReplyWithRetry`（WORKER）在对象类型 `数值/长度上限参数` 下的维度格 `−1 通过`（该 Case 只登记本行 1 格）、`恰好通过`、`+1 拒绝`、`多上限各自成套`；`sendDiscussionReplyWithRetry` × `数值/长度上限参数` 格 `−1 通过`（波次一：补齐 §2.3 未登记格；worker.ts:320，分支 14 点）；只测该符号该类型
 * 维度坐标：`sendDiscussionReplyWithRetry` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-015.md（脚本的唯一依据）
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
  throwingChannel,
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
import { execDeps, runtimeConfig } from "./support/exec-process-fix.js";

describe("UT-WORKER-015 · sendDiscussionReplyWithRetry · 数值/长度上限参数 × −1 通过", () => {
  it("sends the reply for the turn just below the first", () => {
    const matrix = fakeMatrix();

    // 步骤 2：调用 sendDiscussionReplyWithRetry（轮次 −1）
    return sendDiscussionReplyWithRetry(matrix as never, "t-1", "!room:test", "$e1", -1, "hello").then(() => {
      // 步骤 3：断言轮次原样带过去——低于下界也不被拒
      expect(matrix.sent[0]?.turn).toBe(-1);
    });
  });

});
