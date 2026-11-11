/**
 * Case ID: UT-PI-858  ·  STATUS: real
 *
 * 责任：分支 L78 `? typeof input === "string" :`（ternary；tool-host-policy.ts）
 * 维度坐标：`makePolicyFetch` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-858.md（脚本的唯一依据）
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

describe("UT-PI-858 · makePolicyFetch · 状态分支 × 合法迁移", () => {
  it("reads a string input directly and stringifies other inputs", async () => {  // reads a string input directly and stringifies other inputs
    // 步骤 1：取真侧——input 是字符串
    enterNetworkScope(["a.com"]);
    const policy = makePolicyFetch((async () => new Response("ok", { status: 200 })) as unknown as typeof fetch);
    await expect(policy("not a url")).rejects.toThrow(/^not a URL: not a url$/);
    // 步骤 3/4：取假侧——input 不是字符串，走 input.toString()
    const object = { toString: () => "not a url" };
    await expect(policy(object as unknown as RequestInfo)).rejects.toThrow(/^not a URL: not a url$/);
  });
});
