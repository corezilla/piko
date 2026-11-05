/**
 * Case ID: UT-OBS-087  ·  STATUS: real
 *
 * 责任：分支 L79 ternary: ? typeof fields?.generation === "number" :（observability.ts）
 * 维度坐标：`emit` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-087.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-087 · emit · 状态分支 × 合法迁移", () => {
  it("promotes a numeric generation to the envelope", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 emit("e", { generation: 3 })
    obs.emit("e", { generation: 3 });

    // 步骤 3：断言 generation 逐值对账
    expect(obs.snapshot().recent_events[0].generation).toBe(3);
  });

  it("omits generation when it is not a number", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 emit("e", { generation: "3" })
    obs.emit("e", { generation: "3" });

    // 步骤 3：断言信封里没有 generation（字符串不算数字）
    expect("generation" in obs.snapshot().recent_events[0]).toBe(false);
  });
});
