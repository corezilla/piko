/**
 * Case ID: UT-OBS-057  ·  STATUS: real
 *
 * 责任：参数 `fields: Record<string, unknown> | undefined` 的 `注入字符` 类（observability.ts:44）
 * 维度坐标：`redact` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-057.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";

describe("UT-OBS-057 · redact · 纯函数/无副作用 × 每等价类合法值", () => {
  it("treats an injected key as data, not as code", () => {
    // 步骤 1：构造含注入形态的键与值
    const fields = { "$(whoami)": "x" };

    // 步骤 2：调用 redact(fields)
    // 步骤 3：断言原样作为字符串处理，不执行
    const out = redact(fields);
    expect(out["$(whoami)"]).toBe("x");
  });

  it("does not execute a shell-like payload in a value", () => {
    // 步骤 1：构造注入形态的值
    const fields = { note: "$(rm -rf /)`; DROP TABLE users;--" };

    // 步骤 2：调用 redact(fields)
    // 步骤 3：断言只作字符串拷贝，无执行、无副作用
    const out = redact(fields);
    expect(out.note).toBe("$(rm -rf /)`; DROP TABLE users;--");
  });
});
