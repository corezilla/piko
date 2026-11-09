/**
 * Case ID: UT-WORKER-029  ·  STATUS: real
 *
 * 责任：分支 L38 `if (config.matrix.access_token_secret_ref)`（if；exec-process.ts）
 * 维度坐标：`runExecutionProcess` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-029.md（脚本的唯一依据）
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

describe("UT-WORKER-029 · runExecutionProcess · 状态分支 × 合法迁移", () => {
  it("resolves the matrix token from the secret reference", async () => {
  const { runExecutionProcess } = await import("../../../src/exec-process.js");

    try {
      const { deps, run } = execDeps({
        config: runtimeConfig({ matrix: { enabled: true, access_token_secret_ref: "env:PIKO_UT_MATRIX_KEY" } }),
      });
      await runExecutionProcess("config/runtime.json", "/tmp/piko-exec", deps);

      // 步骤 3：断言矩阵令牌来自密钥解析
      expect(run.matrixTokens).toEqual(["secret-for:env:PIKO_UT_MATRIX_KEY"]);
    } finally {
      vi.restoreAllMocks();
    }
  });

});
