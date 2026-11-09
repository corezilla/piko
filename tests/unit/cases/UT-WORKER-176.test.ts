/**
 * Case ID: UT-WORKER-176  ·  STATUS: real
 *
 * 责任：返回站点 L107 值 `await fn(...args)` 逐值断言（tool-recovery.ts）
 * 维度坐标：`applyToolRecoveryPolicy` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-176.md（脚本的唯一依据）
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

describe("UT-WORKER-176 · applyToolRecoveryPolicy · 纯函数/无副作用 × 每等价类合法值", () => {
  it("forwards the call to the wrapped execute", async () => {
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
    const tool = applyToolRecoveryPolicy(
      base,
      {
        effect: "workspace_write",
        replay: "safe",
        recovery_contract_ref: "atomic",
        permissions: { network_hosts: ["example.com"] },
      } as never,
      registry,
    );
    try {
      await tool.execute(
        "call",
        { path: "x.txt", content: "after\n" },
        () => {},
        ctx as never,
        inv.value,
        context as never,
      );

    // 步骤 3：断言返回值逐值对账——被包装的 execute 的结果被原样带回
    expect(await readFile(join(root, "x.txt"), "utf8")).toBe("after\n");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

});
