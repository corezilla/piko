/**
 * Case ID: UT-OBS-001  ·  STATUS: real
 *
 * 责任：`audit` × `错误路径` × `每个 typed 错误码`（波次一粗粒度登记）
 * 维度坐标：`audit` × `错误路径` × `每个 typed 错误码`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-001.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-001 · audit · 错误路径 × 每个 typed 错误码", () => {
  it("rejects nothing by throwing — audit fails open on a hostile detail", () => {
    // 步骤 1：构造实例与一个取值即抛错的 detail
    const obs = new Observability({ instance_id: "inst-1" }, new ManualClock(0, 0));
    const hostile = {};
    Object.defineProperty(hostile, "boom", {
      enumerable: true,
      get() { throw new Error("sink exploded"); },
    });

    // 步骤 2：调用 audit —— 不得抛出（fail open 是本方法的契约）
    expect(() => obs.audit({ event_name: "e", task_id: "t", detail: hostile })).not.toThrow();

    // 步骤 3：断言无半写状态，且正常记录仍可用
    expect(obs.snapshot().audit_tail).toHaveLength(0);
    obs.audit({ event_name: "ok", task_id: "t", detail: { a: 1 } });
    expect(obs.snapshot().audit_tail).toHaveLength(1);
  });
});
