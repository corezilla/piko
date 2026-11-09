/**
 * Case ID: UT-REPO-439  ·  STATUS: real
 *
 * 责任：参数 `events: { room: string; event: string; sender: string; txn?: string;` 的 `注入字符` 类（store.ts:547）
 * 维度坐标：`ingestMatrixBatch` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-439.md（脚本的唯一依据）
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

describe("UT-REPO-439 · ingestMatrixBatch · 字符串/路径/枚举输入 × 注入字符", () => {
  it("stores injection-shaped event fields verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 events——room/event/sender 带 SQL 注入串
      acceptDiscussion(store, "d1", "!r");
      const events = [{ room: "'; DROP TABLE runs;--", event: "'; DROP TABLE runs;--", sender: "'; DROP TABLE runs;--", turns: [] }];
      // 步骤 2：调用 ingestMatrixBatch
            const n = store.ingestMatrixBatch(events, "cursor-1");
            const row = store.db.prepare("SELECT * FROM matrix_events").get() as any;
      // 步骤 3：断言——参数化绑定：注入串只作为字面量，runs 表不受影响
            expect(n).toBe(1);
            expect(row.room_id).toBe("'; DROP TABLE runs;--");
            expect(row.event_id).toBe("'; DROP TABLE runs;--");
            expect(row.sender).toBe("'; DROP TABLE runs;--");
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
