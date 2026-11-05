/**
 * Case ID: UT-OBS-126  ·  STATUS: real
 *
 * 责任：分支 L98 catch: catch ()（observability.ts）
 * 维度坐标：`metric` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-126.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-126 · metric · 错误路径 × 每个 typed 错误码", () => {
  it("fails open: a throwing labels object does not break the caller", () => {
    // 步骤 1：构造实例
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));

    // 步骤 2：注入一个 keys() 会抛错的 labels 并调用 metric —— 不得抛出
    const hostile = {
      get [Symbol.iterator]() { throw new Error("sink exploded"); },
    };
    const labels = Object.create(null) as Record<string, string>;
    Object.defineProperty(labels, "boom", {
      enumerable: true,
      get() { throw new Error("sink exploded"); },
    });
    void hostile;

    // 步骤 3：断言不抛错，且该指标未被记下（无半写状态）
    expect(() => obs.metric("m", "inc", 1, labels)).not.toThrow();
    expect(obs.snapshot().metrics.m).toBeUndefined();
  });
});
