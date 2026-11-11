/**
 * Case ID: UT-PI-851  ·  STATUS: real
 *
 * 责任：参数 `allowlist: readonly string[]` 的 `超长` 类（tool-host-policy.ts:52）
 * 维度坐标：`enterNetworkScope` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-851.md（脚本的唯一依据）
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

describe("UT-PI-851 · enterNetworkScope · 字符串/路径/枚举输入 × 超长", () => {
  it("keeps an over-long allowlist verbatim", async () => {  // keeps an over-long allowlist verbatim
    // 步骤 1：超长类——4096 个主机名（源码无比较常量，取默认上限 4096）
    const allowlist = Array.from({ length: 4096 }, (_, i) => `host${i}.example`);
    // 步骤 2：调用 enterNetworkScope
    // 步骤 3：断言实际行为——不截断、不拒绝，原样存下
    enterNetworkScope(allowlist);
    expect(currentAllowlist()).toHaveLength(4096);
    expect(currentAllowlist()).toBe(allowlist);
    // 末尾那一条仍然生效（允许列表按精确字符串匹配）
    const base = vi.fn(async () => new Response("ok", { status: 200 }));
    const policy = makePolicyFetch(base as unknown as typeof fetch);
    await policy("https://host4095.example/x");
    expect(base).toHaveBeenCalledTimes(1);
  });
});
