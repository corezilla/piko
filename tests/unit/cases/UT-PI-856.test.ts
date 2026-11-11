/**
 * Case ID: UT-PI-856  ·  STATUS: real
 *
 * 责任：分支 L77 `if (allowlist !== null && allowlist.length > …`（if；tool-host-policy.ts）
 * 维度坐标：`makePolicyFetch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-856.md（脚本的唯一依据）
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

describe("UT-PI-856 · makePolicyFetch · 状态分支 × 合法迁移", () => {
  it("enforces only inside a non-empty active scope", async () => {  // enforces only inside a non-empty active scope
    // 步骤 1：取真侧——allowlist 非 null 且长度 > 0
    exitNetworkScope();
    enterNetworkScope(["a.com"]);
    const base = vi.fn(async () => new Response("ok", { status: 200 }));
    const policy = makePolicyFetch(base as unknown as typeof fetch);
    // 步骤 2：调用并断言该侧结果——块内被执行，越权主机被拒
    await expect(policy("https://b.com/x")).rejects.toThrow(/not in policy allowlist/);
    expect(base).not.toHaveBeenCalled();
    // 步骤 3/4：取假侧——allowlist 为 null（无作用域），整块被跳过
    exitNetworkScope();
    await policy("https://b.com/x");
    expect(base).toHaveBeenCalledTimes(1);
  });
});
