/**
 * Case ID: UT-REPO-402  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `空` 类（store.ts:528）
 * 维度坐标：`ingestMatrixEvent` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-402.md（脚本的唯一依据）
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

describe("UT-REPO-402 · ingestMatrixEvent · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty room string", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 room——''（空串）、null（显式空值）三态中的前两态；
      // 其余参数取合法等价类
      acceptDiscussion(store, "d1", "!r");
      const rooms = ["", null];
      // 步骤 2：调用 ingestMatrixEvent
            const first = store.ingestMatrixEvent(rooms[0]!, "e1", "sender-1", "txn-1", []);
            const second = store.ingestMatrixEvent(rooms[1] as any, "e2", "sender-1", "txn-2", []);
            const rows = store.db.prepare("SELECT room_id,event_id FROM matrix_events ORDER BY event_id").all() as any[];
      // 步骤 3：断言——实现的真实语义：room 无校验（store.ts:528 无显式校验语句），
            // 空串原样入库，null 因 NOT NULL/主键列存成 NULL 而 INSERT OR IGNORE 匹配 0 行
            expect(first).toBe(true);
            expect(second).toBe(false);
            expect(rows.length).toBe(1);
            expect(rows[0].room_id).toBe("");
            expect(rows[0].event_id).toBe("e1");
    } finally {
      store.close();
    }
  });

});
