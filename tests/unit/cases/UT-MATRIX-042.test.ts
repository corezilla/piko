/**
 * Case ID: UT-MATRIX-042  ·  STATUS: real
 *
 * 责任：可选参数 `replyTo` 缺省/显式两态（matrix.ts:107）
 * 维度坐标：`send` × `字符串/路径/枚举输入` × `每等价类合法值`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-042.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-042 · send · 字符串/路径/枚举输入 × 每等价类合法值", () => {
  it("omits the reply relation when replyTo is absent", async () => {
    // 步骤 1：构造 runtime 与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 send（不传 replyTo）
      await matrix.send("!room:test", "txn", "body");

      // 步骤 3：断言没有 m.relates_to
      expect((sent[0].content as { "m.relates_to"?: unknown })["m.relates_to"]).toBeUndefined();
    } finally {
      store.close();
    }
  });

});
