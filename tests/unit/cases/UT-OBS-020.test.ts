/**
 * Case ID: UT-OBS-020  ·  STATUS: real
 *
 * 责任：返回站点 L42 值 `new Date(this.wallMs).toISOString()` 逐值断言（clock.ts）
 * 维度坐标：`iso` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-020.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-020 · iso · 纯函数/无副作用 × 每等价类合法值", () => {
  it("renders the wall value as an ISO-8601 instant", () => {
    // 步骤 1：构造 ManualClock(0) —— 1970-01-01T00:00:00.000Z
    const clock = new ManualClock(0);

    // 步骤 2：调用 iso()
    // 步骤 3：断言返回值逐值对账
    expect(clock.iso()).toBe("1970-01-01T00:00:00.000Z");
  });

  it("renders the same instant as the wall value", () => {
    // 步骤 1：构造一个已知的墙钟时刻
    const clock = new ManualClock(Date.parse("2026-11-05T00:00:00.000Z"));

    // 步骤 2：调用 iso()
    // 步骤 3：断言与输入逐值一致（时区无关，UTC）
    expect(clock.iso()).toBe("2026-11-05T00:00:00.000Z");
  });
});
