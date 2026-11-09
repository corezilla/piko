/**
 * Case ID: UT-REPO-396  ·  STATUS: real
 *
 * 责任：参数 `txn: string` 的 `超长` 类（store.ts:524）
 * 维度坐标：`recordMatrixEvent` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-396.md（脚本的唯一依据）
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

describe("UT-REPO-396 · recordMatrixEvent · 字符串/路径/枚举输入 × 超长", () => {

  it("stores an over-length transaction id verbatim", async () => {
    const store = newStore();
    try {
      const longTxn = "x".repeat(8192);

      // 步骤 1：按 `超长` 类构造参数 txn——长度 2×4096 的字符串
      // 步骤 2：调用 recordMatrixEvent(…)
      const recorded = store.recordMatrixEvent("room-396", "$e-396", "@a:b", longTxn);

      // 步骤 3：断言——实现没有长度上限校验：8192 字符的 txn_id 原样落库
      expect(recorded).toBe(true);
      const row = store.db.prepare("SELECT length(txn_id) len,txn_id FROM matrix_events").get() as any;
      expect(row.len).toBe(8192);
      expect(row.txn_id).toBe(longTxn);
    } finally {
      store.close();
    }
  });

});
