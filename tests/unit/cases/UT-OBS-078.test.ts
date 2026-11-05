/**
 * Case ID: UT-OBS-078  ·  STATUS: real
 *
 * 责任：参数 `name: string` 的 `空` 类（observability.ts:72）
 * 维度坐标：`emit` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-078.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-078 · emit · 字符串/路径/枚举输入 × 空", () => {
  it("accepts an empty event name", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：调用 emit("")
    // 步骤 3：断言事件被记录且 name 为空串（该参数无校验）
    obs.emit("");
    expect(obs.snapshot().recent_events[0].event_name).toBe("");
  });
});
