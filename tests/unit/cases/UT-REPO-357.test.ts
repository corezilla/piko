/**
 * Case ID: UT-REPO-357  ·  STATUS: real
 *
 * 责任：返回站点 L498 值 `this.tx(() => { const rows = this.db .p…` 逐值断言（store.ts）
 * 维度坐标：`markDiscussionAccessLost` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-357.md（脚本的唯一依据）
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

describe("UT-REPO-357 · markDiscussionAccessLost · 纯函数/无副作用 × 每等价类合法值", () => {

  it("returns the list produced inside the access-loss transaction", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条同房间的讨论任务与一条不同房间的任务
      store.createOrGet(discussionTask("md-357-a", "!room:357", "$e1"), "slinky", 10, "a");
      store.createOrGet(discussionTask("md-357-b", "!room:other", "$e2"), "slinky", 10, "b");

      // 步骤 2：调用 markDiscussionAccessLost("!room:357")
      const affected = store.markDiscussionAccessLost("!room:357");

      // 步骤 3：断言逐值对账——tx 包装返回的就是受影响 task_id 的数组
      expect(affected).toEqual(["md-357-a"]);
      expect(Array.isArray(affected)).toBe(true);
      expect(affected).toHaveLength(1);
    } finally {
      store.close();
    }
  });

});
