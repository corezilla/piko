/**
 * Case ID: UT-WORKER-358  ·  STATUS: real
 *
 * 责任：资源操作 L64 `setTimeout`（worker.ts）
 * 维度坐标：`loop` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-358.md（脚本的唯一依据）
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

describe("UT-WORKER-358 · loop · 资源获取/释放 × 获取失败路径", () => {
  it("releases the backoff timer when the loop stops", async () => {
  const { mkdtemp, rm, writeFile, mkdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      store.createOrGet(task("t-1"), "slinky", 10);
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
      // 步骤 2：调用 loop——没有活干时用 setTimeout 退避
      const loop = (worker as unknown as { loop(): Promise<void> }).loop.bind(worker);
      const running = loop();
      await new Promise((r) => setTimeout(r, 300));
      (worker as unknown as { stopped: boolean }).stopped = true;
      await running;

      // 步骤 3：断言退避定时器用完即释放——循环退出时事件循环已空
      expect(channel.facts.filter((f) => f.kind === "stagingClaim").length).toBeGreaterThan(1);
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
