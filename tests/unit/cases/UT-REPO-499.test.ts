/**
 * Case ID: UT-REPO-499  ·  STATUS: real
 *
 * 责任：参数 `event: string` 的 `空` 类（store.ts:613）
 * 维度坐标：`finishMatrixSend` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-499.md（脚本的唯一依据）
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

describe("UT-REPO-499 · finishMatrixSend · 字符串/路径/枚举输入 × 空", () => {
  it("stores an empty event id", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 event——''（空串）；其余参数取合法等价类
      accept(store, task("t1"));
      store.prepareMatrixSend("tx-1", "t1", 1, "sha-1");
      // 步骤 2：调用 finishMatrixSend
            store.finishMatrixSend("tx-1", "");
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id='tx-1'").get() as any;
      // 步骤 3：断言——event 无校验，空串原样入库，状态仍是 Sent
            expect(row.state).toBe("Sent");
            expect(row.event_id).toBe("");
    } finally {
      store.close();
    }
  });

});
