/**
 * Case ID: UT-OBS-063  ·  STATUS: real
 *
 * 责任：分支 L51 ||: typeof v === "string" || typeof v === "number"（observability.ts）
 * 维度坐标：`redact` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-063.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";

describe("UT-OBS-063 · redact · 状态分支 × 合法迁移", () => {
  it("keeps a boolean value unchanged (third operand true)", () => {
    // 步骤 1：构造布尔值
    const out = redact({ k: false });

    // 步骤 2：调用 redact
    // 步骤 3：断言走的是第三项（boolean）
    expect(out.k).toBe(false);
  });

  it("stringifies a non-primitive value (all operands false)", () => {
    // 步骤 1：构造对象值（三项皆假）
    const out = redact({ k: { nested: 1 } });

    // 步骤 2：调用 redact
    // 步骤 3：断言落到 String(v) 分支
    expect(out.k).toBe("[object Object]");
  });
});
