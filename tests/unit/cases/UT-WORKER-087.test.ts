/**
 * Case ID: UT-WORKER-087  ·  STATUS: real
 *
 * 责任：参数 `context: Context` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:31）
 * 维度坐标：`fileState` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-087.md（脚本的唯一依据）
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

describe("UT-WORKER-087 · fileState · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("passes an empty context down to the env", async () => {
    const env = fakeEnv();

    // 步骤 2：调用 fileState（context 是空对象）
    const empty = {} as never;
    await fileState(env as never, "x.txt", empty);

    // 步骤 3：断言 context 被原样传下去——不校验
    expect(env.fileInfo).toHaveBeenCalledWith("x.txt", empty);
  });

});
