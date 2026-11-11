/**
 * Case ID: UT-PI-853  ·  STATUS: real
 *
 * 责任：参数 `base: typeof fetch` 的 `每等价类合法值` 类（tool-host-policy.ts:74）
 * 维度坐标：`makePolicyFetch` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-853.md（脚本的唯一依据）
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

describe("UT-PI-853 · makePolicyFetch · 纯函数/无副作用 × 每等价类合法值", () => {
  it("wraps a resolving and a rejecting base fetch", async () => {  // wraps a resolving and a rejecting base fetch
    // 步骤 1：base 的每个等价类各一个代表值（resolve / reject）
    const ok = vi.fn(async () => new Response("ok", { status: 200 }));
    const bad = vi.fn(async () => { throw new Error("boom"); });
    // 步骤 2：调用 makePolicyFetch
    const policyOk = makePolicyFetch(ok as unknown as typeof fetch);
    const policyBad = makePolicyFetch(bad as unknown as typeof fetch);
    // 步骤 3：断言返回值逐值对账——两个 base 都被接受并被包装
    expect(typeof policyOk).toBe("function");
    expect(typeof policyBad).toBe("function");
    const response = await policyOk("https://a.com/x");
    expect(response.status).toBe(200);
    expect(ok).toHaveBeenCalledTimes(1);
    // 拒绝的 base 保真传播
    await expect(policyBad("https://a.com/x")).rejects.toThrow("boom");
    expect(bad).toHaveBeenCalledTimes(1);
  });
});
