/**
 * Case ID: UT-PI-542  ·  STATUS: real
 *
 * 责任：分支 L5 `!response.ok`（!；provider-preflight.ts）
 * 维度坐标：`preflightModelProvider` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-542.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-542 · preflightModelProvider · 状态分支 × 合法迁移", () => {
  it("takes both sides of the response-ok guard", async () => {  // takes both sides of the response-ok guard
    // 步骤 1/2：取真侧——response.ok 为假（false / undefined 两种假值都验）
    const falseOk = stubFetch(() => fakeResponse({ ok: false, status: 503 }));
    const fromFalse = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromFalse).toBeInstanceOf(Error);
    expect(fromFalse.message).toBe("model provider preflight returned 503");
    falseOk.restore();

    const undefinedOk = stubFetch(() => fakeResponse({ ok: undefined, status: 401 }));
    const fromUndefined = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromUndefined.message).toBe("model provider preflight returned 401");
    undefinedOk.restore();

    // 步骤 3/4：取假侧——response.ok 为真：块内的 throw 不发生，流程继续到响应体检查；
    // 响应体被读了一次，证明 L5 的块确实被跳过
    let jsonCalls = 0;
    const counted = stubFetch(() => {
      jsonCalls += 1;
      return fakeResponse({ ok: true, status: 200, json: { data: [{ id: "gpt-4o-mini" }] } });
    });
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(jsonCalls).toBe(1);
    expect(counted.calls).toHaveLength(1);
    counted.restore();
  });
});
