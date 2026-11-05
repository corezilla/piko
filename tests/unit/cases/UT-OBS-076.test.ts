/**
 * Case ID: UT-OBS-076  ·  STATUS: real
 *
 * 责任：参数 `limit: number` 的 `−1 通过` 类（observability.ts:67）
 * 维度坐标：`keep` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-076.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-076 · keep · 数值/长度上限参数 × −1 通过", () => {
  it("raises a limit below the floor to the floor of 16", () => {
    // 步骤 1：构造实例并写入 40 条事件
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    for (let i = 0; i < 40; i += 1) obs.emit(`e${i}`);

    // 步骤 2：调用 snapshot(15)
    // 步骤 3：断言被抬到 16（Math.max(16, limit)）
    expect(obs.snapshot(15).recent_events).toHaveLength(16);
  });
});
