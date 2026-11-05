/**
 * Case ID: UT-OBS-106  ·  STATUS: real
 *
 * 责任：参数 `labels: Record<string, string>` 的 `超长` 类（observability.ts:90）
 * 维度坐标：`metric` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-106.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-106 · metric · 纯函数/无副作用 × 每等价类合法值", () => {
  it("records an over-long label set", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：构造 100 个标签并调用 metric
    const labels: Record<string, string> = {};
    for (let i = 0; i < 100; i += 1) labels[`l${i}`] = "v";
    obs.metric("m", "inc", 1, labels);

    // 步骤 3：断言 labels 原样保留、键按排序拼进 id
    const metrics = obs.snapshot().metrics;
    const key = Object.keys(metrics).find((k) => k.startsWith("m{"));
    expect(key).toBeDefined();
    expect(metrics[key!].labels).toEqual(labels);
  });
});
