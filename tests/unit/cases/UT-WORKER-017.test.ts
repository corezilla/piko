/**
 * Case ID: UT-WORKER-017  ·  STATUS: real
 *
 * 责任：参数 `configPath: string` 的 `超长` 类（exec-process.ts:17）
 * 维度坐标：`runExecutionProcess` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-017.md（脚本的唯一依据）
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

describe("UT-WORKER-017 · runExecutionProcess · 字符串/路径/枚举输入 × 超长", () => {
  it("passes an over-long config path to the loader", async () => {
  const { runExecutionProcess } = await import("../../../src/exec-process.js");

    try {
      const { deps, run } = execDeps();
      const long = "c".repeat(5000);
      await runExecutionProcess(long, "/tmp/piko-exec", deps);

      // 步骤 3：断言超长路径原样交给 loader——该参数不校验
      expect(run.configPaths).toEqual([long]);
    } finally {
      vi.restoreAllMocks();
    }
  });

});
