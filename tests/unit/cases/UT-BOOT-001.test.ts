/**
 * Case ID: UT-BOOT-001  ·  STATUS: real
 *
 * 责任：`advance` × `时间域行为` × `超时边界 ±1 tick`（波次一粗粒度登记）
 * 维度坐标：`advance` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-001.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-BOOT-001 · advance · 时间域行为 × 超时边界 ±1 tick", () => {
  it("advances the clock by exactly the given milliseconds", () => {
    // 步骤 1：构造 ManualClock(0, 0)
    const clock = new ManualClock(0, 0);

    // 步骤 2：调用 advance(1)（超时边界的 ±1 tick）
    // 步骤 3：断言墙钟与单调钟都 +1，逐值对账
    clock.advance(1);
    expect(clock.now()).toBe(1);
    expect(clock.monotonic()).toBe(1);
  });
});
