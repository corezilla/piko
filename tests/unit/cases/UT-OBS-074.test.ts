/**
 * Case ID: UT-OBS-074  ·  STATUS: real
 *
 * 责任：参数 `limit: number` 的 `恰好通过` 类（observability.ts:67）
 * 维度坐标：`keep` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-074.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-074 · keep · 数值/长度上限参数 × 恰好通过", () => {
  it("keeps the requested limit when it is above the floor", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：通过 snapshot(100) 间接观察 keep(100)
    for (let i = 0; i < 120; i += 1) obs.emit(`e${i}`);

    // 步骤 3：断言返回 100 条（limit 本身不设上限）
    expect(obs.snapshot(100).recent_events).toHaveLength(100);
  });
});
