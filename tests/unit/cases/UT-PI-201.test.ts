/**
 * Case ID: UT-PI-201  ·  STATUS: real
 *
 * 责任：参数 `status: number` 的 `−1 通过` 类（mem0-client.ts:58）
 * 维度坐标：`mapStatusToCode` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-201.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-201 · mapStatusToCode · 数值/长度上限参数 × −1 通过", () => {
  it("accepts the value one below the 5xx lower bound", () => {  // accepts the value one below the 5xx lower bound
    // 步骤 1：边界值 −1（500−1 = 499）
    // 步骤 2：调用 mapStatusToCode(499)
    // 步骤 3：断言返回值逐值对账——499 不在 5xx 窗口，走 L65 兜底
    expect(mapStatusToCode(499)).toBe("server_error");
    // 对照：与 500 的返回值相同但走的是不同分支（499 命中兜底 L65）
    expect(mapStatusToCode(499)).toBe(mapStatusToCode(500));
  });
});
