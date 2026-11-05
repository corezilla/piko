/**
 * Case ID: UT-OBS-069  ·  STATUS: real
 *
 * 责任：可选参数 `observability` 缺省/显式两态（observability.ts:62）
 * 维度坐标：`Observability.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-069.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-069 · Observability.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("works with observability omitted and with it provided", () => {
    // 步骤 1：缺省态
    const without = new Observability({ instance_id: "i" }, new ManualClock(0, 0));

    // 步骤 2：显式态（observability 存在但 metrics 未禁用）
    const with_ = new Observability({ instance_id: "i", observability: { log_level: "info" } }, new ManualClock(0, 0));

    // 步骤 3：断言两态都能正常产出快照
    expect(without.snapshot().instance_id).toBe("i");
    expect(with_.snapshot().instance_id).toBe("i");
  });
});
