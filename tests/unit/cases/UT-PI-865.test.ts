/**
 * Case ID: UT-PI-865  ·  STATUS: real
 *
 * 责任：返回站点 L97 值 `base(input as RequestInfo, init)` 逐值断言（tool-host-policy.ts）
 * 维度坐标：`makePolicyFetch` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-865.md（脚本的唯一依据）
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

describe("UT-PI-865 · makePolicyFetch · 纯函数/无副作用 × 每等价类合法值", () => {
  it("delegates to the base fetch with the same arguments", async () => {  // delegates to the base fetch with the same arguments
    // 步骤 1：构造使 L97 的返回站点被到达的输入
    const calls: { input: unknown; init?: RequestInit }[] = [];
    const base = vi.fn(async (input: unknown, init?: RequestInit) => {
      calls.push({ input, init });
      return new Response("payload", { status: 202 });
    });
    const policy = makePolicyFetch(base as unknown as typeof fetch);
    // 步骤 2：调用包装出来的 fetch
    const init = { method: "POST", headers: { "x-a": "1" } };
    const response = await policy("https://a.com/x", init);
    // 步骤 3：断言返回值逐值对账——base 收到同样的入参，返回值原样透出
    expect(response.status).toBe(202);
    await response.text();
    expect(base).toHaveBeenCalledTimes(1);
    expect(calls[0]!.input).toBe("https://a.com/x");
    expect(calls[0]!.init).toBe(init);
  });
});
