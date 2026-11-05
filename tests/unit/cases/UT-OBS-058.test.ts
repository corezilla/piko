/**
 * Case ID: UT-OBS-058  ·  STATUS: real
 *
 * 责任：分支 L46 loop: loop (Object.entries(fields ?? {}))（observability.ts）
 * 维度坐标：`redact` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-058.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";

describe("UT-OBS-058 · redact · 状态分支 × 合法迁移", () => {
  it("iterates over every entry of the input record", () => {
    // 步骤 1：构造三个键的记录
    const out = redact({ a: 1, b: "two", c: true });

    // 步骤 2：调用 redact
    // 步骤 3：断言循环走完所有条目（三个键都在结果里）
    expect(Object.keys(out)).toEqual(["a", "b", "c"]);
    expect(out.a).toBe(1);
    expect(out.b).toBe("two");
    expect(out.c).toBe(true);
  });
});
