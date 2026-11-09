/**
 * Case ID: UT-WORKER-106  ·  STATUS: real
 *
 * 责任：分支 L46 `plan.version===1&&typeof plan.before==="strin…`（&&；tool-recovery.ts）
 * 维度坐标：`isPlan` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-106.md（脚本的唯一依据）
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

describe("UT-WORKER-106 · isPlan · 状态分支 × 合法迁移", () => {
  it("rejects a plan whose version is not 1", () => {
const plan = {
  version: 1,
  before: "sha256:aaa",
  after: "sha256:bbb",
  result: { content: [{ type: "text", text: "ok" }] },
};
    // 步骤 2：调用 isPlan（version 是 2）
    // 步骤 3：断言返回值逐值对账——&& 的第一段为假即不是 plan
    expect(isPlan({ ...plan, version: 2 } as never)).toBe(false);
  });

});
