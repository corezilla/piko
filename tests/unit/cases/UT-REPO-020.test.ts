/**
 * Case ID: UT-REPO-020  ·  STATUS: real
 *
 * 责任：被测符号 `markDiscussionAccessLost`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`markDiscussionAccessLost` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-020.md（脚本的唯一依据）
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

describe("UT-REPO-020 · markDiscussionAccessLost · 状态分支 × 合法迁移", () => {
  it("moves a task into the access-lost state", async () => {
  const store = newStore();
  try {
    acceptDiscussion(store, "t-1", "!room:test");
    // 步骤 2：调用 markDiscussionAccessLost
    const affected = store.markDiscussionAccessLost("!room:test");

    // 步骤 3：断言状态迁移合法——任务被标记，别房间的任务不受影响
    expect(affected).toEqual(["t-1"]);
    expect(store.discussionAccessLost("t-1")).toBe(true);
    expect(store.markDiscussionAccessLost("!room:other")).toEqual([]);
  } finally {
    store.close();
  }
  });

});
