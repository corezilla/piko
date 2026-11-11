/**
 * Case ID: UT-PI-843  ·  STATUS: real
 *
 * 责任：参数 `message: string` 的 `注入字符` 类（tool-host-policy.ts:29）
 * 维度坐标：`PolicyViolationError.constructor` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-843.md（脚本的唯一依据）
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

describe("UT-PI-843 · PolicyViolationError.constructor · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected message as data", () => {  // treats an injected message as data
    // 步骤 1：注入类——路径穿越 / 命令元字符 / SQL 元字符
    const payload = "../../etc/passwd; rm -rf /; DROP TABLE tasks; --";
    // 步骤 2：构造 PolicyViolationError
    // 步骤 3：断言实际行为——原样存下，不解释
    const error = new PolicyViolationError("invalid_request", payload);
    expect(error.message).toBe(payload);
  });
});
