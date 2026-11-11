/**
 * Case ID: UT-PI-844  ·  STATUS: real
 *
 * 责任：参数 `host: string` 的 `空` 类（tool-host-policy.ts:29）
 * 维度坐标：`PolicyViolationError.constructor` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-844.md（脚本的唯一依据）
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

describe("UT-PI-844 · PolicyViolationError.constructor · 字符串/路径/枚举输入 × 空", () => {
  it("carries the empty class of the host parameter", () => {  // carries the empty class of the host parameter
    // 步骤 1：host 的空类三态——空串 / undefined（缺省）/ null（显式空值）
    // 步骤 2：构造 PolicyViolationError
    // 步骤 3：断言实际行为
    expect(new PolicyViolationError("host_not_allowed", "m", "").host).toBe("");
    expect(new PolicyViolationError("host_not_allowed", "m").host).toBeUndefined();
    expect(new PolicyViolationError("host_not_allowed", "m", null as unknown as string).host).toBeNull();
  });
});
