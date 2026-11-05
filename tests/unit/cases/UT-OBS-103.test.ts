/**
 * Case ID: UT-OBS-103  ·  STATUS: real
 *
 * 责任：参数 `value: number` 的 `−1 通过` 类（observability.ts:90）
 * 维度坐标：`metric` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-103.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-103 · metric · 数值/长度上限参数 × −1 通过", () => {
  it("accepts a negative value with set", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "set", -1)
    // 步骤 3：断言逐值对账——无下界校验，−1 合法
    obs.metric("m", "set", -1);
    expect(obs.snapshot().metrics.m.value).toBe(-1);
  });
});
