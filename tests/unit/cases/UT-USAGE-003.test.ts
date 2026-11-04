/**
 * Case ID: UT-USAGE-003  ·  STATUS: real
 *
 * 责任：返回站点 L14 值 `{source:"PiModelResponses",quality:"Com…` 逐值断言（semantic.ts）
 * 维度坐标：`emptyUsage` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `USAGE`）
 * 用例文档：docs/70_verification/unit/cases/UT-USAGE-003.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { emptyUsage } from "../../../src/semantic.js";

describe("UT-USAGE-003 · emptyUsage · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the complete zero usage record", () => {
    // 步骤 1：调用 emptyUsage（semantic.ts:14），纯函数无输入
    const usage = emptyUsage();

    // 步骤 2：断言返回值逐值对账（结构、字段、顺序），且无未声明副作用
    expect(usage).toEqual({
      source: "PiModelResponses",
      quality: "Complete",
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      cache_read_tokens: 0,
      cache_write_tokens: 0,
      reasoning_tokens: 0,
      model_attempts: 0,
      usage_observed_attempts: 0,
      missing_fields: [],
    });
  });

  it("returns a fresh object each call (no shared mutable state)", () => {
    // 该返回站点的等价类：两次调用不得共享同一对象
    const a = emptyUsage();
    const b = emptyUsage();
    expect(a).not.toBe(b);
    expect(a.missing_fields).not.toBe(b.missing_fields);
  });
});
