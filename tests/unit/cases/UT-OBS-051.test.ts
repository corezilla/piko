/**
 * Case ID: UT-OBS-051  ·  STATUS: real
 *
 * 责任：参数 `delta: number` 的 `非法值` 类（observability.ts:127）
 * 维度坐标：`bump` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-051.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-051 · bump · 数值/长度上限参数 × −1 通过", () => {
  it("accepts a negative delta (counter goes backwards)", () => {
    // 步骤 1：构造实例并先 bump 一次
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    obs.bump("c", 5);

    // 步骤 2：调用 bump("c", -2)
    // 步骤 3：断言计数为 3（无下界校验，负值合法）
    obs.bump("c", -2);
    expect(obs.snapshot().counters.c).toBe(3);
  });
});
