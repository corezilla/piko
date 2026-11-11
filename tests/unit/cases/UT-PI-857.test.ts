/**
 * Case ID: UT-PI-857  ·  STATUS: real
 *
 * 责任：分支 L77 `allowlist !== null && allowlist.length > 0`（&&；tool-host-policy.ts）
 * 维度坐标：`makePolicyFetch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-857.md（脚本的唯一依据）
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

describe("UT-PI-857 · makePolicyFetch · 状态分支 × 合法迁移", () => {
  it("treats an empty active scope as no restriction", async () => {  // treats an empty active scope as no restriction
    // 步骤 1：&& 的取真侧——allowlist 非 null 且长度 > 0
    enterNetworkScope(["a.com"]);
    const base = vi.fn(async () => new Response("ok", { status: 200 }));
    const policy = makePolicyFetch(base as unknown as typeof fetch);
    await expect(policy("https://b.com/x")).rejects.toThrow(/not in policy allowlist/);
    expect(base).not.toHaveBeenCalled();
    // 步骤 3/4：&& 的取假侧——allowlist 非 null 但长度 == 0（第二个操作数为假）
    enterNetworkScope([]);
    await policy("https://b.com/x");
    expect(base).toHaveBeenCalledTimes(1);
  });
});
