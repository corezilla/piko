/**
 * Case ID: UT-PI-530  ·  STATUS: real
 *
 * 责任：参数 `base: string` 的 `超长` 类（provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-530.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-530 · preflightModelProvider · 字符串/路径/枚举输入 × 超长", () => {
  it("accepts an oversized base and keeps the whole path in the request URL", async () => {  // accepts an oversized base and keeps the whole path in the request URL
    // 步骤 1：base 长度 2×4096 = 8192（源码没有比较常量，取 4096 作上限）
    const prefix = "https://provider.example.com/v1/";
    const filler = "a".repeat(2 * 4096 - prefix.length);
    const base = prefix + filler;
    expect(base.length).toBe(8192);

    // 步骤 2/3：请求照发，URL 里整段超长路径都在，只在末尾追加 models
    const stub = stubFetch(modelsResponder());
    await expect(preflightModelProvider(base, "sk-test", 1000, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(stub.calls).toHaveLength(1);
    expect(stub.calls[0].url).toBe(`${prefix}${filler}/models`);
    expect(stub.calls[0].url.length).toBe(base.length + "/models".length);
    stub.restore();
  });
});
