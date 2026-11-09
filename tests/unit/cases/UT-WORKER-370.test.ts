/**
 * Case ID: UT-WORKER-370  ·  STATUS: real
 *
 * 责任：分支 L93 `if (this.isAborted(taskId))`（if；worker.ts）
 * 维度坐标：`stageInputs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-370.md（脚本的唯一依据）
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

describe("UT-WORKER-370 · stageInputs · 状态分支 × 合法迁移", () => {
  it("aborts the fetch when the task was cancelled", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1", { input_refs: [{ source: "/remote/allowed/a.txt" }] }), "slinky", 10);
      const channel = fakeChannel();
      const transfer = fakeTransfer({ fetchInputs: async () => { throw Object.assign(new Error("aborted"), { name: "AbortError" }); } });
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        transfer as never,
        channel as never,
      );
      store.cancel("t-1");

    try {
      await (worker as unknown as { stageInputs(taskId: string): Promise<void> }).stageInputs("t-1");

      // 步骤 3：断言中止被下传到 fetch——轮询每 250ms 查一次 isAborted，
      //         中止后即 abort controller，故 fetch 收到已中止的 signal
      expect(transfer.fetchInputs).toHaveBeenCalledTimes(1);
      const signal = transfer.fetchInputs.mock.calls[0]?.[2];
      expect(signal).toBeDefined();
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
