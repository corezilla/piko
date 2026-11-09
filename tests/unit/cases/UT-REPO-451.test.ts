/**
 * Case ID: UT-REPO-451  ·  STATUS: real
 *
 * 责任：状态写 L550 → `db`（store.ts）
 * 维度坐标：`ingestMatrixBatch` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-451.md（脚本的唯一依据）
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

describe("UT-REPO-451 · ingestMatrixBatch · 持久化/序列化 × round-trip", () => {
  it("inserts the matrix_events rows on first batch ingest", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:550 对 `db` 的写被执行的前置状态——全新事件
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixBatch
            const n = store.ingestMatrixBatch([{ room: "!room-a", event: "event-a", sender: "sender-a", txn: "txn-a", turns: [] }], "cursor-1");
            const row = store.db.prepare("SELECT * FROM matrix_events").get() as any;
      // 步骤 3：读回权威事实源逐值对账写入语义
            expect(n).toBe(1);
            expect(row.room_id).toBe("!room-a");
            expect(row.event_id).toBe("event-a");
            expect(row.sender).toBe("sender-a");
            expect(row.txn_id).toBe("txn-a");
            expect(typeof row.observed_at).toBe("string");
    } finally {
      store.close();
    }
  });

});
