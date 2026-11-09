/**
 * Case ID: UT-REPO-007  ·  STATUS: real
 *
 * 责任：被测符号 `failAccessLostTasks`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`failAccessLostTasks` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-007.md（脚本的唯一依据）
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

describe("UT-REPO-007 · failAccessLostTasks · 状态分支 × 合法迁移", () => {
  it("fails the queued tasks that lost discussion access", async () => {
  const store = newStore();
  try {
    acceptDiscussion(store, "t-1", "!room:test");
    store.markDiscussionAccessLost("!room:test");
    // 步骤 2：调用 failAccessLostTasks
    const failed = store.failAccessLostTasks();

    // 步骤 3：断言状态迁移合法——任务转 Failed 并带出失败事实
    expect(failed).toEqual(["t-1"]);
    expect(store.getRun("t-1").state).toBe("Failed");
    expect(store.result("t-1").failure?.code).toBe("DiscussionAccessLost");
  } finally {
    store.close();
  }
  });

});
