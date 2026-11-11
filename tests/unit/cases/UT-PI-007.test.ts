/**
 * Case ID: UT-PI-007  ·  STATUS: real
 *
 * 责任：`preflightModelProvider` × `错误路径` × `每个 typed 错误码`（波次一粗粒度登记；provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-007.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-007 · preflightModelProvider · 错误路径 × 每个 typed 错误码", () => {
  it("walks both sides of every branch and surfaces both error messages verbatim", async () => {  // walks both sides of every branch and surfaces both error messages verbatim
    // 步骤 1/2：L4 ternary 取真侧——base 自带尾斜杠
    const trueSide = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1/", "sk-test", 1000, "gpt-4o-mini");
    expect(trueSide.calls).toHaveLength(1);
    expect(trueSide.calls[0].url).toBe("https://provider.example.com/v1/models");
    trueSide.restore();

    // L4 ternary 取假侧——base 不带尾斜杠：实现补 "/" 后 v1 被当作目录而不是文件
    const falseSide = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini");
    expect(falseSide.calls[0].url).toBe("https://provider.example.com/v1/models");
    expect(falseSide.calls[0].url).not.toBe("https://provider.example.com/models");
    falseSide.restore();

    // L5 if 取真侧——非 2xx
    const notOk = stubFetch(() => fakeResponse({ ok: false, status: 503 }));
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini")).rejects.toThrow(
      "model provider preflight returned 503",
    );
    expect(notOk.calls).toHaveLength(1);
    notOk.restore();

    // L5 if 取假侧 + L7 if 取真侧——2xx 但目标模型不在列表
    const noModel = stubFetch(() => fakeResponse({ status: 200, json: { data: [{ id: "other-model" }] } }));
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini")).rejects.toThrow(
      "configured model is not available: gpt-4o-mini",
    );
    noModel.restore();

    // L7 if 取假侧——模型在列表里：resolve undefined
    const ok = stubFetch(modelsResponder(["gpt-4o-mini"]));
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(ok.calls[0].headers.authorization).toBe("Bearer sk-test");
    expect(ok.calls[0].signal).toBeDefined();
    expect(ok.calls[0].signal!.aborted).toBe(false);
    ok.restore();

    // 步骤 4：两处 throw 都只抛普通 Error，没有 typed code 字段，消息逐值保真
    const typedProbe = stubFetch(() => fakeResponse({ ok: false, status: 500 }));
    const failure = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(failure).toBeInstanceOf(Error);
    expect(failure.message).toBe("model provider preflight returned 500");
    expect((failure as { code?: unknown }).code).toBeUndefined();
    typedProbe.restore();

    // 步骤 5：无残留——成功路径只发一次请求，除此之外没有可观测的状态写
    const again = stubFetch(modelsResponder(["gpt-4o-mini"]));
    await preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini");
    expect(again.calls).toHaveLength(1);
    again.restore();
  });
});
