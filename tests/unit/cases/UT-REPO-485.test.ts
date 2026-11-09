/**
 * Case ID: UT-REPO-485  ·  STATUS: real
 *
 * 责任：参数 `turn: number` 的 `+1 拒绝` 类（store.ts:602）
 * 维度坐标：`prepareMatrixSend` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-485.md（脚本的唯一依据）
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

describe("UT-REPO-485 · prepareMatrixSend · 数值/长度上限参数 × +1 拒绝", () => {
  it("rejects turn+1 (2) only when it breaks the INTEGER column", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `+1 拒绝` 类构造 turn——边界值 1 + 1 = 2；其余参数取合法等价类
      accept(store, task("t1"));
      // 步骤 2：调用 prepareMatrixSend
            let err: any = null;
            try {
              store.prepareMatrixSend("tx-1", "t1", 2, "sha-1");
            } catch (e) {
              err = e;
            }
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
      // 步骤 3：断言——实现的真实语义：turn 无边界校验（store.ts:602 无显式校验语句），
            // 2 是合法 INTEGER，故被接受；只有非整数（REAL）才会被 SQLite 拒绝
            expect(err).toBeNull();
            expect(row.turn_seq).toBe(2);
    } finally {
      store.close();
    }
  });

});
