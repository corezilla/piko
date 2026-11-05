/**
 * Case ID: UT-OBS-018  ·  STATUS: real
 *
 * 责任：返回站点 L36 值 `this.wallMs` 逐值断言（clock.ts）
 * 维度坐标：`now` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-018.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-018 · now · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the wall value it was constructed with", () => {
    // 步骤 1：构造 ManualClock(1234)
    const clock = new ManualClock(1234);

    // 步骤 2：调用 now()
    // 步骤 3：断言返回值逐值对账
    expect(clock.now()).toBe(1234);
  });

  it("returns the same value on repeated calls (no hidden mutation)", () => {
    const clock = new ManualClock(7);
    expect(clock.now()).toBe(clock.now());
  });
});
