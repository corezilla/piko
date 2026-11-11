/**
 * Case ID: UT-PI-548  ·  STATUS: real
 *
 * 责任：throw L5 `reject`（守卫 `if (!response.ok)`；provider-preflight.ts）
 * 维度坐标：`preflightModelProvider` × `错误路径` × `每个 typed 错误码`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-548.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-548 · preflightModelProvider · 错误路径 × 每个 typed 错误码", () => {
  it("rejects with the exact status message for every non-ok status", async () => {  // rejects with the exact status message for every non-ok status
    // 步骤 1/2：守卫 if (!response.ok) 取真——逐值对账 401/404/429/500/503
    for (const status of [401, 404, 429, 500, 503]) {
      const stub = stubFetch(() => fakeResponse({ ok: false, status }));
      const failure = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
      expect(failure).toBeInstanceOf(Error);
      expect(failure.message).toBe(`model provider preflight returned ${status}`);
      // 步骤 3：无部分写入——只发一次请求
      expect(stub.calls).toHaveLength(1);
      stub.restore();
    }

    // 步骤 4：错误是普通 Error，没有 typed code 字段（内部错误不上抛为客户端码）
    const stub = stubFetch(() => fakeResponse({ ok: false, status: 502 }));
    const failure = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect((failure as { code?: unknown }).code).toBeUndefined();
    expect(failure.name).toBe("Error");
    expect(failure.message).toBe("model provider preflight returned 502");
    expect(stub.calls).toHaveLength(1);
    stub.restore();
  });
});
