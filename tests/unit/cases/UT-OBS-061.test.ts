/**
 * Case ID: UT-OBS-061  ·  STATUS: real
 *
 * 责任：分支 L51 ternary: ? typeof v === "string" || typeof v === "number" ||… :（observability.ts）
 * 维度坐标：`redact` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-061.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";

describe("UT-OBS-061 · redact · 状态分支 × 合法迁移", () => {
  it("keeps primitive values as their own type", () => {
    // 步骤 1：构造 string／number／boolean 三种原始值
    const out = redact({ s: "x", n: 1, b: true });

    // 步骤 2：调用 redact
    // 步骤 3：断言原类型保留（不被 String() 化）
    expect(out.s).toBe("x");
    expect(out.n).toBe(1);
    expect(out.b).toBe(true);
  });
});
