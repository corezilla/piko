/**
 * Case ID: UT-OBS-055  ·  STATUS: real
 *
 * 责任：参数 `fields: Record<string, unknown> | undefined` 的 `空` 类（observability.ts:44）
 * 维度坐标：`redact` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `OBS`）
 * 用例文档：docs/70_verification/unit/cases/UT-OBS-055.md（脚本的唯一依据）
 */
import { describe, expect, it } from "vitest";
import { Observability, redact } from "../../../src/observability.js";

describe("UT-OBS-055 · redact · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns an empty record for an undefined input", () => {
    // 步骤 1：构造 fields＝undefined（缺省态）
    // 步骤 2：调用 redact(undefined)
    // 步骤 3：断言返回空对象、无字段泄漏
    expect(redact(undefined)).toEqual({});
  });

  it("returns an empty record for an empty input", () => {
    // 步骤 1：构造 fields＝{}
    expect(redact({})).toEqual({});
  });
});
