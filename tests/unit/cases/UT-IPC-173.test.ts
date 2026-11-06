/**
 * Case ID: UT-IPC-173  ·  STATUS: real
 *
 * 责任：参数 `code: string` 的 `注入字符` 类（types.ts:233）
 * 维度坐标：`PikoError.constructor` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `IPC`）
 * 用例文档：docs/70_verification/unit/cases/UT-IPC-173.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { PikoError } from "../../../src/types.js";

describe("UT-IPC-173 · PikoError.constructor · 字符串/路径/枚举输入 × 注入字符", () => {
  it("keeps an injected code as data, not as a command", () => {
    // 步骤 1：构造注入形态的 code
    const code = "$(rm -rf /)`; DROP TABLE x;--";

    // 步骤 2：构造 PikoError
    const error = new PikoError(code, 500, "boom");

    // 步骤 3：断言原样保留、不执行
    expect(error.code).toBe(code);
  });
});
