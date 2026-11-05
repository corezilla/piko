/**
 * Case ID: UT-BOOT-002  ·  STATUS: real
 *
 * 责任：`iso` × `时间域行为` × `超时边界 ±1 tick`（波次一粗粒度登记）
 * 维度坐标：`iso` × `时间域行为` × `超时边界 ±1 tick`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-BOOT-002.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-BOOT-002 · iso · 时间域行为 × 超时边界 ±1 tick", () => {
  it("renders the epoch as an ISO instant", () => {
    // 步骤 1：构造 ManualClock(0)
    const clock = new ManualClock(0);

    // 步骤 2：调用 iso()
    // 步骤 3：断言逐值对账（时间域边界的基准时刻）
    expect(clock.iso()).toBe("1970-01-01T00:00:00.000Z");
  });
});
