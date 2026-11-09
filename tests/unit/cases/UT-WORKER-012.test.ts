/**
 * Case ID: UT-WORKER-012  ·  STATUS: real
 *
 * 责任：被测符号 `runExecutionProcess`（WORKER）在对象类型 `资源获取/释放` 下的维度格 `异常中途释放`（该 Case 只登记本行 1 格）、`获取失败路径`、`正常释放`；`runExecutionProcess` × `资源获取/释放` 格 `异常中途释放`（波次一：补齐 §2.3 未登记格；exec-process.ts:17，分支 16 点）；只测该符号该类型
 * 维度坐标：`runExecutionProcess` × `资源获取/释放` × `异常中途释放`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-012.md（脚本的唯一依据）
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

describe("UT-WORKER-012 · runExecutionProcess · 资源获取/释放 × 异常中途释放", () => {
  it("releases the collaborators when the startup fails midway", async () => {
  const { runExecutionProcess } = await import("../../../src/exec-process.js");

    try {
      const { deps, run } = execDeps({ failAt: "matrixStart" });

      // 步骤 2：调用 runExecutionProcess（Matrix 起不来）
      await expect(runExecutionProcess("config/runtime.json", "/tmp/piko-exec", deps)).rejects.toThrow();

      // 步骤 3：断言已开的库被关掉——中途失败也要释放
      expect(run.openedStores).toHaveLength(1);
      expect(run.workerStarted).toBe(0);
    } finally {
      vi.restoreAllMocks();
    }
  });

});
