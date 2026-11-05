/**
 * Case ID: UT-OBS-026  ·  STATUS: real
 *
 * 责任：参数 `wallIso: string` 的 `注入字符` 类（clock.ts:48）
 * 维度坐标：`set` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-026.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-026 · set · 字符串/路径/枚举输入 × 注入字符", () => {
  it("does not evaluate a shell-like payload (no code execution)", () => {
    // 步骤 1：构造 ManualClock(0, 0)
    const clock = new ManualClock(0, 0);

    // 步骤 2：调用 set(注入串)
    // 步骤 3：断言只当字符串解析，不执行；结果为 NaN
    const payload = "$(rm -rf /)`; DROP TABLE users;--";
    expect(() => clock.set(payload)).not.toThrow();
    expect(Number.isNaN(clock.now())).toBe(true);
  });
});
