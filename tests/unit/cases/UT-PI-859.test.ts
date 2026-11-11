/**
 * Case ID: UT-PI-859  ·  STATUS: real
 *
 * 责任：分支 L82 `catch ("invalid_request", `not a URL: ${urlSt…`（catch；tool-host-policy.ts）
 * 维度坐标：`makePolicyFetch` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-859.md（脚本的唯一依据）
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

describe("UT-PI-859 · makePolicyFetch · 错误路径 × 每个 typed 错误码", () => {
  it("takes both sides of the URL parse guard", async () => {  // takes both sides of the URL parse guard
    // 步骤 1：取真侧——URL 解析失败，进入 catch
    enterNetworkScope(["a.com"]);
    const base = vi.fn(async () => new Response("ok", { status: 200 }));
    const policy = makePolicyFetch(base as unknown as typeof fetch);
    // 步骤 2：调用并断言该侧结果
    await expect(policy("::not a url::")).rejects.toThrow(PolicyViolationError);
    expect(base).not.toHaveBeenCalled();
    // 步骤 3/4：取假侧——URL 解析成功，块被跳过
    await policy("https://a.com/x");
    expect(base).toHaveBeenCalledTimes(1);
  });
});
