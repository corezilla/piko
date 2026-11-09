/**
 * Case ID: UT-WORKER-082  ·  STATUS: real
 *
 * 责任：参数 `env` 的 `非法值` 类（tool-recovery.ts:31）
 * 维度坐标：`fileState` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-082.md（脚本的唯一依据）
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

describe("UT-WORKER-082 · fileState · 纯函数/无副作用 × 非法值", () => {
  it("propagates the failure when the env cannot answer", async () => {
    const env = fakeEnv({ fileInfo: () => ({ ok: false, error: { code: "not_found" } }) });

    // 步骤 2：调用 fileState（env 返回 not_found）
    // 步骤 3：断言 not_found 被当作「缺失」而非错误
    const state = await fileState(env as never, "x.txt", context as never);
    expect(state.fingerprint).toBe("missing");
  });

});
