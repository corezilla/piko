/**
 * Case ID: UT-WORKER-003  ·  STATUS: real
 *
 * 责任：被测符号 `claimNext`（WORKER）在对象类型 `并发/可重入` 下的维度格 `并发对偶/交错`（该 Case 只登记本行 1 格）、`容量 N−1/N/N+1`、`可重入幂等`；只测该符号该类型
 * 维度坐标：`claimNext` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-003.md（脚本的唯一依据）
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

describe("UT-WORKER-003 · claimNext · 并发/可重入 × 并发对偶/交错", () => {
  it("asks for staging before asking for the slot", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1"), "slinky", 10);
      const grant = store.tryClaimSlot("worker", "boot") as { lease_epoch: number } | null;
      const channel = fakeChannel({ "stagingClaim:once": { task_id: "t-stage" }, "claim:once": { task_id: "t-1", lease_epoch: 1 } });
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
      // 步骤 2：调用 claimNext 两次
      const first = await (worker as unknown as { claimNext(): Promise<unknown> }).claimNext();
      const second = await (worker as unknown as { claimNext(): Promise<unknown> }).claimNext();

      // 步骤 3：断言交错序——先问 staging，再问 slot
      expect(first).toEqual({ kind: "staging", task_id: "t-stage" });
      expect(second).toEqual({ kind: "run", task_id: "t-1", lease_epoch: 1 });
      expect(channel.facts.map((f) => f.kind)).toEqual(["stagingClaim", "stagingClaim", "claim"]);
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
