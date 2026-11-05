/**
 * Case ID: UT-OBS-012  ·  STATUS: real
 *
 * 责任：参数 `wallMs: number` 的 `−1 通过` 类（clock.ts:34）
 * 维度坐标：`ManualClock.constructor` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-012.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock, systemClock } from "../../../src/clock.js";

describe("UT-OBS-012 · ManualClock.constructor · 数值/长度上限参数 × −1 通过", () => {
  it("accepts a negative wall value (no lower-bound check)", () => {
    // 步骤 1：构造 wallMs＝-1（0 的 −1）
    const clock = new ManualClock(-1);

    // 步骤 2：调用 now()
    // 步骤 3：断言逐值对账——该参数无下界校验，−1 合法
    expect(clock.now()).toBe(-1);
  });
});
