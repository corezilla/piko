/**
 * Case ID: UT-PI-845  ·  STATUS: real
 *
 * 责任：参数 `host: string` 的 `超长` 类（tool-host-policy.ts:29）
 * 维度坐标：`PolicyViolationError.constructor` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-845.md（脚本的唯一依据）
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

describe("UT-PI-845 · PolicyViolationError.constructor · 字符串/路径/枚举输入 × 超长", () => {
  it("keeps an over-long host verbatim", () => {  // keeps an over-long host verbatim
    // 步骤 1：超长类——长度 2×4096
    const long = "h".repeat(8192);
    // 步骤 2：构造 PolicyViolationError
    // 步骤 3：断言实际行为——不截断、不拒绝
    const error = new PolicyViolationError("host_not_allowed", "m", long);
    expect(error.host).toHaveLength(8192);
    expect(error.host).toBe(long);
  });
});
