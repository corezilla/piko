/**
 * Case ID: UT-OBS-036  ·  STATUS: real
 *
 * 责任：参数 `record: AuditRecord` 的 `非法值` 类（observability.ts:104）
 * 维度坐标：`audit` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-036.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-036 · audit · 纯函数/无副作用 × 每等价类合法值", () => {
  it("redacts a sensitive detail field", () => {
    // 步骤 1：构造含敏感键的 detail（非法值——不应原样留存）
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 audit(record)
    obs.audit({ event_name: "auth", task_id: "t-1", detail: { token: "sk-live", ok: true } });

    // 步骤 3：读回 snapshot().audit_tail，断言敏感键被遮蔽、普通键保留
    const tail = obs.snapshot().audit_tail;
    expect(tail[0].detail.token).toBe("[redacted]");
    expect(tail[0].detail.ok).toBe(true);
  });
});
