/**
 * Case ID: UT-MATRIX-039  ·  STATUS: real
 *
 * 责任：参数 `replyTo: string` 的 `空` 类（matrix.ts:107）
 * 维度坐标：`send` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-039.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-039 · send · 字符串/路径/枚举输入 × 空", () => {
  it("omits the reply relation when replyTo is empty", async () => {
    // 步骤 1：构造 runtime 与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 send(房间, 事务 id, body, "")
      await matrix.send("!room:test", "txn", "body", "");

      // 步骤 3：断言内容里没有 m.relates_to（空串是假值）
      expect((sent[0].content as { "m.relates_to"?: unknown })["m.relates_to"]).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
