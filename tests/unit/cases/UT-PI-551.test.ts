/**
 * Case ID: UT-PI-551  ·  STATUS: real
 *
 * 责任：资源操作 L8 `clearTimeout`（provider-preflight.ts）
 * 维度坐标：`preflightModelProvider` × `资源获取/释放` × `正常释放`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-551.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-551 · preflightModelProvider · 资源获取/释放 × 正常释放", () => {
  it("clears the timer on the success path and on the throw path", async () => {  // clears the timer on the success path and on the throw path
    vi.useFakeTimers();
    const setSpy = vi.spyOn(globalThis, "setTimeout");
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");

    // 步骤 1/2：正常路径——set 一次、clear 一次，handle 逐一对上，定时器计数归 0
    const setBefore = setSpy.mock.calls.length;
    const clearBefore = clearSpy.mock.calls.length;
    const resultBefore = setSpy.mock.results.length;
    const ok = stubFetch(modelsResponder(["gpt-4o-mini"]));
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 5000, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(setSpy.mock.calls.length).toBe(setBefore + 1);
    expect(setSpy.mock.calls[setBefore][1]).toBe(5000);
    expect(clearSpy.mock.calls.length).toBe(clearBefore + 1);
    expect(clearSpy.mock.calls[clearBefore][0]).toBe(setSpy.mock.results[resultBefore].value);
    expect(vi.getTimerCount()).toBe(0);
    // 清掉的定时器不会再 fire：把 5000ms 走完，signal 从未被 abort
    await vi.advanceTimersByTimeAsync(6000);
    expect(ok.calls[0].signal!.aborted).toBe(false);
    ok.restore();

    // 步骤 3：抛错路径（L5 throw）——finally 里的 clear 照样发生，无泄漏
    const failing = stubFetch(() => fakeResponse({ ok: false, status: 500 }));
    const setBeforeThrow = setSpy.mock.calls.length;
    const clearBeforeThrow = clearSpy.mock.calls.length;
    const resultBeforeThrow = setSpy.mock.results.length;
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 5000, "gpt-4o-mini")).rejects.toThrow(
      "model provider preflight returned 500",
    );
    expect(setSpy.mock.calls.length).toBe(setBeforeThrow + 1);
    expect(clearSpy.mock.calls.length).toBe(clearBeforeThrow + 1);
    expect(clearSpy.mock.calls[clearBeforeThrow][0]).toBe(setSpy.mock.results[resultBeforeThrow].value);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(6000);
    expect(failing.calls[0].signal!.aborted).toBe(false);
    failing.restore();

    // 步骤 4：两路资源计数都归 0
    expect(vi.getTimerCount()).toBe(0);
    setSpy.mockRestore();
    clearSpy.mockRestore();
  });
});
