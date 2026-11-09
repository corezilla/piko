/**
 * Case ID: UT-WORKER-238  ·  STATUS: real
 *
 * 责任：分支 L274 `catch (finalize)`（catch；worker.ts）
 * 维度坐标：`run` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-238.md（脚本的唯一依据）
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

describe("UT-WORKER-238 · run · 错误路径 × 每个 typed 错误码", () => {
  it("swallows a failure to publish the result", async () => {
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
      );      const rejecting = rejectingChannel("p0 down");
      const failingWorker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        fakeTransfer() as never,
        rejecting as never,
      );
    try {
      // 步骤 2：调用 run（发布被拒）
      // 步骤 3：断言收尾失败被吞掉——run 不把发布失败抛给调用方
      await expect(
        (failingWorker as unknown as { run(taskId: string, epoch: number): Promise<void> }).run("t-1", 1),
      ).resolves.toBeUndefined();
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
