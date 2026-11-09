/**
 * Case ID: UT-WORKER-351  ·  STATUS: real
 *
 * 责任：分支 L67 `if (claim.kind === "staging")`（if；worker.ts）
 * 维度坐标：`loop` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-351.md（脚本的唯一依据）
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

describe("UT-WORKER-351 · loop · 并发/可重入 × 并发对偶/交错", () => {
  it("stages the inputs when the claim is a staging one", async () => {
  const { mkdtemp, rm, writeFile, mkdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1", { input_refs: [{ source: "/remote/allowed/a.txt" }] }), "slinky", 10);
      const channel = fakeChannel({ "stagingClaim:once": { task_id: "t-1" }, claim: null });
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
      // 步骤 2：调用 loop——先取到 staging claim
      const loop = (worker as unknown as { loop(): Promise<void> }).loop.bind(worker);
      const running = loop();
      await new Promise((r) => setTimeout(r, 50));
      (worker as unknown as { stopped: boolean }).stopped = true;
      await running;

      // 步骤 3：断言走了 staging 分支——staging fact 被报出
      expect(channel.facts.some((f) => f.kind === "staging")).toBe(true);
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
