/**
 * Case ID: UT-MATRIX-034  ·  STATUS: real
 *
 * 责任：参数 `txnId: string` 的 `超长` 类（matrix.ts:107）
 * 维度坐标：`send` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-034.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-034 · send · 字符串/路径/枚举输入 × 超长", () => {
  it("sends with an over-long transaction id", async () => {
    // 步骤 1：构造 runtime 与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 send(超长事务 id)
      const txn = "t".repeat(1000);
      await matrix.send("!room:test", txn, "body");

      // 步骤 3：断言原样送出
      expect(sent[0].txnId).toBe(txn);
    } finally {
      store.close();
    }
  });

});
