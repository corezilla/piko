/**
 * Case ID: UT-OBS-066  ·  STATUS: real
 *
 * 责任：参数 `config: { instance_id: string; observability?: {...} }` 的 `空` 类（observability.ts:62）
 * 维度坐标：`Observability.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-066.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-066 · Observability.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("accepts a config with only instance_id", () => {
    // 步骤 1：构造 config＝{ instance_id: "inst-1" }（observability 缺省）
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：读回 snapshot()
    // 步骤 3：断言 instance_id 逐值对账，且缺省 observability 不影响
    expect(obs.snapshot().instance_id).toBe("inst-1");
  });
});
