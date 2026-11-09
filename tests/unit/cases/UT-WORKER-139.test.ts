/**
 * Case ID: UT-WORKER-139  ·  STATUS: real
 *
 * 责任：分支 L70 `!Array.isArray(params.edits)||params.edits.le…`（||；tool-recovery.ts）
 * 维度坐标：`executeRecoverable` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-139.md（脚本的唯一依据）
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

describe("UT-WORKER-139 · executeRecoverable · 状态分支 × 合法迁移", () => {
  it("rejects an edit with an empty replacement list", async () => {
  const { mkdtemp, rm, writeFile, readFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { createWriteTool, createEditTool } = await import(
    "../../../upstream/pi/packages/agent/src/harness/tools/index.ts"
  );
  const root = await mkdtemp(join(tmpdir(), "piko-recovery-"));
  const inv = invocation();
  const ctx = toolContext(root);
    const base = createEditTool();
    await writeFile(join(root, "x.txt"), "before\n", "utf8");
    try {
      await expect(
        executeRecoverable(
          base,
          "call",
          { path: "x.txt", edits: [] },
          () => {},
          ctx as never,
          inv.value,
          context as never,
        ),
      ).rejects.toThrow(/edits must contain at least one replacement/);

      // 步骤 3：断言文件未被改动
      expect(await readFile(join(root, "x.txt"), "utf8")).toBe("before\n");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

});
