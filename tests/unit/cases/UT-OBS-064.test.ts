/**
 * Case ID: UT-OBS-064  ·  STATUS: real
 *
 * 责任：分支 L51 ternary: ? v === null :（observability.ts）
 * 维度坐标：`redact` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-064.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";

describe("UT-OBS-064 · redact · 状态分支 × 合法迁移", () => {
  it("keeps null as null (the ternary true side)", () => {
    // 步骤 1：构造 null 值
    const out = redact({ k: null });

    // 步骤 2：调用 redact
    // 步骤 3：断言 null 被保留为 null（不是字符串 "null"）
    expect(out.k).toBeNull();
  });
});
