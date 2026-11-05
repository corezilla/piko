/**
 * Case ID: UT-OBS-039  ·  STATUS: real
 *
 * 责任：分支 L108 catch: catch ()（observability.ts）
 * 维度坐标：`audit` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-039.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-039 · audit · 错误路径 × 每个 typed 错误码", () => {
  it("fails open: a throwing detail does not break the caller", () => {
    // 步骤 1：构造一个 getter 抛错的 detail（触发 redact 内部异常）
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    const hostile = {};
    Object.defineProperty(hostile, "boom", {
      enumerable: true,
      get() { throw new Error("sink exploded"); },
    });

    // 步骤 2：调用 audit(record) —— 不得抛出
    expect(() => obs.audit({ event_name: "e", task_id: "t", detail: hostile })).not.toThrow();

    // 步骤 3：断言该条目未被记录（异常被 catch 吞掉，不留半写状态）
    expect(obs.snapshot().audit_tail).toHaveLength(0);
  });
});
