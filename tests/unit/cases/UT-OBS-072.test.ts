/**
 * Case ID: UT-OBS-072  ·  STATUS: real
 *
 * 责任：参数 `clock: Clock` 的 `非法值` 类（observability.ts:62）
 * 维度坐标：`Observability.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-072.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-072 · Observability.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts a clock whose iso() returns a non-ISO string (no validation)", () => {
    // 步骤 1：注入一个 iso() 返回非法格式的时钟
    const hostile = { now: () => 0, monotonic: () => 0, iso: () => "not-a-date" };
    const obs = new Observability({ instance_id: "inst-1" }, hostile);

    // 步骤 2：读回 snapshot().generated_at
    // 步骤 3：断言原样透传（该参数无格式校验）
    expect(obs.snapshot().generated_at).toBe("not-a-date");
  });
});
