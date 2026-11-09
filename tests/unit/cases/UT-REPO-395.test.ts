/**
 * Case ID: UT-REPO-395  ·  STATUS: real
 *
 * 责任：参数 `txn: string` 的 `空` 类（store.ts:524）
 * 维度坐标：`recordMatrixEvent` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-395.md（脚本的唯一依据）
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

describe("UT-REPO-395 · recordMatrixEvent · 字符串/路径/枚举输入 × 空", () => {
  it("maps the empty txn to an empty string, and to SQL NULL for undefined and null", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造参数 txn——''（空串）、undefined（缺省）、null（显式空值）三态
      // 步骤 2：调用 recordMatrixEvent(…)
      expect(store.recordMatrixEvent("!room:a", "$e1", "@alice", "")).toBe(true);
      expect(store.recordMatrixEvent("!room:b", "$e2", "@alice", undefined)).toBe(true);
      expect(store.recordMatrixEvent("!room:c", "$e3", "@alice", null as never)).toBe(true);

      // 步骤 3：断言——实现的真实语义：`txn ?? null` 只把 null/undefined 变成 SQL NULL，
      //         空串是合法值，原样落库；三种输入都不抛 typed 错误
      const rows = store.db.prepare("SELECT event_id,txn_id FROM matrix_events ORDER BY event_id").all() as any[];
      expect(rows).toEqual([
        { event_id: "$e1", txn_id: "" },
        { event_id: "$e2", txn_id: null },
        { event_id: "$e3", txn_id: null },
      ]);
      expect(rows[0].txn_id).toBe("");
      expect(rows[1].txn_id).toBeNull();
      expect(rows[2].txn_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
