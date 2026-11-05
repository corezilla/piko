/**
 * Case ID: UT-OBS-090  ·  STATUS: real
 *
 * 责任：分支 L80 ?.: fields?.epoch（observability.ts）
 * 维度坐标：`emit` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-090.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-090 · emit · 状态分支 × 合法迁移", () => {
  it("short-circuits the optional chain for epoch when fields is absent", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 emit("e")
    obs.emit("e");

    // 步骤 3：断言 epoch 缺席
    expect(obs.snapshot().recent_events[0].epoch).toBeUndefined();
  });
});
