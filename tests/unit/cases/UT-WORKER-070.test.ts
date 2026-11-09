/**
 * Case ID: UT-WORKER-070  ·  STATUS: real
 *
 * 责任：参数 `input: { declaredOutputPaths: readonly string[]; outputs: readonly ` 的 `注入字符` 类（test-evidence.ts:42）
 * 维度坐标：`buildRawResultRef` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-070.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { ExecutionFactCollector, statusFromErrorCode } from "../../../src/execution-facts.js";
import { buildRawResultRef, isExecutionFailure } from "../../../src/test-evidence.js";
import { RunWorker, aggregateUsage } from "../../../src/worker.js";
import { applyToolRecoveryPolicy } from "../../../src/tool-recovery.js";
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

describe("UT-WORKER-070 · buildRawResultRef · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected declared path as data", () => {
const fact = (over: Partial<ExecutionFact> = {}): ExecutionFact => ({
  tool_call_id: "call-1",
  command: "cat /etc/hostname",
  exit_code: 0,
  status: "exited",
  output: "a7048",
  truncated: false,
  timed_out: false,
  started_at: "2026-11-09T00:00:00.000Z",
  ended_at: "2026-11-09T00:00:01.000Z",
  duration_ms: 1000,
  ...over,
});

const output = (path: string) => ({ path, sha256: "a".repeat(64), size_bytes: 4 });
    // 步骤 2：调用 buildRawResultRef（声明路径含注入串）
    const raw = buildRawResultRef({
      declaredOutputPaths: ["out/$(rm -rf /).json"],
      outputs: [],
      executions: [],
    });

    // 步骤 3：断言返回值逐值对账——路径内容不被解释
    expect(raw.report_missing).toBe(true);
  });

});
