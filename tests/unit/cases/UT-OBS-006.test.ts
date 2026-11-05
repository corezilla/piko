/**
 * Case ID: UT-OBS-006  ·  STATUS: real
 *
 * 责任：`redact` × `纯函数/无副作用` × `每等价类合法值`（波次一粗粒度登记）
 * 维度坐标：`redact` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1 粗粒度登记行）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-006.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";
import { ManualClock } from "../../../src/clock.js";

describe("UT-OBS-006 · redact · 纯函数/无副作用 × 每等价类合法值", () => {
  it("redacts forbidden keys and preserves the rest", () => {
    // 步骤 1：构造混合字段（敏感键＋普通键）
    const out = redact({ api_key: "sk-live", duration_ms: 12, ok: true });

    // 步骤 2：调用 redact
    // 步骤 3：断言敏感键遮蔽、普通键逐值保留
    expect(out.api_key).toBe("[redacted]");
    expect(out.duration_ms).toBe(12);
    expect(out.ok).toBe(true);
  });
});
