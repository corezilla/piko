/**
 * Case ID: UT-PI-206  ·  STATUS: real
 *
 * 责任：分支 L63 `if (status >= 500 && status < 600)`（if；mem0-client.ts）
 * 维度坐标：`mapStatusToCode` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-206.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-206 · mapStatusToCode · 状态分支 × 合法迁移", () => {
  it("maps both sides of the 5xx window to server_error", () => {  // maps both sides of the 5xx window to server_error
    // 步骤 1：取真侧——599（越界一侧，仍在 [500, 600) 窗口内）
    // 步骤 2：调用并断言该侧结果
    expect(mapStatusToCode(599)).toBe("server_error");
    // 步骤 3/4：取假侧——600（不越界一侧，走 L65 兜底）
    expect(mapStatusToCode(600)).toBe("server_error");
    // 两侧返回值相同：L63 的 5xx 特判与 L65 的兜底在可观测层面无差别
    expect(mapStatusToCode(599)).toBe(mapStatusToCode(600));
  });
});
