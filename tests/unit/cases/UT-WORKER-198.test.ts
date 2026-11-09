/**
 * Case ID: UT-WORKER-198  ·  STATUS: real
 *
 * 责任：分支 L166 `if (task.artifact_target)`（if；worker.ts）
 * 维度坐标：`run` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-198.md（脚本的唯一依据）
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

describe("UT-WORKER-198 · run · 状态分支 × 合法迁移", () => {
  it("delivers the artifacts when the task declares a target", async () => {
  const { mkdtemp, rm, writeFile, mkdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1", { output_paths: ["out/report.json"], artifact_target: { method: "scp", target: "/remote/allowed" } }), "slinky", 10);
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

      // 步骤 3：断言交付被发起——先报 in_progress 再报结果
      const delivery = channel.facts.filter((f) => f.kind === "delivery");
      expect(delivery).toHaveLength(2);
      expect(delivery[0]).toMatchObject({ delivery: { state: "in_progress" } });
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
