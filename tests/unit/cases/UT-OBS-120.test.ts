/**
 * Case ID: UT-OBS-120  ·  STATUS: real
 *
 * 责任：分支 L96 ??: value ?? 1（observability.ts）
 * 维度坐标：`metric` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-120.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-120 · metric · 状态分支 × 合法迁移", () => {
  it("increments by one when value is omitted", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc") —— value 缺省
    // 步骤 3：断言 +1
    obs.metric("m", "inc");
    expect(obs.snapshot().metrics.m.value).toBe(1);
  });
});
