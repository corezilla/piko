/**
 * Case ID: UT-REPO-400  ·  STATUS: real
 *
 * 责任：状态写 L525 → `db`（store.ts）
 * 维度坐标：`recordMatrixEvent` × `持久化/序列化` × `round-trip`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-400.md（脚本的唯一依据）
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

describe("UT-REPO-400 · recordMatrixEvent · 持久化/序列化 × round-trip", () => {

  it("writes the matrix event row with the observed timestamp", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:525 对 `db` 的写被执行的前置状态
      expect(store.db.prepare("SELECT count(*) n FROM matrix_events").get()).toEqual({ n: 0 });
      expect(store.matrixCursor()).toBeNull();

      // 步骤 2：调用 recordMatrixEvent(…)
      expect(store.recordMatrixEvent("room-400", "$e-400", "@bob:localhost", "txn-400")).toBe(true);

      // 步骤 3：读回权威事实源逐值对账写入语义——行内容与实现 INSERT 的列序一致
      const row = store.db.prepare(
        "SELECT room_id,event_id,sender,txn_id,observed_at FROM matrix_events",
      ).get() as any;
      expect(row.room_id).toBe("room-400");
      expect(row.event_id).toBe("$e-400");
      expect(row.sender).toBe("@bob:localhost");
      expect(row.txn_id).toBe("txn-400");
      expect(new Date(row.observed_at).toISOString()).toBe(row.observed_at);
      // recordMatrixEvent 不碰 sync_cursor
      expect(store.matrixCursor()).toBeNull();
    } finally {
      store.close();
    }
  });

});
