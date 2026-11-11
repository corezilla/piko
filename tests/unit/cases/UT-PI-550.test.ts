/**
 * Case ID: UT-PI-550  ·  STATUS: real
 *
 * 责任：资源操作 L2 `setTimeout`（provider-preflight.ts）
 * 维度坐标：`preflightModelProvider` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-550.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-550 · preflightModelProvider · 资源获取/释放 × 获取失败路径", () => {
  it("arms one timer per call and releases it on both paths", async () => {  // arms one timer per call and releases it on both paths
    vi.useFakeTimers();
    // 步骤 1/2：正常路径——请求在飞时恰好挂着 1 个定时器（替身调用序证明），
    // 结束后归 0
    let timersDuringRequest = -1;
    const inflight = stubFetch(() => {
      timersDuringRequest = vi.getTimerCount();
      return fakeResponse({ status: 200, json: { data: [{ id: "gpt-4o-mini" }] } });
    });
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 5, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(timersDuringRequest).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
    inflight.restore();

    // 定时器按 timeout=5 挂起：t=4 不 abort，t=5 abort
    const pending = stubFetch(neverSettles);
    const promise = preflightModelProvider("https://provider.example.com/v1", "sk-test", 5, "gpt-4o-mini");
    const assertion = expect(promise).rejects.toThrow("The operation was aborted.");
    await vi.advanceTimersByTimeAsync(4);
    expect(pending.calls[0].signal!.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await assertion;
    expect(pending.calls[0].signal!.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    pending.restore();

    // 步骤 3：注入资源获取失败——setTimeout 本身抛错；错误原样上抛，不发请求
    const setSpy = vi.spyOn(globalThis, "setTimeout").mockImplementation(() => {
      throw new Error("timer unavailable");
    });
    const untouched = stubFetch(modelsResponder());
    const rejected = preflightModelProvider("https://provider.example.com/v1", "sk-test", 50, "gpt-4o-mini");
    let failure: Error | undefined;
    const caught = rejected.then(
      () => undefined,
      (error: unknown) => {
        failure = error as Error;
      },
    );
    setSpy.mockRestore();
    await caught;
    expect(failure).toBeInstanceOf(Error);
    expect(failure!.message).toBe("timer unavailable");
    // 步骤 4：两路都无残留——失败路径没有挂任何定时器，也没有发请求
    expect(untouched.calls).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
    untouched.restore();
  });
});
