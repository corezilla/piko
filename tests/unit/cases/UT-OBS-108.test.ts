/**
 * Case ID: UT-OBS-108  ·  STATUS: real
 *
 * 责任：可选参数 `labels` 缺省/显式两态（observability.ts:90）
 * 维度坐标：`metric` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-108.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-108 · metric · 纯函数/无副作用 × 每等价类合法值", () => {
  it("keys the metric by id alone when labels are omitted", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：缺省态 metric("plain", "inc", 1)
    obs.metric("plain", "inc", 1);

    // 步骤 3：断言键就是 "plain"
    expect(obs.snapshot().metrics.plain).toBeDefined();
  });
});
