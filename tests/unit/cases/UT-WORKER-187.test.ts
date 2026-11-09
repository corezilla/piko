/**
 * Case ID: UT-WORKER-187  ·  STATUS: real
 *
 * 责任：参数 `failure` 的 `超长` 类（worker.ts:125）
 * 维度坐标：`reportPreconditionFailure` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-187.md（脚本的唯一依据）
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

describe("UT-WORKER-187 · reportPreconditionFailure · 字符串/路径/枚举输入 × 超长", () => {
  it("reports a failure with an over-long message", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1"), "slinky", 10);
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
      // 步骤 2：调用 reportPreconditionFailure（超长消息）
      await (worker as unknown as {
        reportPreconditionFailure(taskId: string, failure: unknown): Promise<void>;
      }).reportPreconditionFailure("t-1", { code: "X", cause_class: "Y", message: "m".repeat(100000) });

      // 步骤 3：断言消息原样带出——该参数不校验
      const failure = channel.facts.find((f) => f.kind === "preconditionFailure");
      expect((failure as never as { result: { failure: { message: string } } }).result.failure.message)
        .toHaveLength(100000);
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
