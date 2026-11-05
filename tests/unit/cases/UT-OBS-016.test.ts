/**
 * Case ID: UT-OBS-016  ·  STATUS: real
 *
 * 责任：参数 `monoMs: number` 的 `−1 通过` 类（clock.ts:34）
 * 维度坐标：`ManualClock.constructor` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-016.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-OBS-016 · ManualClock.constructor · 数值/长度上限参数 × −1 通过", () => {
  it("accepts a negative monotonic value (no lower-bound check)", () => {
    // 步骤 1：构造 monoMs＝-1
    const clock = new ManualClock(0, -1);

    // 步骤 2：调用 monotonic()
    // 步骤 3：断言逐值对账——无下界校验，−1 合法
    expect(clock.monotonic()).toBe(-1);
  });
});
