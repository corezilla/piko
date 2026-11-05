/**
 * Case ID: UT-OBS-005  ·  STATUS: real
 *
 * 责任：`metric` × `数值/长度上限参数` × `恰好通过`（波次一粗粒度登记）
 * 维度坐标：`metric` × `数值/长度上限参数` × `恰好通过`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-005.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-005 · metric · 数值/长度上限参数 × 恰好通过", () => {
  it("records a metric at the exact value given", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "set", 42)
    // 步骤 3：断言值逐值对账
    obs.metric("m", "set", 42);
    expect(obs.snapshot().metrics.m.value).toBe(42);
  });
});
