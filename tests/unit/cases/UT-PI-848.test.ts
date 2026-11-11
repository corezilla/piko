/**
 * Case ID: UT-PI-848  ·  STATUS: real
 *
 * 责任：状态写 L35 → `this.name`（tool-host-policy.ts）
 * 维度坐标：`PolicyViolationError.constructor` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-848.md（脚本的唯一依据）
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

describe("UT-PI-848 · PolicyViolationError.constructor · 状态分支 × 合法迁移", () => {
  it("names the error after its class", () => {  // names the error after its class
    // 步骤 1：构造前置状态——合法等价类的构造参数
    // 步骤 2：构造 PolicyViolationError
    // 步骤 3：读回 this.name 逐值对账
    const error = new PolicyViolationError("host_not_allowed", "m", "h");
    expect(error.name).toBe("PolicyViolationError");
    expect(error instanceof Error).toBe(true);
  });
});
