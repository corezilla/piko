/**
 * Case ID: UT-PI-852  ·  STATUS: real
 *
 * 责任：参数 `allowlist: readonly string[]` 的 `注入字符` 类（tool-host-policy.ts:52）
 * 维度坐标：`enterNetworkScope` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-852.md（脚本的唯一依据）
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

describe("UT-PI-852 · enterNetworkScope · 字符串/路径/枚举输入 × 注入字符", () => {
  it("treats an injected allowlist entry as data", async () => {  // treats an injected allowlist entry as data
    // 步骤 1：注入类——路径穿越 / 命令元字符 / SQL 元字符
    const hostile = ["../../etc/passwd", "evil.com; rm -rf /", "evil.com' OR 1=1 --"];
    // 步骤 2：调用 enterNetworkScope
    // 步骤 3：断言实际行为——不净化，原样存下
    enterNetworkScope(hostile);
    expect(currentAllowlist()).toBe(hostile);
    // 注入串永远匹配不到真实主机（允许列表按精确字符串匹配）
    const base = vi.fn(async () => new Response("ok", { status: 200 }));
    const policy = makePolicyFetch(base as unknown as typeof fetch);
    await expect(policy("https://evil.com/x")).rejects.toThrow(/host_not_allowed|not in policy allowlist/);
    expect(base).not.toHaveBeenCalled();
  });
});
