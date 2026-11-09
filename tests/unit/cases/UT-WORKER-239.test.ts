/**
 * Case ID: UT-WORKER-239  ·  STATUS: real
 *
 * 责任：分支 L278 `if (timer)`（if；worker.ts）
 * 维度坐标：`run` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-239.md（脚本的唯一依据）
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

describe("UT-WORKER-239 · run · 并发/可重入 × 并发对偶/交错", () => {
  it("clears the heartbeat timer after the run", async () => {
  const { mkdtemp, rm, writeFile, mkdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1"), "slinky", 10);
      const grant = store.tryClaimSlot("worker", "boot") as { lease_epoch: number } | null;
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
      vi.useFakeTimers();
      try {      await (worker as unknown as { run(taskId: string, epoch: number): Promise<void> })
        .run("t-1", 1);

      // 步骤 3：断言心跳定时器被清掉——finally 里的 clearInterval 生效
      expect(vi.getTimerCount()).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
