/**
 * Case ID: UT-WORKER-039  ·  STATUS: real
 *
 * 责任：await 拒绝传播 #2：被调方 `resolveSecret(config.llmtier.api_key_secret_ref` 拒绝必须 typed 化上抛（exec-process.ts:17）
 * 维度坐标：`runExecutionProcess` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-039.md（脚本的唯一依据）
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

describe("UT-WORKER-039 · runExecutionProcess · 错误路径 × 每个 typed 错误码", () => {
  it("propagates a missing llm key", async () => {
  const { runExecutionProcess } = await import("../../../src/exec-process.js");

    try {
      const { deps } = execDeps({ failAt: "resolveSecret" });

      // 步骤 2：调用 runExecutionProcess
      // 步骤 3：断言错误逐值对账——密钥解析失败即起不来
      await expect(runExecutionProcess("config/runtime.json", "/tmp/piko-exec", deps)).rejects.toThrow(
        /missing secret env:PIKO_UT_LLM_KEY/,
      );
    } finally {
      vi.restoreAllMocks();
    }
  });

});
