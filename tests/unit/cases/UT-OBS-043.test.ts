/**
 * Case ID: UT-OBS-043  ·  STATUS: real
 *
 * 责任：可选参数 `limit` 缺省/显式两态（observability.ts:114）
 * 维度坐标：`snapshot` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-043.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-043 · snapshot · 纯函数/无副作用 × 每等价类合法值", () => {
  it("defaults the limit to 50 when omitted", () => {
    // 步骤 1：写入 60 条事件
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    for (let i = 0; i < 60; i += 1) obs.emit(`e${i}`);

    // 步骤 2：调用 snapshot() —— limit 缺省
    // 步骤 3：断言按默认 50 裁剪
    expect(obs.snapshot().recent_events).toHaveLength(50);
  });

  it("honours an explicit limit", () => {
    // 显式态
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    for (let i = 0; i < 60; i += 1) obs.emit(`e${i}`);
    expect(obs.snapshot(20).recent_events).toHaveLength(20);
  });
});
