/**
 * Case ID: UT-WORKER-219  ·  STATUS: real
 *
 * 责任：分支 L209 `? bad && bad.status !== "exited" :`（ternary；worker.ts）
 * 维度坐标：`run` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-219.md（脚本的唯一依据）
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

describe("UT-WORKER-219 · run · 状态分支 × 合法迁移", () => {
  it("includes the status in the failure message", async () => {
  const { mkdtemp, rm, writeFile, mkdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1"), "slinky", 10);
      const grant = store.tryClaimSlot("worker", "boot") as { lease_epoch: number } | null;
      const channel = fakeChannel();
      const transfer = fakeTransfer();
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({
      status: "completed",
      summary: "done",
      executions: [{
        tool_call_id: null,
        command: "pytest",
        exit_code: null,
        status: "spawn_error",
        output: "",
        truncated: false,
        timed_out: false,
        started_at: "2026-11-09T00:00:00.000Z",
        ended_at: "2026-11-09T00:00:01.000Z",
        duration_ms: 1000,
      }],
    })) as never,
        fakeMatrix() as never,
        transfer as never,
        channel as never,
      );
    try {
      await (worker as unknown as { run(taskId: string, epoch: number): Promise<void> })
        .run("t-1", 1);

      // 步骤 3：断言状态被写进消息
      const fact = channel.facts.find((f) => f.kind === "publishResult");
      expect(fact).toMatchObject({
        result: { failure: { message: "execution failed: pytest (spawn_error)" } },
      });
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
