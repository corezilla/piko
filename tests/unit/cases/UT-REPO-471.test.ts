/**
 * Case ID: UT-REPO-471  ·  STATUS: real
 *
 * 责任：返回站点 L589 值 `JSON.parse(x.task_json).discussion?.roo…` 逐值断言（store.ts）
 * 维度坐标：`openDiscussionRuns` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-471.md（脚本的唯一依据）
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

describe("UT-REPO-471 · openDiscussionRuns · 纯函数/无副作用 × 每等价类合法值", () => {

  it("selects runs by the room id read through the optional chain", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造两个房间各一条开放讨论任务
      store.createOrGet(discussionTask("od-471-a", "!room:471", "$e1"), "slinky", 10, "a");
      store.createOrGet(discussionTask("od-471-b", "!room:other", "$e2"), "slinky", 10, "b");

      // 步骤 2：调用 openDiscussionRuns("!room:471")
      const runs = store.openDiscussionRuns("!room:471");

      // 步骤 3：断言逐值对账——只有 JSON.parse(task_json).discussion.room_id 命中的那条被选中
      expect(runs).toEqual(["od-471-a"]);
    } finally {
      store.close();
    }
  });

});
