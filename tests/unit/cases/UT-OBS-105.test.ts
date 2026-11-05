/**
 * Case ID: UT-OBS-105  ·  STATUS: real
 *
 * 责任：参数 `labels: Record<string, string>` 的 `空` 类（observability.ts:90）
 * 维度坐标：`metric` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-105.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-105 · metric · 纯函数/无副作用 × 每等价类合法值", () => {
  it("uses the bare id when labels is empty", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 1, {})
    // 步骤 3：断言键就是 id 本身（不带标签后缀）
    obs.metric("m", "inc", 1, {});
    expect(obs.snapshot().metrics.m).toBeDefined();
  });
});
