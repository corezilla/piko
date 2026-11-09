/**
 * Case ID: UT-WORKER-049  ·  STATUS: real
 *
 * 责任：返回站点 L73 值 `（无值 return：提前退出）` 逐值断言（exec-process.ts）
 * 维度坐标：`runExecutionProcess` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-049.md（脚本的唯一依据）
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

describe("UT-WORKER-049 · runExecutionProcess · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns without acting on a non-command message", async () => {
  const { runExecutionProcess } = await import("../../../src/exec-process.js");

    try {
      const { deps, run } = execDeps();
      await runExecutionProcess("config/runtime.json", "/tmp/piko-exec", deps);

      // 步骤 2：发一条非命令消息
      (process as unknown as { emit(event: string, payload: unknown): boolean }).emit("message", { not_a_command: true });

      // 步骤 3：断言提前退出——没有中止、没有别的动作
      expect(run.aborted).toEqual([]);
      expect(run.workerStarted).toBe(1);
    } finally {
      vi.restoreAllMocks();
    }
  });

});
