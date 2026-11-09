/**
 * Case ID: UT-REPO-424  ·  STATUS: real
 *
 * 责任：状态写 L537 → `db`（store.ts）
 * 维度坐标：`ingestMatrixEvent` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-424.md（脚本的唯一依据）
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

describe("UT-REPO-424 · ingestMatrixEvent · 持久化/序列化 × round-trip", () => {
  it("inserts the discussion_turns row for an Open task", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:537 对 `db` 的写被执行的前置状态——一条 intake 为 Open 的讨论任务
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixEvent
            const ok = store.ingestMatrixEvent("!r", "event-a", "sender-a", "txn-a", [{ task: "d1", visible: "visible text" }]);
            const row = store.db.prepare("SELECT * FROM discussion_turns WHERE event_id='event-a'").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(ok).toBe(true);
            expect(row.task_id).toBe("d1");
            expect(row.event_id).toBe("event-a");
            expect(row.turn_seq).toBe(2);
            expect(row.status).toBe("Pending");
            expect(row.visible_content).toBe("visible text");
            expect(row.pi_entry_id).toBeNull();
            expect(row.pi_operation_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
