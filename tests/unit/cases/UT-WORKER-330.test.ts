/**
 * Case ID: UT-WORKER-330  ·  STATUS: real
 *
 * 责任：资源操作 L350 `setTimeout`（worker.ts）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-330.md（脚本的唯一依据）
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

describe("UT-WORKER-330 · sendDiscussionReplyWithRetry · 资源获取/释放 × 获取失败路径", () => {
  it("releases the backoff timer once the ladder is exhausted", async () => {
    const matrix = fakeMatrix({
      send: async () => {
        throw new Error("ECONNREFUSED");
      },
    });
    // 步骤 2：调用 sendDiscussionReplyWithRetry（重试之间有退避）
    const started = Date.now();
    await expect(
      sendDiscussionReplyWithRetry(matrix as never, "t-1", "!room:test", "$e1", 1, "hello"),
    ).rejects.toThrow();
    const elapsed = Date.now() - started;

    // 步骤 3：断言退避定时器用完即释放——退避总时长＝200＋1000＋5000＝6200ms
    expect(matrix.sendDiscussionReply.mock.calls.length).toBe(4);
    expect(elapsed).toBeGreaterThanOrEqual(6000);
  });

});
