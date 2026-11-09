/**
 * Case ID: UT-WORKER-021  ·  STATUS: real
 *
 * 责任：参数 `root: string` 的 `注入字符` 类（exec-process.ts:17）
 * 维度坐标：`runExecutionProcess` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-021.md（脚本的唯一依据）
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

describe("UT-WORKER-021 · runExecutionProcess · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected root as data", async () => {
  const { runExecutionProcess } = await import("../../../src/exec-process.js");

    try {
      const { deps, run } = execDeps();
      await runExecutionProcess("config/runtime.json", "/tmp/$(rm -rf /)", deps);

      // 步骤 3：断言注入串原样交给 loader——不被 shell 解释
      expect(run.roots).toEqual(["/tmp/$(rm -rf /)"]);
    } finally {
      vi.restoreAllMocks();
    }
  });

});
