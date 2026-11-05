/**
 * Case ID: UT-OBS-010  ·  STATUS: real
 *
 * 责任：参数 `wallMs: number` 的 `恰好通过` 类（clock.ts:34）
 * 维度坐标：`ManualClock.constructor` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-010.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-OBS-010 · ManualClock.constructor · 数值/长度上限参数 × 恰好通过", () => {
  it("accepts a wall clock value at the boundary", () => {
    // 步骤 1：构造 wallMs＝0（默认边界）
    const clock = new ManualClock(0);

    // 步骤 2：调用 now()（被测构造器的取值语义）
    // 步骤 3：断言 now() 逐值等于构造入参
    expect(clock.now()).toBe(0);
  });
});
