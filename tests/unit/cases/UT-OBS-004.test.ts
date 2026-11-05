/**
 * Case ID: UT-OBS-004  ·  STATUS: real
 *
 * 责任：`keep` × `纯函数/无副作用` × `每等价类合法值`（波次一粗粒度登记）
 * 维度坐标：`keep` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-004.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-004 · keep · 纯函数/无副作用 × 每等价类合法值", () => {
  it("keeps at least 16 entries and at most the requested limit", () => {
    // 步骤 1：构造实例并写入 40 条事件
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    for (let i = 0; i < 40; i += 1) obs.emit(`e${i}`);

    // 步骤 2：按不同 limit 读回
    // 步骤 3：断言条数恒为 max(16, limit)（事件数足够时）
    expect(obs.snapshot(0).recent_events.length).toBe(16);
    expect(obs.snapshot(16).recent_events.length).toBe(16);
    expect(obs.snapshot(25).recent_events.length).toBe(25);
    expect(obs.snapshot(40).recent_events.length).toBe(40);
  });
});
