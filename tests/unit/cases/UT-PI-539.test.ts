/**
 * Case ID: UT-PI-539  ·  STATUS: real
 *
 * 责任：参数 `model: string` 的 `超长` 类（provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `字符串/路径/枚举输入` × `超长`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-539.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-539 · preflightModelProvider · 字符串/路径/枚举输入 × 超长", () => {
  it("matches an oversized model only against an entry with the same oversized id", async () => {  // matches an oversized model only against an entry with the same oversized id
    // 步骤 1：model 长度 2×4096 = 8192
    const model = "m".repeat(2 * 4096);
    expect(model.length).toBe(8192);

    // 步骤 2/3：列表里有同一个超长 id → 命中
    const hit = stubFetch(modelsResponder([model]));
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, model)).resolves.toBeUndefined();
    hit.restore();

    // 列表里没有 → 错误消息里带完整的超长 model
    const miss = stubFetch(modelsResponder(["gpt-4o-mini"]));
    const failure = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, model));
    expect(failure.message).toBe(`configured model is not available: ${model}`);
    expect(failure.message.length).toBe("configured model is not available: ".length + 8192);
    miss.restore();
  });
});
