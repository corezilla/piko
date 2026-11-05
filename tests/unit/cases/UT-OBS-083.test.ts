/**
 * Case ID: UT-OBS-083  ·  STATUS: real
 *
 * 责任：参数 `fields: Record<string, unknown>` 的 `注入字符` 类（observability.ts:72）
 * 维度坐标：`emit` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-083.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-083 · emit · 纯函数/无副作用 × 每等价类合法值", () => {
  it("redacts sensitive field names in an emitted event", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：构造含敏感键的 fields 并 emit
    obs.emit("e", { api_key: "sk-live", safe: "ok" });

    // 步骤 3：读回事件，断言敏感键被遮蔽、普通键保留
    const event = obs.snapshot().recent_events[0];
    expect(event.fields?.api_key).toBe("[redacted]");
    expect(event.fields?.safe).toBe("ok");
  });
});
