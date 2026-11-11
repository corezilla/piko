/**
 * Case ID: UT-PI-534  ·  STATUS: real
 *
 * 责任：参数 `key: string` 的 `注入字符` 类（provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-534.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-534 · preflightModelProvider · 字符串/路径/枚举输入 × 注入字符", () => {
  it("forwards injected key characters verbatim without sanitizing them", async () => {  // forwards injected key characters verbatim without sanitizing them
    // 步骤 1：key 的注入字符四类输入
    // ① 路径穿越串
    const traversal = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1", "../../etc/passwd", 1000, "gpt-4o-mini");
    expect(traversal.calls[0].headers.authorization).toBe("Bearer ../../etc/passwd");
    traversal.restore();

    // ② 控制字符——不转义、不丢弃
    const control = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1", "sk\u0000\u0007key", 1000, "gpt-4o-mini");
    expect(control.calls[0].headers.authorization).toBe("Bearer sk\u0000\u0007key");
    control.restore();

    // ③ SQL / 命令元字符
    const metachar = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1", "sk'; DROP TABLE keys; --", 1000, "gpt-4o-mini");
    expect(metachar.calls[0].headers.authorization).toBe("Bearer sk'; DROP TABLE keys; --");
    metachar.restore();

    // ④ 超长 + 注入组合串——只影响头，不影响 URL
    const long = "sk" + "'; rm -rf /; ".repeat(400);
    const combo = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1", long, 1000, "gpt-4o-mini");
    expect(combo.calls[0].headers.authorization).toBe(`Bearer ${long}`);
    expect(combo.calls[0].url).toBe("https://provider.example.com/v1/models");
    combo.restore();
  });
});
