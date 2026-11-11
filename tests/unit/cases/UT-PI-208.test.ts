/**
 * Case ID: UT-PI-208  ·  STATUS: real
 *
 * 责任：返回站点 L59 值 `"auth_invalid"` 逐值断言（mem0-client.ts）
 * 维度坐标：`mapStatusToCode` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-208.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-208 · mapStatusToCode · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns auth_invalid from the 401 branch", () => {  // returns auth_invalid from the 401 branch
    // 步骤 1：构造使 L59 的返回站点被到达的输入（status = 401）
    // 步骤 2：调用 mapStatusToCode(401)
    // 步骤 3：断言返回值逐值对账
    expect(mapStatusToCode(401)).toBe("auth_invalid");
    // 无未声明副作用：两次调用结果相同（纯函数）
    expect(mapStatusToCode(401)).toBe(mapStatusToCode(401));
  });
});
