/**
 * Case ID: UT-REPO-086  ·  STATUS: real
 *
 * 责任：状态写 L215 → `db`（store.ts）
 * 维度坐标：`createOrGet` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-086.md（脚本的唯一依据）
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

describe("UT-REPO-086 · createOrGet · 持久化/序列化 × round-trip", () => {

  it("persists the discussion turn written at the acceptance site", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造带 discussion 的 task 与触发内容
      // 步骤 2：调用 createOrGet(...)
      store.createOrGet(discussionTask("co-086", "!room:086", "$evt086"), "slinky", 10, "content-086");

      // 步骤 3：断言逐值对账——discussion_turns 一行，pi 绑定列仍为空
      const row = store.db.prepare("SELECT * FROM discussion_turns WHERE task_id=?").get("co-086") as any;
      expect(row.task_id).toBe("co-086");
      expect(row.event_id).toBe("$evt086");
      expect(row.turn_seq).toBe(1);
      expect(row.status).toBe("Pending");
      expect(row.visible_content).toBe("content-086");
      expect(row.pi_entry_id).toBeNull();
      expect(row.pi_operation_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
