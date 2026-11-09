/**
 * Case ID: UT-WORKER-154  ·  STATUS: real
 *
 * 责任：参数 `policy` 的 `非法值` 类（tool-recovery.ts:91）
 * 维度坐标：`applyToolRecoveryPolicy` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-154.md（脚本的唯一依据）
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

describe("UT-WORKER-154 · applyToolRecoveryPolicy · 纯函数/无副作用 × 非法值", () => {
  it("refuses a policy with an unknown effect", async () => {
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
    try {
    // 步骤 2：调用 applyToolRecoveryPolicy（effect 是未知值、replay 是 safe）
    // 步骤 3：断言被拒——未知 effect 既不是 never 也不是 read_only，
    //         故落到写契约分支，而该契约不支持 read 工具
    expect(() =>
      applyToolRecoveryPolicy(
        base,
        { effect: "not_an_effect", replay: "safe", recovery_contract_ref: "atomic" } as never,
        registry,
      ),
    ).toThrow(/does not support read/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

});
