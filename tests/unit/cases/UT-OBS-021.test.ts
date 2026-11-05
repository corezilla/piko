/**
 * Case ID: UT-OBS-021  ·  STATUS: real
 *
 * 责任：参数 `ms: number` 的 `恰好通过` 类（clock.ts:44）
 * 维度坐标：`advance` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-021.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-021 · advance · 数值/长度上限参数 × 恰好通过", () => {
  it("advances both wall and monotonic by the given amount", () => {
    // 步骤 1：构造 ManualClock(0, 0)
    const clock = new ManualClock(0, 0);

    // 步骤 2：调用 advance(100)
    // 步骤 3：断言两个时钟都 +100（逐值对账）
    clock.advance(100);
    expect(clock.now()).toBe(100);
    expect(clock.monotonic()).toBe(100);
  });
});
