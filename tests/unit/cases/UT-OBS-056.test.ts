/**
 * Case ID: UT-OBS-056  ·  STATUS: real
 *
 * 责任：参数 `fields: Record<string, unknown> | undefined` 的 `超长` 类（observability.ts:44）
 * 维度坐标：`redact` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-056.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";

describe("UT-OBS-056 · redact · 纯函数/无副作用 × 每等价类合法值", () => {
  it("redacts a large record without dropping keys", () => {
    // 步骤 1：构造 1000 个键的记录
    const fields: Record<string, unknown> = {};
    for (let i = 0; i < 1000; i += 1) fields[`k${i}`] = i;

    // 步骤 2：调用 redact(fields)
    // 步骤 3：断言键数守恒、值逐值对账
    const out = redact(fields);
    expect(Object.keys(out)).toHaveLength(1000);
    expect(out.k0).toBe(0);
    expect(out.k999).toBe(999);
  });
});
