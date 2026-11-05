/**
 * Case ID: UT-OBS-009  ·  STATUS: real
 *
 * 责任：分支 L28 ternary: ? typeof performance !== "undefined" :（clock.ts）
 * 维度坐标：`systemClock.monotonic` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-009.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-OBS-009 · systemClock.monotonic · 状态分支 × 合法迁移", () => {
  it("returns a non-negative elapsed value when performance is available", () => {
    // 步骤 1：构造 performance 可用的环境（本运行时即满足 typeof performance !== "undefined"）
    // 步骤 2：调用 systemClock.monotonic()
    // 步骤 3：断言返回值是有限非负数（单调时钟不随墙钟跳变）
    const value = systemClock.monotonic();
    expect(Number.isFinite(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
  });

  it("does not go backwards across two reads (monotonic)", () => {
    // 该分支的时间域性质：连续两次读单调不降
    const first = systemClock.monotonic();
    const second = systemClock.monotonic();
    expect(second).toBeGreaterThanOrEqual(first);
  });
});
