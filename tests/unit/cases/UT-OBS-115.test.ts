/**
 * Case ID: UT-OBS-115  ·  STATUS: real
 *
 * 责任：分支 L93 ternary: ? labels && Object.keys(labels).length :（observability.ts）
 * 维度坐标：`metric` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-115.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-115 · metric · 状态分支 × 合法迁移", () => {
  it("keys by id alone when labels are empty", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 1, {})
    // 步骤 3：断言键就是 "m"（不带标签后缀）
    obs.metric("m", "inc", 1, {});
    expect(Object.keys(obs.snapshot().metrics)).toEqual(["m"]);
  });

  it("keys by id plus labels when labels are present", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 1, { a: "1" })
    // 步骤 3：断言键带标签后缀
    obs.metric("m", "inc", 1, { a: "1" });
    expect(Object.keys(obs.snapshot().metrics)).toEqual(["m{a=1}"]);
  });
});
