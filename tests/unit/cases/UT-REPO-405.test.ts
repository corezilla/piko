/**
 * Case ID: UT-REPO-405  ·  STATUS: real
 *
 * 责任：参数 `event: string` 的 `空` 类（store.ts:528）
 * 维度坐标：`ingestMatrixEvent` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-405.md（脚本的唯一依据）
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

describe("UT-REPO-405 · ingestMatrixEvent · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty event string", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 event——''（空串）、null（显式空值）三态中的前两态
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixEvent
            const first = store.ingestMatrixEvent("!r", "", "sender-1", "txn-1", []);
            const second = store.ingestMatrixEvent("!r", null as any, "sender-1", "txn-2", []);
            const rows = store.db.prepare("SELECT event_id FROM matrix_events").all() as any[];
      // 步骤 3：断言——event 无校验；空串入库，null 匹配 0 行（NOT NULL）
            expect(first).toBe(true);
            expect(second).toBe(false);
            expect(rows.length).toBe(1);
            expect(rows[0].event_id).toBe("");
    } finally {
      store.close();
    }
  });

});
