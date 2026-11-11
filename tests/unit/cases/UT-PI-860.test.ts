/**
 * Case ID: UT-PI-860  ·  STATUS: real
 *
 * 责任：分支 L89 `if (!allowlist.includes(host))`（if；tool-host-policy.ts）
 * 维度坐标：`makePolicyFetch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-860.md（脚本的唯一依据）
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

describe("UT-PI-860 · makePolicyFetch · 状态分支 × 合法迁移", () => {
  it("rejects a host outside the allowlist and admits one inside", async () => {  // rejects a host outside the allowlist and admits one inside
    // 步骤 1：取真侧——allowlist.includes(host) 为假
    enterNetworkScope(["a.com"]);
    const base = vi.fn(async () => new Response("ok", { status: 200 }));
    const policy = makePolicyFetch(base as unknown as typeof fetch);
    // 步骤 2：调用并断言该侧结果
    await expect(policy("https://b.com/x")).rejects.toThrow(/not in policy allowlist/);
    expect(base).not.toHaveBeenCalled();
    // 步骤 3/4：取假侧——allowlist.includes(host) 为真
    await policy("https://a.com/x");
    expect(base).toHaveBeenCalledTimes(1);
  });
});
