/**
 * Case ID: UT-WORKER-184  ·  STATUS: real
 *
 * 责任：参数 `taskId: string` 的 `超长` 类（worker.ts:125）
 * 维度坐标：`reportPreconditionFailure` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-184.md（脚本的唯一依据）
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

describe("UT-WORKER-184 · reportPreconditionFailure · 字符串/路径/枚举输入 × 超长", () => {
  it("reports a failure for an over-long task id", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t".repeat(5000)), "slinky", 10);
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
      // 步骤 2：调用 reportPreconditionFailure（超长 id）
      await (worker as unknown as {
        reportPreconditionFailure(taskId: string, failure: unknown): Promise<void>;
      }).reportPreconditionFailure("t".repeat(5000), { code: "InputFetchFailed", cause_class: "Dependency", message: "boom" });

      // 步骤 3：断言 task_id 原样带过去——该参数不校验
      const failure = channel.facts.find((f) => f.kind === "preconditionFailure");
      expect(failure).toMatchObject({ result: { task_id: "t".repeat(5000) } });
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
