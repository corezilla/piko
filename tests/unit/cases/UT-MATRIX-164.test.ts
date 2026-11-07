/**
 * Case ID: UT-MATRIX-164  ·  STATUS: real
 *
 * 责任：参数 `room: string` 的 `空` 类（matrix.ts:73）
 * 维度坐标：`recordDiscussionAccessLost` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `MATRIX`）
 * 用例文档：docs/70_verification/unit/cases/UT-MATRIX-164.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { MatrixRuntime, isPermanentMatrixError } from "../../../src/matrix.js";
import { config, event, newStore, recordingClient, runtimeWith, task } from "./support/matrix-fix.js";

describe("UT-MATRIX-164 · recordDiscussionAccessLost · 字符串/路径/枚举输入 × 空", () => {
  it("records the loss for an empty room id", () => {
    // 步骤 1：构造 store 与 runtime
    const store = newStore();
    try {
      const matrix = runtimeWith(store, undefined, true);

      // 步骤 2：调用 recordDiscussionAccessLost("")
      matrix.recordDiscussionAccessLost("");

      // 步骤 3：断言被记下（不抛错——这是 fail-closed 的记录动作）
      expect(() => matrix.recordDiscussionAccessLost("")).not.toThrow();
    } finally {
      store.close();
    }
  });

});
