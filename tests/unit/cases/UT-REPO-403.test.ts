/**
 * Case ID: UT-REPO-403  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `超长` 类（store.ts:528）
 * 维度坐标：`ingestMatrixEvent` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-403.md（脚本的唯一依据）
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

describe("UT-REPO-403 · ingestMatrixEvent · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long room string", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 room——长度 2×上限 = 8192；其余参数取合法等价类
      acceptDiscussion(store, "d1", "!r");
      const longRoom = "r".repeat(8192);
      // 步骤 2：调用 ingestMatrixEvent
            const ok = store.ingestMatrixEvent(longRoom, "e1", "sender-1", "txn-1", []);
            const row = store.db.prepare("SELECT room_id FROM matrix_events WHERE event_id='e1'").get() as any;
      // 步骤 3：断言——room 不做长度校验，超长串原样入库
            expect(ok).toBe(true);
            expect(row.room_id).toBe(longRoom);
            expect(row.room_id.length).toBe(8192);
    } finally {
      store.close();
    }
  });

});
