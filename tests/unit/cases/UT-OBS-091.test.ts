/**
 * Case ID: UT-OBS-091  ·  STATUS: real
 *
 * 责任：分支 L81 ternary: ? fields?.redacted_error_class :（observability.ts）
 * 维度坐标：`emit` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-091.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-091 · emit · 状态分支 × 合法迁移", () => {
  it("promotes redacted_error_class to the envelope", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 emit("e", { redacted_error_class: "TimeoutError" })
    obs.emit("e", { redacted_error_class: "TimeoutError" });

    // 步骤 3：断言逐值对账
    expect(obs.snapshot().recent_events[0].redacted_error_class).toBe("TimeoutError");
  });

  it("omits redacted_error_class when it is empty", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 emit("e", { redacted_error_class: "" })
    obs.emit("e", { redacted_error_class: "" });

    // 步骤 3：断言空串为假值 → 不进信封
    expect("redacted_error_class" in obs.snapshot().recent_events[0]).toBe(false);
  });
});
