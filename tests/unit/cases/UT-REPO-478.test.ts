/**
 * Case ID: UT-REPO-478  ·  STATUS: real
 *
 * 责任：参数 `txn: string` 的 `空` 类（store.ts:602）
 * 维度坐标：`prepareMatrixSend` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-478.md（脚本的唯一依据）
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

describe("UT-REPO-478 · prepareMatrixSend · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty txn string", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 txn——''（空串）、null（显式空值）三态中的前两态；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      // 步骤 2：调用 prepareMatrixSend
            const emptyTxn = store.prepareMatrixSend("", "t1", 1, "sha-1");
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id=''").get() as any;
            const nullTxn = (() => {
              try {
                return store.prepareMatrixSend(null as any, "t1", 1, "sha-1");
              } catch (e) {
                return e;
              }
            })();
      // 步骤 3：断言——实现的真实语义：txn 无校验（store.ts:602 无显式校验语句），
            // 空串原样入库；null 触发 matrix_sends.txn_id 的 NOT NULL 约束（SQLite 错误，非 typed PikoError）
            expect(emptyTxn).toEqual({ state: "Pending" });
            expect(row.txn_id).toBe("");
            expect(row.task_id).toBe("t1");
            expect(row.state).toBe("Pending");
            expect(nullTxn).toBeInstanceOf(Error);
            expect((nullTxn as any).message).toContain("NOT NULL constraint failed");
    } finally {
      store.close();
    }
  });

});
