/**
 * Case ID: UT-WORKER-097  ·  STATUS: real
 *
 * 责任：返回站点 L34 值 `{fingerprint:"missing"}` 逐值断言（tool-recovery.ts）
 * 维度坐标：`fileState` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-097.md（脚本的唯一依据）
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

describe("UT-WORKER-097 · fileState · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the missing fingerprint without content", async () => {
    const env = fakeEnv({ fileInfo: () => ({ ok: false, error: { code: "not_found" } }) });

    // 步骤 2：调用 fileState
    const state = await fileState(env as never, "x.txt", context as never);

    // 步骤 3：断言返回值逐值对账——只有指纹，没有内容
    expect(state).toEqual({ fingerprint: "missing" });
    expect(state.content).toBeUndefined();
  });

});
