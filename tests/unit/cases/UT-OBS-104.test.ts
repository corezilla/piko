/**
 * Case ID: UT-OBS-104  ·  STATUS: real
 *
 * 责任：可选参数 `value` 缺省/显式两态（observability.ts:90）
 * 维度坐标：`metric` × `数值/长度上限参数` × `未知枚举`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-104.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-104 · metric · 数值/长度上限参数 × 未知枚举", () => {
  it("defaults the increment to 1 and honours an explicit value", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：缺省态 metric("a", "inc") 与显式态 metric("b", "inc", 5)
    obs.metric("a", "inc");
    obs.metric("b", "inc", 5);

    // 步骤 3：断言分别为 1 与 5
    const metrics = obs.snapshot().metrics;
    expect(metrics.a.value).toBe(1);
    expect(metrics.b.value).toBe(5);
  });
});
