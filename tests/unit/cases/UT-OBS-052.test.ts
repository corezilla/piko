/**
 * Case ID: UT-OBS-052  ·  STATUS: real
 *
 * 责任：可选参数 `delta` 缺省/显式两态（observability.ts:127）
 * 维度坐标：`bump` × `数值/长度上限参数` × `未知枚举`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-052.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-052 · bump · 数值/长度上限参数 × 未知枚举", () => {
  it("defaults delta to 1 and honours an explicit delta", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：分别以缺省与显式调用
    obs.bump("a");
    obs.bump("b", 10);

    // 步骤 3：断言两者分别得到 1 与 10
    const counters = obs.snapshot().counters;
    expect(counters.a).toBe(1);
    expect(counters.b).toBe(10);
  });
});
