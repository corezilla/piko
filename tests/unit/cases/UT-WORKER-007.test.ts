/**
 * Case ID: UT-WORKER-007  ·  STATUS: real
 *
 * 责任：被测符号 `reportPreconditionFailure`（WORKER）在对象类型 `错误路径` 下的维度格 `每个 typed 错误码`（该 Case 只登记本行 1 格）、`错误保真传播`、`内部错误不上抛为客户端码`；只测该符号该类型
 * 维度坐标：`reportPreconditionFailure` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-007.md（脚本的唯一依据）
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
import { execDeps, runtimeConfig } from "./support/exec-process-fix.js";

describe("UT-WORKER-007 · reportPreconditionFailure · 错误路径 × 每个 typed 错误码", () => {
  it("reports the failure code verbatim", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
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
        fakePi(async () => ({ status: "completed", summary: "done" })) as never,
        fakeMatrix() as never,
        transfer as never,
        channel as never,
      );
    try {
      // 步骤 2：调用 reportPreconditionFailure（带一个客户端错误码）
      await (worker as unknown as {
        reportPreconditionFailure(taskId: string, failure: unknown): Promise<void>;
      }).reportPreconditionFailure("t-1", {
        code: "InputFetchFailed",
        cause_class: "Dependency",
        message: "input fetch failed: /remote/a.txt",
      });

      // 步骤 3：断言错误逐值对账——客户端错误码不被改写
      const failure = channel.facts.find((f) => f.kind === "preconditionFailure");
      expect(failure).toMatchObject({
        result: {
          state: "Failed",
          failure: {
            code: "InputFetchFailed",
            cause_class: "Dependency",
            message: "input fetch failed: /remote/a.txt",
          },
        },
      });
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
