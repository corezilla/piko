/**
 * Case ID: UT-OBS-014  ·  STATUS: real
 *
 * 责任：参数 `monoMs: number` 的 `恰好通过` 类（clock.ts:34）
 * 维度坐标：`ManualClock.constructor` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-014.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-OBS-014 · ManualClock.constructor · 数值/长度上限参数 × 恰好通过", () => {
  it("accepts a monotonic value at the boundary", () => {
    // 步骤 1：构造 monoMs＝0
    const clock = new ManualClock(0, 0);

    // 步骤 2：调用 monotonic()
    // 步骤 3：断言逐值对账
    expect(clock.monotonic()).toBe(0);
  });
});
