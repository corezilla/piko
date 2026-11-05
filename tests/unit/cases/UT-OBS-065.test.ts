/**
 * Case ID: UT-OBS-065  ·  STATUS: real
 *
 * 责任：返回站点 L53 值 `out` 逐值断言（observability.ts）
 * 维度坐标：`redact` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-065.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";

describe("UT-OBS-065 · redact · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns a new record, not the input", () => {
    // 步骤 1：构造输入记录
    const input = { a: 1 };

    // 步骤 2：调用 redact
    // 步骤 3：断言返回值是新对象（不共享引用）
    const out = redact(input);
    expect(out).not.toBe(input);
    expect(out).toEqual({ a: 1 });
  });

  it("does not mutate the input record", () => {
    // 步骤 1：构造含敏感键的输入
    const input = { api_key: "sk-live" };

    // 步骤 2：调用 redact
    // 步骤 3：断言输入未被改写（遮蔽只发生在副本上）
    redact(input);
    expect(input.api_key).toBe("sk-live");
  });
});
