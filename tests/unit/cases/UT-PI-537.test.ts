/**
 * Case ID: UT-PI-537  ·  STATUS: real
 *
 * 责任：参数 `timeout: number` 的 `−1 通过` 类（provider-preflight.ts:1）
 * 维度坐标：`preflightModelProvider` × `数值/长度上限参数` × `−1 通过`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-537.md（脚本的唯一依据）
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { preflightModelProvider } from "../../../src/provider-preflight.js";
import { captureError, fakeResponse, modelsResponder, neverSettles, stubFetch } from "./support/d-preflight-fix.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});


describe("UT-PI-537 · preflightModelProvider · 数值/长度上限参数 × −1 通过", () => {
  it("accepts a negative timeout of minus one when the response arrives in time", async () => {  // accepts a negative timeout of minus one when the response arrives in time
    // 步骤 1：timeout 取边界值 0 的 -1 = -1；实现不做校验，请求照发
    const immediate = stubFetch(modelsResponder());
    await expect(preflightModelProvider("https://provider.example.com/v1", "sk-test", -1, "gpt-4o-mini")).resolves.toBeUndefined();
    expect(immediate.calls).toHaveLength(1);
    expect(immediate.calls[0].signal!.aborted).toBe(false);
    immediate.restore();

    // 步骤 2/3：负超时不是"立刻超时"——定时器按 1ms 挂起（Node 把负延时钳到 1），
    // 挂起的请求最终被 abort，错误原样上抛
    const pending = stubFetch(neverSettles);
    const promise = preflightModelProvider("https://provider.example.com/v1", "sk-test", -1, "gpt-4o-mini");
    const assertion = expect(promise).rejects.toThrow("The operation was aborted.");
    const deadline = Date.now() + 1000;
    while (!pending.calls[0].signal!.aborted && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    await assertion;
    expect(pending.calls[0].signal!.aborted).toBe(true);
    pending.restore();
  });
});
