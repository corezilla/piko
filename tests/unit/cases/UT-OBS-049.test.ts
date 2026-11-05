/**
 * Case ID: UT-OBS-049  ·  STATUS: real
 *
 * 责任：参数 `delta: number` 的 `每等价类合法值` 类（observability.ts:127）
 * 维度坐标：`bump` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-049.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-049 · bump · 数值/长度上限参数 × 恰好通过", () => {
  it("bumps by one by default", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 bump("c") —— delta 缺省为 1
    // 步骤 3：断言计数为 1
    obs.bump("c");
    expect(obs.snapshot().counters.c).toBe(1);
  });
});
