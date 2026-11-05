/**
 * Case ID: UT-OBS-044  ·  STATUS: real
 *
 * 责任：分支 L116 loop: loop (this.counters)（observability.ts）
 * 维度坐标：`snapshot` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-044.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-044 · snapshot · 状态分支 × 合法迁移", () => {
  it("copies every counter into the snapshot", () => {
    // 步骤 1：bump 三个计数器
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    obs.bump("a");
    obs.bump("b", 5);
    obs.bump("a", 2);

    // 步骤 2：调用 snapshot()
    // 步骤 3：断言循环走完所有计数器且值逐值对账
    const snap = obs.snapshot();
    expect(snap.counters).toEqual({ a: 3, b: 5 });
  });
});
