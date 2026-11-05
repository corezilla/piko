/**
 * Case ID: UT-OBS-073  ·  STATUS: real
 *
 * 责任：可选参数 `clock` 缺省/显式两态（observability.ts:62）
 * 维度坐标：`Observability.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-073.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-073 · Observability.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("falls back to the system clock when none is injected", () => {
    // 步骤 1：缺省态——不传 clock
    const obs = new Observability({ instance_id: "inst-1" });

    // 步骤 2：读回 snapshot().generated_at
    // 步骤 3：断言是合法 ISO（来自 systemClock）
    expect(obs.snapshot().generated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("uses the injected clock when one is given", () => {
    // 显式态
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    expect(obs.snapshot().generated_at).toBe("1970-01-01T00:00:00.000Z");
  });
});
