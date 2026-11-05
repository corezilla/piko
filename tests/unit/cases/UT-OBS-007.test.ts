/**
 * Case ID: UT-OBS-007  ·  STATUS: real
 *
 * 责任：`snapshot` × `数值/长度上限参数` × `恰好通过`（波次一粗粒度登记）
 * 维度坐标：`snapshot` × `数值/长度上限参数` × `恰好通过`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-007.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-007 · snapshot · 数值/长度上限参数 × 恰好通过", () => {
  it("returns a snapshot limited to the requested count", () => {
    // 步骤 1：构造实例并写入 30 条事件
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    for (let i = 0; i < 30; i += 1) obs.emit(`e${i}`);

    // 步骤 2：调用 snapshot(30)
    // 步骤 3：断言返回 30 条，且是最新的那些
    const events = obs.snapshot(30).recent_events;
    expect(events).toHaveLength(30);
    expect(events[events.length - 1].event_name).toBe("e29");
  });
});
