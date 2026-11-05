/**
 * Case ID: UT-OBS-013  ·  STATUS: real
 *
 * 责任：可选参数 `wallMs` 缺省/显式两态（clock.ts:34）
 * 维度坐标：`ManualClock.constructor` × `数值/长度上限参数` × `未知枚举`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-013.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-OBS-013 · ManualClock.constructor · 数值/长度上限参数 × 未知枚举", () => {
  it("defaults both values to zero when constructed with no arguments", () => {
    // 步骤 1：缺省态——不传任何参数
    const clock = new ManualClock();

    // 步骤 2：调用 now() 与 monotonic()
    // 步骤 3：断言缺省值即两个默认值 0
    expect(clock.now()).toBe(0);
    expect(clock.monotonic()).toBe(0);
  });

  it("uses the explicit value when given", () => {
    // 显式态
    const clock = new ManualClock(42, 7);
    expect(clock.now()).toBe(42);
    expect(clock.monotonic()).toBe(7);
  });
});
