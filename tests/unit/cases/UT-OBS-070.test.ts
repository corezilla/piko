/**
 * Case ID: UT-OBS-070  ·  STATUS: real
 *
 * 责任：参数 `clock: Clock` 的 `每等价类合法值` 类（observability.ts:62）
 * 维度坐标：`Observability.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-070.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-070 · Observability.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("uses the injected clock for timestamps", () => {
    // 步骤 1：构造受控时钟 ManualClock(1700000000000, 5)
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(1700000000000, 5));

    // 步骤 2：读回 snapshot().generated_at
    // 步骤 3：断言时间戳来自注入的时钟（不是真实系统时间）
    expect(obs.snapshot().generated_at).toBe(new Date(1700000000000).toISOString());
  });
});
