/**
 * Case ID: UT-PI-838  ·  STATUS: real
 *
 * 责任：参数 `code: "host_not_allowed" | "invalid_request"` 的 `每等价类合法值` 类（tool-host-policy.ts:29）
 * 维度坐标：`PolicyViolationError.constructor` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-838.md（脚本的唯一依据）
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

describe("UT-PI-838 · PolicyViolationError.constructor · 纯函数/无副作用 × 每等价类合法值", () => {
  it("keeps each member of the code enumeration", () => {  // keeps each member of the code enumeration
    // 步骤 1：code 的每个等价类各一个代表值
    // 步骤 2：构造 PolicyViolationError
    // 步骤 3：断言返回值逐值对账
    expect(new PolicyViolationError("host_not_allowed", "m", "h").code).toBe("host_not_allowed");
    expect(new PolicyViolationError("invalid_request", "m", "h").code).toBe("invalid_request");
  });
});
