/**
 * Case ID: UT-OBS-098  ·  STATUS: real
 *
 * 责任：参数 `op: MetricOp` 的 `每等价类合法值` 类（observability.ts:90）
 * 维度坐标：`metric` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-098.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-098 · metric · 纯函数/无副作用 × 每等价类合法值", () => {
  it("supports every declared operation", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：分别以 inc／set／observe 调用
    obs.metric("m_inc", "inc", 2);
    obs.metric("m_set", "set", 5);
    obs.metric("m_obs", "observe", 7);

    // 步骤 3：读回 snapshot().metrics，断言逐值对账
    const metrics = obs.snapshot().metrics;
    expect(metrics.m_inc.value).toBe(2);
    expect(metrics.m_set.value).toBe(5);
    expect(metrics.m_obs.value).toBe(7);
  });
});
