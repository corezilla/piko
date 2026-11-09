/**
 * Case ID: UT-REPO-438  ·  STATUS: real
 *
 * 责任：参数 `events: { room: string; event: string; sender: string; txn?: string;` 的 `超长` 类（store.ts:547）
 * 维度坐标：`ingestMatrixBatch` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-438.md（脚本的唯一依据）
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

describe("UT-REPO-438 · ingestMatrixBatch · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts a long events array", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 events——取 100 条事件；其余参数取合法等价类
      acceptDiscussion(store, "d1", "!r");
      const events = Array.from({ length: 100 }, (_, i) => ({ room: "!r", event: "e" + i, sender: "s", turns: [] }));
      // 步骤 2：调用 ingestMatrixBatch
            const n = store.ingestMatrixBatch(events, "cursor-1");
            const rows = store.db.prepare("SELECT count(*) n FROM matrix_events").get() as any;
      // 步骤 3：断言——返回值是 events.length，且每条事件都入库
            expect(n).toBe(100);
            expect(rows.n).toBe(100);
            expect(store.matrixCursor()).toBe("cursor-1");
    } finally {
      store.close();
    }
  });

});
