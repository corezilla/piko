/**
 * Case ID: UT-BOOT-009  ·  STATUS: real
 *
 * 责任：`systemClock.now` × `时间域行为` × `超时边界 ±1 tick`（波次一粗粒度登记）
 * 维度坐标：`systemClock.now` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-009.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-BOOT-009 · systemClock.now · 时间域行为 × 超时边界 ±1 tick", () => {
  it("returns the system wall clock as epoch milliseconds", () => {
    // 步骤 1：取调用前的时间戳
    const before = Date.now();

    // 步骤 2：调用 systemClock.now()
    // 步骤 3：断言落在调用前后之间（时间域边界自洽）
    const value = systemClock.now();
    expect(value).toBeGreaterThanOrEqual(before);
    expect(value).toBeLessThanOrEqual(Date.now());
  });
});
