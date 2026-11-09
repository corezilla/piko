/**
 * Case ID: UT-WORKER-221  ·  STATUS: real
 *
 * 责任：分支 L216 `state !== "Completed" && outputs.length > 0`（&&；worker.ts）
 * 维度坐标：`run` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-221.md（脚本的唯一依据）
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
  throwingChannel,
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

describe("UT-WORKER-221 · run · 状态分支 × 合法迁移", () => {
  it("marks the result partial when it failed but produced outputs", async () => {
  const { mkdtemp, rm, writeFile, mkdir } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      await mkdir(join(root, "out"), { recursive: true });
      await writeFile(join(root, "out", "report.json"), "{}", "utf8");
      store.createOrGet(task("t-1", { output_paths: ["out/report.json"], permissions: { read_paths: [], write_paths: ["out"], tool_profile_ref: "workspace-standard" } }), "slinky", 10);
      const grant = store.tryClaimSlot("worker", "boot") as { lease_epoch: number } | null;
      const channel = fakeChannel();
      const transfer = fakeTransfer();
      const worker = new RunWorker(
        config(root),
        store,
        fakePi(async () => ({ status: "failed", summary: "boom" })) as never,
        fakeMatrix() as never,
        transfer as never,
        channel as never,
      );
    try {
      await (worker as unknown as { run(taskId: string, epoch: number): Promise<void> })
        .run("t-1", 1);

      // 步骤 3：断言 partial 为真——失败但有产物
      const fact = channel.facts.find((f) => f.kind === "publishResult");
      expect(fact).toMatchObject({ result: { state: "Failed", partial: true } });
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
