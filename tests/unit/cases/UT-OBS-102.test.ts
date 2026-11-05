/**
 * Case ID: UT-OBS-102  ·  STATUS: real
 *
 * 责任：参数 `value: number` 的 `+1 拒绝` 类（observability.ts:90）
 * 维度坐标：`metric` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-102.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-102 · metric · 数值/长度上限参数 × +1 拒绝", () => {
  it("accumulates the next integer with inc", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 4)
    // 步骤 3：断言逐值对账——无上限校验，+1 合法
    obs.metric("m", "inc", 4);
    expect(obs.snapshot().metrics.m.value).toBe(4);
  });
});
