/**
 * Case ID: UT-REPO-497  ·  STATUS: real
 *
 * 责任：参数 `txn: string` 的 `超长` 类（store.ts:613）
 * 维度坐标：`finishMatrixSend` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-497.md（脚本的唯一依据）
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

describe("UT-REPO-497 · finishMatrixSend · 字符串/路径/枚举输入 × 超长", () => {
  it("marks the transaction Sent for an over-long txn", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `超长` 类构造 txn——长度 2×上限 = 8192；其余参数取合法等价类
      accept(store, task("t1"));
      const longTxn = "x".repeat(8192);
      store.prepareMatrixSend(longTxn, "t1", 1, "sha-1");
      // 步骤 2：调用 finishMatrixSend
            store.finishMatrixSend(longTxn, "event-long");
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id=?").get(longTxn) as any;
      // 步骤 3：断言——txn 不做长度校验，超长串仍能命中行并被推进为 Sent
            expect(row.state).toBe("Sent");
            expect(row.event_id).toBe("event-long");
    } finally {
      store.close();
    }
  });

});
