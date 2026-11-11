/**
 * Case ID: UT-PI-540  ·  STATUS: real
 *
 * 责任：参数 `model: string` 的 `注入字符` 类（provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-540.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-540 · preflightModelProvider · 字符串/路径/枚举输入 × 注入字符", () => {
  it("compares injected model strings verbatim without sanitizing them", async () => {  // compares injected model strings verbatim without sanitizing them
    // 步骤 1：model 的注入字符四类输入
    // ① 路径穿越串——命中时严格相等即可
    const traversal = "gpt/../../etc/passwd";
    const hit = stubFetch(modelsResponder([traversal]));
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, traversal)).resolves.toBeUndefined();
    hit.restore();

    // ② 控制字符——原样进比较，原样进错误消息
    const control = "gpt\u0000\u0007model";
    const controlStub = stubFetch(modelsResponder(["gpt-4o-mini"]));
    const controlFailure = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, control));
    expect(controlFailure.message).toBe(`configured model is not available: ${control}`);
    controlStub.restore();

    // ③ SQL / 命令元字符
    const metachar = "'; DROP TABLE models; --";
    const metacharStub = stubFetch(modelsResponder(["gpt-4o-mini"]));
    const metacharFailure = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, metachar));
    expect(metacharFailure.message).toBe(`configured model is not available: ${metachar}`);
    metacharStub.restore();

    // ④ 超长 + 注入组合串
    const combo = "'; rm -rf /; " + "x".repeat(2 * 4096);
    const comboStub = stubFetch(modelsResponder(["gpt-4o-mini"]));
    const comboFailure = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, combo));
    expect(comboFailure.message).toBe(`configured model is not available: ${combo}`);
    comboStub.restore();
  });
});
