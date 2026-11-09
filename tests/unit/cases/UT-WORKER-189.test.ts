/**
 * Case ID: UT-WORKER-189  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `this.report({ kind: "preconditionFailure", result }` 拒绝必须 typed 化上抛（worker.ts:125）
 * 维度坐标：`reportPreconditionFailure` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-189.md（脚本的唯一依据）
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

describe("UT-WORKER-189 · reportPreconditionFailure · 错误路径 × 每个 typed 错误码", () => {
  it("throws when the failure fact is rejected", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1"), "slinky", 10);
      const channel = fakeChannel();
      const transfer = fakeTransfer();
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        transfer as never,
        channel as never,
      );

    try {
      const rejecting = rejectingChannel("p0 down");
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        fakeTransfer() as never,
        rejecting as never,
      );

      // 步骤 2：调用 reportPreconditionFailure（通道拒绝）
      // 步骤 3：断言错误逐值对账——事实没被提交就不能当成已生效
      await expect(
        (worker as unknown as {
          reportPreconditionFailure(taskId: string, failure: unknown): Promise<void>;
        }).reportPreconditionFailure("t-1", { code: "X", cause_class: "Y", message: "boom" }),
      ).rejects.toThrow("fact preconditionFailure rejected: p0 down");
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
