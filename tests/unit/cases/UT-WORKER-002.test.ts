/**
 * Case ID: UT-WORKER-002  ·  STATUS: real
 *
 * 责任：被测符号 `applyToolRecoveryPolicy`（WORKER）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`applyToolRecoveryPolicy` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `WORKER`）
 * 用例文档：docs/70_verification/unit/cases/UT-WORKER-002.md（脚本的唯一依据）
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
import { execDeps, runtimeConfig } from "./support/exec-process-fix.js";

describe("UT-WORKER-002 · applyToolRecoveryPolicy · 状态分支 × 合法迁移", () => {
  it("routes a tool to the branch its policy names", async () => {
    const { createWriteTool, createReadTool } = await import(
      "../../../upstream/pi/packages/agent/src/harness/tools/index.ts"
    );

    // 步骤 1：造三个策略各对应一条分支
    const never = applyToolRecoveryPolicy(createWriteTool(), neverPolicy, registry);
    const readOnly = applyToolRecoveryPolicy(createReadTool(), readPolicy, registry);
    const writable = applyToolRecoveryPolicy(createWriteTool(), writePolicy, registry);

    // 步骤 2：断言三条分支各归其位——never / safe(只读) / safe(写契约)
    expect(never.replay).toBe("never");
    expect(readOnly.replay).toBe("safe");
    expect(writable.replay).toBe("safe");
  });

});
