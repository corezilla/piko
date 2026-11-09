/**
 * Case ID: UT-WORKER-100  ·  STATUS: real
 *
 * 责任：参数 `value: JsonValue|undefined` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:43）
 * 维度坐标：`isPlan` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-100.md（脚本的唯一依据）
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

describe("UT-WORKER-100 · isPlan · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts a plan with an empty result", () => {
const plan = {
  version: 1,
  before: "sha256:aaa",
  after: "sha256:bbb",
  result: { content: [{ type: "text", text: "ok" }] },
};
    // 步骤 2：调用 isPlan（result 是空对象）
    const ok = isPlan({ ...plan, result: {} } as never);

    // 步骤 3：断言返回值逐值对账——只要求 result 存在，不看内容
    expect(ok).toBe(true);
  });

});
