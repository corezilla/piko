/**
 * Case ID: UT-WORKER-345  ·  STATUS: real
 *
 * 责任：返回站点 L51 值 `this.aborted.has(taskId) || this.store.…` 逐值断言（worker.ts）
 * 维度坐标：`isAborted` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-345.md（脚本的唯一依据）
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

describe("UT-WORKER-345 · isAborted · 纯函数/无副作用 × 每等价类合法值", () => {
  it("reports the abort requested in this process", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      const channel = fakeChannel();
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        fakeTransfer() as never,
        channel as never,
      );
    try {
      // 步骤 1：请求中止
      worker.requestAbort("t-1");

      // 步骤 2：调用 isAborted("t-1")
      // 步骤 3：断言返回值逐值对账——|| 的前半段为真即已中止
      const aborted = (worker as unknown as { isAborted(taskId: string): boolean }).isAborted("t-1");
      expect(aborted).toBe(true);
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
