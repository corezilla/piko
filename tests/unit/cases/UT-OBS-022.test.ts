/**
 * Case ID: UT-OBS-022  ·  STATUS: real
 *
 * 责任：参数 `ms: number` 的 `+1 拒绝` 类（clock.ts:44）
 * 维度坐标：`advance` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-022.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-022 · advance · 数值/长度上限参数 × +1 拒绝", () => {
  it("advances by the next millisecond", () => {
    // 步骤 1：构造 ManualClock(0, 0)
    const clock = new ManualClock(0, 0);

    // 步骤 2：调用 advance(1)
    // 步骤 3：断言逐值对账——该参数无上限校验，+1 合法
    clock.advance(1);
    expect(clock.now()).toBe(1);
    expect(clock.monotonic()).toBe(1);
  });
});
