/**
 * Case ID: UT-OBS-096  ·  STATUS: real
 *
 * 责任：参数 `id: string` 的 `超长` 类（observability.ts:90）
 * 维度坐标：`metric` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-096.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-096 · metric · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an over-long metric id", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric(1000 字符 id, "inc")
    // 步骤 3：断言原样保留
    const id = "m".repeat(1000);
    obs.metric(id, "inc");
    expect(obs.snapshot().metrics[id]).toBeDefined();
  });
});
