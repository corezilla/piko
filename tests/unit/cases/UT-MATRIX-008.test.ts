/**
 * Case ID: UT-MATRIX-008  ·  STATUS: real
 *
 * 责任：`send` × `并发/可重入` × `并发对偶/交错`（波次一粗粒度登记）
 * 维度坐标：`send` × `并发/可重入` × `并发对偶/交错`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-008.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, listenersOf, newStore, recordingClient, runtimeWith, sdkClient, task } from "./support/matrix-fix.js";
import type { RuntimeConfig } from "../../../src/types.js";

describe("UT-MATRIX-008 · send · 并发/可重入 × 并发对偶/交错", () => {
  it("keeps concurrent sends independent", async () => {
    // 步骤 1：构造 store、runtime 与记录发送的 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const matrix = runtimeWith(store, client);

      // 步骤 2：并发发两条消息
      await Promise.all([
        matrix.send("!room:test", "txn-1", "first"),
        matrix.send("!room:test", "txn-2", "second"),
      ]);

      // 步骤 3：断言两条都送出且事务 id 各自独立（不串扰）
      expect(sent).toHaveLength(2);
      expect(new Set(sent.map((s) => s.txnId)).size).toBe(2);
    } finally {
      store.close();
    }
  });

});
