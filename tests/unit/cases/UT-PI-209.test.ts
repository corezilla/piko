/**
 * Case ID: UT-PI-209  ·  STATUS: real
 *
 * 责任：返回站点 L60 值 `"auth_forbidden"` 逐值断言（mem0-client.ts）
 * 维度坐标：`mapStatusToCode` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-209.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-209 · mapStatusToCode · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns auth_forbidden from the 403 branch", () => {  // returns auth_forbidden from the 403 branch
    // 步骤 1：构造使 L60 的返回站点被到达的输入（status = 403）
    // 步骤 2：调用 mapStatusToCode(403)
    // 步骤 3：断言返回值逐值对账
    expect(mapStatusToCode(403)).toBe("auth_forbidden");
    expect(mapStatusToCode(403)).toBe(mapStatusToCode(403));
  });
});
