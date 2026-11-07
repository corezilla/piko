/**
 * Case ID: UT-MATRIX-165  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `超长` 类（matrix.ts:73）
 * 维度坐标：`recordDiscussionAccessLost` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-165.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-165 · recordDiscussionAccessLost · 字符串/路径/枚举输入 × 超长", () => {
  it("records the loss for an over-long room id", () => {
    // 步骤 1：构造 store 与 runtime
    const store = newStore();
    try {
      const matrix = runtimeWith(store, undefined, true);

      // 步骤 2：调用 recordDiscussionAccessLost(超长房间)
      // 步骤 3：断言不抛错
      expect(() => matrix.recordDiscussionAccessLost("!r".repeat(1000))).not.toThrow();
    } finally {
      store.close();
    }
  });

});
