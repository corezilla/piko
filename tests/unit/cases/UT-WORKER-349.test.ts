/**
 * Case ID: UT-WORKER-349  ·  STATUS: real
 *
 * 责任：分支 L63 `if (!claim)`（if；worker.ts）
 * 维度坐标：`loop` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-349.md（脚本的唯一依据）
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

describe("UT-WORKER-349 · loop · 并发/可重入 × 并发对偶/交错", () => {
  it("waits and polls again when there is no work", async () => {
  const { mkdtemp, rm, writeFile, mkdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1"), "slinky", 10);
      const channel = fakeChannel({ stagingClaim: null, claim: null });
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
      // 步骤 2：调用 loop——没有活干就退避 200ms 再问
      const loop = (worker as unknown as { loop(): Promise<void> }).loop.bind(worker);
      const running = loop();
      await new Promise((r) => setTimeout(r, 300));
      (worker as unknown as { stopped: boolean }).stopped = true;
      await running;

      // 步骤 3：断言退避期间又问过一次 P0——退避是 200ms
      expect(channel.facts.filter((f) => f.kind === "stagingClaim").length).toBeGreaterThan(1);
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
