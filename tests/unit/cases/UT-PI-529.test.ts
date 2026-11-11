/**
 * Case ID: UT-PI-529  ·  STATUS: real
 *
 * 责任：参数 `base: string` 的 `空` 类（provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-529.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-529 · preflightModelProvider · 字符串/路径/枚举输入 × 空", () => {
  it("rejects an empty base with a TypeError before any request is sent", async () => {  // rejects an empty base with a TypeError before any request is sent
    // 步骤 1：base 的三态空值——空串 / undefined / null
    // 空串：拼成 "/" 后 new URL 的 base 不是绝对地址 → ERR_INVALID_URL
    const emptyString = stubFetch(modelsResponder());
    await expect(preflightModelProvider("", "sk-test", 1000, "gpt-4o-mini")).rejects.toThrow(TypeError);
    await expect(preflightModelProvider("", "sk-test", 1000, "gpt-4o-mini")).rejects.toThrow("Invalid URL");
    expect(emptyString.calls).toHaveLength(0);
    emptyString.restore();

    // undefined：base.endsWith 上直接抛 TypeError
    const undefinedBase = stubFetch(modelsResponder());
    await expect(preflightModelProvider(undefined as unknown as string, "sk-test", 1000, "gpt-4o-mini")).rejects.toThrow(
      "Cannot read properties of undefined (reading 'endsWith')",
    );
    expect(undefinedBase.calls).toHaveLength(0);
    undefinedBase.restore();

    // null：同上
    const nullBase = stubFetch(modelsResponder());
    await expect(preflightModelProvider(null as unknown as string, "sk-test", 1000, "gpt-4o-mini")).rejects.toThrow(
      "Cannot read properties of null (reading 'endsWith')",
    );
    expect(nullBase.calls).toHaveLength(0);
    nullBase.restore();
  });
});
