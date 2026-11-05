/**
 * Case ID: UT-OBS-123  ·  STATUS: real
 *
 * 责任：分支 L96 ??: cur?.value ?? Number.POSITIVE_INFINITY（observability.ts）
 * 维度坐标：`metric` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-123.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-123 · metric · 状态分支 × 合法迁移", () => {
  it("keeps the smaller value on observe (observe semantics)", () => {
    // 步骤 1：构造实例并先记一次
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    obs.metric("m", "set", 30);

    // 步骤 2：调用 metric("m", "observe", 10)
    // 步骤 3：断言取较小值 10
    obs.metric("m", "observe", 10);
    expect(obs.snapshot().metrics.m.value).toBe(10);
  });

  it("does not raise the value on observe", () => {
    // 步骤 1：构造实例并先记一次
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    obs.metric("m", "set", 5);

    // 步骤 2：调用 metric("m", "observe", 100)
    // 步骤 3：断言保持 5（observe 只能降不能升）
    obs.metric("m", "observe", 100);
    expect(obs.snapshot().metrics.m.value).toBe(5);
  });
});
