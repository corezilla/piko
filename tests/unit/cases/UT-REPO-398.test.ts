/**
 * Case ID: UT-REPO-398  ·  STATUS: real
 *
 * 责任：可选参数 `txn` 缺省/显式两态（store.ts:524）
 * 维度坐标：`recordMatrixEvent` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-398.md（脚本的唯一依据）
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

describe("UT-REPO-398 · recordMatrixEvent · 字符串/路径/枚举输入 × 未知枚举", () => {

  it("treats an omitted txn as SQL NULL and stores an explicit one verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：对可选参数 txn 构造三态——缺省（不传）、显式传值、未知枚举值
      accept(store, task("t-398"));

      // 步骤 2：分别调用 recordMatrixEvent(…)
      const omitted = store.recordMatrixEvent("!room:a", "$evt-a", "sender");
      const explicit = store.recordMatrixEvent("!room:b", "$evt-b", "sender", "txn-b");
      const unknown = store.recordMatrixEvent("!room:c", "$evt-c", "sender", "not-a-known-txn" as any);

      // 步骤 3：断言——实现的真实语义：txn 只是可空 TEXT 列，无枚举校验；
      // 缺省落 SQL NULL，显式值原样落库，未知枚举值同样被接受
      expect(omitted).toBe(true);
      expect(explicit).toBe(true);
      expect(unknown).toBe(true);
      const rows = store.db.prepare("SELECT room_id,txn_id FROM matrix_events ORDER BY room_id").all() as any[];
      expect(rows[0].txn_id).toBeNull();
      expect(rows[1].txn_id).toBe("txn-b");
      expect(rows[2].txn_id).toBe("not-a-known-txn");
    } finally {
      store.close();
    }
  });

});
