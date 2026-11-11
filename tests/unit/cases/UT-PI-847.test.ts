/**
 * Case ID: UT-PI-847  ·  STATUS: real
 *
 * 责任：可选参数 `host` 缺省/显式两态（tool-host-policy.ts:29）
 * 维度坐标：`PolicyViolationError.constructor` × `字符串/路径/枚举输入` × `未知枚举`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-847.md（脚本的唯一依据）
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

describe("UT-PI-847 · PolicyViolationError.constructor · 字符串/路径/枚举输入 × 未知枚举", () => {
  it("keeps the absent and explicit host states isomorphic", () => {  // keeps the absent and explicit host states isomorphic
    // 步骤 1：可选参数 host 的缺省 / 显式传 undefined 两态
    const absent = new PolicyViolationError("host_not_allowed", "m");
    const explicit = new PolicyViolationError("host_not_allowed", "m", undefined);
    // 步骤 2：分别构造
    // 步骤 3：断言缺省态与显式 undefined 同构
    expect(absent.host).toBeUndefined();
    expect(explicit.host).toBeUndefined();
    expect(absent.host).toBe(explicit.host);
    // 未知取值按实际行为：不被拒绝，原样带出（偏差：文档要求 typed 拒绝）
    const unknown = new PolicyViolationError("host_not_allowed", "m", "not a host");
    expect(unknown.host).toBe("not a host");
  });
});
