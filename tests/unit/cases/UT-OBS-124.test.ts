/**
 * Case ID: UT-OBS-124  ·  STATUS: real
 *
 * 责任：分支 L97 ??: METRIC_UNITS[unit] ?? unit（observability.ts）
 * 维度坐标：`metric` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-124.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-124 · metric · 状态分支 × 合法迁移", () => {
  it("falls back to the raw unit when it is not in the unit table", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 1, undefined, "widgets")
    // 步骤 3：断言单位原样（表里没有 → 回退到入参）
    obs.metric("m", "inc", 1, undefined, "widgets");
    expect(obs.snapshot().metrics.m.unit).toBe("widgets");
  });

  it("takes the table entry for a known unit", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 1, undefined, "ms")
    // 步骤 3：断言取表里的值
    obs.metric("m", "inc", 1, undefined, "ms");
    expect(obs.snapshot().metrics.m.unit).toBe("ms");
  });
});
