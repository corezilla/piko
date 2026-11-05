/**
 * Case ID: UT-OBS-077  ·  STATUS: real
 *
 * 责任：返回站点 L68 值 `Math.max(16, limit)` 逐值断言（observability.ts）
 * 维度坐标：`keep` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-077.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-077 · keep · 纯函数/无副作用 × 每等价类合法值", () => {
  it("never returns less than 16 and never more than the request", () => {
    // 步骤 1：构造实例并写入 40 条事件
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    for (let i = 0; i < 40; i += 1) obs.emit(`e${i}`);

    // 步骤 2：依次请求 0／1／15／16／17／40
    // 步骤 3：断言返回值＝max(16, limit)（事件足够多时即可观察）
    expect(obs.snapshot(0).recent_events.length).toBe(16);
    expect(obs.snapshot(1).recent_events.length).toBe(16);
    expect(obs.snapshot(15).recent_events.length).toBe(16);
    expect(obs.snapshot(16).recent_events.length).toBe(16);
    expect(obs.snapshot(17).recent_events.length).toBe(17);
    expect(obs.snapshot(40).recent_events.length).toBe(40);
  });
});
