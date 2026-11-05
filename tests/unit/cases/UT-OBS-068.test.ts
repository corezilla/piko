/**
 * Case ID: UT-OBS-068  ·  STATUS: real
 *
 * 责任：参数 `config` 的 `注入字符` 类（observability.ts:62）
 * 维度坐标：`Observability.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-068.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-068 · Observability.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("treats an injected instance id as data", () => {
    // 步骤 1：构造注入形态的 instance_id
    const id = "$(id)`; DROP TABLE x;--";
    const obs = new Observability({ instance_id: id }, new ManualClock(0, 0));

    // 步骤 2：读回 snapshot()
    // 步骤 3：断言原样保留、不执行
    expect(obs.snapshot().instance_id).toBe(id);
  });
});
