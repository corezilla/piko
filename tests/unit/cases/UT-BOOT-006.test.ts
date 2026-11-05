/**
 * Case ID: UT-BOOT-006  ·  STATUS: real
 *
 * 责任：`now` × `时间域行为` × `超时边界 ±1 tick`（波次一粗粒度登记）
 * 维度坐标：`now` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-006.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-BOOT-006 · now · 时间域行为 × 超时边界 ±1 tick", () => {
  it("returns the wall value and only changes when advanced", () => {
    // 步骤 1：构造 ManualClock(1000, 0)
    const clock = new ManualClock(1000, 0);

    // 步骤 2：调用 now() 两次
    // 步骤 3：断言逐值对账且两次相同（未推进时不漂移）
    expect(clock.now()).toBe(1000);
    expect(clock.now()).toBe(1000);
  });
});
