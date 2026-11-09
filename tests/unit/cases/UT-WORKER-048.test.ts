/**
 * Case ID: UT-WORKER-048  ·  STATUS: real
 *
 * 责任：资源操作 L61 `clearInterval`（exec-process.ts）
 * 维度坐标：`runExecutionProcess` × `资源获取/释放` × `正常释放`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-048.md（脚本的唯一依据）
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

describe("UT-WORKER-048 · runExecutionProcess · 资源获取/释放 × 正常释放", () => {
  it("clears the heartbeat timer on shutdown", async () => {
  const { runExecutionProcess } = await import("../../../src/exec-process.js");

    try {
      vi.useFakeTimers();
      const exit = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
      try {
      const { deps, run } = execDeps();
      const started = await runExecutionProcess("config/runtime.json", "/tmp/piko-exec", deps);
      const before = vi.getTimerCount();

      // 步骤 2：调用 shutdown
      // 步骤 3：断言心跳定时器被清掉——shutdown 第一步就是 clearInterval
      await started.shutdown();
      expect(vi.getTimerCount()).toBeLessThan(before);
      expect(run.storesClosed).toBe(1);
      expect(exit).toHaveBeenCalledWith(0);
      } finally {
        vi.useRealTimers();
      }
    } finally {
      vi.restoreAllMocks();
    }
  });

});
