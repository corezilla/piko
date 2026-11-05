/**
 * Case ID: UT-OBS-042  ·  STATUS: real
 *
 * 责任：参数 `limit: number` 的 `非法值` 类（observability.ts:114）
 * 维度坐标：`snapshot` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-042.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-042 · snapshot · 纯函数/无副作用 × 每等价类合法值", () => {
  it("treats a negative limit as the floor (no crash, no empty result)", () => {
    // 步骤 1：写入 30 条事件，请求 limit＝-1
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    for (let i = 0; i < 30; i += 1) obs.emit(`e${i}`);

    // 步骤 2：调用 snapshot(-1)
    // 步骤 3：断言按 16 下界裁剪，且不抛错
    expect(() => obs.snapshot(-1)).not.toThrow();
    expect(obs.snapshot(-1).recent_events).toHaveLength(16);
  });
});
