/**
 * Case ID: UT-REPO-503  ·  STATUS: real
 *
 * 责任：参数 `txn: string` 的 `空` 类（store.ts:616）
 * 维度坐标：`unknownMatrixSend` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `REPO`）
 * 用例文档：docs/70_verification/unit/cases/UT-REPO-503.md（脚本的唯一依据）
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

describe("UT-REPO-503 · unknownMatrixSend · 字符串/路径/枚举输入 × 空", () => {
  it("marks an empty-txn transaction Unknown", async () => {
    const store = newStore();
    try {
      // 步骤 1：按 `空` 类构造 txn——''（空串）；其余参数取合法等价类
      accept(store, task("t1"));
      store.prepareMatrixSend("", "t1", 1, "sha-1");
      // 步骤 2：调用 unknownMatrixSend
            store.unknownMatrixSend("");
            const row = store.db.prepare("SELECT * FROM matrix_sends WHERE txn_id=''").get() as any;
      // 步骤 3：断言——txn 无校验，空串是合法的行键，Pending 被推进为 Unknown
            expect(row.state).toBe("Unknown");
            expect(row.event_id).toBeNull();
    } finally {
      store.close();
    }
  });

});
