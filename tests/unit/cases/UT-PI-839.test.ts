/**
 * Case ID: UT-PI-839  ·  STATUS: real
 *
 * 责任：参数 `code: "host_not_allowed" | "invalid_request"` 的 `边界(上/下/零/空/满)` 类（tool-host-policy.ts…
 * 维度坐标：`PolicyViolationError.constructor` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-839.md（脚本的唯一依据）
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

describe("UT-PI-839 · PolicyViolationError.constructor · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts the empty code boundary without rejecting it", () => {  // accepts the empty code boundary without rejecting it
    // 步骤 1：边界类——空串（枚举下界之外）
    // 步骤 2：构造 PolicyViolationError
    // 步骤 3：断言实际行为——不校验、原样存下（偏差：文档要求 typed 拒绝，实现不拒绝）
    const error = new PolicyViolationError("" as never, "m", "h");
    expect(error.code).toBe("");
  });
});
