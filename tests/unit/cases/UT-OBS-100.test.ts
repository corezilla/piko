/**
 * Case ID: UT-OBS-100  ·  STATUS: real
 *
 * 责任：参数 `op: MetricOp` 的 `非法值` 类（observability.ts:90）
 * 维度坐标：`metric` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-100.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-100 · metric · 纯函数/无副作用 × 每等价类合法值", () => {
  it("does not throw for an illegal operation (fail open into observe)", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "" as never, 1)
    // 步骤 3：断言不抛错，且值被记下（没有校验义务，行为可预测）
    expect(() => obs.metric("m", "" as never, 1)).not.toThrow();
    expect(obs.snapshot().metrics.m.value).toBe(1);
  });
});
