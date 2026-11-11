/**
 * Case ID: UT-PI-864  ·  STATUS: real
 *
 * 责任：返回站点 L75 值 `(async (input: RequestInfo | URL, init?…` 逐值断言（tool-host-policy.ts）
 * 维度坐标：`makePolicyFetch` × `纯函数/无副作用` × `每等价类合法值`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-864.md（脚本的唯一依据）
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

describe("UT-PI-864 · makePolicyFetch · 纯函数/无副作用 × 每等价类合法值", () => {
  it("returns an async function from the wrapper factory", () => {  // returns an async function from the wrapper factory
    // 步骤 1：构造使 L75 的返回站点被到达的输入
    const base = vi.fn(async () => new Response("ok", { status: 200 }));
    // 步骤 2：调用 makePolicyFetch
    const policy = makePolicyFetch(base as unknown as typeof fetch);
    // 步骤 3：断言返回值逐值对账——是一个异步函数
    expect(typeof policy).toBe("function");
    expect(policy.constructor.name).toBe("AsyncFunction");
    expect(policy.length).toBe(2);
  });
});
