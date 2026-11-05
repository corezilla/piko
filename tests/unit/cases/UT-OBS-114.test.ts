/**
 * Case ID: UT-OBS-114  ·  STATUS: real
 *
 * 责任：分支 L92 ?.: this.config.observability?.metrics_enabled（observability.ts）
 * 维度坐标：`metric` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-114.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-114 · metric · 状态分支 × 合法迁移", () => {
  it("records when the observability block is absent (optional chain short-circuits)", () => {
    // 步骤 1：构造没有 observability 块的实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 1)
    // 步骤 3：断言被记下（undefined !== false，不早退）
    obs.metric("m", "inc", 1);
    expect(obs.snapshot().metrics.m.value).toBe(1);
  });
});
