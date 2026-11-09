/**
 * Case ID: UT-REPO-360  ·  STATUS: real
 *
 * 责任：返回站点 L513 值 `affected` 逐值断言（store.ts）
 * 维度坐标：`markDiscussionAccessLost` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-360.md（脚本的唯一依据）
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

describe("UT-REPO-360 · markDiscussionAccessLost · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the affected task ids", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造两条同房间的讨论任务
      store.createOrGet(discussionTask("md-360-a", "!room:360", "$e1"), "slinky", 10, "a");
      store.createOrGet(discussionTask("md-360-b", "!room:360", "$e2"), "slinky", 10, "b");

      // 步骤 2：调用 markDiscussionAccessLost("!room:360")
      const affected = store.markDiscussionAccessLost("!room:360");

      // 步骤 3：断言逐值对账——返回值就是 affected 数组，元素是 task_id 字符串
      expect(affected).toEqual(["md-360-a", "md-360-b"]);
      for (const id of affected) expect(typeof id).toBe("string");
    } finally {
      store.close();
    }
  });

});
