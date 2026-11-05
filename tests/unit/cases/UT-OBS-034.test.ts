/**
 * Case ID: UT-OBS-034  ·  STATUS: real
 *
 * 责任：参数 `record: AuditRecord` 的 `每等价类合法值` 类（observability.ts:104）
 * 维度坐标：`audit` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-034.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-034 · audit · 纯函数/无副作用 × 每等价类合法值", () => {
  it("records an audit entry with a task id and detail", () => {
    // 步骤 1：构造合法 AuditRecord
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 audit(record)
    obs.audit({ event_name: "task.cancel", task_id: "t-1", detail: { reason: "user" } });

    // 步骤 3：读回权威事实源（snapshot().audit_tail）逐值对账
    const tail = obs.snapshot().audit_tail;
    expect(tail).toHaveLength(1);
    expect(tail[0].event_name).toBe("task.cancel");
    expect(tail[0].task_id).toBe("t-1");
    expect(tail[0].detail).toEqual({ reason: "user" });
  });
});
