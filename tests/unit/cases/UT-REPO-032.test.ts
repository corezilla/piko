/**
 * Case ID: UT-REPO-032  ·  STATUS: real
 *
 * 责任：被测符号 `purgeExpired`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`purgeExpired` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-032.md（脚本的唯一依据）
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

describe("UT-REPO-032 · purgeExpired · 状态分支 × 合法迁移", () => {
  it("removes the expired terminal tasks", async () => {
  const store = newStore();
  try {
    accept(store, task("t-1"));
    store.finishQueued(result("t-1"));
    store.db.prepare("UPDATE tasks SET purge_after='2000-01-01T00:00:00.000Z' WHERE task_id='t-1'").run();
    // 步骤 2：调用 purgeExpired
    const removed = store.purgeExpired();

    // 步骤 3：断言状态迁移合法——过期且终态的被清掉
    expect(removed).toBe(1);
    expect(() => store.getTask("t-1")).toThrow(/task not found/);
  } finally {
    store.close();
  }
  });

});
