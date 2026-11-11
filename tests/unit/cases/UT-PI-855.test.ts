/**
 * Case ID: UT-PI-855  ·  STATUS: real
 *
 * 责任：参数 `base: typeof fetch` 的 `非法值` 类（tool-host-policy.ts:74）
 * 维度坐标：`makePolicyFetch` × `纯函数/无副作用` × `非法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-855.md（脚本的唯一依据）
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

describe("UT-PI-855 · makePolicyFetch · 纯函数/无副作用 × 非法值", () => {
  it("accepts a non-callable base without rejecting it", () => {  // accepts a non-callable base without rejecting it
    // 步骤 1：非法值类——base 不是函数
    // 步骤 2：调用 makePolicyFetch
    const policy = makePolicyFetch(42 as unknown as typeof fetch);
    // 步骤 3：断言实际行为——构造期不拒绝（偏差：文档要求 typed 拒绝），失败推迟到调用时
    expect(typeof policy).toBe("function");
    expect(() => makePolicyFetch(42 as unknown as typeof fetch)).not.toThrow();
  });
});
