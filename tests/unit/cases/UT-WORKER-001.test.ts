/**
 * Case ID: UT-WORKER-001  ·  STATUS: real
 *
 * 责任：被测符号 `aggregateUsage`（WORKER）在对象类型 `纯函数/无副作用` 下的维度格 `每等价类合法值`（该 Case 只登记本行 1 格）、`边界(上/下/零/空/满)`、`非法值`；只测该符号该类型
 * 维度坐标：`aggregateUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-001.md（脚本的唯一依据）
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

describe("UT-WORKER-001 · aggregateUsage · 纯函数/无副作用 × 每等价类合法值", () => {
  it("aggregates a complete set of attempts", () => {
const complete = {
  input: 10,
  output: 5,
  totalTokens: 15,
  cacheRead: 2,
  cacheWrite: 0,
  reasoning: 1,
};
    // 步骤 2：调用 aggregateUsage（两次尝试，字段齐全）
    const usage = aggregateUsage([complete, complete], 2);

    // 步骤 3：断言返回值逐值对账——质量 Complete，六个字段逐个求和
    expect(usage.quality).toBe("Complete");
    expect(usage.input_tokens).toBe(20);
    expect(usage.output_tokens).toBe(10);
    expect(usage.total_tokens).toBe(30);
    expect(usage.cache_read_tokens).toBe(4);
    expect(usage.cache_write_tokens).toBe(0);
    expect(usage.reasoning_tokens).toBe(2);
    expect(usage.missing_fields).toEqual([]);
  });

});
