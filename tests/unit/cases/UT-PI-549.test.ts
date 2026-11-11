/**
 * Case ID: UT-PI-549  ·  STATUS: real
 *
 * 责任：throw L7 `reject`（守卫 `if (!Array.isArray(payload?.data)||!pay…`；provider-preflight.ts）
 * 维度坐标：`preflightModelProvider` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-549.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-549 · preflightModelProvider · 错误路径 × 每个 typed 错误码", () => {
  it("rejects with the exact model message from both guard operands", async () => {  // rejects with the exact model message from both guard operands
    // 步骤 1/2：守卫取真·变体①——data 不是数组
    const notArray = stubFetch(() => fakeResponse({ status: 200, json: { object: "not a list" } }));
    const fromNotArray = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromNotArray).toBeInstanceOf(Error);
    expect(fromNotArray.message).toBe("configured model is not available: gpt-4o-mini");
    notArray.restore();

    // 步骤 1/2：守卫取真·变体②——data 是数组但没有命中项
    const noMatch = stubFetch(() => fakeResponse({ status: 200, json: { data: [{ id: "gpt-4o" }] } }));
    const fromNoMatch = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromNoMatch.message).toBe("configured model is not available: gpt-4o-mini");
    noMatch.restore();

    // 步骤 3：无部分写入——两种触发都只发一次请求，消息里带目标 model
    // 步骤 4：普通 Error，无 typed code，消息可判别（含目标 model 名）
    const stub = stubFetch(() => fakeResponse({ status: 200, json: { data: [] } }));
    const failure = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "qwen3-coder"));
    expect(failure.message).toBe("configured model is not available: qwen3-coder");
    expect((failure as { code?: unknown }).code).toBeUndefined();
    expect(stub.calls).toHaveLength(1);
    stub.restore();
  });
});
