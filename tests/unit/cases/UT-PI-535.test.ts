/**
 * Case ID: UT-PI-535  ·  STATUS: real
 *
 * 责任：参数 `timeout: number` 的 `恰好通过` 类（provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `数值/长度上限参数` × `恰好通过`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-535.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-535 · preflightModelProvider · 数值/长度上限参数 × 恰好通过", () => {
  it("accepts the boundary timeout of zero when the response arrives in time", async () => {  // accepts the boundary timeout of zero when the response arrives in time
    vi.useFakeTimers();
    // 步骤 1：timeout 取边界值 0（源码无更小的合法超时）
    const immediate = stubFetch(modelsResponder());
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", 0, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(immediate.calls).toHaveLength(1);
    expect(immediate.calls[0].signal).toBeDefined();
    expect(immediate.calls[0].signal!.aborted).toBe(false);
    immediate.restore();

    // 同一个 timeout=0 的定时器确实按 0ms 挂起：挂起的请求在 t=0 就被 abort
    const pending = stubFetch(neverSettles);
    const promise = preflightModelProvider("https://provider.example.com/v1", "sk-test", 0, "gpt-4o-mini");
    const assertion = expect(promise).rejects.toThrow("The operation was aborted.");
    await vi.advanceTimersByTimeAsync(0);
    await assertion;
    expect(pending.calls[0].signal!.aborted).toBe(true);
    pending.restore();
  });
});
