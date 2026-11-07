/**
 * Case ID: UT-MATRIX-032  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `注入字符` 类（matrix.ts:107）
 * 维度坐标：`send` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-032.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-032 · send · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected room id as data", async () => {
    // 步骤 1：构造 runtime 与 client 替身
    const store = newStore();
    const { client, sent } = recordingClient();
    try {
      const matrix = runtimeWith(store, client);

      // 步骤 2：调用 send(注入串, "txn", "body")
      await matrix.send("$(rm -rf /)", "txn", "body");

      // 步骤 3：断言原样送出、不执行
      expect(sent[0].room).toBe("$(rm -rf /)");
    } finally {
      store.close();
    }
  });

});
