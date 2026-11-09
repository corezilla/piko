/**
 * Case ID: UT-REPO-356  ·  STATUS: real
 *
 * 责任：状态写 L512 → `db`（store.ts）
 * 维度坐标：`markDiscussionAccessLost` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-356.md（脚本的唯一依据）
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

describe("UT-REPO-356 · markDiscussionAccessLost · 持久化/序列化 × round-trip", () => {

  it("persists the discussion_access_loss row it writes", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造一条同房间的讨论任务
      store.createOrGet(discussionTask("md-356", "!room:356", "$evt"), "slinky", 10, "hello");

      // 步骤 2：调用 markDiscussionAccessLost("!room:356")
      store.markDiscussionAccessLost("!room:356");

      // 步骤 3：断言逐值对账——落库一行，task_id/room_id 与入参一致，detected_at 是 ISO 时间戳
      const row = store.db.prepare("SELECT * FROM discussion_access_loss WHERE task_id=?").get("md-356") as any;
      expect(row.task_id).toBe("md-356");
      expect(row.room_id).toBe("!room:356");
      expect(typeof row.detected_at).toBe("string");
      expect(Number.isNaN(Date.parse(row.detected_at))).toBe(false);
    } finally {
      store.close();
    }
  });

});
