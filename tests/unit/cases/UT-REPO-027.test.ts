/**
 * Case ID: UT-REPO-027  ·  STATUS: real
 *
 * 责任：被测符号 `openDiscussionRuns`（REPO）在对象类型 `状态分支` 下的维度格 `合法迁移`（该 Case 只登记本行 1 格）、`每个非法迁移拒绝`；只测该符号该类型
 * 维度坐标：`openDiscussionRuns` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-027.md（脚本的唯一依据）
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

describe("UT-REPO-027 · openDiscussionRuns · 状态分支 × 合法迁移", () => {
  it("lists the open runs that reference a room", async () => {
  const store = newStore();
  try {
    acceptDiscussion(store, "t-1", "!room:test");
    acceptDiscussion(store, "t-2", "!room:other");
    // 步骤 2：调用 openDiscussionRuns
    const runs = store.openDiscussionRuns("!room:test");

    // 步骤 3：断言返回值逐值对账——只有那个房间的任务
    expect(runs).toEqual(["t-1"]);
  } finally {
    store.close();
  }
  });

});
