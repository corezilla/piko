/**
 * Case ID: UT-OBS-003  ·  STATUS: real
 *
 * 责任：`emit` × `错误路径` × `每个 typed 错误码`（波次一粗粒度登记）
 * 维度坐标：`emit` × `错误路径` × `每个 typed 错误码`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-003.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-003 · emit · 错误路径 × 每个 typed 错误码", () => {
  it("fails open: a throwing fields getter does not break the caller", () => {
    // 步骤 1：构造实例与一个取值即抛错的 fields
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    const hostile = {};
    Object.defineProperty(hostile, "boom", {
      enumerable: true,
      get() { throw new Error("sink exploded"); },
    });

    // 步骤 2：调用 emit —— 不得抛出
    expect(() => obs.emit("e", hostile)).not.toThrow();

    // 步骤 3：断言无半写状态，随后正常 emit 仍可用
    expect(obs.snapshot().recent_events).toHaveLength(0);
    obs.emit("ok");
    expect(obs.snapshot().recent_events).toHaveLength(1);
  });
});
