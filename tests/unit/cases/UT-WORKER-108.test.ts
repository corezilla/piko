/**
 * Case ID: UT-WORKER-108  ·  STATUS: real
 *
 * 责任：返回站点 L46 值 `plan.version===1&&typeof plan.before===…` 逐值断言（tool-recovery.ts）
 * 维度坐标：`isPlan` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-108.md（脚本的唯一依据）
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

describe("UT-WORKER-108 · isPlan · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns false for a plan that is missing the after digest", () => {
const plan = {
  version: 1,
  before: "sha256:aaa",
  after: "sha256:bbb",
  result: { content: [{ type: "text", text: "ok" }] },
};
    // 步骤 2：调用 isPlan（缺 after 字段）
    const { after, ...withoutAfter } = plan;

    // 步骤 3：断言返回值逐值对账——after 必须是字符串
    expect(isPlan(withoutAfter as never)).toBe(false);
  });

});
