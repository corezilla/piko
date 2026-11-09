/**
 * Case ID: UT-REPO-353  ·  STATUS: real
 *
 * 责任：分支 L505 `JSON.parse(x.task_json).discussion?.room_id`（?.；store.ts）
 * 维度坐标：`markDiscussionAccessLost` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-353.md（脚本的唯一依据）
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

describe("UT-REPO-353 · markDiscussionAccessLost · 状态分支 × 合法迁移", () => {

  it("reads the discussion room through the optional chain when a task has one", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造两个带 discussion 的任务（同一房间）与一个不带 discussion 的任务
      store.createOrGet(discussionTask("md-353-a", "!room:353", "$e1"), "slinky", 10, "a");
      store.createOrGet(discussionTask("md-353-b", "!room:353", "$e2"), "slinky", 10, "b");
      store.createOrGet(task("md-353-c"), "slinky", 10);

      // 步骤 2：调用 markDiscussionAccessLost("!room:353")
      const affected = store.markDiscussionAccessLost("!room:353");

      // 步骤 3：断言逐值对账——可选链不短路，两个带 discussion 的任务都被标记，
      // 不带 discussion 的任务（discussion 为 undefined）不被标记
      expect(affected.sort()).toEqual(["md-353-a", "md-353-b"]);
      expect(store.discussionAccessLost("md-353-a")).toBe(true);
      expect(store.discussionAccessLost("md-353-b")).toBe(true);
      expect(store.discussionAccessLost("md-353-c")).toBe(false);
    } finally {
      store.close();
    }
  });

});
