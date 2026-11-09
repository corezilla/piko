/**
 * Case ID: UT-WORKER-146  ·  STATUS: real
 *
 * 责任：throw L86 `reject`（守卫 `if (current.fingerprint!==plan.before)`；tool-recovery.ts）
 * 维度坐标：`executeRecoverable` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-146.md（脚本的唯一依据）
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

describe("UT-WORKER-146 · executeRecoverable · 错误路径 × 每个 typed 错误码", () => {
  it("fails closed when the target drifted", async () => {
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
    await writeFile(join(root, "x.txt"), "third-party\n", "utf8");
    const { createHash } = await import("node:crypto");
    inv.memos.set("workspace-write-plan", {
      version: 1,
      before: `sha256:${createHash("sha256").update("before\n").digest("hex")}`,
      after: `sha256:${createHash("sha256").update("after\n").digest("hex")}`,
      result: { content: [] },
    });
    try {
      // 步骤 2：调用 executeRecoverable（当前状态与前后都不匹配）
      // 步骤 3：断言错误消息逐值对账——fail closed
      await expect(
        executeRecoverable(
          base,
          "call",
          { path: "x.txt", content: "after\n" },
          () => {},
          ctx as never,
          inv.value,
          context as never,
        ),
      ).rejects.toThrow(/recovery is ambiguous/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

});
