/**
 * Case ID: UT-PI-836  ·  STATUS: real
 *
 * 责任：返回站点 L114 值 `base` 逐值断言（tool-host-policy.ts）
 * 维度坐标：`installNetworkPolicy` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-836.md（脚本的唯一依据）
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

describe("UT-PI-836 · installNetworkPolicy · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns the captured base on the install path", () => {  // returns the captured base on the install path
    // 步骤 1：previousFetch 为 null（先复位），走 L114
    restoreNetworkPolicy();
    const original = globalThis.fetch;
    // 步骤 2：调用 installNetworkPolicy
    const returned = installNetworkPolicy();
    // 步骤 3：断言返回值逐值对账——返回 base，即安装前的 globalThis.fetch
    expect(returned).toBe(original);
    expect(globalThis.fetch).not.toBe(original);
    expect(typeof globalThis.fetch).toBe("function");
  });
});
