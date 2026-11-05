/**
 * Case ID: UT-OBS-047  ·  STATUS: real
 *
 * 责任：参数 `counter: string` 的 `超长` 类（observability.ts:127）
 * 维度坐标：`bump` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-047.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-047 · bump · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long counter name", () => {
    // 步骤 1：构造 500 字符的 counter 名
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    const name = "x".repeat(500);

    // 步骤 2：调用 bump(name)
    // 步骤 3：断言键完整保留、值为 1
    obs.bump(name);
    expect(obs.snapshot().counters[name]).toBe(1);
  });
});
