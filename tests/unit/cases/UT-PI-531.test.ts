/**
 * Case ID: UT-PI-531  ·  STATUS: real
 *
 * 责任：参数 `base: string` 的 `注入字符` 类（provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `字符串/路径/枚举输入` × `注入字符`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-531.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-531 · preflightModelProvider · 字符串/路径/枚举输入 × 注入字符", () => {
  it("normalizes injected base strings without leaving the origin", async () => {  // normalizes injected base strings without leaving the origin
    // 步骤 1：base 的注入字符四类输入
    // ① 路径穿越串——URL 解析器把 ../ 归一化掉，但主机不变
    const traversal = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1/../../admin", "sk-test", 1000, "gpt-4o-mini");
    expect(traversal.calls[0].url).toBe("https://provider.example.com/admin/models");
    expect(new URL(traversal.calls[0].url).host).toBe("provider.example.com");
    traversal.restore();

    // ② 绝对路径穿越串——双斜杠开头的段被原样保留
    const absolute = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com//etc/passwd", "sk-test", 1000, "gpt-4o-mini");
    expect(absolute.calls[0].url).toBe("https://provider.example.com//etc/passwd/models");
    expect(new URL(absolute.calls[0].url).host).toBe("provider.example.com");
    absolute.restore();

    // ③ 控制字符——NUL 被百分号编码
    const control = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1/\u0000admin", "sk-test", 1000, "gpt-4o-mini");
    expect(control.calls[0].url).toBe("https://provider.example.com/v1/%00admin/models");
    control.restore();

    // ④ SQL / 命令元字符——空格被编码，引号与分号原样保留
    const metachar = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1/'; DROP TABLE models; --", "sk-test", 1000, "gpt-4o-mini");
    expect(metachar.calls[0].url).toBe("https://provider.example.com/v1/';%20DROP%20TABLE%20models;%20--/models");
    metachar.restore();

    // ⑤ 超长 + 注入组合串——注入片段仍在路径里，主机仍是原主机
    const combo = "https://provider.example.com/v1/" + "'; DROP TABLE models; --".repeat(200);
    const comboStub = stubFetch(modelsResponder());
    await preflightModelProvider(combo, "sk-test", 1000, "gpt-4o-mini");
    expect(comboStub.calls[0].url.startsWith("https://provider.example.com/v1/';%20DROP%20TABLE%20models;%20--")).toBe(true);
    expect(comboStub.calls[0].url.endsWith("/models")).toBe(true);
    expect(new URL(comboStub.calls[0].url).host).toBe("provider.example.com");
    comboStub.restore();
  });
});
