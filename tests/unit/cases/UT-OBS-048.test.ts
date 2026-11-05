/**
 * Case ID: UT-OBS-048  ·  STATUS: real
 *
 * 责任：参数 `counter: string` 的 `注入字符` 类（observability.ts:127）
 * 维度坐标：`bump` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-048.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-048 · bump · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected counter name as a plain key", () => {
    // 步骤 1：构造注入形态的 counter 名
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 bump(name)
    // 步骤 3：断言只作普通键，不执行
    const name = "__proto__; rm -rf /";
    obs.bump(name);
    expect(obs.snapshot().counters[name]).toBe(1);
  });
});
