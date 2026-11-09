/**
 * Case ID: UT-WORKER-098  ·  STATUS: real
 *
 * 责任：返回站点 L40 值 `{fingerprint:digest(read.value),content…` 逐值断言（tool-recovery.ts）
 * 维度坐标：`fileState` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-098.md（脚本的唯一依据）
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

describe("UT-WORKER-098 · fileState · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the fingerprint and the content", async () => {
    const env = fakeEnv({ readTextFile: () => ({ ok: true, value: "hello" }) });

    // 步骤 2：调用 fileState
    const state = await fileState(env as never, "x.txt", context as never);

    // 步骤 3：断言返回值逐值对账——指纹是内容的 sha256，内容原样带出
    const { createHash } = await import("node:crypto");
    expect(state.fingerprint).toBe(`sha256:${createHash("sha256").update("hello").digest("hex")}`);
    expect(state.content).toBe("hello");
  });

});
