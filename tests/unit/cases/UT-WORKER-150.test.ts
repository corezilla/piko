/**
 * Case ID: UT-WORKER-150  ·  STATUS: real
 *
 * 责任：参数 `base` 的 `边界(上/下/零/空/满)` 类（tool-recovery.ts:91）
 * 维度坐标：`applyToolRecoveryPolicy` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-150.md（脚本的唯一依据）
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

describe("UT-WORKER-150 · applyToolRecoveryPolicy · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("keeps a tool that has no execute of its own", async () => {
  const { mkdtemp, rm, writeFile, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { createWriteTool, createEditTool, createReadTool, createBashTool } = await import(
    "../../../upstream/pi/packages/agent/src/harness/tools/index.ts"
  );
  const root = await mkdtemp(join(tmpdir(), "piko-recovery-"));
  const inv = invocation();
  const ctx = toolContext(root);
    const base = { name: "custom", parameters: undefined } as never;
    const tool = applyToolRecoveryPolicy(base, neverPolicy, registry);
    try {
    // 步骤 2：断言返回值逐值对账——字段原样带出
    expect(tool.name).toBe("custom");
    expect(tool.parameters).toBeUndefined();
    expect(tool.replay).toBe("never");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

});
