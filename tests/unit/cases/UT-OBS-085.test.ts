/**
 * Case ID: UT-OBS-085  ·  STATUS: real
 *
 * 责任：分支 L78 ternary: ? fields?.task_id :（observability.ts）
 * 维度坐标：`emit` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-085.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-085 · emit · 状态分支 × 合法迁移", () => {
  it("promotes task_id to a top-level envelope field when present", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 emit("e", { task_id: 42 })
    obs.emit("e", { task_id: 42 });

    // 步骤 3：断言 task_id 出现在信封顶层且被 String 化
    const event = obs.snapshot().recent_events[0];
    expect(event.task_id).toBe("42");
  });

  it("omits task_id when the field is absent", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 emit("e")
    obs.emit("e");

    // 步骤 3：断言信封里没有 task_id 这个键
    expect("task_id" in obs.snapshot().recent_events[0]).toBe(false);
  });
});
