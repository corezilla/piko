/**
 * Case ID: UT-WORKER-368  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `注入字符` 类（worker.ts:87）
 * 维度坐标：`stageInputs` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-368.md（脚本的唯一依据）
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

describe("UT-WORKER-368 · stageInputs · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected task id as data", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("$(rm -rf /)"), "slinky", 10);
      const channel = fakeChannel();
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
      await (worker as unknown as { stageInputs(taskId: string): Promise<void> }).stageInputs("$(rm -rf /)");

      // 步骤 3：断言 staging fact 被报出——注入串只是 id
      expect(channel.facts.some((f) => f.kind === "staging")).toBe(true);
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
