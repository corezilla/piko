/**
 * Case ID: UT-REPO-002  ·  STATUS: real
 *
 * 责任：被测符号 `cancel`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`cancel` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-002.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { TaskStore, asReader } from "../../../src/store.js";
import {
  accept,
  acceptDiscussion,
  discussionTask,
  newStore,
  rawUsageSample,
  result,
  task,
} from "./support/repo-fix.js";
import type { AgentResult } from "../../../src/types.js";

describe("UT-REPO-002 · cancel · 状态分支 × 合法迁移", () => {
  it("routes the cancellation by the run's state", async () => {
  const store = newStore();
  try {
    accept(store, task("t-queued"));
    accept(store, task("t-running"));
    store.db.prepare("UPDATE runs SET state='Running' WHERE task_id='t-running'").run();
    // 步骤 2：调用 cancel（对 Queued 与 Running 各一次）
    const queued = store.cancel("t-queued");
    const running = store.cancel("t-running");

    // 步骤 3：断言状态迁移合法——Queued 直接终态，Running 转 Cancelling
    expect(queued.outcome).toBe("CancelledBeforeStart");
    expect(running.outcome).toBe("StopRequested");
    expect(store.getRun("t-running").state).toBe("Cancelling");
  } finally {
    store.close();
  }
  });

});
