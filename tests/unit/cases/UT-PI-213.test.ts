/**
 * Case ID: UT-PI-213  ·  STATUS: real
 *
 * 责任：返回站点 L65 值 `"server_error"` 逐值断言（mem0-client.ts）
 * 维度坐标：`mapStatusToCode` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-213.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-213 · mapStatusToCode · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns server_error from the fallback branch", () => {  // returns server_error from the fallback branch
    // 步骤 1：构造使 L65 的返回站点被到达的输入（status = 400，不命中任何特判）
    // 步骤 2：调用 mapStatusToCode(400)
    // 步骤 3：断言返回值逐值对账
    expect(mapStatusToCode(400)).toBe("server_error");
    // 兜底覆盖其余一切：2xx / 3xx / 4xx / 5xx 都归 server_error
    expect(mapStatusToCode(200)).toBe("server_error");
    expect(mapStatusToCode(302)).toBe("server_error");
  });
});
