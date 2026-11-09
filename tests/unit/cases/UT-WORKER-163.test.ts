/**
 * Case ID: UT-WORKER-163  ·  STATUS: real
 *
 * 责任：分支 L123 `if (execAllowlist.length === 0)`（if；tool-recovery.ts）
 * 维度坐标：`applyToolRecoveryPolicy` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-163.md（脚本的唯一依据）
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

describe("UT-WORKER-163 · applyToolRecoveryPolicy · 状态分支 × 合法迁移", () => {
  it("lets any command through when the executable allowlist is empty", async () => {
  const { mkdtemp, rm, writeFile, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { createWriteTool, createEditTool, createReadTool, createBashTool } = await import(
    "../../../upstream/pi/packages/agent/src/harness/tools/index.ts"
  );
  const root = await mkdtemp(join(tmpdir(), "piko-recovery-"));
  const inv = invocation();
  const ctx = toolContext(root);
    const base = createBashTool();
    const tool = applyToolRecoveryPolicy(
      base,
      { effect: "process", replay: "never", permissions: { executables: [] } } as never,
      registry,
    );
    try {
      await tool.execute(
        "call",
        { command: "echo allowed" },
        () => {},
        ctx as never,
        inv.value,
        context as never,
      );

    // 步骤 3：断言命令没被拦——空允许表即不限制
    expect(inv.memos.size).toBe(0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

});
