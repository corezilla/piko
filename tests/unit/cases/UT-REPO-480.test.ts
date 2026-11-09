/**
 * Case ID: UT-REPO-480  ·  STATUS: real
 *
 * 责任：参数 `txn: string` 的 `注入字符` 类（store.ts:602）
 * 维度坐标：`prepareMatrixSend` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-480.md（脚本的唯一依据）
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

describe("UT-REPO-480 · prepareMatrixSend · 字符串/路径/枚举输入 × 注入字符", () => {
  it("stores an injection-shaped txn string verbatim", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 txn——SQL 注入串、路径穿越串、控制字符串
      accept(store, task("t1"));
      const txn = "'; DROP TABLE matrix_sends;--";
      // 步骤 2：调用 prepareMatrixSend
            const out = store.prepareMatrixSend(txn, "t1", 1, "sha-1");
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id=?").get(txn) as any;
      // 步骤 3：断言——参数化绑定：注入串只作为 txn_id 字面量，runs 表不受影响
            expect(out).toEqual({ state: "Pending" });
            expect(row.txn_id).toBe(txn);
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
