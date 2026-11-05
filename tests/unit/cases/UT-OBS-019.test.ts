/**
 * Case ID: UT-OBS-019  ·  STATUS: real
 *
 * 责任：返回站点 L39 值 `this.monoMs` 逐值断言（clock.ts）
 * 维度坐标：`monotonic` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-019.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-019 · monotonic · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the monotonic value it was constructed with", () => {
    // 步骤 1：构造 ManualClock(0, 99)
    const clock = new ManualClock(0, 99);

    // 步骤 2：调用 monotonic()
    // 步骤 3：断言返回值逐值对账
    expect(clock.monotonic()).toBe(99);
  });
});
