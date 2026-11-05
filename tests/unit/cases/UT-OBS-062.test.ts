/**
 * Case ID: UT-OBS-062  ·  STATUS: real
 *
 * 责任：分支 L51 ||: typeof v === "string" || typeof v === "number"（observability.ts）
 * 维度坐标：`redact` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-062.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";

describe("UT-OBS-062 · redact · 状态分支 × 合法迁移", () => {
  it("keeps a string value unchanged (first operand true)", () => {
    // 步骤 1：构造字符串值
    const out = redact({ k: "plain" });

    // 步骤 2：调用 redact
    // 步骤 3：断言走的是左项（string 为真即短路）
    expect(out.k).toBe("plain");
  });

  it("keeps a number value unchanged (second operand true)", () => {
    // 步骤 1：构造数值
    const out = redact({ k: 7 });

    // 步骤 2：调用 redact
    // 步骤 3：断言走的是第二项
    expect(out.k).toBe(7);
  });
});
