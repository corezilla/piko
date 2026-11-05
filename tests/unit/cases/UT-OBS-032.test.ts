/**
 * Case ID: UT-OBS-032  ·  STATUS: real
 *
 * 责任：状态写 L49 → `this.wallMs`（clock.ts）
 * 维度坐标：`set` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-032.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-032 · set · 状态分支 × 合法迁移", () => {
  it("writes the parsed wall value into this.wallMs", () => {
    // 步骤 1：构造 ManualClock(0, 0)
    const clock = new ManualClock(0, 0);

    // 步骤 2：调用 set("2026-11-05T00:00:00.000Z")
    // 步骤 3：读回权威事实源（now() 读的就是 this.wallMs）逐值对账
    clock.set("2026-11-05T00:00:00.000Z");
    expect(clock.now()).toBe(Date.parse("2026-11-05T00:00:00.000Z"));
  });
});
