/**
 * Case ID: UT-REPO-417  ·  STATUS: real
 *
 * 责任：分支 L530 `txn ?? null`（??；store.ts）
 * 维度坐标：`ingestMatrixEvent` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-417.md（脚本的唯一依据）
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

describe("UT-REPO-417 · ingestMatrixEvent · 状态分支 × 合法迁移", () => {
  it("normalises txn with `txn ?? null` on both sides", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:530 的分支（??：`txn ?? null`）取真的输入——txn 为 undefined
      acceptDiscussion(store, "d1", "!r");
      // 步骤 2：调用 ingestMatrixEvent 并断言该侧可观测结果
            const withUndef = store.ingestMatrixEvent("!r", "e1", "sender-1", undefined, []);
            const undefRow = store.db.prepare("SELECT txn_id FROM matrix_events WHERE event_id='e1'").get() as any;
            // 步骤 3：构造使该分支取假的输入——txn 有值
            const withValue = store.ingestMatrixEvent("!r", "e2", "sender-1", "txn-2", []);
            const valueRow = store.db.prepare("SELECT txn_id FROM matrix_events WHERE event_id='e2'").get() as any;
      // 步骤 3：断言——取真侧归一成 SQL NULL，取假侧原样保留
            expect(withUndef).toBe(true);
            expect(undefRow.txn_id).toBeNull();
            expect(withValue).toBe(true);
            expect(valueRow.txn_id).toBe("txn-2");
    } finally {
      store.close();
    }
  });

});
