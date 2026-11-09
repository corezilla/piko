/**
 * Case ID: UT-WORKER-160  ·  STATUS: real
 *
 * 责任：分支 L103 `if (allowlist.length === 0)`（if；tool-recovery.ts）
 * 维度坐标：`applyToolRecoveryPolicy` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-160.md（脚本的唯一依据）
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

describe("UT-WORKER-160 · applyToolRecoveryPolicy · 状态分支 × 合法迁移", () => {
  it("leaves the tool untouched when the network allowlist is empty", async () => {
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
      { effect: "read_only", replay: "safe", permissions: { network_hosts: [] } } as never,
      registry,
    );
    try {
    // 步骤 2：断言返回值逐值对账——空允许表即不套作用域
    expect(tool.replay).toBe("safe");
    expect(tool.name).toBe(base.name);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

});
