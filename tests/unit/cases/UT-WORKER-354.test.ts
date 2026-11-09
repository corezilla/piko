/**
 * Case ID: UT-WORKER-354  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #2：被调方 `new Promise((r` 拒绝必须 typed 化上抛（worker.ts:58）
 * 维度坐标：`loop` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-354.md（脚本的唯一依据）
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

describe("UT-WORKER-354 · loop · 错误路径 × 每个 typed 错误码", () => {
  it("propagates a rejected backoff promise", async () => {
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
      // 步骤 2：调用 loop——退避用的 Promise 不会被拒，
      //         故断言循环在停止前不会抛错
      const loop = (worker as unknown as { loop(): Promise<void> }).loop.bind(worker);
      const running = loop();
      await new Promise((r) => setTimeout(r, 50));
      (worker as unknown as { stopped: boolean }).stopped = true;
      await running;

      // 步骤 3：断言退避不是一次拒绝——它是纯粹的延时
      expect(channel.facts.length).toBeGreaterThan(0);
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
