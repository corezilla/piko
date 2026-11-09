/**
 * Case ID: UT-WORKER-013  ·  STATUS: real
 *
 * 责任：被测符号 `run`（WORKER）在对象类型 `纯函数/无副作用` 下的维度格 `非法值`（该 Case 只登记本行 1 格）、`每等价类合法值`、`边界(上/下/零/空/满)`；`run` × `纯函数/无副作用` 格 `非法值`（波次一：补齐 §2.3 未登记格；worker.ts:143，分支 46 点）；只测该符号该类型
 * 维度坐标：`run` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-013.md（脚本的唯一依据）
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

describe("UT-WORKER-013 · run · 纯函数/无副作用 × 非法值", () => {
  it("does not validate the lease epoch it is given", async () => {
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
      // 步骤 2：调用 run（租约纪元是个字符串——非法类型）
      await (worker as unknown as { run(taskId: string, epoch: number): Promise<void> }).run("t-1", "not-a-number" as never);

      // 步骤 3：断言发布照发——该参数不校验，围栏由 P0 在提交时校验
      const published = channel.facts.find((f) => f.kind === "publishResult");
      expect(published).toBeDefined();
      expect(published).toMatchObject({ lease_epoch: "not-a-number" });
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
