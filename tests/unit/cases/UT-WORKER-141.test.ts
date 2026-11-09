/**
 * Case ID: UT-WORKER-141  ·  STATUS: real
 *
 * 责任：分支 L85 `if (current.fingerprint===plan.after)`（if；tool-recovery.ts）
 * 维度坐标：`executeRecoverable` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-141.md（脚本的唯一依据）
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

describe("UT-WORKER-141 · executeRecoverable · 状态分支 × 合法迁移", () => {
  it("replays the recorded result when the effect already happened", async () => {
  const { mkdtemp, rm, writeFile, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { createWriteTool, createEditTool } = await import(
    "../../../upstream/pi/packages/agent/src/harness/tools/index.ts"
  );
  const root = await mkdtemp(join(tmpdir(), "piko-recovery-"));
  const inv = invocation();
  const ctx = toolContext(root);
    const base = createWriteTool();
    await writeFile(join(root, "x.txt"), "after\n", "utf8");
    const { createHash } = await import("node:crypto");
    inv.memos.set("workspace-write-plan", {
      version: 1,
      before: `sha256:${createHash("sha256").update("before\n").digest("hex")}`,
      after: `sha256:${createHash("sha256").update("after\n").digest("hex")}`,
      result: { content: [{ type: "text", text: "replayed" }] },
    });
    try {
      const result = await executeRecoverable(
        base,
        "call",
        { path: "x.txt", content: "after\n" },
        () => {},
        ctx as never,
        inv.value,
        context as never,
      );

      // 步骤 3：断言返回计划里的结果——没有重跑工具
      expect(result).toMatchObject({ content: [{ type: "text", text: "replayed" }] });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

});
