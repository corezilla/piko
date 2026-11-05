/**
 * Case ID: UT-OBS-025  ·  STATUS: real
 *
 * 责任：参数 `wallIso: string` 的 `超长` 类（clock.ts:48）
 * 维度坐标：`set` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-025.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-025 · set · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long ISO string without throwing", () => {
    // 步骤 1：构造 ManualClock(0, 0)
    const clock = new ManualClock(0, 0);

    // 步骤 2：调用 set(超长串)
    // 步骤 3：断言不抛错，且结果为不可解析时间（NaN）
    const long = "2026-11-05T00:00:00.000Z".repeat(100);
    expect(() => clock.set(long)).not.toThrow();
    expect(Number.isNaN(clock.now())).toBe(true);
  });
});
