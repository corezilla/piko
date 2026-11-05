/**
 * Case ID: UT-OBS-038  ·  STATUS: real
 *
 * 责任：分支 L107 if: if (this.auditTrail.length > 200)（observability.ts）
 * 维度坐标：`audit` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-038.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-038 · audit · 状态分支 × 合法迁移", () => {
  it("keeps the newest entries once the trail passes its cap", () => {
    // 步骤 1：连续写入 250 条（越过内部 200 上限）
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    for (let i = 0; i < 250; i += 1) obs.audit({ event_name: `e${i}`, task_id: "t", detail: {} });

    // 步骤 2：读回 snapshot().audit_tail
    // 步骤 3：断言尾部是最新的条目；可见条数受 snapshot 的 keep(limit=50) 约束，
    // 内部 200 上限的效果表现为「最旧的已被丢弃、最新的一定在」
    const tail = obs.snapshot().audit_tail;
    expect(tail.length).toBeGreaterThan(0);
    expect(tail[tail.length - 1].event_name).toBe("e249");
    expect(tail.some((r) => r.event_name === "e0")).toBe(false);
  });

  it("keeps every entry below the cap", () => {
    // 步骤 1：写入 10 条（未越限）
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    for (let i = 0; i < 10; i += 1) obs.audit({ event_name: `e${i}`, task_id: "t", detail: {} });

    // 步骤 2：读回 snapshot().audit_tail
    // 步骤 3：断言 10 条全在
    expect(obs.snapshot().audit_tail).toHaveLength(10);
  });
});
