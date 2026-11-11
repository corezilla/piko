/**
 * Case ID: UT-PI-536  ·  STATUS: real
 *
 * 责任：参数 `timeout: number` 的 `+1 拒绝` 类（provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `数值/长度上限参数` × `+1 拒绝`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-536.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-536 · preflightModelProvider · 数值/长度上限参数 × +1 拒绝", () => {
  it("aborts the request when the timeout is one millisecond past the boundary", async () => {  // aborts the request when the timeout is one millisecond past the boundary
    vi.useFakeTimers();
    // 步骤 1：timeout 取边界值 0 的 +1 = 1
    const pending = stubFetch(neverSettles);
    const promise = preflightModelProvider("https://provider.example.com/v1", "sk-test", 1, "gpt-4o-mini");
    const assertion = expect(promise).rejects.toThrow("The operation was aborted.");

    // 步骤 2/3：t=0 还没到 1ms——信号未 abort，请求仍在飞
    await vi.advanceTimersByTimeAsync(0);
    expect(pending.calls).toHaveLength(1);
    expect(pending.calls[0].signal!.aborted).toBe(false);

    // t=1 到达边界——abort，fetch 以 AbortError 收场，错误原样上抛
    await vi.advanceTimersByTimeAsync(1);
    await assertion;
    expect(pending.calls[0].signal!.aborted).toBe(true);
    pending.restore();
  });
});
