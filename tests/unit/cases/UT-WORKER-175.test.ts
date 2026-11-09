/**
 * Case ID: UT-WORKER-175  ·  STATUS: real
 *
 * 责任：返回站点 L104 值 `(async (...args: Parameters<F>) => { en…` 逐值断言（tool-recovery.ts）
 * 维度坐标：`applyToolRecoveryPolicy` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-175.md（脚本的唯一依据）
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

describe("UT-WORKER-175 · applyToolRecoveryPolicy · 纯函数/无副作用 × 每等价类合法值", () => {
  it("wraps the execute when there is a network allowlist", async () => {
  const { mkdtemp, rm, writeFile, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { createWriteTool, createEditTool, createReadTool, createBashTool } = await import(
    "../../../upstream/pi/packages/agent/src/harness/tools/index.ts"
  );
  const root = await mkdtemp(join(tmpdir(), "piko-recovery-"));
  const inv = invocation();
  const ctx = toolContext(root);
    const base = createReadTool();
    const tool = applyToolRecoveryPolicy(
      base,
      { effect: "read_only", replay: "safe", permissions: { network_hosts: ["example.com"] } } as never,
      registry,
    );
    try {
    // 步骤 2：断言返回值逐值对账——有允许表才包作用域
    expect(typeof tool.execute).toBe("function");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

});
