/**
 * Case ID: UT-OBS-118  ·  STATUS: real
 *
 * 责任：分支 L96 ??: cur?.value ?? 0（observability.ts）
 * 维度坐标：`metric` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-118.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-118 · metric · 状态分支 × 合法迁移", () => {
  it("treats a missing metric as zero on the first inc", () => {
    // 步骤 1：构造实例（该指标尚不存在）
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("fresh", "inc", 4)
    // 步骤 3：断言从 0 起累加得 4
    obs.metric("fresh", "inc", 4);
    expect(obs.snapshot().metrics.fresh.value).toBe(4);
  });
});
