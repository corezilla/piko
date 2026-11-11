/**
 * Case ID: UT-PI-546  ·  STATUS: real
 *
 * 责任：分支 L7 `!payload.data.some((item:any)=>item?.id===mod…`（!；provider-preflight.ts）
 * 维度坐标：`preflightModelProvider` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-546.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-546 · preflightModelProvider · 状态分支 × 合法迁移", () => {
  it("takes both sides of the negated some-match guard", async () => {  // takes both sides of the negated some-match guard
    // 步骤 1/2：取真侧——.some 没找到任何命中项（不命中 / 大小写不同都算）
    const miss = stubFetch(() => fakeResponse({ status: 200, json: { data: [{ id: "gpt-4o" }, { id: "claude" }] } }));
    const fromMiss = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromMiss).toBeInstanceOf(Error);
    expect(fromMiss.message).toBe("configured model is not available: gpt-4o-mini");
    miss.restore();

    const caseSensitive = stubFetch(() => fakeResponse({ status: 200, json: { data: [{ id: "GPT-4O-MINI" }] } }));
    const fromCase = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromCase.message).toBe("configured model is not available: gpt-4o-mini");
    caseSensitive.restore();

    // 步骤 3/4：取假侧——.some 命中（哪怕命中项在最后一个），整块被跳过
    const hitLast = stubFetch(() =>
      fakeResponse({ status: 200, json: { data: [{ id: "gpt-4o" }, { id: "claude" }, { id: "gpt-4o-mini" }] } }),
    );
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(hitLast.calls).toHaveLength(1);
    hitLast.restore();
  });
});
