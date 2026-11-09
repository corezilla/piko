/**
 * Case ID: UT-REPO-486  ·  STATUS: real
 *
 * 责任：参数 `turn: number` 的 `−1 通过` 类（store.ts:602）
 * 维度坐标：`prepareMatrixSend` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-486.md（脚本的唯一依据）
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

describe("UT-REPO-486 · prepareMatrixSend · 数值/长度上限参数 × −1 通过", () => {
  it("accepts turn-1 (0) — the implementation does not treat it as out of range", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `−1 通过` 类构造 turn——边界值 1 − 1 = 0；其余参数取合法等价类
      accept(store, task("t1"));
      // 步骤 2：调用 prepareMatrixSend
            const out = store.prepareMatrixSend("tx-1", "t1", 0, "sha-1");
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
      // 步骤 3：断言——turn 无下界校验，0（乃至负数）都原样入库
            expect(out).toEqual({ state: "Pending" });
            expect(row.turn_seq).toBe(0);
    } finally {
      store.close();
    }
  });

});
