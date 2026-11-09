/**
 * Case ID: UT-REPO-407  ·  STATUS: real
 *
 * 责任：参数 `event: string` 的 `注入字符` 类（store.ts:528）
 * 维度坐标：`ingestMatrixEvent` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-407.md（脚本的唯一依据）
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

describe("UT-REPO-407 · ingestMatrixEvent · 字符串/路径/枚举输入 × 注入字符", () => {
  it("stores an injection-shaped event string verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 event——SQL 注入串、路径穿越串、控制字符串
      acceptDiscussion(store, "d1", "!r");
      const event = "'; DROP TABLE runs;--";
      // 步骤 2：调用 ingestMatrixEvent
            const ok = store.ingestMatrixEvent("!r", event, "sender-1", "txn-1", []);
            const row = store.db.prepare("SELECT event_id FROM matrix_events WHERE room_id='!r'").get() as any;
      // 步骤 3：断言——参数化绑定：注入串只作为 event_id 字面量，runs 表不受影响
            expect(ok).toBe(true);
            expect(row.event_id).toBe(event);
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
