/**
 * Case ID: UT-OBS-033  ·  STATUS: real
 *
 * 责任：状态写 L50 → `this.monoMs`（clock.ts）
 * 维度坐标：`set` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-033.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-033 · set · 状态分支 × 合法迁移", () => {
  it("writes the monotonic value into this.monoMs only when provided", () => {
    // 步骤 1：构造 ManualClock(0, 0)
    const clock = new ManualClock(0, 0);

    // 步骤 2：调用 set(合法 ISO, 33)
    // 步骤 3：读回权威事实源（monotonic() 读的就是 this.monoMs）逐值对账
    clock.set("2026-11-05T00:00:00.000Z", 33);
    expect(clock.monotonic()).toBe(33);
  });
});
