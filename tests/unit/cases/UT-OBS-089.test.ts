/**
 * Case ID: UT-OBS-089  ·  STATUS: real
 *
 * 责任：分支 L80 ternary: ? typeof fields?.epoch === "number" :（observability.ts）
 * 维度坐标：`emit` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-089.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-089 · emit · 状态分支 × 合法迁移", () => {
  it("promotes a numeric epoch to the envelope", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 emit("e", { epoch: 7 })
    obs.emit("e", { epoch: 7 });

    // 步骤 3：断言 epoch 逐值对账
    expect(obs.snapshot().recent_events[0].epoch).toBe(7);
  });

  it("omits epoch when it is not a number", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 emit("e", { epoch: "7" })
    obs.emit("e", { epoch: "7" });

    // 步骤 3：断言信封里没有 epoch
    expect("epoch" in obs.snapshot().recent_events[0]).toBe(false);
  });
});
