/**
 * Case ID: UT-WORKER-317  ·  STATUS: real
 *
 * 责任：分支 L335 `catch (error)`（catch；worker.ts）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-317.md（脚本的唯一依据）
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

describe("UT-WORKER-317 · sendDiscussionReplyWithRetry · 错误路径 × 每个 typed 错误码", () => {
  it("retries a transient failure", async () => {
    const matrix = fakeMatrix({
      send: async () => {
        throw Object.assign(new Error("fetch failed"), { name: "ConnectionError" });
      },
    });
    await expect(
      sendDiscussionReplyWithRetry(matrix as never, "t-1", "!room:test", "$e1", 1, "hello"),
    ).rejects.toThrow(/fetch failed/);

    // 步骤 3：断言重试了——连接错误是瞬时的，不立即放弃
    expect(matrix.sendDiscussionReply.mock.calls.length).toBeGreaterThan(1);
  });

});
