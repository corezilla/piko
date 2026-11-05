/**
 * Case ID: UT-OBS-093  ·  STATUS: real
 *
 * 责任：分支 L84 if: if (this.events.length > 500)（observability.ts）
 * 维度坐标：`emit` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-093.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-093 · emit · 状态分支 × 合法迁移", () => {
  it("keeps the newest 500 events when the buffer overflows", () => {
    // 步骤 1：连续 emit 600 条
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    for (let i = 0; i < 600; i += 1) obs.emit(`e${i}`);

    // 步骤 2：读回 snapshot(1000).recent_events
    // 步骤 3：断言内部缓冲裁到 500，最旧的已丢弃、最新的还在
    const events = obs.snapshot(1000).recent_events;
    expect(events).toHaveLength(500);
    expect(events[events.length - 1].event_name).toBe("e599");
    expect(events.some((e) => e.event_name === "e0")).toBe(false);
  });
});
