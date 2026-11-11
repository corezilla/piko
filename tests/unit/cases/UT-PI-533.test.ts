/**
 * Case ID: UT-PI-533  ·  STATUS: real
 *
 * 责任：参数 `key: string` 的 `超长` 类（provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-533.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-533 · preflightModelProvider · 字符串/路径/枚举输入 × 超长", () => {
  it("forwards an oversized key verbatim in the authorization header", async () => {  // forwards an oversized key verbatim in the authorization header
    // 步骤 1：key 长度 2×4096 = 8192
    const key = "k".repeat(2 * 4096);
    expect(key.length).toBe(8192);

    // 步骤 2/3：请求照发，头里是完整的 8192 字符 key
    const stub = stubFetch(modelsResponder());
    await expect(preflightModelProvider("https://provider.example.com/v1", key, 1000, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(stub.calls).toHaveLength(1);
    expect(stub.calls[0].headers.authorization).toBe(`Bearer ${key}`);
    expect(stub.calls[0].headers.authorization.length).toBe(key.length + "Bearer ".length);
    stub.restore();
  });
});
