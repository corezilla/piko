/**
 * Case ID: UT-OBS-037  ·  STATUS: real
 *
 * 责任：分支 L106 ??: record.task_id ?? null（observability.ts）
 * 维度坐标：`audit` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-037.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-037 · audit · 状态分支 × 合法迁移", () => {
  it("takes the left side when task_id is present", () => {
    // 步骤 1：构造带 task_id 的 record
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 audit(record)
    obs.audit({ event_name: "e", task_id: "t-9", detail: {} });

    // 步骤 3：读回 snapshot().audit_tail，断言 task_id 原样
    expect(obs.snapshot().audit_tail[0].task_id).toBe("t-9");
  });

  it("takes the right side when task_id is nullish", () => {
    // 步骤 1：构造 task_id 为 null 的 record
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 audit(record)
    obs.audit({ event_name: "e", task_id: null, detail: {} });

    // 步骤 3：读回 snapshot().audit_tail，断言归一为 null
    expect(obs.snapshot().audit_tail[0].task_id).toBeNull();
  });
});
