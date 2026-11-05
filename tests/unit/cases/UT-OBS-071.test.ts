/**
 * Case ID: UT-OBS-071  ·  STATUS: real
 *
 * 责任：参数 `clock: Clock` 的 `边界(上/下/零/空/满)` 类（observability.ts:62）
 * 维度坐标：`Observability.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-071.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-071 · Observability.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts the zero epoch as the clock value", () => {
    // 步骤 1：构造 ManualClock(0, 0)
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：读回 snapshot().generated_at
    // 步骤 3：断言是纪元时刻
    expect(obs.snapshot().generated_at).toBe("1970-01-01T00:00:00.000Z");
  });
});
