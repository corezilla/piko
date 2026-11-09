/**
 * Case ID: UT-REPO-358  ·  STATUS: real
 *
 * 责任：返回站点 L505 值 `JSON.parse(x.task_json).discussion?.roo…` 逐值断言（store.ts）
 * 维度坐标：`markDiscussionAccessLost` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-358.md（脚本的唯一依据）
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

describe("UT-REPO-358 · markDiscussionAccessLost · 纯函数/无副作用 × 每等价类合法值", () => {

  it("selects tasks by the room id read through the optional chain", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造两个房间各一条讨论任务
      store.createOrGet(discussionTask("md-358-a", "!room:358", "$e1"), "slinky", 10, "a");
      store.createOrGet(discussionTask("md-358-b", "!room:other", "$e2"), "slinky", 10, "b");

      // 步骤 2：调用 markDiscussionAccessLost("!room:358")
      const affected = store.markDiscussionAccessLost("!room:358");

      // 步骤 3：断言逐值对账——只有 JSON.parse(task_json).discussion.room_id 命中的那条被选中
      expect(affected).toEqual(["md-358-a"]);
      expect(store.discussionAccessLost("md-358-b")).toBe(false);
    } finally {
      store.close();
    }
  });

});
