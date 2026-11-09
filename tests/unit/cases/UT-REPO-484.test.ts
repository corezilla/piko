/**
 * Case ID: UT-REPO-484  ·  STATUS: real
 *
 * 责任：参数 `turn: number` 的 `恰好通过` 类（store.ts:602）
 * 维度坐标：`prepareMatrixSend` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-484.md（脚本的唯一依据）
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

describe("UT-REPO-484 · prepareMatrixSend · 数值/长度上限参数 × 恰好通过", () => {
  it("accepts the exact turn number 1", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `恰好通过` 类构造 turn——边界值 1（第一轮）；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      // 步骤 2：调用 prepareMatrixSend
            const out = store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
      // 步骤 3：断言——turn 原样入库
            expect(out).toEqual({ state: "Pending" });
            expect(row.turn_seq).toBe(1);
            expect(row.state).toBe("Pending");
    } finally {
      store.close();
    }
  });

});
