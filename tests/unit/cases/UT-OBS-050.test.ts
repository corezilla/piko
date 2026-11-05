/**
 * Case ID: UT-OBS-050  ·  STATUS: real
 *
 * 责任：参数 `delta: number` 的 `边界(上/下/零/空/满)` 类（observability.ts:127）
 * 维度坐标：`bump` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-050.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-050 · bump · 数值/长度上限参数 × +1 拒绝", () => {
  it("bumps by zero (no change)", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 bump("c", 0)
    // 步骤 3：断言计数仍为 0
    obs.bump("c", 0);
    expect(obs.snapshot().counters.c).toBe(0);
  });

  it("accumulates repeated bumps", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：连续调用 bump("c", 3)
    // 步骤 3：断言累加为 6
    obs.bump("c", 3);
    obs.bump("c", 3);
    expect(obs.snapshot().counters.c).toBe(6);
  });
});
