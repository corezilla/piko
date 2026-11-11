/**
 * Case ID: UT-PI-837  ·  STATUS: real
 *
 * 责任：分支 L122 `if (previousFetch !== null)`（if；tool-host-policy.ts）
 * 维度坐标：`restoreNetworkPolicy` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-837.md（脚本的唯一依据）
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

describe("UT-PI-837 · restoreNetworkPolicy · 状态分支 × 合法迁移", () => {
  it("restores the previous fetch only when one was installed", () => {  // restores the previous fetch only when one was installed
    // 步骤 1：取真侧——先安装，再恢复
    restoreNetworkPolicy();
    const original = globalThis.fetch;
    installNetworkPolicy();
    expect(globalThis.fetch).not.toBe(original);
    // 步骤 2：调用 restoreNetworkPolicy 并断言该侧结果
    restoreNetworkPolicy();
    expect(globalThis.fetch).toBe(original);
    // 步骤 3/4：取假侧——previousFetch 为 null 时不碰 globalThis.fetch
    const sentinel = (async () => new Response("s", { status: 200 })) as unknown as typeof fetch;
    vi.stubGlobal("fetch", sentinel);
    restoreNetworkPolicy();
    expect(globalThis.fetch).toBe(sentinel);
    vi.unstubAllGlobals();
    // 恢复动作同时清空允许列表
    enterNetworkScope(["a.com"]);
    restoreNetworkPolicy();
    expect(currentAllowlist()).toBeNull();
  });
});
