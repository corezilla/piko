/**
 * Case ID: UT-WORKER-005  ·  STATUS: real
 *
 * 责任：被测符号 `loop`（WORKER）在对象类型 `时间域行为` 下的维度格 `超时边界 ±1 tick`（该 Case 只登记本行 1 格）、`定时器触发序`；只测该符号该类型
 * 维度坐标：`loop` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-005.md（脚本的唯一依据）
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

describe("UT-WORKER-005 · loop · 时间域行为 × 超时边界 ±1 tick", () => {
  it("polls again after the backoff", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1"), "slinky", 10);
      const grant = store.tryClaimSlot("worker", "boot") as { lease_epoch: number } | null;
      const channel = fakeChannel({ stagingClaim: null, claim: null });
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
      // 步骤 2：调用 loop——没有活干时每 200ms 退避一次
      const loop = (worker as unknown as { loop(): Promise<void> }).loop.bind(worker);
      const running = loop();
      await new Promise((r) => setTimeout(r, 250));
      (worker as unknown as { stopped: boolean }).stopped = true;
      await running;

      // 步骤 3：断言退避边界——250ms 之内至少问过一次，超过后退避也到了
      expect(channel.facts.filter((f) => f.kind === "stagingClaim").length).toBeGreaterThan(1);
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
