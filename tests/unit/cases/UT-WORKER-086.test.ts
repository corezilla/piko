/**
 * Case ID: UT-WORKER-086  ·  STATUS: real
 *
 * 责任：参数 `context: Context` 的 `每等价类合法值` 类（tool-recovery.ts:31）
 * 维度坐标：`fileState` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-086.md（脚本的唯一依据）
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

describe("UT-WORKER-086 · fileState · 纯函数/无副作用 × 每等价类合法值", () => {
  it("passes the context down to the env", async () => {
    const env = fakeEnv();

    // 步骤 2：调用 fileState（带 Pi 的后台 context）
    await fileState(env as never, "x.txt", context as never);

    // 步骤 3：断言 context 被原样传下去
    expect(env.fileInfo).toHaveBeenCalledWith("x.txt", context);
  });

});
