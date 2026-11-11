/**
 * Case ID: UT-PI-547  ·  STATUS: real
 *
 * 责任：分支 L7 `item?.id`（?.；provider-preflight.ts）
 * 维度坐标：`preflightModelProvider` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-547.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-547 · preflightModelProvider · 状态分支 × 合法迁移", () => {
  it("takes both sides of the optional chain on each item", async () => {  // takes both sides of the optional chain on each item
    // 步骤 1/2：取真侧——item 是有效对象：可选链不短路，id 被读到（getter 证明）
    let idReads = 0;
    const present = stubFetch(() => {
      idReads = 0;
      return fakeResponse({
        status: 200,
        json: {
          data: [
            {
              get id() {
                idReads += 1;
                return "gpt-4o-mini";
              },
            },
          ],
        },
      });
    });
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(idReads).toBeGreaterThanOrEqual(1);
    present.restore();

    // 步骤 3/4：取假侧——item 为 undefined / null：可选链短路取 undefined，
    // 不会 TypeError，落成可判别的领域错误
    const nullItem = stubFetch(() => fakeResponse({ status: 200, json: { data: [null, undefined, { id: "other" }] } }));
    const fromNull = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromNull).toBeInstanceOf(Error);
    expect(fromNull.message).toBe("configured model is not available: gpt-4o-mini");
    nullItem.restore();
  });
});
