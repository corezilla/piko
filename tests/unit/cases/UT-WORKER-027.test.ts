/**
 * Case ID: UT-WORKER-027  ·  STATUS: real
 *
 * 责任：分支 L36 `if (config.matrix.direct_access_token)`（if；exec-process.ts）
 * 维度坐标：`runExecutionProcess` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-027.md（脚本的唯一依据）
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

describe("UT-WORKER-027 · runExecutionProcess · 状态分支 × 合法迁移", () => {
  it("uses the direct matrix token without resolving a secret", async () => {
  const { runExecutionProcess } = await import("../../../src/exec-process.js");

    try {
      const { deps, run } = execDeps({
        config: runtimeConfig({ matrix: { enabled: true, direct_access_token: "syt_direct" } }),
      });
      await runExecutionProcess("config/runtime.json", "/tmp/piko-exec", deps);

      // 步骤 3：断言直给的令牌被用上，且没有去解析密钥
      expect(run.matrixTokens).toEqual(["syt_direct"]);
      expect(run.secrets).not.toContain("env:PIKO_UT_MATRIX_KEY");
    } finally {
      vi.restoreAllMocks();
    }
  });

});
