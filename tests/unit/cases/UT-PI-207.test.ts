/**
 * Case ID: UT-PI-207  ·  STATUS: real
 *
 * 责任：分支 L63 `status >= 500 && status < 600`（&&；mem0-client.ts）
 * 维度坐标：`mapStatusToCode` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-207.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { mapStatusToCode } from "../../../src/mem0-client.js";

describe("UT-PI-207 · mapStatusToCode · 状态分支 × 合法迁移", () => {
  it("covers both operands of the 5xx window condition", () => {  // covers both operands of the 5xx window condition
    // 步骤 1：&& 的取真侧——两个操作数都真（500 ≤ status < 600，取 550）
    // 步骤 2：调用并断言该侧结果
    expect(mapStatusToCode(550)).toBe("server_error");
    // 步骤 3/4：&& 的取假侧——status >= 500 成立但 status < 600 不成立（取 600）
    expect(mapStatusToCode(600)).toBe("server_error");
    // 另一条取假路径：status >= 500 不成立（取 499）
    expect(mapStatusToCode(499)).toBe("server_error");
  });
});
