/**
 * Case ID: UT-WORKER-328  ·  STATUS: real
 *
 * 责任：throw L331 `reject`（守卫 `if (!(await matrix.isJoined(roomId)))`；worker.ts）
 * 维度坐标：`sendDiscussionReplyWithRetry` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-328.md（脚本的唯一依据）
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

describe("UT-WORKER-328 · sendDiscussionReplyWithRetry · 错误路径 × 每个 typed 错误码", () => {
  it("reports the declared access-lost error", async () => {
    const matrix = fakeMatrix({ joined: false });
    // 步骤 2：调用 sendDiscussionReplyWithRetry（已不在房间里）
    // 步骤 3：断言错误逐值对账——带 pikoCode 与 cause
    await expect(
      sendDiscussionReplyWithRetry(matrix as never, "t-1", "!room:test", "$e1", 1, "hello"),
    ).rejects.toMatchObject({
      message: "Piko lost access to the discussion room.",
      pikoCode: "DiscussionAccessLost",
      cause: "Authorization",
    });
  });

});
