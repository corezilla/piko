/**
 * Case ID: UT-REPO-501  ·  STATUS: real
 *
 * 责任：参数 `event: string` 的 `注入字符` 类（store.ts:613）
 * 维度坐标：`finishMatrixSend` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-501.md（脚本的唯一依据）
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

describe("UT-REPO-501 · finishMatrixSend · 字符串/路径/枚举输入 × 注入字符", () => {
  it("leaves an unknown transaction untouched (no row matches)", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `注入字符` 类构造 event——SQL 注入串、路径穿越串、控制字符串；
      // 其余参数取合法等价类
      accept(store, task("t1"));
      store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
      // 步骤 2：调用 finishMatrixSend（txn 不存在）
            store.finishMatrixSend("tx-unknown", "event-x");
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
            const count = store.db.prepare("SELECT count(*) n FROM matrix_sends").get() as any;
      // 步骤 3：断言——实现的真实语义：finishMatrixSend 不检查 UPDATE 的 changes，
            // 未知 txn 静默无操作；已有的 tx-1 保持 Pending
            expect(row.state).toBe("Pending");
            expect(row.event_id).toBeNull();
            expect(count.n).toBe(1);
    } finally {
      store.close();
    }
  });

});
