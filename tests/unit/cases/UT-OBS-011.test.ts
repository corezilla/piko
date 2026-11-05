/**
 * Case ID: UT-OBS-011  ·  STATUS: real
 *
 * 责任：参数 `wallMs: number` 的 `+1 拒绝` 类（clock.ts:34）
 * 维度坐标：`ManualClock.constructor` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-011.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-OBS-011 · ManualClock.constructor · 数值/长度上限参数 × +1 拒绝", () => {
  it("accepts the next integer above the boundary", () => {
    // 步骤 1：构造 wallMs＝1（0 的 +1）
    const clock = new ManualClock(1);

    // 步骤 2：调用 now()
    // 步骤 3：断言逐值对账——该参数无上限校验，+1 合法
    expect(clock.now()).toBe(1);
  });

  it("keeps the wall value independent of the monotonic value", () => {
    // 步骤 1：构造 wallMs 与 monoMs 不同
    const clock = new ManualClock(1000, 5);

    // 步骤 2：分别调用 now() 与 monotonic()
    // 步骤 3：断言两者互不串扰
    expect(clock.now()).toBe(1000);
    expect(clock.monotonic()).toBe(5);
  });
});
