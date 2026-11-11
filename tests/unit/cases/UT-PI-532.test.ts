/**
 * Case ID: UT-PI-532  ·  STATUS: real
 *
 * 责任：参数 `key: string` 的 `空` 类（provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-532.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-532 · preflightModelProvider · 字符串/路径/枚举输入 × 空", () => {
  it("forwards an empty key verbatim in the authorization header", async () => {  // forwards an empty key verbatim in the authorization header
    // 步骤 1：key 的三态空值——实现没有校验，原样拼进 authorization
    const emptyString = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1", "", 1000, "gpt-4o-mini");
    expect(emptyString.calls).toHaveLength(1);
    expect(emptyString.calls[0].headers.authorization).toBe("Bearer ");
    emptyString.restore();

    const undefinedKey = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1", undefined as unknown as string, 1000, "gpt-4o-mini");
    expect(undefinedKey.calls[0].headers.authorization).toBe("Bearer undefined");
    undefinedKey.restore();

    const nullKey = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1", null as unknown as string, 1000, "gpt-4o-mini");
    expect(nullKey.calls[0].headers.authorization).toBe("Bearer null");
    nullKey.restore();
  });
});
