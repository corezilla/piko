/**
 * Case ID: UT-WORKER-250  ·  STATUS: real
 *
 * 责任：参数 `pi` 的 `边界(上/下/零/空/满)` 类（worker.ts:28）
 * 维度坐标：`RunWorker.constructor` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-250.md（脚本的唯一依据）
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

describe("UT-WORKER-250 · RunWorker.constructor · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("binds a pi runtime with no execute", async () => {
  const { mkdtemp, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "piko-worker-"));
  const store = new TaskStore(":memory:", 1000);
      const worker = new RunWorker(
        config(root),
        store,
        {} as never,
        fakeMatrix() as never,
        fakeTransfer() as never,
        fakeChannel() as never,
      );
    try {
      // 步骤 2：断言构造成功——该参数不校验
      expect(worker).toBeDefined();
    } finally {
      store.close();
      await rm(root, { recursive: true, force: true });
    }
  });

});
