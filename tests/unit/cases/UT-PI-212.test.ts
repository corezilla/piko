/**
 * Case ID: UT-PI-212  ·  STATUS: real
 *
 * 责任：返回站点 L63 值 `"server_error"` 逐值断言（mem0-client.ts）
 * 维度坐标：`mapStatusToCode` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-212.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-212 · mapStatusToCode · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns server_error from the 5xx branch", () => {  // returns server_error from the 5xx branch
    // 步骤 1：构造使 L63 的返回站点被到达的输入（status = 503）
    // 步骤 2：调用 mapStatusToCode(503)
    // 步骤 3：断言返回值逐值对账
    expect(mapStatusToCode(503)).toBe("server_error");
    // 该站点与 L65 兜底站点返回同一个字面量，值上不可区分
    expect(mapStatusToCode(503)).toBe("server_error");
  });
});
