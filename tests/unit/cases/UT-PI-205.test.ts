/**
 * Case ID: UT-PI-205  ·  STATUS: real
 *
 * 责任：分支 L62 `if (status === 429)`（if；mem0-client.ts）
 * 维度坐标：`mapStatusToCode` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-205.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-205 · mapStatusToCode · 状态分支 × 合法迁移", () => {
  it("maps 429 to rate_limited and skips it for another status", () => {  // maps 429 to rate_limited and skips it for another status
    // 步骤 1：取真侧——status = 429
    // 步骤 2：调用并断言该侧结果
    expect(mapStatusToCode(429)).toBe("rate_limited");
    // 步骤 3/4：取假侧——status ≠ 429（取 428）
    expect(mapStatusToCode(428)).toBe("server_error");
    expect(mapStatusToCode(428)).not.toBe("rate_limited");
  });
});
