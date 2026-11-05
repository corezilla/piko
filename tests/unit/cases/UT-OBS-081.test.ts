/**
 * Case ID: UT-OBS-081  ·  STATUS: real
 *
 * 责任：参数 `fields: Record<string, unknown>` 的 `空` 类（observability.ts:72）
 * 维度坐标：`emit` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-081.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-081 · emit · 纯函数/无副作用 × 每等价类合法值", () => {
  it("records an event without fields", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 emit("e") —— fields 缺省
    // 步骤 3：断言事件存在且 fields 为空对象
    obs.emit("e");
    const event = obs.snapshot().recent_events[0];
    expect(event.event_name).toBe("e");
    expect(event.fields).toEqual({});
  });
});
