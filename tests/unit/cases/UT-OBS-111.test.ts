/**
 * Case ID: UT-OBS-111  ·  STATUS: real
 *
 * 责任：参数 `unit: string` 的 `非法值` 类（observability.ts:90）
 * 维度坐标：`metric` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-111.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-111 · metric · 纯函数/无副作用 × 每等价类合法值", () => {
  it("keeps an empty unit verbatim", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 1, undefined, "")
    // 步骤 3：断言空单位原样保留（无校验义务）
    obs.metric("m", "inc", 1, undefined, "");
    expect(obs.snapshot().metrics.m.unit).toBe("");
  });
});
