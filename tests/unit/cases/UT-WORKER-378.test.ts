/**
 * Case ID: UT-WORKER-378  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #3：被调方 `this.reportPreconditionFailure(taskId, {` 拒绝必须 typed 化上抛（worker.ts:87）
 * 维度坐标：`stageInputs` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-378.md（脚本的唯一依据）
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

describe("UT-WORKER-378 · stageInputs · 错误路径 × 每个 typed 错误码", () => {
  it("propagates a rejected failure report for a failed staging", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1", { input_refs: [{ source: "/remote/allowed/a.txt" }] }), "slinky", 10);
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
      const rejecting = rejectingChannel("p0 down");
      const failingWorker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        fakeTransfer({ fetchInputs: async () => ({ state: "failed", fetched: [], failed: [{ source: "/remote/x", error: "nope" }] }) }) as never,
        rejecting as never,
      );
    try {
      // 步骤 2：调用 stageInputs（staging 失败 → 报前置失败 → 通道拒绝）
      // 步骤 3：断言拒绝被上抛——先被拒的是 in_progress 的 staging fact
      await expect(
        (failingWorker as unknown as { stageInputs(taskId: string): Promise<void> }).stageInputs("t-1"),
      ).rejects.toThrow("fact staging rejected: p0 down");
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
