/**
 * Case ID: UT-PI-835  ·  STATUS: real
 *
 * 责任：返回站点 L110 值 `previousFetch` 逐值断言（tool-host-policy.ts）
 * 维度坐标：`installNetworkPolicy` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-835.md（脚本的唯一依据）
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

describe("UT-PI-835 · installNetworkPolicy · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the saved previous fetch on the short-circuit path", () => {  // returns the saved previous fetch on the short-circuit path
    // 步骤 1：先安装一次，使 previousFetch 非 null
    restoreNetworkPolicy();
    const original = globalThis.fetch;
    installNetworkPolicy();
    const wrapper = globalThis.fetch;
    // 步骤 2：再次调用 installNetworkPolicy（命中 L110 的提前返回）
    const returned = installNetworkPolicy();
    // 步骤 3：断言返回值逐值对账——返回的是 previousFetch，不是包装后的 fetch
    expect(returned).toBe(original);
    expect(returned).not.toBe(wrapper);
  });
});
