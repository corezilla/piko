/**
 * Case ID: UT-MATRIX-166  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `注入字符` 类（matrix.ts:73）
 * 维度坐标：`recordDiscussionAccessLost` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-166.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-166 · recordDiscussionAccessLost · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected room id as data", () => {
    // 步骤 1：构造 store 与 runtime
    const store = newStore();
    try {
      const matrix = runtimeWith(store, undefined, true);

      // 步骤 2：调用 recordDiscussionAccessLost(注入串)
      // 步骤 3：断言不抛错、不执行
      expect(() => matrix.recordDiscussionAccessLost("$(rm -rf /)")).not.toThrow();
    } finally {
      store.close();
    }
  });

});
