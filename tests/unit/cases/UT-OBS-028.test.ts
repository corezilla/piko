/**
 * Case ID: UT-OBS-028  ·  STATUS: real
 *
 * 责任：参数 `monoMs: number` 的 `+1 拒绝` 类（clock.ts:48）
 * 维度坐标：`set` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-028.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-028 · set · 数值/长度上限参数 × +1 拒绝", () => {
  it("sets the monotonic value to the next integer", () => {
    // 步骤 1：构造 ManualClock(0, 0)
    const clock = new ManualClock(0, 0);

    // 步骤 2：调用 set(合法 ISO, 1)
    // 步骤 3：断言逐值对账——无上限校验，+1 合法
    clock.set("2026-11-05T00:00:00.000Z", 1);
    expect(clock.monotonic()).toBe(1);
  });
});
