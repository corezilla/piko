/**
 * Case ID: UT-PI-544  ·  STATUS: real
 *
 * 责任：分支 L7 `!Array.isArray(payload?.data)`（!；provider-preflight.ts）
 * 维度坐标：`preflightModelProvider` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-544.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-544 · preflightModelProvider · 状态分支 × 合法迁移", () => {
  it("takes both sides of the array-is guard on payload.data", async () => {  // takes both sides of the array-is guard on payload.data
    // 步骤 1/2：取真侧——Array.isArray(payload?.data) 为假：对象 / 字符串两种都验
    const objectData = stubFetch(() => fakeResponse({ status: 200, json: { data: { "0": "gpt-4o-mini", length: 1 } } }));
    const fromObject = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromObject).toBeInstanceOf(Error);
    expect(fromObject.message).toBe("configured model is not available: gpt-4o-mini");
    objectData.restore();

    const stringData = stubFetch(() => fakeResponse({ status: 200, json: { data: "gpt-4o-mini" } }));
    const fromString = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromString.message).toBe("configured model is not available: gpt-4o-mini");
    stringData.restore();

    // 步骤 3/4：取假侧——data 是数组：第一个操作数为假，流程落到 .some 并命中
    const arrayData = stubFetch(modelsResponder(["gpt-4o-mini"]));
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(arrayData.calls).toHaveLength(1);
    arrayData.restore();
  });
});
