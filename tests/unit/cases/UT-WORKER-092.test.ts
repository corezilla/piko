/**
 * Case ID: UT-WORKER-092  ·  STATUS: real
 *
 * 责任：分支 L37 `info.value.kind!=="file"&&info.value.kind!=="…`（&&；tool-recovery.ts）
 * 维度坐标：`fileState` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-092.md（脚本的唯一依据）
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

describe("UT-WORKER-092 · fileState · 状态分支 × 合法迁移", () => {
  it("accepts a symlink target", async () => {
    const env = fakeEnv({ fileInfo: () => ({ ok: true, value: { kind: "symlink" } }) });

    // 步骤 2：调用 fileState（目标是符号链接）
    const state = await fileState(env as never, "x.txt", context as never);

    // 步骤 3：断言不被拒——&& 的第二段为假即不是目录
    expect(state.content).toBe("content");
  });

});
