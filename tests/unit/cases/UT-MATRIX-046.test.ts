/**
 * Case ID: UT-MATRIX-046  ·  STATUS: real
 *
 * 责任：返回站点 L111 值 （matrix.ts:107）
 * 维度坐标：`send` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-046.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-046 · send · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the SDK's send result", async () => {
    // 步骤 1：构造 runtime 与 client 替身（返回固定事件 id）
    const store = newStore();
    try {
      const matrix = runtimeWith(store, { sendEvent: async () => ({ event_id: "$sent-1" }) });

      // 步骤 2：调用 send
      const result = await matrix.send("!room:test", "txn", "body");

      // 步骤 3：断言返回值原样透出
      expect((result as { event_id: string }).event_id).toBe("$sent-1");
    } finally {
      store.close();
    }
  });

});
