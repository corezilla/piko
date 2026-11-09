/**
 * Case ID: UT-WORKER-374  ·  STATUS: real
 *
 * 责任：分支 L110 `if (staging.state === "failed")`（if；worker.ts）
 * 维度坐标：`stageInputs` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-374.md（脚本的唯一依据）
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

describe("UT-WORKER-374 · stageInputs · 状态分支 × 合法迁移", () => {
  it("clears the staging when the fetch reports a failure", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1", { input_refs: [{ source: "/remote/allowed/a.txt" }] }), "slinky", 10);
      const channel = fakeChannel();
      const transfer = fakeTransfer({ fetchInputs: async () => ({ state: "failed", fetched: [], failed: [{ source: "/remote/allowed/a.txt", error: "nope" }] }) });
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

      // 步骤 3：断言 staging 被清掉，且前置失败被报出
      expect(transfer.cleared).toEqual(["t-1"]);
      const failure = channel.facts.find((f) => f.kind === "preconditionFailure");
      expect(failure).toMatchObject({
        result: { failure: { code: "InputFetchFailed", cause_class: "Dependency" } },
      });
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
