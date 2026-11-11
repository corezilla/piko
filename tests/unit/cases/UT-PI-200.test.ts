/**
 * Case ID: UT-PI-200  ·  STATUS: real
 *
 * 责任：参数 `status: number` 的 `+1 拒绝` 类（mem0-client.ts:58）
 * 维度坐标：`mapStatusToCode` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-200.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-200 · mapStatusToCode · 数值/长度上限参数 × +1 拒绝", () => {
  it("does not reject the value one above the 5xx lower bound", () => {  // does not reject the value one above the 5xx lower bound
    // 步骤 1：边界值 +1（500+1 = 501）
    // 步骤 2：调用 mapStatusToCode(501)
    // 步骤 3：断言实际行为——501 仍在 5xx 窗口内，函数不抛错，返回值与 500 相同
    expect(mapStatusToCode(501)).toBe("server_error");
    // 偏差记录：本函数没有「拒绝」语义，任何 status 都返回语义码，不抛 typed 错误
    expect(() => mapStatusToCode(501)).not.toThrow();
  });
});
