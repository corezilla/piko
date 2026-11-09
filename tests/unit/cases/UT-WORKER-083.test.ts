/**
 * Case ID: UT-WORKER-083  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `空` 类（tool-recovery.ts:31）
 * 维度坐标：`fileState` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-083.md（脚本的唯一依据）
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

describe("UT-WORKER-083 · fileState · 字符串/路径/枚举输入 × 空", () => {
  it("asks the env about the empty path", async () => {
    const env = fakeEnv();

    // 步骤 2：调用 fileState(env, "", context)
    await fileState(env as never, "", context as never);

    // 步骤 3：断言空路径被原样交给 env——该参数不校验
    expect(env.fileInfo).toHaveBeenCalledWith("", expect.anything());
  });

});
