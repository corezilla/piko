/**
 * Case ID: UT-OBS-116  ·  STATUS: real
 *
 * 责任：分支 L93 &&: labels && Object.keys(labels).length（observability.ts）
 * 维度坐标：`metric` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-116.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-116 · metric · 状态分支 × 合法迁移", () => {
  it("short-circuits on a nullish labels argument", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 1, undefined)
    // 步骤 3：断言 labels 为假 → 走裸 id 分支
    obs.metric("m", "inc", 1, undefined);
    expect(Object.keys(obs.snapshot().metrics)).toEqual(["m"]);
  });

  it("takes the right operand when labels hold no keys", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 metric("m", "inc", 1, {}) —— labels 为真但长度为 0
    // 步骤 3：断言整个 && 为假 → 走裸 id 分支
    obs.metric("m", "inc", 1, {});
    expect(Object.keys(obs.snapshot().metrics)).toEqual(["m"]);
  });
});
