/**
 * Case ID: UT-OBS-030  ·  STATUS: real
 *
 * 责任：可选参数 `monoMs` 缺省/显式两态（clock.ts:48）
 * 维度坐标：`set` × `数值/长度上限参数` × `未知枚举`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-030.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-030 · set · 数值/长度上限参数 × 未知枚举", () => {
  it("keeps the monotonic value when the argument is omitted", () => {
    // 步骤 1：构造 ManualClock(0, 55)
    const clock = new ManualClock(0, 55);

    // 步骤 2：调用 set(合法 ISO) —— monoMs 缺省
    // 步骤 3：断言单调钟保持 55（未被重置）
    clock.set("2026-11-05T00:00:00.000Z");
    expect(clock.monotonic()).toBe(55);
  });

  it("overwrites the monotonic value when the argument is given", () => {
    // 显式态
    const clock = new ManualClock(0, 55);
    clock.set("2026-11-05T00:00:00.000Z", 9);
    expect(clock.monotonic()).toBe(9);
  });
});
