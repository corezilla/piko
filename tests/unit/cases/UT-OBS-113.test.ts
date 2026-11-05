/**
 * Case ID: UT-OBS-113  ·  STATUS: real
 *
 * 责任：分支 L92 if: if (this.config.observability?.metrics_enabled === false)（observability.ts）
 * 维度坐标：`metric` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-113.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-113 · metric · 状态分支 × 合法迁移", () => {
  it("skips recording when metrics_enabled is explicitly false", () => {
    // 步骤 1：构造 metrics_enabled＝false 的实例
    const obs = new Observability(
      { instance_id: "inst-1", observability: { metrics_enabled: false } },
      new ManualClock(0, 0),
    );

    // 步骤 2：调用 metric("m", "inc", 1)
    // 步骤 3：断言没有任何指标被记下（提前返回）
    obs.metric("m", "inc", 1);
    expect(obs.snapshot().metrics).toEqual({});
  });

  it("records when metrics_enabled is true", () => {
    // 步骤 1：构造 metrics_enabled＝true 的实例
    const obs = new Observability(
      { instance_id: "inst-1", observability: { metrics_enabled: true } },
      new ManualClock(0, 0),
    );

    // 步骤 2：调用 metric("m", "inc", 1)
    // 步骤 3：断言被记下
    obs.metric("m", "inc", 1);
    expect(obs.snapshot().metrics.m.value).toBe(1);
  });
});
