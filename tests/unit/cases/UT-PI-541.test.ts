/**
 * Case ID: UT-PI-541  ·  STATUS: real
 *
 * 责任：分支 L4 `? base.endsWith("/") :`（ternary；provider-preflight.ts）
 * 维度坐标：`preflightModelProvider` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-541.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-541 · preflightModelProvider · 状态分支 × 合法迁移", () => {
  it("takes both sides of the trailing-slash ternary when building the URL", async () => {  // takes both sides of the trailing-slash ternary when building the URL
    // 步骤 1/2：取真侧——base 自带尾斜杠，直接用作 new URL 的 base
    const trueSide = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1/", "sk-test", 1000, "gpt-4o-mini");
    expect(trueSide.calls).toHaveLength(1);
    expect(trueSide.calls[0].url).toBe("https://provider.example.com/v1/models");
    trueSide.restore();

    // 步骤 3/4：取假侧——base 不带尾斜杠：实现补上 "/"，v1 被当作目录保留；
    // 若没有补 "/"，models 会替换掉 v1 这一段（反事实对照）
    const falseSide = stubFetch(modelsResponder());
    await preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini");
    expect(falseSide.calls).toHaveLength(1);
    expect(falseSide.calls[0].url).toBe("https://provider.example.com/v1/models");
    expect(new URL("models", "https://provider.example.com/v1").href).toBe("https://provider.example.com/models");
    expect(falseSide.calls[0].url).not.toBe("https://provider.example.com/models");
    falseSide.restore();
  });
});
