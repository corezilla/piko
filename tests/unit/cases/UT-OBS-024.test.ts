/**
 * Case ID: UT-OBS-024  ·  STATUS: real
 *
 * 责任：参数 `wallIso: string` 的 `空` 类（clock.ts:48）
 * 维度坐标：`set` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-024.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-024 · set · 字符串/路径/枚举输入 × 空", () => {
  it("sets the wall clock from an empty ISO string (invalid date)", () => {
    // 步骤 1：构造 ManualClock(0, 0)
    const clock = new ManualClock(0, 0);

    // 步骤 2：调用 set("") —— Date.parse("") 为 NaN
    // 步骤 3：断言墙钟被写成 NaN（该参数无格式校验），单调钟不受影响
    clock.set("");
    expect(Number.isNaN(clock.now())).toBe(true);
    expect(clock.monotonic()).toBe(0);
  });
});
