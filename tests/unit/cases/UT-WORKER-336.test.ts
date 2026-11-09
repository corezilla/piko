/**
 * Case ID: UT-WORKER-336  ·  STATUS: real
 *
 * 责任：throw L41 InternalError（守卫 `if (!outcome.ok)`；worker.ts）
 * 维度坐标：`report` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-336.md（脚本的唯一依据）
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

describe("UT-WORKER-336 · report · 错误路径 × 每个 typed 错误码", () => {
  it("throws when the fact was rejected", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      const channel = fakeChannel({ heartbeat: null });
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        fakeTransfer() as never,
        channel as never,
      );
    try {
      const rejecting = rejectingChannel("fenced");
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        fakeTransfer() as never,
        rejecting as never,
      );

      // 步骤 2：调用 report（通道拒绝）
      // 步骤 3：断言错误逐值对账——未提交的事实不得当成已生效
      await expect(
        (worker as unknown as { report(fact: unknown): Promise<unknown> })
          .report({ kind: "heartbeat", at: 1 }),
      ).rejects.toThrow("fact heartbeat rejected: fenced");
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
