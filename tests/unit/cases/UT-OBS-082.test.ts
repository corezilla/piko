/**
 * Case ID: UT-OBS-082  ·  STATUS: real
 *
 * 责任：参数 `fields: Record<string, unknown>` 的 `超长` 类（observability.ts:72）
 * 维度坐标：`emit` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-082.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-082 · emit · 纯函数/无副作用 × 每等价类合法值", () => {
  it("records an event with a large field set", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：构造 500 键的 fields 并 emit
    const fields: Record<string, unknown> = {};
    for (let i = 0; i < 500; i += 1) fields[`k${i}`] = i;
    obs.emit("bulk", fields);

    // 步骤 3：断言字段数守恒、值逐值对账
    const event = obs.snapshot().recent_events[0];
    expect(Object.keys(event.fields ?? {})).toHaveLength(500);
    expect(event.fields?.k499).toBe(499);
  });
});
