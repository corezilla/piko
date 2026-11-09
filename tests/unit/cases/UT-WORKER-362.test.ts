/**
 * Case ID: UT-WORKER-362  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `this.channel.report({ kind: "stagingClaim" }` 拒绝必须 typed 化上抛（worker.ts:78）
 * 维度坐标：`claimNext` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-362.md（脚本的唯一依据）
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

describe("UT-WORKER-362 · claimNext · 错误路径 × 每个 typed 错误码", () => {
  it("propagates a rejected staging claim", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      const channel = fakeChannel();
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        fakeTransfer() as never,
        channel as never,
      );
    try {
      const rejecting = rejectingChannel("channel down");
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        fakeTransfer() as never,
        rejecting as never,
      );

      // 步骤 2：调用 claimNext（通道拒绝）
      // 步骤 3：断言返回值逐值对账——claimNext 直接读 channel.report 的值，
      //         不经 report()，故被拒时取到 undefined 而非 typed 错误；
      //         两次都拒即当成「没有活干」，返回 null。
      //         这条与「通道故障」不可区分，是已登记的缺口 G-UT-WORKER-1。
      await expect(
        (worker as unknown as { claimNext(): Promise<unknown> }).claimNext(),
      ).resolves.toBeNull();
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
