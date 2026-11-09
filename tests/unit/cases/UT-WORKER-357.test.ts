/**
 * Case ID: UT-WORKER-357  ·  STATUS: real
 *
 * 责任：持久化/序列化 round-trip 状态写 L68 → `db`（worker.ts）
 * 维度坐标：`loop` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-357.md（脚本的唯一依据）
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

describe("UT-WORKER-357 · loop · 持久化/序列化 × round-trip", () => {
  it("persists the run outcome through the two-step commit", async () => {
  const { mkdtemp, rm, writeFile, mkdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);

    try {
      // 步骤 1：造一条任务（槽位留给 P0 的 claim 去占）
      store.createOrGet(task("t-1"), "slinky", 10);

      // 步骤 2：用真的 channel（写进权威库）跑一轮 loop
      const { FactHandler, LocalChannel } = await import("../../../src/ipc.js");
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        fakeTransfer() as never,
        new LocalChannel(new FactHandler(store)) as never,
      );
      const loop = (worker as unknown as { loop(): Promise<void> }).loop.bind(worker);
      const running = loop();
      await new Promise((r) => setTimeout(r, 200));
      (worker as unknown as { stopped: boolean }).stopped = true;
      await running;

      // 步骤 3：断言结果落库——发布与收尾都写进了权威库
      expect(store.getRun("t-1").state).toBe("Completed");
      expect(store.result("t-1").state).toBe("Completed");
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
