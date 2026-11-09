/**
 * Case ID: UT-WORKER-193  ·  STATUS: real
 *
 * 责任：参数 `epoch: number` 的 `恰好通过` 类（worker.ts:143）
 * 维度坐标：`run` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-193.md（脚本的唯一依据）
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

describe("UT-WORKER-193 · run · 数值/长度上限参数 × 恰好通过", () => {
  it("publishes with the granted lease epoch", async () => {
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
      await (worker as unknown as { run(taskId: string, epoch: number): Promise<void> })
        .run("t-1", 1);

      // 步骤 3：断言发布带上了租约纪元——纪元必须与 P0 授予的一致
      const fact = channel.facts.find((f) => f.kind === "publishResult");
      expect(fact).toMatchObject({ lease_epoch: 1 });
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
