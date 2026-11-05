/**
 * Case ID: UT-OBS-101  ·  STATUS: real
 *
 * 责任：参数 `value: number` 的 `恰好通过` 类（observability.ts:90）
 * 维度坐标：`metric` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-101.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-101 · metric · 数值/长度上限参数 × 恰好通过", () => {
  it("records the exact value with inc", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 3)
    // 步骤 3：断言逐值对账
    obs.metric("m", "inc", 3);
    expect(obs.snapshot().metrics.m.value).toBe(3);
  });
});
