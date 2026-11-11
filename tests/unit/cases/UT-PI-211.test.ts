/**
 * Case ID: UT-PI-211  ·  STATUS: real
 *
 * 责任：返回站点 L62 值 `"rate_limited"` 逐值断言（mem0-client.ts）
 * 维度坐标：`mapStatusToCode` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-211.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-211 · mapStatusToCode · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns rate_limited from the 429 branch", () => {  // returns rate_limited from the 429 branch
    // 步骤 1：构造使 L62 的返回站点被到达的输入（status = 429）
    // 步骤 2：调用 mapStatusToCode(429)
    // 步骤 3：断言返回值逐值对账
    expect(mapStatusToCode(429)).toBe("rate_limited");
    expect(mapStatusToCode(429)).toBe(mapStatusToCode(429));
  });
});
