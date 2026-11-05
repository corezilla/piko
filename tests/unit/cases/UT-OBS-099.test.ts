/**
 * Case ID: UT-OBS-099  ·  STATUS: real
 *
 * 责任：参数 `op: MetricOp` 的 `边界(上/下/零/空/满)` 类（observability.ts:90）
 * 维度坐标：`metric` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-099.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-099 · metric · 纯函数/无副作用 × 每等价类合法值", () => {
  it("treats an unknown operation as observe", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "unknown" as never, 4)
    obs.metric("m", "unknown" as never, 4);

    // 步骤 3：断言落到 observe 分支（取当前值与新值的较小者）
    expect(obs.snapshot().metrics.m.value).toBe(4);
  });
});
