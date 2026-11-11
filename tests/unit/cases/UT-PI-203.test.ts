/**
 * Case ID: UT-PI-203  ·  STATUS: real
 *
 * 责任：分支 L60 `if (status === 403)`（if；mem0-client.ts）
 * 维度坐标：`mapStatusToCode` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-203.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-203 · mapStatusToCode · 状态分支 × 合法迁移", () => {
  it("maps 403 to auth_forbidden and skips it for another status", () => {  // maps 403 to auth_forbidden and skips it for another status
    // 步骤 1：取真侧——status = 403
    // 步骤 2：调用并断言该侧结果
    expect(mapStatusToCode(403)).toBe("auth_forbidden");
    // 步骤 3/4：取假侧——status ≠ 403（取 402）
    expect(mapStatusToCode(402)).toBe("server_error");
    expect(mapStatusToCode(402)).not.toBe("auth_forbidden");
  });
});
