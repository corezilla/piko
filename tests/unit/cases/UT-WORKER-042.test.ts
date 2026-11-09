/**
 * Case ID: UT-WORKER-042  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #5：被调方 `resolveSecret(config.matrix.access_token_secret_ref` 拒绝必须 typed 化上抛（exec-process.ts:17）
 * 维度坐标：`runExecutionProcess` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-042.md（脚本的唯一依据）
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

describe("UT-WORKER-042 · runExecutionProcess · 错误路径 × 每个 typed 错误码", () => {
  it("propagates a missing matrix token", async () => {
  const { runExecutionProcess } = await import("../../../src/exec-process.js");

    try {
      const { deps } = execDeps({
        config: runtimeConfig({ matrix: { enabled: true, access_token_secret_ref: "env:PIKO_UT_MATRIX_KEY" } }),
        secret: async (ref: string) => {
          if (ref.includes("MATRIX")) throw new Error("matrix token missing");
          return "llm-key";
        },
      });

      // 步骤 2：调用 runExecutionProcess
      // 步骤 3：断言错误逐值对账
      await expect(runExecutionProcess("config/runtime.json", "/tmp/piko-exec", deps)).rejects.toThrow(
        "matrix token missing",
      );
    } finally {
      vi.restoreAllMocks();
    }
  });

});
