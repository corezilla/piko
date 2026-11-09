/**
 * Case ID: UT-WORKER-149  ·  STATUS: real
 *
 * 责任：参数 `base: AgentHarnessTool<ExecutionToolContext>` 的 `每等价类合法值` 类（tool-recovery.ts:91）
 * 维度坐标：`applyToolRecoveryPolicy` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-149.md（脚本的唯一依据）
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

describe("UT-WORKER-149 · applyToolRecoveryPolicy · 纯函数/无副作用 × 每等价类合法值", () => {
  it("keeps the tool name and description", async () => {
  const { mkdtemp, rm, writeFile, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { createWriteTool, createEditTool, createReadTool, createBashTool } = await import(
    "../../../upstream/pi/packages/agent/src/harness/tools/index.ts"
  );
  const root = await mkdtemp(join(tmpdir(), "piko-recovery-"));
  const inv = invocation();
  const ctx = toolContext(root);
    const base = createWriteTool();
    const tool = applyToolRecoveryPolicy(base, writePolicy, registry);
    try {
    // 步骤 2：断言返回值逐值对账——工具身份不变
    expect(tool.name).toBe(base.name);
    expect(tool.description).toBe(base.description);
    expect(tool.parameters).toBe(base.parameters);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

});
