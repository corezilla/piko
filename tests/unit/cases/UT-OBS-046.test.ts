/**
 * Case ID: UT-OBS-046  ·  STATUS: real
 *
 * 责任：参数 `counter: string` 的 `空` 类（observability.ts:127）
 * 维度坐标：`bump` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-046.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-046 · bump · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty counter name", () => {
    // 步骤 1：构造 counter＝""
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 bump("")
    // 步骤 3：断言空名被当作普通键记下
    obs.bump("");
    expect(obs.snapshot().counters).toEqual({ "": 1 });
  });
});
