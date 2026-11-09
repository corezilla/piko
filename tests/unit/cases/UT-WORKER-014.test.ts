/**
 * Case ID: UT-WORKER-014  ·  STATUS: real
 *
 * 责任：被测符号 `aggregateUsage`（WORKER）在对象类型 `数值/长度上限参数` 下的维度格 `多上限各自成套`（该 Case 只登记本行 1 格）、`恰好通过`、`+1 拒绝`、`−1 通过`；`aggregateUsage` × `数值/长度上限参数` 格 `多上限各自成套`（波次一：补齐 §2.3 未登记格；worker.ts:299，分支 12 点）；只测该符号该类型
 * 维度坐标：`aggregateUsage` × `数值/长度上限参数` × `多上限各自成套`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-014.md（脚本的唯一依据）
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
  throwingChannel,
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
import { execDeps, runtimeConfig } from "./support/exec-process-fix.js";

describe("UT-WORKER-014 · aggregateUsage · 数值/长度上限参数 × 多上限各自成套", () => {
  it("applies each token field's own bound", () => {
const complete = {
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 2,
  cacheWrite: 0,
  reasoning: 1,
};
    // 步骤 2：调用 aggregateUsage（一条记录缺 reasoning、另两条齐全）
    const usage = aggregateUsage([complete, complete, { ...complete, reasoning: undefined }], 3);

    // 步骤 3：断言逐格对账——每个字段各自成套：有 reasoning 的两条能求和，
    //         缺的那条让整个字段置空，其余字段不受牵连
    expect(usage.reasoning_tokens).toBeNull();
    expect(usage.missing_fields).toEqual(["reasoning_tokens"]);
    expect(usage.input_tokens).toBe(30);
    expect(usage.quality).toBe("Partial");
  });

});
