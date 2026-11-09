/**
 * Case ID: UT-REPO-505  ·  STATUS: real
 *
 * 责任：参数 `txn: string` 的 `注入字符` 类（store.ts:616）
 * 维度坐标：`unknownMatrixSend` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-505.md（脚本的唯一依据）
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

describe("UT-REPO-505 · unknownMatrixSend · 字符串/路径/枚举输入 × 注入字符", () => {
  it("leaves an unknown transaction untouched", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 txn——SQL 注入串、路径穿越串、控制字符串
      accept(store, task("t1"));
      store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
      // 步骤 2：调用 unknownMatrixSend（txn 不存在）
            store.unknownMatrixSend("'; DROP TABLE matrix_sends;--");
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
            const count = store.db.prepare("SELECT count(*) n FROM matrix_sends").get() as any;
      // 步骤 3：断言——注入串匹配不到行，静默无操作；tx-1 仍是 Pending，matrix_sends 表完好
            expect(row.state).toBe("Pending");
            expect(count.n).toBe(1);
            expect((store.db.prepare("SELECT count(*) n FROM runs").get() as any).n).toBe(1);
    } finally {
      store.close();
    }
  });

});
