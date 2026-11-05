/**
 * Case ID: UT-OBS-027  ·  STATUS: real
 *
 * 责任：参数 `monoMs: number` 的 `恰好通过` 类（clock.ts:48）
 * 维度坐标：`set` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-027.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-027 · set · 数值/长度上限参数 × 恰好通过", () => {
  it("sets the monotonic value when provided", () => {
    // 步骤 1：构造 ManualClock(0, 0)
    const clock = new ManualClock(0, 0);

    // 步骤 2：调用 set(合法 ISO, 0)
    // 步骤 3：断言单调钟被写成 0
    clock.set("2026-11-05T00:00:00.000Z", 0);
    expect(clock.monotonic()).toBe(0);
  });
});
