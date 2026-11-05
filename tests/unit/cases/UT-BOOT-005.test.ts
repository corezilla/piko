/**
 * Case ID: UT-BOOT-005  ·  STATUS: real
 *
 * 责任：`monotonic` × `时间域行为` × `超时边界 ±1 tick`（波次一粗粒度登记）
 * 维度坐标：`monotonic` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-005.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-BOOT-005 · monotonic · 时间域行为 × 超时边界 ±1 tick", () => {
  it("returns the monotonic value and never goes backwards", () => {
    // 步骤 1：构造 ManualClock(0, 5)
    const clock = new ManualClock(0, 5);

    // 步骤 2：连续调用 monotonic()
    // 步骤 3：断言逐值对账且单调不降
    const first = clock.monotonic();
    const second = clock.monotonic();
    expect(first).toBe(5);
    expect(second).toBeGreaterThanOrEqual(first);
  });
});
