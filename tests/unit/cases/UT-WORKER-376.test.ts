/**
 * Case ID: UT-WORKER-376  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #1：被调方 `this.transfer.fetchInputs(taskId, refs, controller.signal` 拒绝必须 typed 化上抛（worker.ts:87）
 * 维度坐标：`stageInputs` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-376.md（脚本的唯一依据）
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

describe("UT-WORKER-376 · stageInputs · 错误路径 × 每个 typed 错误码", () => {
  it("turns a rejected fetch into a precondition failure", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1", { input_refs: [{ source: "/remote/allowed/a.txt" }] }), "slinky", 10);
      const channel = fakeChannel();
      const transfer = fakeTransfer({ fetchInputs: async () => { throw new Error("connection refused"); } });
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        transfer as never,
        channel as never,
      );

    try {
      await (worker as unknown as { stageInputs(taskId: string): Promise<void> }).stageInputs("t-1");

      // 步骤 3：断言拒绝不冒泡给调用方——被转成前置失败事实
      const failure = channel.facts.find((f) => f.kind === "preconditionFailure");
      expect(failure).toMatchObject({
        result: { failure: { message: "connection refused" } },
      });
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
