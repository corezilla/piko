/**
 * Case ID: UT-WORKER-045  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #8：被调方 `matrix.close(` 拒绝必须 typed 化上抛（exec-process.ts:17）
 * 维度坐标：`runExecutionProcess` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-045.md（脚本的唯一依据）
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

describe("UT-WORKER-045 · runExecutionProcess · 错误路径 × 每个 typed 错误码", () => {
  it("propagates a matrix that cannot close", async () => {
  const { runExecutionProcess } = await import("../../../src/exec-process.js");

    try {
      const { deps, run } = execDeps({ failAt: "matrixClose" });
      const started = await runExecutionProcess("config/runtime.json", "/tmp/piko-exec", deps);

      // 步骤 2：调用 shutdown
      // 步骤 3：断言错误逐值对账
      await expect(started.shutdown()).rejects.toThrow("matrix close failed");
      expect(run.matrixClosed).toBe(1);
    } finally {
      vi.restoreAllMocks();
    }
  });

});
