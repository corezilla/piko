/**
 * Case ID: UT-OBS-040  ·  STATUS: real
 *
 * 责任：参数 `limit: number` 的 `每等价类合法值` 类（observability.ts:114）
 * 维度坐标：`snapshot` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-040.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-040 · snapshot · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the diagnostic snapshot with instance id and generated_at", () => {
    // 步骤 1：构造实例（受控时钟）
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 snapshot()
    // 步骤 3：断言结构逐值对账
    const snap = obs.snapshot();
    expect(snap.instance_id).toBe("inst-1");
    expect(snap.generated_at).toBe("1970-01-01T00:00:00.000Z");
    expect(snap.metrics).toEqual({});
    expect(snap.counters).toEqual({});
    expect(snap.recent_events).toEqual([]);
    expect(snap.audit_tail).toEqual([]);
  });
});
