/**
 * Case ID: UT-OBS-035  ·  STATUS: real
 *
 * 责任：参数 `record: AuditRecord` 的 `边界(上/下/零/空/满)` 类（observability.ts:104）
 * 维度坐标：`audit` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-035.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-035 · audit · 纯函数/无副作用 × 每等价类合法值", () => {
  it("records an entry with an empty detail object", () => {
    // 步骤 1：构造空 detail（下边界）
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 audit(record)
    obs.audit({ event_name: "noop", task_id: "t-1", detail: {} });

    // 步骤 3：读回 snapshot().audit_tail 逐值对账
    const tail = obs.snapshot().audit_tail;
    expect(tail[0].detail).toEqual({});
  });

  it("records an entry with a large detail object", () => {
    // 步骤 1：构造 500 键的 detail（上边界）
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    const detail: Record<string, unknown> = {};
    for (let i = 0; i < 500; i += 1) detail[`k${i}`] = i;

    // 步骤 2：调用 audit(record)
    obs.audit({ event_name: "bulk", task_id: "t-1", detail });

    // 步骤 3：读回 snapshot().audit_tail，断言条目数与键数守恒
    const tail = obs.snapshot().audit_tail;
    expect(tail).toHaveLength(1);
    expect(Object.keys(tail[0].detail)).toHaveLength(500);
  });
});
