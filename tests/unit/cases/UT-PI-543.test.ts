/**
 * Case ID: UT-PI-543  ·  STATUS: real
 *
 * 责任：分支 L7 `!Array.isArray(payload?.data)||!payload.data.…`（||；provider-preflight.ts）
 * 维度坐标：`preflightModelProvider` × `状态分支` × `合法迁移`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-543.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-543 · preflightModelProvider · 状态分支 × 合法迁移", () => {
  it("takes both sides of the or-guard with short-circuit proof", async () => {  // takes both sides of the or-guard with short-circuit proof
    // 步骤 1/2：取真侧·左操作数——data 不是数组；右操作数绝不能被求值
    //    （some 被换成会抛 "second operand must not be evaluated" 的假函数）
    const leftTrue = stubFetch(() =>
      fakeResponse({
        status: 200,
        json: {
          data: {
            some: () => {
              throw new Error("second operand must not be evaluated");
            },
          },
        },
      }),
    );
    const fromLeft = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromLeft).toBeInstanceOf(Error);
    expect(fromLeft.message).toBe("configured model is not available: gpt-4o-mini");
    leftTrue.restore();

    // 取真侧·右操作数——data 是数组但没有命中项
    const rightTrue = stubFetch(() => fakeResponse({ status: 200, json: { data: [{ id: "other-model" }] } }));
    const fromRight = await captureError(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini"));
    expect(fromRight.message).toBe("configured model is not available: gpt-4o-mini");
    rightTrue.restore();

    // 步骤 3/4：取假侧——两个操作数都为假（数组且命中），整块被跳过，resolve undefined
    const bothFalse = stubFetch(modelsResponder(["gpt-4o-mini"]));
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 1000, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(bothFalse.calls).toHaveLength(1);
    bothFalse.restore();
  });
});
