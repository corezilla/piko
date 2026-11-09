/**
 * Case ID: UT-REPO-355  ·  STATUS: real
 *
 * 责任：分支 L512 `loop (affected)`（loop；store.ts）
 * 维度坐标：`markDiscussionAccessLost` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-355.md（脚本的唯一依据）
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

describe("UT-REPO-355 · markDiscussionAccessLost · 状态分支 × 合法迁移", () => {

  it("iterates over every affected task", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造三个同房间的讨论任务与一个异房间的任务
      store.createOrGet(discussionTask("md-355-a", "!room:355", "$e1"), "slinky", 10, "a");
      store.createOrGet(discussionTask("md-355-b", "!room:355", "$e2"), "slinky", 10, "b");
      store.createOrGet(discussionTask("md-355-c", "!room:355", "$e3"), "slinky", 10, "c");
      store.createOrGet(discussionTask("md-355-d", "!room:other", "$e4"), "slinky", 10, "d");

      // 步骤 2：调用 markDiscussionAccessLost("!room:355")
      const affected = store.markDiscussionAccessLost("!room:355");

      // 步骤 3：断言逐值对账——循环体对每个受影响任务都写了一行 loss 记录
      expect(affected.sort()).toEqual(["md-355-a", "md-355-b", "md-355-c"]);
      for (const id of ["md-355-a", "md-355-b", "md-355-c"]) {
        expect(store.discussionAccessLost(id)).toBe(true);
      }
      expect(store.discussionAccessLost("md-355-d")).toBe(false);
      expect(store.db.prepare("SELECT count(*) n FROM discussion_access_loss").get()).toEqual({ n: 3 });
    } finally {
      store.close();
    }
  });

});
