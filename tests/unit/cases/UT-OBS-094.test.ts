/**
 * Case ID: UT-OBS-094  ·  STATUS: real
 *
 * 责任：分支 L85 catch: catch ()（observability.ts）
 * 维度坐标：`emit` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-094.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-094 · emit · 错误路径 × 每个 typed 错误码", () => {
  it("fails open: a throwing field getter does not break the caller", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：构造一个取值即抛错的 fields 并 emit —— 不得抛出
    const hostile = {};
    Object.defineProperty(hostile, "boom", {
      enumerable: true,
      get() { throw new Error("sink exploded"); },
    });
    expect(() => obs.emit("e", hostile)).not.toThrow();

    // 步骤 3：断言该事件未被记录（异常被吞掉，无半写状态）
    expect(obs.snapshot().recent_events).toHaveLength(0);
  });
});
