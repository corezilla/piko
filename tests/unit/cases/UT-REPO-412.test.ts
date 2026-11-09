/**
 * Case ID: UT-REPO-412  ·  STATUS: real
 *
 * 责任：参数 `txn: string | undefined` 的 `超长` 类（store.ts:528）
 * 维度坐标：`ingestMatrixEvent` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-412.md（脚本的唯一依据）
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

describe("UT-REPO-412 · ingestMatrixEvent · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long txn string", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 txn——长度 2×上限 = 8192；其余参数取合法等价类
      acceptDiscussion(store, "d1", "!r");
      const longTxn = "x".repeat(8192);
      // 步骤 2：调用 ingestMatrixEvent
            const ok = store.ingestMatrixEvent("!r", "e1", "sender-1", longTxn, []);
            const row = store.db.prepare("SELECT txn_id FROM matrix_events WHERE event_id='e1'").get() as any;
      // 步骤 3：断言——txn 不做长度校验，超长串原样入库
            expect(ok).toBe(true);
            expect(row.txn_id).toBe(longTxn);
            expect(row.txn_id.length).toBe(8192);
    } finally {
      store.close();
    }
  });

});
