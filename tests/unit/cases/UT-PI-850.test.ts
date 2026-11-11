/**
 * Case ID: UT-PI-850  ·  STATUS: real
 *
 * 责任：参数 `allowlist: readonly string[]` 的 `空` 类（tool-host-policy.ts:52）
 * 维度坐标：`enterNetworkScope` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-850.md（脚本的唯一依据）
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

describe("UT-PI-850 · enterNetworkScope · 字符串/路径/枚举输入 × 空", () => {
  it("accepts the empty class of the allowlist parameter", async () => {  // accepts the empty class of the allowlist parameter
    // 步骤 1：空类三态——空数组 / undefined（缺省）/ null（显式空值）
    // 步骤 2：调用 enterNetworkScope
    // 步骤 3：断言实际行为
    enterNetworkScope([]);
    expect(currentAllowlist()).toEqual([]);
    // 空数组的语义是「不限制」——策略放行
    const base = vi.fn(async () => new Response("ok", { status: 200 }));
    const policy = makePolicyFetch(base as unknown as typeof fetch);
    enterNetworkScope([]);
    await policy("https://any.example/x");
    expect(base).toHaveBeenCalledTimes(1);
    // null 与 undefined 不等价：null 让策略短路（放行），undefined 让策略在读 .length 时崩
    enterNetworkScope(null as unknown as readonly string[]);
    expect(currentAllowlist()).toBeNull();
    await policy("https://any.example/x");
    expect(base).toHaveBeenCalledTimes(2);
    enterNetworkScope(undefined as unknown as readonly string[]);
    expect(currentAllowlist()).toBeUndefined();
    await expect(policy("https://any.example/x")).rejects.toThrow(TypeError);
  });
});
