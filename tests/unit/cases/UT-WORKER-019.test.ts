/**
 * Case ID: UT-WORKER-019  ·  STATUS: real
 *
 * 责任：参数 `root: string` 的 `空` 类（exec-process.ts:17）
 * 维度坐标：`runExecutionProcess` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-019.md（脚本的唯一依据）
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

describe("UT-WORKER-019 · runExecutionProcess · 字符串/路径/枚举输入 × 空", () => {
  it("passes the empty root to the loader", async () => {
  const { runExecutionProcess } = await import("../../../src/exec-process.js");

    try {
      const { deps, run } = execDeps();
      await runExecutionProcess("config/runtime.json", "", deps);

      // 步骤 3：断言根目录原样交给 loader——该参数不校验
      expect(run.roots).toEqual([""]);
    } finally {
      vi.restoreAllMocks();
    }
  });

});
