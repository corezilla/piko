/**
 * Case ID: UT-REPO-490  ·  STATUS: real
 *
 * 责任：分支 L605 `if (old)`（if；store.ts）
 * 维度坐标：`prepareMatrixSend` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-490.md（脚本的唯一依据）
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

describe("UT-REPO-490 · prepareMatrixSend · 状态分支 × 合法迁移", () => {
  it("takes the existing-transaction branch when the txn is already known", async () => {
    const store = newStore();
    try {
      // 步骤 1：构造使 store.ts:605 的分支（if：`if (old)`）取真的输入——先建一次事务
      accept(store, task("t1"));
      store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
      // 步骤 2：调用 prepareMatrixSend 并断言该侧可观测结果
            const same = store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
            // 步骤 3：构造使该分支取假的输入（新 txn）并断言块内副作用不发生
            const fresh = store.prepareMatrixSend("tx-2", "t1", 1, "sha-1");
            const rows = store.db.prepare("SELECT txn_id,event_id,state FROM matrix_sends ORDER BY txn_id").all() as any[];
      // 步骤 3：断言——取真侧返回旧行（event_id 为 NULL、state 仍 Pending），不新增行；
            // 取假侧返回 { state: "Pending" } 并插入新行
            expect((same as { state: string }).state).toBe("Pending");
            expect((same as { txn_id?: string }).txn_id).toBe("tx-1");
            expect((same as { event_id?: string | null }).event_id).toBeNull();
            expect(fresh).toEqual({ state: "Pending" });
            expect(rows.length).toBe(2);
    } finally {
      store.close();
    }
  });

});
