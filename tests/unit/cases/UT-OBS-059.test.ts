/**
 * Case ID: UT-OBS-059  ·  STATUS: real
 *
 * 责任：分支 L46 ??: fields ?? {}（observability.ts）
 * 维度坐标：`redact` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-059.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";

describe("UT-OBS-059 · redact · 状态分支 × 合法迁移", () => {
  it("takes the left side when fields is defined", () => {
    // 步骤 1：构造 fields＝{ x: 1 }（非 undefined）
    const out = redact({ x: 1 });

    // 步骤 2：调用 redact
    // 步骤 3：断言走的是左值（结果含 x）
    expect(out).toEqual({ x: 1 });
  });

  it("takes the right side when fields is undefined", () => {
    // 步骤 1：构造 fields＝undefined
    const out = redact(undefined);

    // 步骤 2：调用 redact
    // 步骤 3：断言走的是 {}（结果为空）
    expect(out).toEqual({});
  });
});
