/**
 * Case ID: UT-PI-199  ·  STATUS: real
 *
 * 责任：参数 `status: number` 的 `恰好通过` 类（mem0-client.ts:58）
 * 维度坐标：`mapStatusToCode` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-199.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-199 · mapStatusToCode · 数值/长度上限参数 × 恰好通过", () => {
  it("accepts the inclusive lower bound of the 5xx window", () => {  // accepts the inclusive lower bound of the 5xx window
    // 步骤 1：边界值 500（源码比较常量的下界，含端点）
    // 步骤 2：调用 mapStatusToCode(500)
    // 步骤 3：断言返回值逐值对账——500 落进 5xx 窗口
    expect(mapStatusToCode(500)).toBe("server_error");
  });
});
