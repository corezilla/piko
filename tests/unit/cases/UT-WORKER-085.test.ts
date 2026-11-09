/**
 * Case ID: UT-WORKER-085  ·  STATUS: real
 *
 * 责任：参数 `path: string` 的 `注入字符` 类（tool-recovery.ts:31）
 * 维度坐标：`fileState` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-085.md（脚本的唯一依据）
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

describe("UT-WORKER-085 · fileState · 字符串/路径/枚举输入 × 注入字符", () => {
  it("asks the env about an injected path as data", async () => {
    const env = fakeEnv();

    // 步骤 2：调用 fileState(env, 注入串路径, context)
    const injected = "x.txt/$(rm -rf /)";
    await fileState(env as never, injected, context as never);

    // 步骤 3：断言注入串被原样交给 env——不被 shell 解释
    expect(env.fileInfo).toHaveBeenCalledWith(injected, expect.anything());
  });

});
