/**
 * Case ID: UT-PI-204  ·  STATUS: real
 *
 * 责任：分支 L61 `if (status === 404)`（if；mem0-client.ts）
 * 维度坐标：`mapStatusToCode` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-204.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-204 · mapStatusToCode · 状态分支 × 合法迁移", () => {
  it("maps 404 to not_found and skips it for another status", () => {  // maps 404 to not_found and skips it for another status
    // 步骤 1：取真侧——status = 404
    // 步骤 2：调用并断言该侧结果
    expect(mapStatusToCode(404)).toBe("not_found");
    // 步骤 3/4：取假侧——status ≠ 404（取 405）
    expect(mapStatusToCode(405)).toBe("server_error");
    expect(mapStatusToCode(405)).not.toBe("not_found");
  });
});
