/**
 * Case ID: UT-WORKER-363  ·  STATUS: real
 *
 * 责任：返回站点 L81 值 `{ kind: "staging", task_id: staging.tas…` 逐值断言（worker.ts）
 * 维度坐标：`claimNext` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-363.md（脚本的唯一依据）
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

describe("UT-WORKER-363 · claimNext · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the staging claim verbatim", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      const channel = fakeChannel({ stagingClaim: { task_id: "t-stage" } });
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        fakeTransfer() as never,
        channel as never,
      );
    try {
      // 步骤 2：调用 claimNext
      const claim = await (worker as unknown as { claimNext(): Promise<unknown> }).claimNext();

      // 步骤 3：断言返回值逐值对账——kind 与 task_id 两个字段
      expect(claim).toEqual({ kind: "staging", task_id: "t-stage" });
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
