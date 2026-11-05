/**
 * Case ID: UT-OBS-075  ·  STATUS: real
 *
 * 责任：参数 `limit: number` 的 `+1 拒绝` 类（observability.ts:67）
 * 维度坐标：`keep` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-075.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-075 · keep · 数值/长度上限参数 × +1 拒绝", () => {
  it("honours a limit one above the floor", () => {
    // 步骤 1：构造实例并写入 40 条事件
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    for (let i = 0; i < 40; i += 1) obs.emit(`e${i}`);

    // 步骤 2：调用 snapshot(17)
    // 步骤 3：断言返回 17 条（下界 16 之上的值原样生效）
    expect(obs.snapshot(17).recent_events).toHaveLength(17);
  });
});
