/**
 * Case ID: UT-OBS-023  ·  STATUS: real
 *
 * 责任：参数 `ms: number` 的 `−1 通过` 类（clock.ts:44）
 * 维度坐标：`advance` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-023.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-023 · advance · 数值/长度上限参数 × −1 通过", () => {
  it("accepts a negative advance (clock moves backwards)", () => {
    // 步骤 1：构造 ManualClock(1000, 1000)
    const clock = new ManualClock(1000, 1000);

    // 步骤 2：调用 advance(-1)
    // 步骤 3：断言逐值对账——无下界校验，−1 合法（时钟倒退）
    clock.advance(-1);
    expect(clock.now()).toBe(999);
    expect(clock.monotonic()).toBe(999);
  });
});
