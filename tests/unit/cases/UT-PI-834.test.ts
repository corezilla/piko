/**
 * Case ID: UT-PI-834  ·  STATUS: real
 *
 * 责任：分支 L110 `if (previousFetch !== null)`（if；tool-host-policy.ts）
 * 维度坐标：`installNetworkPolicy` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-834.md（脚本的唯一依据）
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

describe("UT-PI-834 · installNetworkPolicy · 状态分支 × 合法迁移", () => {
  it("installs once and short-circuits on the second call", () => {  // installs once and short-circuits on the second call
    // 步骤 1：取假侧——previousFetch 为 null（先复位）
    restoreNetworkPolicy();
    const original = globalThis.fetch;
    const first = installNetworkPolicy();
    const wrapper = globalThis.fetch;
    expect(first).toBe(original);
    expect(wrapper).not.toBe(original);
    // 步骤 2：调用 installNetworkPolicy 并断言取真侧结果
    const second = installNetworkPolicy();
    // 取真侧——返回 previousFetch（原 fetch），且不重复包装
    expect(second).toBe(original);
    expect(globalThis.fetch).toBe(wrapper);
  });
});
