/**
 * Case ID: UT-REPO-423  ·  STATUS: real
 *
 * 责任：状态写 L530 → `db`（store.ts）
 * 维度坐标：`ingestMatrixEvent` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-423.md（脚本的唯一依据）
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

describe("UT-REPO-423 · ingestMatrixEvent · 持久化/序列化 × round-trip", () => {
  it("inserts the matrix_events row on first ingest", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:530 对 `db` 的写被执行的前置状态——全新的 (room, event)
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixEvent
            const ok = store.ingestMatrixEvent("!room-a", "event-a", "sender-a", "txn-a", []);
            const row = store.db.prepare("SELECT * FROM matrix_events").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(ok).toBe(true);
            expect(row.room_id).toBe("!room-a");
            expect(row.event_id).toBe("event-a");
            expect(row.sender).toBe("sender-a");
            expect(row.txn_id).toBe("txn-a");
            expect(typeof row.observed_at).toBe("string");
            expect(store.hasMatrixEvent("!room-a", "event-a")).toBe(true);
    } finally {
      store.close();
    }
  });

});
