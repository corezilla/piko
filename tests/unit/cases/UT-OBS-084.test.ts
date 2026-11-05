/**
 * Case ID: UT-OBS-084  ·  STATUS: real
 *
 * 责任：可选参数 `fields` 缺省/显式两态（observability.ts:72）
 * 维度坐标：`emit` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-084.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-084 · emit · 纯函数/无副作用 × 每等价类合法值", () => {
  it("records the same envelope shape with and without fields", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：缺省态 emit("a") 与显式态 emit("b", { x: 1 })
    obs.emit("a");
    obs.emit("b", { x: 1 });

    // 步骤 3：断言两者信封字段一致（event_name/at/instance_id 都在）
    const events = obs.snapshot().recent_events;
    expect(events[0].event_name).toBe("a");
    expect(events[1].event_name).toBe("b");
    for (const e of events) {
      expect(e.at).toBe("1970-01-01T00:00:00.000Z");
      expect(e.instance_id).toBe("inst-1");
    }
  });
});
