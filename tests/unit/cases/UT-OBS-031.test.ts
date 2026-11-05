/**
 * Case ID: UT-OBS-031  ·  STATUS: real
 *
 * 责任：分支 L50 if: if (monoMs !== undefined)（clock.ts）
 * 维度坐标：`set` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-031.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-031 · set · 状态分支 × 合法迁移", () => {
  it("takes the true side when monoMs is provided", () => {
    // 步骤 1：构造 ManualClock(0, 0)
    const clock = new ManualClock(0, 0);

    // 步骤 2：调用 set(合法 ISO, 12) —— monoMs !== undefined 为真
    // 步骤 3：断言单调钟被改写为 12（证明走了 if 体）
    clock.set("2026-11-05T00:00:00.000Z", 12);
    expect(clock.monotonic()).toBe(12);
  });

  it("takes the false side when monoMs is omitted", () => {
    // 步骤 1：构造 ManualClock(0, 77)
    const clock = new ManualClock(0, 77);

    // 步骤 2：调用 set(合法 ISO) —— monoMs === undefined 为假
    // 步骤 3：断言单调钟保持 77（证明跳过了 if 体）
    clock.set("2026-11-05T00:00:00.000Z");
    expect(clock.monotonic()).toBe(77);
  });
});
