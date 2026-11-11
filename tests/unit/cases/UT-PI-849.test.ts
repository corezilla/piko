/**
 * Case ID: UT-PI-849  ·  STATUS: real
 *
 * 责任：返回站点 L49 值 `activeAllowlist` 逐值断言（tool-host-policy.ts）
 * 维度坐标：`currentAllowlist` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-849.md（脚本的唯一依据）
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

describe("UT-PI-849 · currentAllowlist · 纯函数/无副作用 × 每等价类合法值", () => {
  it("reports the module-scoped active allowlist", () => {  // reports the module-scoped active allowlist
    // 步骤 1：构造使 L49 的返回站点被到达的三种状态
    exitNetworkScope();
    // 步骤 2：调用 currentAllowlist
    // 步骤 3：断言返回值逐值对账
    expect(currentAllowlist()).toBeNull();
    const allowlist = ["a.com", "b.com"];
    enterNetworkScope(allowlist);
    expect(currentAllowlist()).toBe(allowlist);
    enterNetworkScope([]);
    expect(currentAllowlist()).toEqual([]);
    exitNetworkScope();
    expect(currentAllowlist()).toBeNull();
  });
});
