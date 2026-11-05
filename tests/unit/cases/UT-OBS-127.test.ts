/**
 * Case ID: UT-OBS-127  ·  STATUS: real
 *
 * 责任：返回站点 L92 值 （observability.ts）
 * 维度坐标：`metric` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-127.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-127 · metric · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns nothing but leaves a coherent metric entry", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 2, { a: "1" }, "ms")
    // 步骤 3：断言该方法无返回值，且条目（value/unit/labels）完整
    expect(obs.metric("m", "inc", 2, { a: "1" }, "ms")).toBeUndefined();
    const key = Object.keys(obs.snapshot().metrics).find((k) => k.startsWith("m{"))!;
    expect(obs.snapshot().metrics[key]).toEqual({ value: 2, unit: "ms", labels: { a: "1" } });
  });
});
