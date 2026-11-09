/**
 * Case ID: UT-WORKER-080  ·  STATUS: real
 *
 * 责任：参数 `env: ExecutionToolContext["env"]` 的 `每等价类合法值` 类（tool-recovery.ts:31）
 * 维度坐标：`fileState` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-080.md（脚本的唯一依据）
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

describe("UT-WORKER-080 · fileState · 纯函数/无副作用 × 每等价类合法值", () => {
  it("fingerprints a readable file", async () => {
    const env = fakeEnv();

    // 步骤 2：调用 fileState(env, "x.txt", context)
    const state = await fileState(env as never, "x.txt", context as never);

    // 步骤 3：断言返回值逐值对账——指纹是内容的 sha256
    const { createHash } = await import("node:crypto");
    expect(state.fingerprint).toBe(`sha256:${createHash("sha256").update("content").digest("hex")}`);
    expect(state.content).toBe("content");
  });

});
