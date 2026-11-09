/**
 * Case ID: UT-WORKER-093  ·  STATUS: real
 *
 * 责任：分支 L39 `!read.ok`（!；tool-recovery.ts）
 * 维度坐标：`fileState` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-093.md（脚本的唯一依据）
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

describe("UT-WORKER-093 · fileState · 状态分支 × 合法迁移", () => {
  it("does not read the file when the info lookup said it is not a file", async () => {
    const env = fakeEnv({ fileInfo: () => ({ ok: true, value: { kind: "directory" } }) });

    // 步骤 2：调用 fileState（目标是目录）
    await expect(fileState(env as never, "x.txt", context as never)).rejects.toThrow(/not a file/);

    // 步骤 3：断言没有去读文件——先判类型再读
    expect(env.readTextFile).not.toHaveBeenCalled();
  });

});
