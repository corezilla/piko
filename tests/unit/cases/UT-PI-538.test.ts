/**
 * Case ID: UT-PI-538  ·  STATUS: real
 *
 * 责任：参数 `model: string` 的 `空` 类（provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `字符串/路径/枚举输入` × `空`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-538.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-538 · preflightModelProvider · 字符串/路径/枚举输入 × 空", () => {
  it("matches an empty model only against an entry whose id is exactly empty", async () => {  // matches an empty model only against an entry whose id is exactly empty
    // 步骤 1：model 的三态空值
    // 空串：只有 id 为空串的条目才命中
    const emptyString = stubFetch(modelsResponder([""]));
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "")).resolves.toBeUndefined();
    emptyString.restore();

    // 空串但列表里没有空 id → 逐值对账的错误消息
    const emptyStringMiss = stubFetch(modelsResponder(["gpt-4o-mini"]));
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "")).rejects.toThrow(
      "configured model is not available: ",
    );
    emptyStringMiss.restore();

    // undefined：item?.id 为 undefined 的条目与 undefined 严格相等 → 命中
    const undefinedModel = stubFetch(() =>
      fakeResponse({ status: 200, json: { data: [{ id: "gpt-4o-mini" }, { name: "no-id" }] } }),
    );
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, undefined as unknown as string)).resolves.toBeUndefined();
    undefinedModel.restore();

    // null：列表里没有 id 为 null 的条目 → 逐值对账的错误消息
    const nullModel = stubFetch(modelsResponder(["gpt-4o-mini"]));
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, null as unknown as string)).rejects.toThrow(
      "configured model is not available: null",
    );
    nullModel.restore();
  });
});
