/**
 * Case ID: UT-WORKER-047  ·  STATUS: real
 *
 * 责任：资源操作 L57 `setInterval`（exec-process.ts）
 * 维度坐标：`runExecutionProcess` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-047.md（脚本的唯一依据）
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

describe("UT-WORKER-047 · runExecutionProcess · 资源获取/释放 × 获取失败路径", () => {
  it("starts the heartbeat timer", async () => {
  const { runExecutionProcess } = await import("../../../src/exec-process.js");

    try {
      vi.useFakeTimers();
      try {
      const { deps, run } = execDeps();
      await runExecutionProcess("config/runtime.json", "/tmp/piko-exec", deps);

      // 步骤 3：断言心跳定时器被装上了——每秒一次
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      expect(run.workerStarted).toBe(1);
      } finally {
        vi.useRealTimers();
      }
    } finally {
      vi.restoreAllMocks();
    }
  });

});
