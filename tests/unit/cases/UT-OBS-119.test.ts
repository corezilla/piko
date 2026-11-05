/**
 * Case ID: UT-OBS-119  ·  STATUS: real
 *
 * 责任：分支 L96 ?.: cur?.value（observability.ts）
 * 维度坐标：`metric` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-119.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-119 · metric · 状态分支 × 合法迁移", () => {
  it("reads the existing value through the optional chain", () => {
    // 步骤 1：构造实例并先记一次
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    obs.metric("m", "set", 20);

    // 步骤 2：调用 metric("m", "inc", 2)
    // 步骤 3：断言在旧值 20 上累加（证明读到了 cur.value）
    obs.metric("m", "inc", 2);
    expect(obs.snapshot().metrics.m.value).toBe(22);
  });
});
