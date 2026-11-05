/**
 * Case ID: UT-OBS-112  ·  STATUS: real
 *
 * 责任：可选参数 `unit` 缺省/显式两态（observability.ts:90）
 * 维度坐标：`metric` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-112.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-112 · metric · 纯函数/无副作用 × 每等价类合法值", () => {
  it("defaults the unit to count and honours an explicit one", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：缺省态与显式态各调一次
    obs.metric("a", "inc", 1);
    obs.metric("b", "inc", 1, undefined, "ms");

    // 步骤 3：断言单位分别为 count 与 ms
    const metrics = obs.snapshot().metrics;
    expect(metrics.a.unit).toBe("count");
    expect(metrics.b.unit).toBe("ms");
  });
});
