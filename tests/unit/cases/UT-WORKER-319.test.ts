/**
 * Case ID: UT-WORKER-319  ·  STATUS: real
 *
 * 责任：分支 L337 `(error as Error)?.message ?? error`（??；worker.ts）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-319.md（脚本的唯一依据）
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

describe("UT-WORKER-319 · sendDiscussionReplyWithRetry · 状态分支 × 合法迁移", () => {
  it("matches the forbidden pattern on a non-Error value", async () => {
    const matrix = fakeMatrix({
      send: async () => {
        throw "M_FORBIDDEN";
      },
    });
    await expect(
      sendDiscussionReplyWithRetry(matrix as never, "t-1", "!room:test", "$e1", 1, "hello"),
    ).rejects.toThrow(/lost access to the discussion room/);

    // 步骤 3：断言非 Error 的抛出物也被匹配上——?? 回退到原值
    expect(matrix.lost).toEqual(["!room:test"]);
  });

});
