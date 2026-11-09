/**
 * Case ID: UT-WORKER-096  ·  STATUS: real
 *
 * 责任：throw L39 `reject`（守卫 `if (!read.ok)`；tool-recovery.ts）
 * 维度坐标：`fileState` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-096.md（脚本的唯一依据）
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

describe("UT-WORKER-096 · fileState · 错误路径 × 每个 typed 错误码", () => {
  it("propagates a read failure", async () => {
    const env = fakeEnv({ readTextFile: () => ({ ok: false, error: { code: "io_error" } }) });

    // 步骤 2：调用 fileState（读文件失败）
    // 步骤 3：断言错误被上抛
    await expect(fileState(env as never, "x.txt", context as never)).rejects.toMatchObject({
      code: "io_error",
    });
  });

});
