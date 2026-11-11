/**
 * Case ID: UT-PI-854  ·  STATUS: real
 *
 * 责任：参数 `base: typeof fetch` 的 `边界(上/下/零/空/满)` 类（tool-host-policy.ts:74）
 * 维度坐标：`makePolicyFetch` × `纯函数/无副作用` × `边界(上/下/零/空/满)`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-854.md（脚本的唯一依据）
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

describe("UT-PI-854 · makePolicyFetch · 纯函数/无副作用 × 边界(上/下/零/空/满)", () => {
  it("accepts an absent base and defers the failure to the call", () => {  // accepts an absent base and defers the failure to the call
    // 步骤 1：边界类——base 为 undefined / null
    // 步骤 2：调用 makePolicyFetch
    const policyUndefined = makePolicyFetch(undefined as unknown as typeof fetch);
    const policyNull = makePolicyFetch(null as unknown as typeof fetch);
    // 步骤 3：断言实际行为——构造期不校验、不抛错，失败推迟到调用时
    expect(typeof policyUndefined).toBe("function");
    expect(typeof policyNull).toBe("function");
    expect(() => makePolicyFetch(undefined as unknown as typeof fetch)).not.toThrow();
  });
});
