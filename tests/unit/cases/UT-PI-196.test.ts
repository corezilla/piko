/**
 * Case ID: UT-PI-196  ·  STATUS: real
 *
 * 责任：资源操作 L319 `setTimeout`（mem0-client.ts）
 * 维度坐标：`pollForExtractedMemory` × `资源获取/释放` × `获取失败路径`（方案 §6.1A 分卷 `PI`）
 * 用例文档：docs/70_verification/unit/cases/UT-PI-196.md（脚本的唯一依据）
 */
import { describe, expect, it, vi } from "vitest";
import { Mem0Adapter, Mem0ApiError } from "../../../src/mem0-client.js";
import {
  ADD_PATH,
  MEM0_BASE,
  MEM0_KEY,
  Mem0FetchStub,
  SEARCH_PATH,
  drainPoll,
  hit,
  json,
  reject,
  text,
  validMessages,
} from "./support/a2-mem0-fix.js";

describe("UT-PI-196 · pollForExtractedMemory · 资源获取/释放 × 获取失败路径", () => {
  it("uses one 700ms timer per round and leaves no timer behind", async () => {  // uses one 700ms timer per round and leaves no timer behind
    const adapter = new Mem0Adapter(MEM0_BASE, MEM0_KEY);
    const stub = new Mem0FetchStub().fallbackFor(SEARCH_PATH, json({ results: [] }));
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const timer = vi.spyOn(globalThis, "setTimeout");
    const clearer = vi.spyOn(globalThis, "clearTimeout");
    vi.stubGlobal("fetch", stub.fetch);
    try {
      // 步骤 1/2：正常路径——每一轮都用一次 setTimeout(r, 700)
      const pending = adapter.pollForExtractedMemory("tester:piko", "q");
      const result = await drainPoll(pending);
      expect(result).toBeNull();

      // 步骤 2：断言资源被使用——setTimeout 被调了 15 次，每次延迟都是 700ms
      expect(timer.mock.calls.length).toBe(15);
      for (const call of timer.mock.calls) {
        expect(call[1]).toBe(700);
      }

      // 步骤 4：断言无残留——实现不显式 clearTimeout（定时器自然到期后消失），
      // 但结束时待触发定时器计数回零
      expect(clearer.mock.calls.length).toBe(0);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      timer.mockRestore();
      clearer.mockRestore();
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }

    // 步骤 3：注入该资源操作失败——setTimeout 抛错后错误原样上抛，且没有留下任何定时器
    vi.useFakeTimers();
    vi.stubGlobal("fetch", new Mem0FetchStub().fallbackFor(SEARCH_PATH, json({ results: [] })).fetch);
    vi.stubGlobal("setTimeout", (() => {
      throw new Error("timer unavailable");
    }) as unknown as typeof setTimeout);
    try {
      const err = await adapter.pollForExtractedMemory("tester:piko", "q").then(
        () => null,
        (e) => e,
      );
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("timer unavailable");
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});
