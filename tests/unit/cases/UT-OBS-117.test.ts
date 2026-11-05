/**
 * Case ID: UT-OBS-117  ·  STATUS: real
 *
 * 责任：分支 L96 ternary: ? op === "inc" :（observability.ts）
 * 维度坐标：`metric` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-117.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-117 · metric · 状态分支 × 合法迁移", () => {
  it("takes the inc branch and adds to the current value", () => {
    // 步骤 1：构造实例并先记一次
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    obs.metric("m", "set", 10);

    // 步骤 2：调用 metric("m", "inc", 3)
    // 步骤 3：断言累加为 13
    obs.metric("m", "inc", 3);
    expect(obs.snapshot().metrics.m.value).toBe(13);
  });
});
