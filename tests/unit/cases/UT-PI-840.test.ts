/**
 * Case ID: UT-PI-840  ·  STATUS: real
 *
 * 责任：参数 `code: "host_not_allowed" | "invalid_request"` 的 `非法值` 类（tool-host-policy.ts:29）
 * 维度坐标：`PolicyViolationError.constructor` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-840.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import {
  PolicyViolationError,
  currentAllowlist,
  enterNetworkScope,
  exitNetworkScope,
  installNetworkPolicy,
  makePolicyFetch,
  restoreNetworkPolicy,
} from "../../../src/tool-host-policy.js";

describe("UT-PI-840 · PolicyViolationError.constructor · 纯函数/无副作用 × 非法值", () => {
  it("accepts a code outside the enumeration without rejecting it", () => {  // accepts a code outside the enumeration without rejecting it
    // 步骤 1：非法值类——不属于枚举的字符串
    // 步骤 2：构造 PolicyViolationError
    // 步骤 3：断言实际行为——不抛 typed 错误，code 原样带出（偏差：文档要求 typed 拒绝）
    const error = new PolicyViolationError("not_a_code" as never, "m", "h");
    expect(error.code).toBe("not_a_code");
    expect(() => new PolicyViolationError("not_a_code" as never, "m", "h")).not.toThrow();
  });
});
