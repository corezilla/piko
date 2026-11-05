/**
 * Case ID: UT-OBS-125  ·  STATUS: real
 *
 * 责任：分支 L97 ternary: ? labels :（observability.ts）
 * 维度坐标：`metric` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-125.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-125 · metric · 状态分支 × 合法迁移", () => {
  it("omits labels from the metric entry when none were given", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 1) —— labels 缺省
    // 步骤 3：断言条目里没有 labels 键
    obs.metric("m", "inc", 1);
    expect("labels" in obs.snapshot().metrics.m).toBe(false);
  });

  it("keeps labels on the metric entry when given", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 1, { a: "1" })
    // 步骤 3：断言 labels 原样保留
    obs.metric("m", "inc", 1, { a: "1" });
    const key = Object.keys(obs.snapshot().metrics).find((k) => k.startsWith("m{"))!;
    expect(obs.snapshot().metrics[key].labels).toEqual({ a: "1" });
  });
});
