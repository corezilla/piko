/**
 * Case ID: UT-OBS-017  ·  STATUS: real
 *
 * 责任：可选参数 `monoMs` 缺省/显式两态（clock.ts:34）
 * 维度坐标：`ManualClock.constructor` × `数值/长度上限参数` × `未知枚举`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-017.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-OBS-017 · ManualClock.constructor · 数值/长度上限参数 × 未知枚举", () => {
  it("defaults monoMs to zero when only wallMs is given", () => {
    // 步骤 1：只传 wallMs——monoMs 走缺省
    const clock = new ManualClock(500);

    // 步骤 2：调用 monotonic()
    // 步骤 3：断言缺省为 0，与显式传 0 同构
    expect(clock.monotonic()).toBe(0);
    expect(new ManualClock(500, 0).monotonic()).toBe(clock.monotonic());
  });
});
