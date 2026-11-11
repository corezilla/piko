/**
 * Case ID: UT-PI-545  ·  STATUS: real
 *
 * 责任：分支 L7 `payload?.data`（?.；provider-preflight.ts）
 * 维度坐标：`preflightModelProvider` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-545.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-545 · preflightModelProvider · 状态分支 × 合法迁移", () => {
  it("takes both sides of the optional chain on payload", async () => {  // takes both sides of the optional chain on payload
    // 步骤 1/2：取真侧——payload 是有效对象：可选链不短路，data 被读到（getter 证明）
    let dataReads = 0;
    const present = stubFetch(() => {
      dataReads = 0;
      return fakeResponse({
        status: 200,
        json: {
          get data() {
            dataReads += 1;
            return [{ id: "gpt-4o-mini" }];
          },
        },
      });
    });
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(dataReads).toBeGreaterThanOrEqual(1);
    present.restore();

    // 步骤 3/4：取假侧——payload 为 undefined / null：可选链短路取 undefined，
    // 结果是可判别的领域错误而不是 TypeError
    const undefinedPayload = stubFetch(() => fakeResponse({ status: 200, json: undefined }));
    const fromUndefined = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromUndefined).toBeInstanceOf(Error);
    expect(fromUndefined.message).toBe("configured model is not available: gpt-4o-mini");
    undefinedPayload.restore();

    const nullPayload = stubFetch(() => fakeResponse({ status: 200, json: null }));
    const fromNull = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromNull.message).toBe("configured model is not available: gpt-4o-mini");
    nullPayload.restore();
  });
});
