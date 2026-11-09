/**
 * Case ID: UT-REPO-411  ·  STATUS: real
 *
 * 责任：参数 `txn: string | undefined` 的 `空` 类（store.ts:528）
 * 维度坐标：`ingestMatrixEvent` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-411.md（脚本的唯一依据）
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

describe("UT-REPO-411 · ingestMatrixEvent · 字符串/路径/枚举输入 × 空", () => {
  it("treats an undefined txn as NULL and an empty txn as a literal", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 txn——''（空串）、undefined（缺省）、null（显式空值）三态
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixEvent
            const withUndef = store.ingestMatrixEvent("!r", "e1", "sender-1", undefined, []);
            const withEmpty = store.ingestMatrixEvent("!r", "e2", "sender-1", "", []);
            const withNull = store.ingestMatrixEvent("!r", "e3", "sender-1", null as any, []);
            const rows = store.db.prepare("SELECT event_id,txn_id FROM matrix_events ORDER BY event_id").all() as any[];
      // 步骤 3：断言——实现的真实语义：`txn ?? null` 只把 undefined/null 归一为 SQL NULL；
            // 空串是普通值，原样入库
            expect(withUndef).toBe(true);
            expect(withEmpty).toBe(true);
            expect(withNull).toBe(true);
            expect(rows.find((r) => r.event_id === "e1").txn_id).toBeNull();
            expect(rows.find((r) => r.event_id === "e2").txn_id).toBe("");
            expect(rows.find((r) => r.event_id === "e3").txn_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
