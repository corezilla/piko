/**
 * Case ID: UT-PI-861  ·  STATUS: real
 *
 * 责任：分支 L89 `!allowlist.includes(host)`（!；tool-host-policy.ts）
 * 维度坐标：`makePolicyFetch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-861.md（脚本的唯一依据）
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

describe("UT-PI-861 · makePolicyFetch · 状态分支 × 合法迁移", () => {
  it("admits the host when the membership lookup returns true", async () => {  // admits the host when the membership lookup returns true
    // 步骤 1：被调方返回真值——allowlist.includes(host) 为真，!true 为假
    enterNetworkScope(["a.com"]);
    const base = vi.fn(async () => new Response("ok", { status: 200 }));
    const policy = makePolicyFetch(base as unknown as typeof fetch);
    // 步骤 2：调用并断言该侧结果——不抛错，交给 base
    const response = await policy("https://a.com/x");
    expect(response.status).toBe(200);
    expect(base).toHaveBeenCalledTimes(1);
    // 端口被剥掉后再比较：a.com:443 仍然匹配 a.com
    await policy("https://a.com:443/x");
    expect(base).toHaveBeenCalledTimes(2);
  });
});
